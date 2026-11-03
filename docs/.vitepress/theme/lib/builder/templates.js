// Starting points for the builder. Each one is a real-world layout built only
// from resources this provider manages.
import { emptyDesign } from './model.js'
import { specFor } from './specs.js'

const clone = (v) => JSON.parse(JSON.stringify(v))

function merge(base, extra) {
  const out = clone(base || {})
  for (const [k, v] of Object.entries(extra || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) out[k] = merge(out[k], v)
    else out[k] = clone(v)
  }
  return out
}

function design(title, build) {
  const d = emptyDesign()
  d.title = title
  const add = (type, name, values = {}, refs = {}, { noDefaults = false } = {}) => {
    const inst = { id: `i${d.instances.length + 1}`, type, name, values: noDefaults ? clone(values) : merge(specFor(type).defaults, values), refs }
    d.instances.push(inst)
    return inst
  }
  build(add)
  return d
}

const DV = (currency = 'EUR', language = 1033) => ({ language_code: language, currency_code: currency })

export const TEMPLATES = [
  {
    id: 'starter',
    title: 'One Dataverse environment',
    blurb: 'A sandbox with a Dataverse database and audit settings.',
    build: () =>
      design('Contoso tenant', (add) => {
        const dev = add('powerplatform_environment', 'dev', { display_name: 'Contoso Dev', environment_type: 'Sandbox', location: 'europe', dataverse: DV() })
        add('powerplatform_environment_settings', 'dev', {}, { environment_id: dev.id })
      }),
  },
  {
    id: 'alm',
    title: 'Dev / Test / Prod with ALM',
    blurb: 'Three managed environments in a governed group, a managed solution and a deployment identity.',
    build: () =>
      design('Contoso ALM', (add) => {
        const group = add('powerplatform_environment_group', 'business_apps', { display_name: 'Business apps', description: 'Dev, test and production for Contoso apps' })
        add('powerplatform_environment_group_rule_set', 'business_apps', {}, { environment_group_id: group.id })
        const envs = [
          ['dev', 'Contoso Dev', 'Sandbox'],
          ['test', 'Contoso Test', 'Sandbox'],
          ['prod', 'Contoso Prod', 'Production'],
        ].map(([name, display, type]) => add('powerplatform_environment', name, { display_name: display, environment_type: type, location: 'europe', dataverse: DV() }, { environment_group_id: group.id }))
        for (const env of envs) add('powerplatform_managed_environment', env.name, {}, { environment_id: env.id })
        add('powerplatform_publisher', 'contoso', {}, { environment_id: envs[0].id })
        for (const env of envs.slice(1)) {
          add('powerplatform_managed_solution', `core_${env.name}`, {}, { environment_id: env.id })
          const appUser = add('powerplatform_application_user', `pipeline_${env.name}`, {}, { environment_id: env.id })
          add('powerplatform_security_role_assignment', `pipeline_${env.name}`, { security_role_name: 'System Administrator' }, { environment_id: env.id, system_user_id: appUser.id })
        }
      }),
  },
  {
    id: 'governance',
    title: 'Governance baseline',
    blurb: 'Tenant settings, DLP, tenant isolation, maker routing into a governed group and delegated admin.',
    build: () =>
      design('Contoso governance', (add) => {
        const group = add('powerplatform_environment_group', 'personal', { display_name: 'Personal productivity', description: 'Developer environments created by default environment routing' })
        add(
          'powerplatform_environment_group_rule_set',
          'personal',
          { rules: { sharing_controls: { share_mode: 'exclude sharing with security groups', share_max_limit: 5 }, maker_welcome_content: { maker_onboarding_url: 'https://contoso.sharepoint.com/sites/makers', maker_onboarding_markdown: '## Welcome, maker' } } },
          { environment_group_id: group.id },
        )
        add('powerplatform_tenant_settings', 'tenant', {}, { 'power_platform.governance.environment_routing_target_environment_group_id': group.id })
        add('powerplatform_data_loss_prevention_policy', 'baseline', {})
        add('powerplatform_tenant_isolation_policy', 'tenant', {})
        add('powerplatform_rbac_role_assignment', 'personal_readers', { scope_type: 'environment_group', role_definition_name: 'Power Platform Reader', principal_type: 'Group' }, { environment_group_id: group.id })
        const sandbox = add('powerplatform_environment', 'sandbox', { display_name: 'Contoso Sandbox', environment_type: 'Sandbox', location: 'europe', dataverse: DV() }, { environment_group_id: group.id })
        add('powerplatform_managed_environment', 'sandbox', {}, { environment_id: sandbox.id })
      }),
  },
  {
    id: 'payg',
    title: 'Pay-as-you-go billing',
    blurb: 'A billing policy on an Azure subscription paying for two environments.',
    build: () =>
      design('Contoso PAYG', (add) => {
        const policy = add('powerplatform_billing_policy', 'payg', { name: 'payg-europe', location: 'europe' })
        const finance = add('powerplatform_environment', 'finance', { display_name: 'Contoso Finance', environment_type: 'Production', location: 'europe', dataverse: DV() })
        const ops = add('powerplatform_environment', 'ops', { display_name: 'Contoso Ops', environment_type: 'Sandbox', location: 'europe' })
        add('powerplatform_billing_policy_environment', 'payg', {}, { billing_policy_id: policy.id, environments: [finance.id, ops.id] })
      }),
  },
  {
    id: 'secure',
    title: 'Private network + customer-managed key',
    blurb: 'A managed production environment linked to VNet injection and CMK enterprise policies, with IP firewall and disaster recovery.',
    build: () =>
      design('Contoso secure', (add) => {
        const prod = add('powerplatform_environment', 'prod', { display_name: 'Contoso Prod', environment_type: 'Production', location: 'europe', azure_region: 'westeurope', dataverse: { ...DV(), security_group_id: 'var.prod_security_group_id' } })
        add('powerplatform_managed_environment', 'prod', { solution_checker_mode: 'Block' }, { environment_id: prod.id })
        add('powerplatform_enterprise_policy', 'network', { policy_type: 'NetworkInjection' }, { environment_id: prod.id })
        add('powerplatform_enterprise_policy', 'encryption', { policy_type: 'Encryption' }, { environment_id: prod.id })
        add(
          'powerplatform_environment_settings',
          'prod',
          { product: { security: { allow_application_user_access: true, allowed_ip_range_for_firewall: ['10.10.0.0/16'], allowed_service_tags_for_firewall: ['ApiManagement'] } } },
          { environment_id: prod.id },
        )
        add('powerplatform_environment_disaster_recovery', 'prod', {}, { environment_id: prod.id })
      }),
  },
  {
    id: 'copilot',
    title: 'Copilot Studio agent workspace',
    blurb: 'An agent environment streaming telemetry to Application Insights with a shared Azure OpenAI connection.',
    build: () =>
      design('Contoso agents', (add) => {
        const env = add('powerplatform_environment', 'agents', { display_name: 'Contoso Agents', environment_type: 'Sandbox', location: 'europe', dataverse: DV() })
        add('powerplatform_copilot_studio_application_insights', 'support_agent', {}, { environment_id: env.id })
        const conn = add('powerplatform_connection', 'openai', { name: 'shared_azureopenai', display_name: 'Azure OpenAI' }, { environment_id: env.id })
        add('powerplatform_connection_share', 'openai_makers', { role_name: 'CanView' }, { environment_id: env.id, connection_id: conn.id, connector_name: conn.id })
        add('powerplatform_environment_settings', 'agents', { product: { features: { enable_ai_prompts: true, enable_transcript_recording_for_copilot_studio: true } } }, { environment_id: env.id })
      }),
  },
  {
    id: 'anatomy',
    title: 'Every scope at once',
    blurb: 'Tenant-wide policies, a governed group, a Dataverse production environment and a Teams-style environment without Dataverse.',
    build: () =>
      design('Contoso, annotated', (add) => {
        const group = add('powerplatform_environment_group', 'governed', { display_name: 'Governed apps', description: 'Managed production environments' })
        add('powerplatform_environment_group_rule_set', 'governed', {}, { environment_group_id: group.id })
        add('powerplatform_tenant_settings', 'tenant', {}, { 'power_platform.governance.environment_routing_target_environment_group_id': group.id })
        add('powerplatform_data_loss_prevention_policy', 'baseline', {})
        const policy = add('powerplatform_billing_policy', 'payg', { name: 'payg-europe' })
        add('powerplatform_rbac_role_assignment', 'readers', { scope_type: 'environment_group' }, { environment_group_id: group.id })
        const prod = add('powerplatform_environment', 'prod', { display_name: 'Contoso Prod', environment_type: 'Production', location: 'europe', dataverse: DV() }, { environment_group_id: group.id, billing_policy_id: policy.id })
        add('powerplatform_managed_environment', 'prod', {}, { environment_id: prod.id })
        add('powerplatform_environment_settings', 'prod', {}, { environment_id: prod.id })
        add('powerplatform_enterprise_policy', 'network', { policy_type: 'NetworkInjection' }, { environment_id: prod.id })
        add('powerplatform_managed_solution', 'core', {}, { environment_id: prod.id })
        add('powerplatform_environment_variable_value', 'api_url', {}, { environment_id: prod.id })
        const appUser = add('powerplatform_application_user', 'pipeline', {}, { environment_id: prod.id })
        add('powerplatform_security_role_assignment', 'pipeline_admin', { security_role_name: 'System Administrator' }, { environment_id: prod.id, system_user_id: appUser.id })
        const teams = add('powerplatform_environment', 'teams', { display_name: 'Contoso Teams', environment_type: 'Sandbox', location: 'europe' })
        delete teams.values.dataverse
        const conn = add('powerplatform_connection', 'sharepoint', { name: 'shared_sharepointonline', display_name: 'SharePoint' }, { environment_id: teams.id })
        add('powerplatform_connection_share', 'sharepoint_makers', { role_name: 'CanView' }, { environment_id: teams.id, connection_id: conn.id, connector_name: conn.id })
        add('powerplatform_user', 'maker', { security_roles: ['Environment Maker'] }, { environment_id: teams.id })
      }),
  },
  {
    id: 'empty',
    title: 'Empty tenant',
    blurb: 'Start from nothing and add resources from the palette.',
    build: () => design('Contoso tenant', () => {}),
  },
]

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || null
