// Checks a design against the provider's own validators and the platform
// rules it depends on, so problems show up before `terraform plan` does.
import { attrsAt, typeInfo, relations, isEmpty, getPath } from './schema.js'
import { specFor } from './specs.js'
import { refDefs, byId, parentOf, managedFor, hasDataverse, validName, address } from './model.js'
import { variableName } from './hcl.js'

const ENV = 'powerplatform_environment'

const requiresDataverse = new Set(relations.filter((r) => r.kind === 'parent' && r.requiresDataverse).map((r) => r.from))

export function validate(design) {
  const issues = []
  const push = (inst, level, text, path = null) => issues.push({ id: inst ? inst.id : null, level, text, path })

  const names = new Map()
  for (const inst of design.instances) {
    const key = `${inst.type}.${inst.name}`
    if (!validName(inst.name)) push(inst, 'error', `"${inst.name}" is not a valid Terraform name — use letters, digits, _ and -.`)
    if (names.has(key)) push(inst, 'error', `Another ${inst.type} is already named "${inst.name}".`)
    names.set(key, inst)
  }

  for (const inst of design.instances) {
    const spec = specFor(inst.type)
    const defs = refDefs(inst.type)
    checkRequired(inst, '', inst.values, defs, spec, push)

    // parent
    if (spec.parent) {
      const parent = parentOf(design, inst)
      if (!parent) push(inst, 'error', spec.parent === 'environment_group_id' ? 'Pick the environment group this belongs to.' : 'Pick the environment this belongs to.', spec.parent)
      else if (parent.type === ENV && requiresDataverse.has(inst.type) && !hasDataverse(parent)) {
        const devException = inst.type === 'powerplatform_managed_environment' && parent.values.environment_type === 'Developer'
        if (!devException) push(inst, 'error', `${typeInfo(inst.type).title} needs a Dataverse database — enable Dataverse on "${parent.values.display_name || parent.name}".`)
      }
    }

    // singletons
    if (spec.singleton) {
      const scopeKey = spec.singleton === 'tenant' ? 'tenant' : inst.refs[spec.parent]
      const extra = spec.singletonKey ? spec.singletonKey(inst) : ''
      const twins = design.instances.filter(
        (o) => o.type === inst.type && o.id !== inst.id && (spec.singleton === 'tenant' || o.refs[spec.parent] === scopeKey) && (spec.singletonKey ? spec.singletonKey(o) === extra : true),
      )
      if (twins.length && scopeKey) push(inst, 'error', spec.singleton === 'tenant' ? `Only one ${inst.type} can exist per tenant.` : `Only one ${typeInfo(inst.type).title.toLowerCase()}${extra ? ` (${extra})` : ''} per ${spec.parent === 'environment_group_id' ? 'group' : 'environment'}.`)
    }
  }

  // per-type rules
  for (const inst of design.instances) {
    const v = inst.values
    switch (inst.type) {
      case ENV: {
        const hasLoc = !isEmpty(v.location)
        const hasMacro = !isEmpty(v.macro_region)
        if (hasLoc === hasMacro) push(inst, 'error', 'Set exactly one of location or macro_region.', 'location')
        if (hasMacro && !isEmpty(v.azure_region)) push(inst, 'error', 'macro_region cannot be combined with azure_region.', 'azure_region')
        const dv = v.dataverse || {}
        if (dv && (dv.administration_mode_enabled === undefined) !== (dv.background_operation_enabled === undefined)) push(inst, 'error', 'administration_mode_enabled and background_operation_enabled must be set together.', 'dataverse')
        if (v.environment_type === 'Default') push(inst, 'warn', 'The Default environment already exists in every tenant — import it instead of creating one.', 'environment_type')
        if (v.environment_type === 'Developer') push(inst, 'info', 'Creating Developer environments is a preview feature of the provider.', 'environment_type')
        if (inst.refs.environment_group_id) {
          if (!managedFor(design, inst.id)) push(inst, 'error', 'Environment groups only contain Managed Environments — add a Managed Environment to this environment.', 'environment_group_id')
          if (!hasDataverse(inst) && v.environment_type !== 'Developer') push(inst, 'warn', 'Environments without Dataverse cannot be added to an environment group.', 'environment_group_id')
        }
        const viaPolicyEnv = design.instances.some((o) => o.type === 'powerplatform_billing_policy_environment' && (o.refs.environments || []).includes(inst.id))
        if (viaPolicyEnv && inst.refs.billing_policy_id) push(inst, 'warn', 'Billing is linked twice: by billing_policy_id and by a billing policy environments resource. Keep one.', 'billing_policy_id')
        break
      }
      case 'powerplatform_managed_environment': {
        const env = parentOf(design, inst)
        if (env && env.refs.environment_group_id) push(inst, 'info', 'This environment is in a group, so the group rule set governs it and these settings are not applied (provider known limitation).')
        if (v.is_group_sharing_disabled === false && Number(v.max_limit_user_sharing) !== -1) push(inst, 'warn', 'When group sharing is allowed, max_limit_user_sharing should be -1.', 'max_limit_user_sharing')
        break
      }
      case 'powerplatform_data_loss_prevention_policy': {
        const envs = inst.refs.environments || []
        if (v.environment_type !== 'AllEnvironments' && !envs.length) push(inst, 'error', `${v.environment_type} needs at least one environment in environments.`, 'environments')
        if (v.environment_type === 'AllEnvironments' && envs.length) push(inst, 'warn', 'environments is ignored when environment_type is AllEnvironments.', 'environments')
        break
      }
      case 'powerplatform_billing_policy_environment': {
        const policy = byId(design, inst.refs.billing_policy_id)
        const envs = (inst.refs.environments || []).map((id) => byId(design, id)).filter(Boolean)
        if (!envs.length) push(inst, 'error', 'Choose the environments this billing policy pays for.', 'environments')
        if (policy) for (const e of envs) if (e.values.location && policy.values.location && e.values.location !== policy.values.location) push(inst, 'warn', `"${e.values.display_name}" is in ${e.values.location} but the billing policy is in ${policy.values.location}.`, 'environments')
        break
      }
      case 'powerplatform_enterprise_policy': {
        const env = parentOf(design, inst)
        if (env && ['Encryption', 'NetworkInjection'].includes(v.policy_type) && !managedFor(design, env.id)) push(inst, 'warn', `${v.policy_type} policies require a Managed Environment.`)
        break
      }
      case 'powerplatform_environment_settings': {
        const env = parentOf(design, inst)
        const sec = getPath(v, 'product.security') || {}
        const firewall = Object.keys(sec).some((k) => /firewall|reverse_proxy/.test(k) && !isEmpty(sec[k]))
        if (env && firewall && !managedFor(design, env.id)) push(inst, 'warn', 'IP firewall settings need a Managed Environment.', 'product')
        break
      }
      case 'powerplatform_security_role_assignment': {
        const principals = ['system_user_id', 'team_id'].filter((p) => inst.refs[p] || !isEmpty(v[p]))
        if (principals.length !== 1) push(inst, 'error', 'Set exactly one principal: system_user_id or team_id.', 'system_user_id')
        const roles = ['security_role_name', 'security_role_id'].filter((p) => !isEmpty(v[p]))
        if (roles.length !== 1) push(inst, 'error', 'Select the role by exactly one of security_role_name or security_role_id.', 'security_role_name')
        break
      }
      case 'powerplatform_rbac_role_assignment': {
        const roles = ['role_definition_id', 'role_definition_name'].filter((p) => !isEmpty(v[p]))
        if (roles.length !== 1) push(inst, 'error', 'Select the role by exactly one of role_definition_id or role_definition_name.', 'role_definition_name')
        if (v.scope_type === 'environment' && !inst.refs.environment_id && isEmpty(v.environment_id)) push(inst, 'error', 'scope_type "environment" needs environment_id.', 'environment_id')
        if (v.scope_type === 'environment_group' && !inst.refs.environment_group_id && isEmpty(v.environment_group_id)) push(inst, 'error', 'scope_type "environment_group" needs environment_group_id.', 'environment_group_id')
        if (v.scope_type === 'tenant' && (inst.refs.environment_id || inst.refs.environment_group_id)) push(inst, 'warn', 'Tenant scope ignores the environment / group reference.', 'scope_type')
        push(inst, 'info', 'The Power Platform RBAC API is in preview.')
        break
      }
      case 'powerplatform_connection_share': {
        const c = byId(design, inst.refs.connection_id)
        if (c && c.refs.environment_id !== inst.refs.environment_id) push(inst, 'warn', 'The connection lives in a different environment than this share.', 'connection_id')
        break
      }
      case 'powerplatform_environment_variable_value': {
        const has = design.instances.some((s) => (s.type === 'powerplatform_managed_solution' || s.type === 'powerplatform_solution') && s.refs.environment_id === inst.refs.environment_id)
        if (!has) push(inst, 'info', 'The variable definition must already exist in the environment (it ships in a solution).')
        break
      }
      case 'powerplatform_managed_solution': {
        const src = v.source || {}
        if (isEmpty(src.path) === isEmpty(src.url)) push(inst, 'error', 'Point source at exactly one of path or url.', 'source')
        break
      }
      case 'powerplatform_solution':
      case 'powerplatform_rest':
        push(inst, 'info', inst.type === 'powerplatform_solution' ? 'Deprecated in v5.0.0 — prefer powerplatform_managed_solution for managed solutions.' : 'Deprecated: powerplatform_rest is removed in v5.0.0.')
        break
      case 'powerplatform_copilot_studio_application_insights':
      case 'powerplatform_environment_wave':
        push(inst, 'info', 'Preview resource.')
        break
    }
  }
  return issues
}

function checkRequired(inst, path, values, defs, spec, push) {
  for (const attr of attrsAt(inst.type, path)) {
    const p = path ? `${path}.${attr.name}` : attr.name
    const v = values ? values[attr.name] : undefined
    if (attr.type === 'object') {
      if (v || attr.section === 'required') checkRequired(inst, p, v || {}, defs, spec, push)
      continue
    }
    if (attr.section !== 'required') continue
    if (attr.type === 'object_list' || attr.type === 'object_set') continue
    if (defs[p] && (defs[p].many ? (inst.refs[p] || []).length : inst.refs[p])) continue
    if (defs[p] && defs[p].many) continue
    const ext = (spec.external || {})[p]
    if (ext) continue // generated as a variable when empty
    if (isEmpty(v)) push(inst, 'error', `${p} is required.`, p)
  }
}

export function issuesFor(issues, id) {
  return issues.filter((i) => i.id === id)
}

export function worstLevel(list) {
  if (list.some((i) => i.level === 'error')) return 'error'
  if (list.some((i) => i.level === 'warn')) return 'warn'
  return null
}

export { address, variableName }
