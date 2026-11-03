// Read-only view over the extracted provider graph (types, relations, layers).
import graph from '../../data/graph.json'

export const provider = graph.provider
export const categories = graph.categories
export const external = graph.external
export const relations = graph.relations
export const types = graph.types

export const typeByName = new Map()
for (const t of types) typeByName.set(`${t.kind}:${t.name}`, t)

export const categoryById = new Map(categories.map((c) => [c.id, c]))
export const categoryOrder = new Map(categories.map((c, i) => [c.id, i]))

export function getType(name, kind) {
  if (kind) return typeByName.get(`${kind}:${name}`) || null
  return typeByName.get(`resource:${name}`) || typeByName.get(`data-source:${name}`) || null
}

export const resources = types.filter((t) => t.kind === 'resource')
export const dataSources = types.filter((t) => t.kind === 'data-source')

// CSS custom property holding the layer pen colour.
export const pen = (category) => `var(--pen-${category || 'tenant'})`

export function relationsFrom(name, kind = 'resource') {
  return relations.filter((r) => r.from === name && r.fromKind === kind)
}

export function relationsTo(name, kind = 'resource') {
  return relations.filter((r) => r.to === name && r.toKind === kind)
}

// Descriptor for any relation endpoint (resource, data source or external object).
export function endpoint(name, kind) {
  if (kind === 'external') {
    const e = external[name]
    return {
      id: `external:${name}`,
      name,
      kind: 'external',
      title: e ? e.title : name,
      subtitle: e && e.provider ? e.provider : 'outside Terraform',
      category: 'external',
      side: e ? e.side : 'azure',
      page: null,
    }
  }
  const t = getType(name, kind)
  return {
    id: `${kind}:${name}`,
    name,
    kind,
    title: t ? t.title : name,
    subtitle: kind === 'data-source' ? `data.${name}` : name,
    category: t ? t.category : 'tenant',
    page: t ? t.page : null,
  }
}

export const kindLabel = { resource: 'Resource', 'data-source': 'Data source', external: 'External' }

export const relationKinds = {
  parent: { label: 'lives in', description: 'Attached to and scoped by the target.' },
  reference: { label: 'references', description: 'Holds the id of another resource.' },
  lookup: { label: 'looks up', description: 'Value usually comes from a data source.' },
  external: { label: 'points outside', description: 'Value comes from Azure or Entra ID.' },
  implicit: { label: 'needs first', description: 'No attribute, but add depends_on.' },
}
