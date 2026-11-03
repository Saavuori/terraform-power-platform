// Schema access for the builder: editable attributes per resource type and
// nested path, straight from the extracted provider schema.
import lite from '../../../data/schema-lite.json'

export const provider = lite.provider
export const categories = lite.categories
export const relations = lite.relations

const RESOURCES = new Map(lite.types.filter((t) => t.kind === 'resource').map((t) => [t.name, t]))

export const resourceTypes = [...RESOURCES.values()]

export function typeInfo(name) {
  return RESOURCES.get(name) || null
}

const editable = (a) => a.section !== 'readOnly' && a.name !== 'timeouts'

// Editable attributes at a nested path ('' = top level). Objects whose children
// are all read-only (e.g. powerplatform_rest.output) are dropped.
export function attrsAt(typeName, path = '') {
  const t = RESOURCES.get(typeName)
  if (!t) return []
  const list = path ? t.nested[path] || [] : t.attributes
  return list.filter(editable).filter((a) => {
    if (!a.type.startsWith('object')) return true
    const child = path ? `${path}.${a.name}` : a.name
    return attrsAt(typeName, child).length > 0
  })
}

export function attrAt(typeName, dotted) {
  const t = RESOURCES.get(typeName)
  if (!t) return null
  const parts = dotted.split('.')
  const parent = parts.slice(0, -1).join('.')
  const list = parent ? t.nested[parent] || [] : t.attributes
  return list.find((a) => a.name === parts.at(-1)) || null
}

// Read a nested value by dotted path from an instance values object.
export function getPath(obj, dotted) {
  let cur = obj
  for (const k of dotted.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

export function setPath(obj, dotted, value) {
  const parts = dotted.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object' || Array.isArray(cur[parts[i]])) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  if (value === undefined) delete cur[parts.at(-1)]
  else cur[parts.at(-1)] = value
}

export function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
}
