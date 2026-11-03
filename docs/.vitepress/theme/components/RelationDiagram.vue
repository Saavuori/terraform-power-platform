<script setup>
// What a type depends on (left) and what depends on it (right), drawn from
// the curated relation model. Arrows point from the referencing type to the
// referenced one, so everything on the right needs the centre to exist first.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'
import PlotCanvas from './PlotCanvas.vue'
import { getType, relationsFrom, relationsTo, endpoint, relationKinds } from '../lib/graph.js'

const props = defineProps({
  name: { type: String, required: true },
  kind: { type: String, default: 'resource' },
})

const router = useRouter()
const NW = 184
const NH = 42
const GAP = 10
const COL = NW + 74

// narrow columns get a top-to-bottom layout so lettering stays legible
const root = ref(null)
const narrow = ref(false)
let ro = null
onMounted(() => {
  if (!(root.value instanceof Element)) return
  ro = new ResizeObserver(([e]) => (narrow.value = e.contentRect.width < 600))
  ro.observe(root.value)
})
onBeforeUnmount(() => ro?.disconnect())

const self = computed(() => getType(props.name, props.kind))
const outbound = computed(() => relationsFrom(props.name, props.kind))
const inbound = computed(() => relationsTo(props.name, props.kind))

const kindRank = { resource: 0, 'data-source': 1, external: 2 }
function groupBy(list, side) {
  const m = new Map()
  for (const r of list) {
    const ep = side === 'out' ? endpoint(r.to, r.toKind) : endpoint(r.from, r.fromKind)
    if (!m.has(ep.id)) m.set(ep.id, { ep, rels: [] })
    m.get(ep.id).rels.push(r)
  }
  return [...m.values()].sort((a, b) => kindRank[a.ep.kind] - kindRank[b.ep.kind] || a.ep.title.localeCompare(b.ep.title))
}
const left = computed(() => groupBy(outbound.value, 'out'))
const right = computed(() => groupBy(inbound.value, 'in'))

const edgeKind = (k) => (k === 'lookup' ? 'lookup' : k === 'external' ? 'external' : k === 'implicit' ? 'implicit' : 'reference')
const nodeKind = (k) => (k === 'data-source' ? 'data' : k === 'external' ? 'external' : 'resource')
const tag = (ep) => (ep.kind === 'data-source' ? 'DATA' : ep.kind === 'external' ? (ep.side === 'entra' ? 'ENTRA' : ep.side === 'azure' ? 'AZURE' : 'INPUT') : null)

function nodeFor(g, side, x, y, w = NW) {
  const id = `n:${side}:${g.ep.id}`
  return {
    id,
    kind: nodeKind(g.ep.kind),
    x,
    y,
    w,
    h: NH,
    title: g.ep.title,
    subtitle: g.ep.subtitle,
    pen: g.ep.kind === 'external' ? 'external' : g.ep.category,
    tag: tag(g.ep),
    selectable: Boolean(g.ep.page),
    href: g.ep.page,
  }
}

function edgesFor(g, id, side, edges) {
  g.rels.forEach((r, k) => {
    const label = r.attr || (r.kind === 'implicit' ? 'depends_on' : '')
    if (side === 'out') edges.push({ id: `${id}:${k}`, from: 'self', to: id, kind: edgeKind(r.kind), label, pen: self.value?.category })
    else edges.push({ id: `${id}:${k}`, from: id, to: 'self', kind: edgeKind(r.kind), label, pen: g.ep.kind === 'external' ? 'external' : g.ep.category })
  })
}

// top-to-bottom: depends-on row, the type, used-by row
function verticalScene() {
  const nodes = []
  const edges = []
  const labels = []
  const cols = 2
  const w = 210
  const gx = 18
  const rowsOf = (n) => Math.ceil(n / cols)
  const width = cols * w + (cols - 1) * gx
  let y = left.value.length ? 26 : 0
  left.value.forEach((g, i) => {
    const n = nodeFor(g, 'out', (i % cols) * (w + gx), y + Math.floor(i / cols) * (NH + GAP), w)
    nodes.push(n)
    edgesFor(g, n.id, 'out', edges)
  })
  if (left.value.length) labels.push({ x: 0, y: 12, text: 'DEPENDS ON' })
  y += rowsOf(left.value.length) * (NH + GAP) + (left.value.length ? 56 : 0)
  nodes.push({ id: 'self', kind: 'hub', x: (width - 260) / 2, y, w: 260, h: 60, title: self.value?.title || props.name, subtitle: (props.kind === 'data-source' ? 'data.' : '') + props.name, pen: self.value?.category })
  y += 60 + 64
  if (right.value.length) labels.push({ x: 0, y: y - 14, text: 'USED BY' })
  right.value.forEach((g, i) => {
    const n = nodeFor(g, 'in', (i % cols) * (w + gx), y + Math.floor(i / cols) * (NH + GAP), w)
    nodes.push(n)
    edgesFor(g, n.id, 'in', edges)
  })
  return { nodes, edges, labels, frames: [] }
}

const scene = computed(() => {
  if (narrow.value) return verticalScene()
  const nodes = []
  const edges = []
  const labels = []
  const rightCols = right.value.length > 11 ? 2 : 1
  const rightRows = Math.ceil(right.value.length / rightCols)
  const colH = (n) => (n ? n * NH + (n - 1) * GAP : 0)
  const height = Math.max(colH(left.value.length), colH(rightRows), 70)
  const top = 30
  const hub = { id: 'self', kind: 'hub', x: COL, y: top + (height - 64) / 2, w: NW + 10, h: 64, title: self.value?.title || props.name, subtitle: (props.kind === 'data-source' ? 'data.' : '') + props.name, pen: self.value?.category }
  nodes.push(hub)

  const place = (items, x0, cols, side) => {
    const rows = Math.ceil(items.length / cols)
    const offset = (height - colH(rows)) / 2
    items.forEach((g, i) => {
      const col = Math.floor(i / rows)
      const row = i % rows
      const n = nodeFor(g, side, x0 + col * (NW + 18), top + offset + row * (NH + GAP))
      nodes.push(n)
      edgesFor(g, n.id, side, edges)
    })
  }
  place(left.value, 0, 1, 'out')
  place(right.value, COL * 2, rightCols, 'in')
  if (left.value.length) labels.push({ x: 0, y: 12, text: 'DEPENDS ON' })
  if (right.value.length) labels.push({ x: COL * 2, y: 12, text: 'USED BY' })
  return { nodes, edges, labels, frames: [] }
})

function go(id) {
  const n = scene.value.nodes.find((x) => x.id === id)
  if (n && n.href) router.go(withBase(n.href))
}

const listOut = computed(() => outbound.value.map((r) => ({ r, ep: endpoint(r.to, r.toKind) })))
const listIn = computed(() => inbound.value.map((r) => ({ r, ep: endpoint(r.from, r.fromKind) })))
</script>

<template>
  <figure ref="root" class="rd">
    <PlotCanvas :scene="scene" :padding="18" :aria-label="`Relationships of ${name}`" @select="go" />
    <figcaption class="rd-legend">
      <span><i class="l solid" />references / lives in</span>
      <span><i class="l dashed" />value from a data source</span>
      <span><i class="l dotted" />Azure / Entra object</span>
      <span><i class="l dashdot" />needs depends_on</span>
    </figcaption>
    <div v-if="listOut.length || listIn.length" class="rd-lists">
      <div v-if="listOut.length">
        <p class="pp-label">Depends on</p>
        <ul>
          <li v-for="({ r, ep }, i) in listOut" :key="i">
            <code v-if="r.attr">{{ r.attr }}</code><span v-else class="rd-implicit">depends_on</span>
            → <a v-if="ep.page" :href="withBase(ep.page)">{{ ep.title }}</a><span v-else>{{ ep.title }}</span>
            <span class="rd-kind">{{ relationKinds[r.kind]?.label }}</span>
            <span v-if="r.note" class="rd-note" v-html="r.note.replace(/`([^`]+)`/g, '<code>$1</code>')" />
          </li>
        </ul>
      </div>
      <div v-if="listIn.length">
        <p class="pp-label">Used by</p>
        <ul>
          <li v-for="({ r, ep }, i) in listIn" :key="i">
            <a v-if="ep.page" :href="withBase(ep.page)">{{ ep.title }}</a><span v-else>{{ ep.title }}</span>
            <span class="rd-kind">via</span> <code v-if="r.attr">{{ r.attr }}</code><span v-else class="rd-implicit">depends_on</span>
          </li>
        </ul>
      </div>
    </div>
    <p v-else class="rd-none">No other resource points at this one, and it points at none.</p>
  </figure>
</template>

<style scoped>
.rd {
  margin: 16px 0 8px;
}

.rd :deep(.ppc) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--pp-film);
}

.rd-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.rd-legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.l {
  display: inline-block;
  width: 22px;
  height: 0;
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

.rd-lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 6px 28px;
  margin-top: 14px;
}

.rd-lists ul {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 13.5px;
}

.rd-lists li {
  line-height: 1.55;
  margin: 3px 0;
}

.rd-kind {
  color: var(--vp-c-text-3);
  font-size: 12px;
  margin: 0 3px;
}

.rd-note {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 12.5px;
}

.rd-implicit {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.rd-none {
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}
</style>
