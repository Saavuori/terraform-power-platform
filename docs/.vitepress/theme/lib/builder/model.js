// The builder's design document: a list of resource instances with attribute
// values and references to each other, plus provider settings.
import { specFor, scopeOf, BUILDER_ENV, BUILDER_GROUP } from './specs.js'
import { typeInfo, getPath } from './schema.js'

export function emptyDesign() {
  return {
    version: 1,
    title: 'Contoso tenant',
    provider: { auth: 'cli', cloud: 'public', version: '~> 4.2' },
    instances: [],
  }
}

const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)))

// Reference definitions for a type, including its parent reference.
export function refDefs(type) {
  const spec = specFor(type)
  const defs = { ...(spec.refs || {}) }
  if (spec.parent === 'environment_id') defs.environment_id = { to: BUILDER_ENV, parent: true, label: 'Environment' }
  if (spec.parent === 'environment_group_id') defs.environment_group_id = { to: BUILDER_GROUP, parent: true, label: 'Environment group' }
  if (spec.parent === '@environment') defs['@environment'] = { to: BUILDER_ENV, parent: true, virtual: true, label: 'Environment' }
  return defs
}

export const byId = (design, id) => design.instances.find((i) => i.id === id) || null

export function address(inst) {
  return `${inst.type}.${inst.name}`
}

export function shortAddress(inst) {
  return `${inst.type.replace(/^powerplatform_/, '')}.${inst.name}`
}

export function displayTitle(inst) {
  const spec = specFor(inst.type)
  const t = spec.title ? spec.title(inst) : null
  return t || typeInfo(inst.type)?.title || inst.type
}

export function parentOf(design, inst) {
  const spec = specFor(inst.type)
  if (!spec.parent) return null
  const id = inst.refs[spec.parent]
  return id ? byId(design, id) : null
}

export function childrenOf(design, parentId) {
  return design.instances.filter((i) => {
    const p = specFor(i.type).parent
    return p && i.refs[p] === parentId
  })
}

export function membersOf(design, groupId) {
  return design.instances.filter((i) => i.type === BUILDER_ENV && i.refs.environment_group_id === groupId)
}

export const hasDataverse = (env) => Boolean(env && env.values.dataverse)

export function managedFor(design, envId) {
  return design.instances.find((i) => i.type === 'powerplatform_managed_environment' && i.refs.environment_id === envId) || null
}

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_-]*$/
export const validName = (n) => IDENT.test(n)

export function slug(text, fallback = 'item') {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return s && /^[a-z_]/.test(s) ? s.slice(0, 32) : fallback
}

export function uniqueName(design, type, base) {
  const taken = new Set(design.instances.filter((i) => i.type === type).map((i) => i.name))
  if (!taken.has(base)) return base
  for (let n = 2; ; n++) if (!taken.has(`${base}_${n}`)) return `${base}_${n}`
}

function nextId(design) {
  let max = 0
  for (const i of design.instances) max = Math.max(max, Number(String(i.id).slice(1)) || 0)
  return `i${max + 1}`
}

// Add a resource. `context` is the currently selected instance: a new
// environment-scoped resource attaches to the environment the selection lives
// in. Missing required parents are created so the result is always placeable.
export function addInstance(design, type, context = null) {
  const spec = specFor(type)
  const created = []
  const envName = type === BUILDER_ENV ? nextEnvName(design) : null
  const inst = {
    id: nextId(design),
    type,
    name: uniqueName(design, type, envName ? slug(envName.split(' ').pop(), 'env') : spec.prefix || 'item'),
    values: clone(spec.defaults || {}),
    refs: {},
  }
  if (envName) inst.values.display_name = envName
  design.instances.push(inst)
  created.push(inst)

  const scope = scopeOf(type)
  if (scope === 'environment') {
    let env = envContext(design, context)
    if (!env) {
      env = addInstance(design, BUILDER_ENV).created[0]
      created.push(env)
    }
    inst.refs[spec.parent] = env.id
  } else if (scope === 'group') {
    let group = context && context.type === BUILDER_GROUP ? context : context && context.refs?.environment_group_id ? byId(design, context.refs.environment_group_id) : null
    group = group || design.instances.find((i) => i.type === BUILDER_GROUP)
    if (!group) {
      group = addInstance(design, BUILDER_GROUP).created[0]
      created.push(group)
    }
    inst.refs.environment_group_id = group.id
  }

  autoLink(design, inst, context)
  return { inst, created }
}

function envContext(design, context) {
  if (context) {
    if (context.type === BUILDER_ENV) return context
    const p = parentOf(design, context)
    if (p && p.type === BUILDER_ENV) return p
  }
  const envs = design.instances.filter((i) => i.type === BUILDER_ENV)
  return envs.at(-1) || null
}

const ENV_NAMES = ['Contoso Dev', 'Contoso Test', 'Contoso Prod', 'Contoso Sandbox', 'Contoso Training']
function nextEnvName(design) {
  const used = new Set(design.instances.filter((i) => i.type === BUILDER_ENV).map((i) => i.values.display_name))
  return ENV_NAMES.find((n) => !used.has(n)) || `Contoso Environment ${used.size + 1}`
}

// Fill obvious references: a single candidate, or the context the user is in.
function autoLink(design, inst, context) {
  const defs = refDefs(inst.type)
  for (const [path, def] of Object.entries(defs)) {
    if (def.parent || def.follows || def.map || inst.refs[path]) continue
    const candidates = design.instances.filter((i) => i.type === def.to && i.id !== inst.id)
    const sameEnv = candidates.filter((c) => c.refs.environment_id && c.refs.environment_id === inst.refs.environment_id)
    if (def.many) {
      if (inst.type === 'powerplatform_billing_policy_environment') inst.refs[path] = candidates.filter((c) => c.type === BUILDER_ENV).map((c) => c.id)
      continue
    }
    if (inst.type === BUILDER_ENV && path === 'environment_group_id') {
      if (context && context.type === BUILDER_GROUP) inst.refs[path] = context.id
      continue
    }
    if (inst.type === BUILDER_ENV && path === 'billing_policy_id') continue
    const pick = sameEnv.length === 1 ? sameEnv[0] : candidates.length === 1 ? candidates[0] : null
    if (pick) inst.refs[path] = pick.id
  }
  for (const [path, def] of Object.entries(defs)) {
    if (def.follows && inst.refs[def.follows]) inst.refs[path] = inst.refs[def.follows]
  }
  // a connection share needs a connection; make one in the same environment
  if (inst.type === 'powerplatform_connection_share' && !inst.refs.connection_id) {
    const { inst: c } = addInstance(design, 'powerplatform_connection', byId(design, inst.refs.environment_id))
    inst.refs.connection_id = c.id
    inst.refs.connector_name = c.id
  }
}

// Remove an instance; resources that cannot exist without it go too.
export function removeInstance(design, id) {
  const removed = new Set([id])
  let grew = true
  while (grew) {
    grew = false
    for (const i of design.instances) {
      if (removed.has(i.id)) continue
      const p = specFor(i.type).parent
      if (p && removed.has(i.refs[p])) {
        removed.add(i.id)
        grew = true
      }
    }
  }
  design.instances = design.instances.filter((i) => !removed.has(i.id))
  for (const i of design.instances) {
    for (const [k, v] of Object.entries(i.refs)) {
      if (Array.isArray(v)) i.refs[k] = v.filter((x) => !removed.has(x))
      else if (removed.has(v)) delete i.refs[k]
    }
  }
  return removed
}

export function duplicateInstance(design, id) {
  const src = byId(design, id)
  if (!src) return null
  const copy = { ...clone(src), id: nextId(design), name: uniqueName(design, src.type, src.name) }
  if (copy.type === BUILDER_ENV) copy.values.display_name = `${src.values.display_name || src.name} copy`
  design.instances.push(copy)
  return copy
}

// Every instance id an instance points at (for ordering and highlighting).
export function dependencies(design, inst, implicitDeps) {
  const out = new Map()
  const defs = refDefs(inst.type)
  for (const [path, v] of Object.entries(inst.refs)) {
    const ids = Array.isArray(v) ? v : [v]
    const def = defs[path] || (path.includes('.') ? defs[path.split('.')[0]] : null)
    for (const id of ids) if (byId(design, id)) out.set(id, { path: def && def.map ? path.split('.')[0] : path, kind: def?.parent ? 'parent' : 'reference' })
  }
  for (const dep of implicitDeps?.get(inst.id) || []) if (!out.has(dep)) out.set(dep, { path: 'depends_on', kind: 'implicit' })
  return out
}

// depends_on that the provider needs but no attribute expresses.
export function implicitDependencies(design) {
  const map = new Map()
  const add = (from, to) => {
    if (!map.has(from.id)) map.set(from.id, [])
    map.get(from.id).push(to.id)
  }
  for (const i of design.instances) {
    const envId = i.refs.environment_id
    if (!envId) continue
    if (i.type === 'powerplatform_environment_settings' || i.type === 'powerplatform_enterprise_policy') {
      const m = managedFor(design, envId)
      if (m) add(i, m)
    }
    if (i.type === 'powerplatform_environment_variable_value') {
      const sol = design.instances.find((s) => (s.type === 'powerplatform_managed_solution' || s.type === 'powerplatform_solution') && s.refs.environment_id === envId)
      if (sol) add(i, sol)
    }
  }
  return map
}

// Value of an attribute, looking through to the instance values.
export function valueAt(inst, path) {
  return getPath(inst.values, path)
}

export function normalize(design) {
  const d = { ...emptyDesign(), ...design }
  d.provider = { ...emptyDesign().provider, ...(design.provider || {}) }
  d.instances = (design.instances || []).filter((i) => i && typeInfo(i.type)).map((i) => ({ id: i.id, type: i.type, name: i.name, values: i.values || {}, refs: i.refs || {} }))
  return d
}
