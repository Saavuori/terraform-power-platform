<script setup>
// Every resource type of the provider and how they reference each other,
// laid out by scope: tenant-wide on the left, the environment as a hub, and
// everything that lives inside an environment on the right. Azure and Entra
// objects sit underneath, data sources optionally on the far right.
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import PlotCanvas from './PlotCanvas.vue'
import { types, relations, categories, categoryOrder, endpoint, relationKinds, getType, external } from '../lib/graph.js'

const NW = 212
const NH = 44
const GAP = 10
const COLGAP = 120

const showData = ref(false)
const showExternal = ref(true)
const hiddenLayers = ref(new Set())
const selected = ref(null)
const query = ref('')
const canvas = ref(null)

const ENV = 'powerplatform_environment'
const parentOf = new Map(relations.filter((r) => r.kind === 'parent' && r.fromKind === 'resource').map((r) => [r.from, r.to]))
const resourcesList = types.filter((t) => t.kind === 'resource')
const tenantOrder = [
  'powerplatform_environment_group',
  'powerplatform_environment_group_rule_set',
  'powerplatform_billing_policy',
  'powerplatform_billing_policy_environment',
  'powerplatform_data_loss_prevention_policy',
  'powerplatform_rbac_role_assignment',
  'powerplatform_tenant_settings',
  'powerplatform_tenant_isolation_policy',
  'powerplatform_admin_management_application',
]
const byCat = (a, b) => (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99) || a.title.localeCompare(b.title)

const visibleType = (t) => !hiddenLayers.value.has(t.category) || t.name === ENV

const scene = computed(() => {
  const nodes = []
  const frames = []
  const edges = []
  const labels = []
  const tenantTypes = tenantOrder.map((n) => resourcesList.find((t) => t.name === n)).filter(Boolean).filter(visibleType)
  const envTypes = resourcesList.filter((t) => parentOf.get(t.name) === ENV).sort(byCat).filter(visibleType)
  const rows = Math.ceil(envTypes.length / 2)
  const colH = (n) => n * (NH + GAP) - GAP
  const top = 46
  const bodyH = Math.max(colH(tenantTypes.length), colH(rows), 300)

  // columns
  const x0 = 0
  const xHub = x0 + NW + COLGAP
  const xEnv = xHub + 64 + COLGAP
  frames.push({ id: 'col:tenant', kind: 'column', x: x0, y: 0, w: NW, h: 30, title: 'Tenant-wide', subtitle: `${tenantTypes.length} types`, depth: 0 })
  frames.push({ id: 'col:env', kind: 'column', x: xEnv, y: 0, w: NW * 2 + 26, h: 30, title: 'Inside an environment', subtitle: `${envTypes.length} types`, depth: 0 })

  tenantTypes.forEach((t, i) => nodes.push(typeNode(t, x0, top + (bodyH - colH(tenantTypes.length)) / 2 + i * (NH + GAP))))
  const hubType = getType(ENV, 'resource')
  nodes.push({ id: `resource:${ENV}`, kind: 'hub', x: xHub, y: top, w: 64, h: bodyH, title: '', subtitle: '', pen: 'environments', selectable: true })
  labels.push({ x: xHub + 32, y: top - 12, text: hubType.title.toUpperCase(), anchor: 'middle', color: '--pen-environments', size: 11 })
  envTypes.forEach((t, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    nodes.push(typeNode(t, xEnv + col * (NW + 26), top + (bodyH - colH(rows)) / 2 + row * (NH + GAP)))
  })

  let right = xEnv + NW * 2 + 26
  const placed = new Set(nodes.map((n) => n.id))

  // data sources
  if (showData.value) {
    const ds = types.filter((t) => t.kind === 'data-source').sort(byCat).filter(visibleType)
    const dsRows = Math.ceil(ds.length / 2)
    const xDs = right + COLGAP
    frames.push({ id: 'col:data', kind: 'column', x: xDs, y: 0, w: NW * 2 + 26, h: 30, title: 'Data sources', subtitle: `${ds.length} lookups`, depth: 0 })
    ds.forEach((t, i) => {
      const n = typeNode(t, xDs + Math.floor(i / dsRows) * (NW + 26), top + (i % dsRows) * (NH + GAP))
      nodes.push(n)
      placed.add(n.id)
    })
    right = xDs + NW * 2 + 26
  }

  // external objects
  const bottom = top + Math.max(bodyH, showData.value ? colH(Math.ceil(types.filter((t) => t.kind === 'data-source').length / 2)) : 0) + 70
  if (showExternal.value) {
    const used = [...new Set(relations.filter((r) => r.toKind === 'external' && placed.has(`${r.fromKind}:${r.from}`)).map((r) => r.to))]
    const side = (k) => (external[k]?.side === 'entra' ? 0 : 1)
    const sorted = used.sort((a, b) => side(a) - side(b) || a.localeCompare(b))
    frames.push({ id: 'col:ext', kind: 'column', x: x0, y: bottom - 44, w: right - x0, h: 30, title: 'Outside Power Platform', subtitle: 'Entra ID · Azure · files', depth: 0 })
    const per = Math.max(1, Math.floor((right - x0 + 26) / (NW + 26)))
    sorted.forEach((k, i) => {
      const ep = endpoint(k, 'external')
      nodes.push({ id: ep.id, kind: 'external', x: x0 + (i % per) * (NW + 26), y: bottom + Math.floor(i / per) * (NH + GAP), w: NW, h: NH, title: ep.title, subtitle: ep.subtitle, pen: 'external', tag: ep.side === 'entra' ? 'ENTRA' : ep.side === 'azure' ? 'AZURE' : 'INPUT', selectable: true })
      placed.add(ep.id)
    })
  }

  for (const [i, r] of relations.entries()) {
    const from = `${r.fromKind}:${r.from}`
    const to = r.toKind === 'external' ? `external:${r.to}` : `${r.toKind}:${r.to}`
    if (!placed.has(from) || !placed.has(to)) continue
    const fromType = getType(r.from, r.fromKind)
    edges.push({
      id: `r${i}`,
      from,
      to,
      kind: r.kind === 'lookup' ? 'lookup' : r.kind === 'external' ? 'external' : r.kind === 'implicit' ? 'implicit' : 'reference',
      label: r.attr ? r.attr.split('.').pop() : 'depends_on',
      pen: r.kind === 'external' ? 'external' : fromType?.category,
      quietLabel: true,
    })
  }
  return { nodes, frames, edges, labels }
})

function typeNode(t, x, y) {
  return {
    id: `${t.kind}:${t.name}`,
    kind: t.kind === 'data-source' ? 'data' : 'resource',
    x,
    y,
    w: NW,
    h: NH,
    title: t.title,
    subtitle: t.kind === 'data-source' ? `data.${t.short}` : t.short,
    pen: t.category,
    tag: t.kind === 'data-source' ? 'DATA' : t.preview ? 'PREVIEW' : null,
    selectable: true,
  }
}

const detail = computed(() => {
  if (!selected.value) return null
  const [kind, ...rest] = selected.value.split(':')
  const name = rest.join(':')
  if (kind === 'external') {
    const ep = endpoint(name, 'external')
    return { ep, type: null, out: [], in: relations.filter((r) => r.toKind === 'external' && r.to === name) }
  }
  return {
    ep: endpoint(name, kind),
    type: getType(name, kind),
    out: relations.filter((r) => r.from === name && r.fromKind === kind),
    in: relations.filter((r) => r.to === name && r.toKind === kind),
  }
})

function toggleLayer(id) {
  const s = new Set(hiddenLayers.value)
  s.has(id) ? s.delete(id) : s.add(id)
  hiddenLayers.value = s
}

const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return scene.value.nodes.filter((n) => n.title.toLowerCase().includes(q) || (n.subtitle || '').toLowerCase().includes(q) || n.id.includes(q)).slice(0, 8)
})
function pick(id) {
  selected.value = id
  query.value = ''
}

const epFor = (r, side) => (side === 'out' ? endpoint(r.to, r.toKind) : endpoint(r.from, r.fromKind))
const stats = computed(() => ({
  resources: types.filter((t) => t.kind === 'resource').length,
  data: types.filter((t) => t.kind === 'data-source').length,
  relations: relations.length,
}))
</script>

<template>
  <div class="rm">
    <div class="rm-bar">
      <div class="rm-title">
        <h1 class="pp-display">Relationship map</h1>
        <p>{{ stats.resources }} resources, {{ stats.data }} data sources and {{ stats.relations }} references between them. Hover to trace, click for details.</p>
      </div>
      <div class="rm-controls">
        <div class="rm-search">
          <input v-model="query" type="search" placeholder="Find a resource" aria-label="Find a resource" />
          <ul v-if="matches.length" class="rm-results">
            <li v-for="m in matches" :key="m.id"><button type="button" @click="pick(m.id)">{{ m.title }} <span class="pp-mono">{{ m.subtitle }}</span></button></li>
          </ul>
        </div>
        <label class="rm-toggle"><input v-model="showData" type="checkbox" />Data sources</label>
        <label class="rm-toggle"><input v-model="showExternal" type="checkbox" />Azure &amp; Entra</label>
        <button type="button" class="pp-btn small ghost" @click="canvas?.fit()">Fit</button>
      </div>
      <div class="rm-layers" role="group" aria-label="Layers">
        <button v-for="c in categories" :key="c.id" type="button" class="rm-layer" :class="{ off: hiddenLayers.has(c.id) }" :aria-pressed="!hiddenLayers.has(c.id)" @click="toggleLayer(c.id)">
          <span class="rm-pen" :style="{ background: `var(--pen-${c.id})` }" />{{ c.title }}
        </button>
      </div>
    </div>

    <div class="rm-body">
      <div class="rm-canvas">
        <PlotCanvas ref="canvas" :scene="scene" interactive :selected="selected" aria-label="Relationship map of all provider types" @select="selected = $event" @background="selected = null" />
        <div class="rm-legend">
          <span><i class="l solid" />references / lives in</span>
          <span><i class="l dashed" />data source lookup</span>
          <span><i class="l dotted" />Azure / Entra</span>
          <span><i class="l dashdot" />depends_on</span>
        </div>
      </div>
      <aside class="rm-detail" :class="{ open: detail }" aria-live="polite">
        <template v-if="detail">
          <button type="button" class="rm-close" aria-label="Close details" @click="selected = null">×</button>
          <p class="pp-label">
            <span class="rm-pen" :style="{ background: detail.ep.kind === 'external' ? 'var(--pen-external)' : `var(--pen-${detail.ep.category})` }" />
            {{ detail.ep.kind === 'external' ? 'Outside Terraform' : detail.ep.kind === 'resource' ? 'Resource' : 'Data source' }}
          </p>
          <h2 class="pp-display">{{ detail.ep.title }}</h2>
          <p class="pp-mono rm-addr">{{ detail.ep.subtitle }}</p>
          <p v-if="detail.type" class="rm-summary">{{ detail.type.summary }}</p>
          <div v-if="detail.out.length">
            <p class="pp-label">Depends on</p>
            <ul class="rm-rel">
              <li v-for="(r, i) in detail.out" :key="i">
                <button type="button" @click="selected = epFor(r, 'out').id">{{ epFor(r, 'out').title }}</button>
                <code v-if="r.attr">{{ r.attr }}</code><span v-else class="rm-kind">depends_on</span>
                <span class="rm-kind">{{ relationKinds[r.kind]?.label }}</span>
              </li>
            </ul>
          </div>
          <div v-if="detail.in.length">
            <p class="pp-label">Used by</p>
            <ul class="rm-rel">
              <li v-for="(r, i) in detail.in" :key="i">
                <button type="button" @click="selected = epFor(r, 'in').id">{{ epFor(r, 'in').title }}</button>
                <code v-if="r.attr">{{ r.attr }}</code>
              </li>
            </ul>
          </div>
          <div class="rm-actions">
            <a v-if="detail.ep.page" class="pp-btn small" :href="withBase(detail.ep.page)">Read the reference</a>
            <a v-if="detail.ep.kind === 'resource'" class="pp-btn small ghost" :href="withBase(`/builder#add=${detail.ep.name}`)">Add in builder</a>
          </div>
        </template>
        <template v-else>
          <p class="pp-label">How to read it</p>
          <p class="rm-summary">Arrows point from the resource that holds a reference to the one it points at. Everything on the right lives inside an environment and needs it to exist first.</p>
          <p class="rm-summary">Turn on <strong>Data sources</strong> to see where values such as locations, languages, connectors and role ids come from.</p>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.rm {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--vp-nav-height));
  background: var(--pp-film);
}

.rm-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 20px;
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.rm-title h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 760;
  line-height: 1.2;
}

.rm-title p {
  margin: 2px 0 0;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}

.rm-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.rm-search {
  position: relative;
}

.rm-search input {
  height: 32px;
  width: 210px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13.5px;
}

.rm-results {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 4px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(10, 20, 40, 0.16);
  min-width: 300px;
}

.rm-results button {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  border: 0;
  background: none;
  padding: 6px 8px;
  text-align: left;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.rm-results button:hover {
  background: var(--vp-c-bg-soft);
}

.rm-results .pp-mono {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.rm-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}

.rm-toggle input {
  accent-color: var(--pp-violet);
}

.rm-layers {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rm-layer {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.rm-layer.off {
  opacity: 0.45;
  text-decoration: line-through;
}

.rm-pen {
  display: inline-block;
  width: 16px;
  height: 3px;
  border-radius: 2px;
  vertical-align: middle;
  margin-right: 4px;
}

.rm-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
}

.rm-canvas {
  position: relative;
  min-height: 0;
}

.rm-legend {
  position: absolute;
  left: 12px;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  pointer-events: none;
}

.rm-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.l {
  display: inline-block;
  width: 20px;
  border-top: 1.6px solid var(--pp-graphite);
}

.l.dashed {
  border-top-style: dashed;
}

.l.dotted {
  border-top-style: dotted;
  border-top-width: 2px;
}

.l.dashdot {
  border-top: 0;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--pp-graphite) 0 7px, transparent 7px 10px, var(--pp-graphite) 10px 12px, transparent 12px 15px);
}

.rm-detail {
  position: relative;
  border-left: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  padding: 18px 18px 30px;
  overflow-y: auto;
}

.rm-detail h2 {
  margin: 4px 0 2px;
  font-size: 20px;
  font-weight: 740;
  line-height: 1.2;
}

.rm-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: 0;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.rm-addr {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  word-break: break-all;
}

.rm-summary {
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.rm-rel {
  list-style: none;
  margin: 6px 0 14px;
  padding: 0;
}

.rm-rel li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
  font-size: 13px;
}

.rm-rel button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--pp-violet);
  cursor: pointer;
  font-size: 13.5px;
  text-align: left;
}

.rm-rel code {
  font-size: 11.5px;
}

.rm-kind {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.rm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

@media (max-width: 960px) {
  .rm {
    height: auto;
  }

  .rm-bar {
    grid-template-columns: 1fr;
  }

  .rm-controls {
    justify-content: flex-start;
  }

  .rm-body {
    grid-template-columns: 1fr;
  }

  .rm-canvas {
    height: 70vh;
  }

  .rm-detail {
    border-left: 0;
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
