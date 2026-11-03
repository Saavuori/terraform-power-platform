<script setup>
// A pen-plotter style SVG canvas. Layout happens elsewhere; this draws a
// scene of frames (containers), nodes and edges, handles pan / zoom /
// selection, traces connections on hover and can export itself.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, nextTick, useId } from 'vue'
import { edgeGeometry, fitText, union } from '../lib/plot.js'

const props = defineProps({
  scene: { type: Object, required: true },
  interactive: { type: Boolean, default: false },
  selected: { type: String, default: null },
  titleBlock: { type: Object, default: null },
  animate: { type: Boolean, default: true },
  padding: { type: Number, default: 28 },
  ariaLabel: { type: String, default: 'Diagram' },
  grid: { type: Boolean, default: true },
  maxHeight: { type: Number, default: 0 },
})
const emit = defineEmits(['select', 'background', 'hover'])

// stable across server render and hydration, unique per canvas on the page
const uid = `pc-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`

const TB_W = 330
const TB_H = 84

const frames = computed(() => [...(props.scene.frames || [])].sort((a, b) => (a.depth || 0) - (b.depth || 0)))
const nodes = computed(() => props.scene.nodes || [])
const labels = computed(() => props.scene.labels || [])

const boxes = computed(() => {
  const m = new Map()
  for (const f of frames.value) m.set(f.id, f)
  for (const n of nodes.value) m.set(n.id, n)
  return m
})

const edges = computed(() =>
  (props.scene.edges || [])
    .map((e) => {
      const a = boxes.value.get(e.from)
      const b = boxes.value.get(e.to)
      if (!a || !b) return null
      const geo = edgeGeometry(a, b)
      const short = Math.hypot(geo.end[0] - geo.start[0], geo.end[1] - geo.start[1]) < 80
      return { ...e, geo, quietLabel: e.quietLabel || short }
    })
    .filter(Boolean),
)

const drawing = computed(() => {
  const all = [...frames.value, ...nodes.value]
  return props.scene.bounds || union(all)
})

const titleBox = computed(() => {
  if (!props.titleBlock) return null
  const d = drawing.value
  return { x: d.x + Math.max(d.w, TB_W) - TB_W, y: d.y + d.h + 26, w: TB_W, h: TB_H }
})

const extent = computed(() => {
  const parts = [drawing.value]
  if (titleBox.value) parts.push(titleBox.value)
  const u = union(parts)
  const p = props.padding
  return { x: u.x - p, y: u.y - p, w: u.w + 2 * p, h: u.h + 2 * p }
})

// pens used by edges -> one arrow marker each
const markerPens = computed(() => {
  const s = new Set(['ink', 'violet'])
  for (const e of edges.value) s.add(e.pen || 'ink')
  return [...s]
})
const penColor = (p) => (p === 'ink' ? 'var(--pp-ink)' : p === 'violet' ? 'var(--pp-violet)' : p === 'red' ? 'var(--pp-red)' : `var(--pen-${p})`)

// ---------------------------------------------------------------- hover tracing
const hoverId = ref(null)
const active = computed(() => {
  const focus = hoverId.value || null
  if (!focus) return null
  const ids = new Set([focus])
  const edgeIds = new Set()
  for (const e of edges.value) {
    if (e.from === focus || e.to === focus) {
      ids.add(e.from)
      ids.add(e.to)
      edgeIds.add(e.id)
    }
  }
  const inside = (b, f) => b !== f && b.x >= f.x && b.y >= f.y && b.x + b.w <= f.x + f.w && b.y + b.h <= f.y + f.h
  // keep containers of highlighted things visible
  for (const f of frames.value) {
    for (const id of [...ids]) {
      const b = boxes.value.get(id)
      if (b && inside(b, f)) ids.add(f.id)
    }
  }
  // and everything inside a hovered container (except the tenant sheet)
  const hovered = boxes.value.get(focus)
  if (hovered && hovered.kind && hovered.kind !== 'tenant' && frames.value.includes(hovered)) {
    for (const b of boxes.value.values()) if (inside(b, hovered)) ids.add(b.id)
  }
  return { ids, edgeIds }
})
const dimNode = (id) => active.value && !active.value.ids.has(id)
const dimEdge = (id) => active.value && !active.value.edgeIds.has(id)
function setHover(id) {
  hoverId.value = id
  emit('hover', id)
}

// ---------------------------------------------------------------- draw-in animation
const seen = new Set()
const fresh = shallowRef(new Set())
const order = shallowRef(new Map())
let freshTimer = null
let firstPaint = true
function computeFresh() {
  if (!props.animate) {
    fresh.value = new Set()
    return
  }
  const next = new Set()
  const ord = new Map()
  let i = 0
  const ids = [...frames.value.map((f) => f.id), ...nodes.value.map((n) => n.id), ...(props.scene.edges || []).map((e) => 'e:' + e.id)]
  for (const id of ids) {
    if (!seen.has(id)) {
      next.add(id)
      ord.set(id, firstPaint ? Math.min(i++, 40) : 0)
    }
    seen.add(id)
  }
  firstPaint = false
  fresh.value = next
  order.value = ord
  if (typeof window === 'undefined') return
  clearTimeout(freshTimer)
  freshTimer = setTimeout(() => (fresh.value = new Set()), 2600)
}
watch(() => props.scene, computeFresh, { immediate: true })
const drawStyle = (id) => ({ '--d': `${(order.value.get(id) || 0) * 45}ms` })
const isFresh = (id) => fresh.value.has(id)

// ---------------------------------------------------------------- pan / zoom
const host = ref(null)
const svgEl = ref(null)
const contentEl = ref(null)
const size = ref({ w: 800, h: 500 })
const view = ref({ x: 0, y: 0, k: 1 })
let ro = null
let fitted = false
let userMoved = false

function fit(pad = 36) {
  const { w: cw, h: ch } = size.value
  const e = extent.value
  if (!e.w || !e.h || !cw || !ch) return
  const k = Math.max(0.12, Math.min(1.2, Math.min((cw - pad * 2) / e.w, (ch - pad * 2) / e.h)))
  view.value = { k, x: (cw - e.w * k) / 2 - e.x * k, y: (ch - e.h * k) / 2 - e.y * k }
  fitted = true
  userMoved = false
}

function zoomAt(factor, cx, cy) {
  userMoved = true
  const v = view.value
  const k = Math.max(0.12, Math.min(3, v.k * factor))
  const f = k / v.k
  view.value = { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f }
}
function zoomBy(factor) {
  zoomAt(factor, size.value.w / 2, size.value.h / 2)
}

const pointers = new Map()
let drag = null
let pinch = null

function localPoint(ev) {
  const r = svgEl.value.getBoundingClientRect()
  return { x: ev.clientX - r.left, y: ev.clientY - r.top }
}

function onPointerDown(ev) {
  if (!props.interactive) return
  const p = localPoint(ev)
  pointers.set(ev.pointerId, p)
  svgEl.value.setPointerCapture?.(ev.pointerId)
  const target = ev.target.closest?.('[data-sel]')
  if (pointers.size === 1) {
    drag = { start: p, last: p, moved: false, target: target ? target.getAttribute('data-sel') : null }
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), k: view.value.k }
    drag = null
  }
}

function onPointerMove(ev) {
  if (!props.interactive || !pointers.has(ev.pointerId)) return
  const p = localPoint(ev)
  pointers.set(ev.pointerId, p)
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const dist = Math.hypot(a.x - b.x, a.y - b.y)
    const target = (pinch.k * dist) / pinch.dist
    zoomAt(target / view.value.k, (a.x + b.x) / 2, (a.y + b.y) / 2)
    return
  }
  if (!drag) return
  const dx = p.x - drag.last.x
  const dy = p.y - drag.last.y
  if (Math.abs(p.x - drag.start.x) + Math.abs(p.y - drag.start.y) > 4) drag.moved = true
  if (drag.moved) {
    userMoved = true
    view.value = { ...view.value, x: view.value.x + dx, y: view.value.y + dy }
  }
  drag.last = p
}

function onPointerUp(ev) {
  if (!props.interactive) return
  pointers.delete(ev.pointerId)
  if (pointers.size < 2) pinch = null
  if (drag && !drag.moved) {
    if (drag.target) emit('select', drag.target)
    else emit('background')
  }
  drag = null
}

function onWheel(ev) {
  if (!props.interactive) return
  ev.preventDefault()
  const p = localPoint(ev)
  const delta = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY
  zoomAt(Math.exp(-delta * 0.0016), p.x, p.y)
}

function onKey(ev) {
  if (!props.interactive) return
  const step = 60
  const map = {
    '+': () => zoomBy(1.2),
    '=': () => zoomBy(1.2),
    '-': () => zoomBy(1 / 1.2),
    0: () => fit(),
    ArrowLeft: () => (view.value = { ...view.value, x: view.value.x + step }),
    ArrowRight: () => (view.value = { ...view.value, x: view.value.x - step }),
    ArrowUp: () => (view.value = { ...view.value, y: view.value.y + step }),
    ArrowDown: () => (view.value = { ...view.value, y: view.value.y - step }),
  }
  if (ev.target !== host.value) return
  const fn = map[ev.key]
  if (fn) {
    ev.preventDefault()
    fn()
  }
}

function onStaticClick(ev) {
  if (props.interactive) return
  const target = ev.target.closest?.('[data-sel]')
  if (target) emit('select', target.getAttribute('data-sel'))
}

function onItemKey(ev, id) {
  if (ev.key === 'Enter' || ev.key === ' ') {
    ev.preventDefault()
    emit('select', id)
  }
}

onMounted(() => {
  if (props.interactive && host.value) {
    ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect
      size.value = { w: cr.width, h: cr.height }
      if (!fitted || !userMoved) fit()
    })
    ro.observe(host.value)
    svgEl.value.addEventListener('wheel', onWheel, { passive: false })
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  svgEl.value?.removeEventListener('wheel', onWheel)
  clearTimeout(freshTimer)
})

watch(
  () => (props.scene.nodes?.length || 0) + (props.scene.frames?.length || 0),
  (n, o) => {
    if (props.interactive && (!fitted || o === 0)) nextTick(() => fit())
  },
)

const contentTransform = computed(() => (props.interactive ? `translate(${view.value.x},${view.value.y}) scale(${view.value.k})` : null))
const staticViewBox = computed(() => {
  const e = extent.value
  return `${e.x} ${e.y} ${e.w} ${e.h}`
})
const zoomPct = computed(() => Math.round(view.value.k * 100))

// ---------------------------------------------------------------- export
function resolveVars(svgText) {
  const cs = getComputedStyle(document.documentElement)
  return svgText.replace(/var\((--[a-z0-9-]+)\)/gi, (_, name) => cs.getPropertyValue(name).trim() || '#000')
}

function exportSvg() {
  const e = extent.value
  const clone = contentEl.value.cloneNode(true)
  clone.removeAttribute('transform')
  clone.querySelectorAll('.ppc-draw').forEach((n) => n.classList.remove('ppc-draw'))
  clone.querySelectorAll('.ppc-dim').forEach((n) => n.classList.remove('ppc-dim'))
  const defs = svgEl.value.querySelector('defs').cloneNode(true)
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${e.x} ${e.y} ${e.w} ${e.h}" width="${Math.round(e.w)}" height="${Math.round(e.h)}">${defs.outerHTML}<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" style="fill: var(--pp-film)"/>${clone.innerHTML}</svg>`
  return resolveVars(xml)
}

async function exportPng(scale = 2) {
  const svg = exportSvg()
  const e = extent.value
  const img = new Image()
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = rej
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(e.w * scale)
  canvas.height = Math.round(e.h * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

defineExpose({ fit, zoomBy, exportSvg, exportPng, zoom: zoomPct })

// ---------------------------------------------------------------- drawing helpers
const fontDisplay = 'font-family: var(--pp-font-display)'
const fontBody = 'font-family: var(--pp-font-body)'
const fontMono = 'font-family: var(--pp-font-mono)'

const dashFor = (kind) => ({ lookup: '5 4', external: '2 4', implicit: '7 3 2 3' })[kind] || null
const nodeDash = (kind) => ({ data: '4 3', external: '2 3' })[kind] || null

function cropMarks(f) {
  const o = 7
  const l = 16
  const x1 = f.x - o
  const y1 = f.y - o
  const x2 = f.x + f.w + o
  const y2 = f.y + f.h + o
  return [
    `M${x1},${y1 + l} V${y1} H${x1 + l}`,
    `M${x2 - l},${y1} H${x2} V${y1 + l}`,
    `M${x2},${y2 - l} V${y2} H${x2 - l}`,
    `M${x1 + l},${y2} H${x1} V${y2 - l}`,
  ].join(' ')
}

function badgeLayout(badges, x, y, maxW) {
  let cx = x
  const out = []
  for (const b of badges || []) {
    const w = Math.round(String(b.text).length * 5.1 + 11)
    if (cx + w > x + maxW) break
    out.push({ ...b, x: cx, y, w })
    cx += w + 5
  }
  return out
}

const badgeTone = (tone) =>
  ({
    green: 'var(--pp-green)',
    red: 'var(--pp-red)',
    amber: 'var(--pp-amber)',
    violet: 'var(--pp-violet)',
  })[tone] || 'var(--pp-graphite)'
</script>

<template>
  <div
    ref="host"
    class="ppc"
    :class="{ 'ppc-interactive': interactive }"
    :tabindex="interactive ? 0 : undefined"
    :aria-label="interactive ? ariaLabel + ' — drag to pan, scroll or +/- to zoom, 0 to fit' : undefined"
    @keydown="onKey"
  >
    <svg
      ref="svgEl"
      class="ppc-svg"
      :viewBox="interactive ? undefined : staticViewBox"
      :style="!interactive && maxHeight ? { maxHeight: maxHeight + 'px' } : null"
      :role="interactive ? 'application' : 'img'"
      :aria-label="ariaLabel"
      xmlns="http://www.w3.org/2000/svg"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="setHover(null)"
      @click="onStaticClick"
    >
      <defs>
        <pattern :id="`${uid}-grid`" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12,0 H0 V12" style="fill: none; stroke: var(--pp-grid); stroke-width: 0.6" />
        </pattern>
        <pattern :id="`${uid}-grid5`" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" :style="`fill: url(#${uid}-grid)`" />
          <path d="M60,0 H0 V60" style="fill: none; stroke: var(--pp-grid-major); stroke-width: 0.9" />
        </pattern>
        <pattern :id="`${uid}-hatch`" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" style="stroke: var(--pp-hairline); stroke-width: 1.4" />
        </pattern>
        <marker
          v-for="p in markerPens"
          :id="`${uid}-arrow-${p}`"
          :key="p"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M1,1 L9,5 L1,9" :style="`fill: none; stroke: ${penColor(p)}; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round`" />
        </marker>
      </defs>

      <g ref="contentEl" :transform="contentTransform">
        <rect
          v-if="grid"
          :x="extent.x - (interactive ? 4000 : 0)"
          :y="extent.y - (interactive ? 4000 : 0)"
          :width="extent.w + (interactive ? 8000 : 0)"
          :height="extent.h + (interactive ? 8000 : 0)"
          :style="`fill: url(#${uid}-grid5)`"
        />

        <!-- frames -->
        <g
          v-for="f in frames"
          :key="f.id"
          class="ppc-frame"
          :class="[`ppc-frame-${f.kind}`, { 'ppc-draw': isFresh(f.id), 'ppc-dim': dimNode(f.id), 'ppc-selectable': f.selectable }]"
          :style="drawStyle(f.id)"
          :data-sel="f.selectable ? f.id : undefined"
          :tabindex="interactive && f.selectable ? 0 : undefined"
          :role="f.selectable ? 'button' : undefined"
          :aria-label="f.selectable ? `${f.title} ${f.subtitle || ''}` : undefined"
          @mouseenter="setHover(f.id)"
          @mouseleave="setHover(null)"
          @keydown="onItemKey($event, f.id)"
          @focus="setHover(f.id)"
          @blur="setHover(null)"
        >
          <template v-if="f.kind === 'tenant'">
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" class="ppc-stroke" pathLength="1" style="fill: var(--pp-sheet); fill-opacity: 0.55; stroke: var(--pp-ink); stroke-width: 1.5" />
            <path :d="cropMarks(f)" class="ppc-stroke" pathLength="1" style="fill: none; stroke: var(--pp-ink); stroke-width: 1.2" />
            <text :x="f.x + 18" :y="f.y + 24" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 11px; letter-spacing: 0.12em; fill: var(--pp-graphite)`">{{ (f.eyebrow || 'TENANT').toUpperCase() }}</text>
            <text :x="f.x + 18" :y="f.y + 44" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 112%; font-weight: 720; font-size: 17px; fill: var(--pp-ink)`">{{ fitText(f.title, f.w - 40, 17, 0.64) }}</text>
          </template>

          <template v-else-if="f.kind === 'group'">
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="6" class="ppc-fill" :style="`fill: ${penColor(f.pen)}; fill-opacity: 0.045; stroke: ${penColor(f.pen)}; stroke-width: 1.3; stroke-dasharray: 9 5`" />
            <text :x="f.x + 14" :y="f.y + 20" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 10.5px; letter-spacing: 0.12em; fill: ${penColor(f.pen)}`">{{ (f.eyebrow || 'ENVIRONMENT GROUP').toUpperCase() }}</text>
            <text :x="f.x + 14" :y="f.y + 38" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 108%; font-weight: 700; font-size: 14.5px; fill: var(--pp-ink)`">{{ fitText(f.title, f.w - 28, 14.5, 0.62) }}</text>
          </template>

          <template v-else-if="f.kind === 'env'">
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="4" class="ppc-stroke" pathLength="1" :style="`fill: var(--pp-sheet); stroke: ${penColor(f.pen)}; stroke-width: 1.5`" />
            <rect :x="f.x + 0.75" :y="f.y + 0.75" :width="f.w - 1.5" :height="(f.header || 62) - 0.75" rx="3.5" class="ppc-fill" :style="`fill: ${penColor(f.pen)}; fill-opacity: 0.075`" />
            <line :x1="f.x" :x2="f.x + f.w" :y1="f.y + (f.header || 62)" :y2="f.y + (f.header || 62)" class="ppc-fill" :style="`stroke: ${penColor(f.pen)}; stroke-opacity: 0.45; stroke-width: 1`" />
            <text :x="f.x + 14" :y="f.y + 22" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 106%; font-weight: 700; font-size: 14px; fill: var(--pp-ink)`">{{ fitText(f.title, f.w - 40, 14, 0.62) }}</text>
            <text :x="f.x + 14" :y="f.y + 37" class="ppc-fill" :style="`${fontMono}; font-size: 9.5px; fill: var(--pp-graphite)`">{{ fitText(f.subtitle, f.w - 28, 9.5, 0.6) }}</text>
            <g class="ppc-fill">
              <g v-for="b in badgeLayout(f.badges, f.x + 14, f.y + 44, f.w - 28)" :key="b.text">
                <rect :x="b.x" :y="b.y" :width="b.w" height="13" rx="6.5" :style="`fill: none; stroke: ${badgeTone(b.tone)}; stroke-width: 0.9`" />
                <text :x="b.x + b.w / 2" :y="b.y + 9.6" text-anchor="middle" :style="`${fontDisplay}; font-stretch: 80%; font-weight: 640; font-size: 8.6px; letter-spacing: 0.05em; fill: ${badgeTone(b.tone)}`">{{ b.text }}</text>
              </g>
            </g>
            <circle v-if="f.status" :cx="f.x + f.w - 14" :cy="f.y + 16" r="4.5" :style="`fill: ${f.status === 'error' ? 'var(--pp-red)' : 'var(--pp-amber)'}`" />
          </template>

          <template v-else-if="f.kind === 'lane'">
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="4" class="ppc-fill" style="fill: none; stroke: var(--pp-faint); stroke-width: 1; stroke-dasharray: 3 4" />
            <rect :x="f.x" :y="f.y" :width="f.w" height="30" rx="4" class="ppc-fill" :style="`fill: url(#${uid}-hatch)`" />
            <text :x="f.x + 12" :y="f.y + 19" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 78%; font-weight: 680; font-size: 10.5px; letter-spacing: 0.12em; fill: var(--pp-graphite)`">{{ f.title.toUpperCase() }}</text>
          </template>

          <template v-else-if="f.kind === 'unplaced'">
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="4" class="ppc-fill" style="fill: none; stroke: var(--pp-red); stroke-width: 1.2; stroke-dasharray: 6 4" />
            <text :x="f.x + 12" :y="f.y + 20" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 78%; font-weight: 680; font-size: 10.5px; letter-spacing: 0.1em; fill: var(--pp-red)`">{{ f.title.toUpperCase() }}</text>
          </template>

          <template v-else-if="f.kind === 'column'">
            <line :x1="f.x" :x2="f.x + f.w" :y1="f.y + 30" :y2="f.y + 30" class="ppc-stroke" pathLength="1" style="stroke: var(--pp-ink); stroke-width: 1.1" />
            <text :x="f.x" :y="f.y + 18" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 78%; font-weight: 680; font-size: 11px; letter-spacing: 0.12em; fill: var(--pp-ink)`">{{ f.title.toUpperCase() }}</text>
            <text v-if="f.subtitle" :x="f.x + f.w" :y="f.y + 18" text-anchor="end" class="ppc-fill" :style="`${fontMono}; font-size: 9.5px; fill: var(--pp-graphite)`">{{ f.subtitle }}</text>
          </template>

          <template v-else>
            <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="4" class="ppc-fill" style="fill: none; stroke: var(--pp-hairline); stroke-width: 1" />
            <text :x="f.x + 12" :y="f.y + 20" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 78%; font-weight: 680; font-size: 10.5px; letter-spacing: 0.12em; fill: var(--pp-graphite)`">{{ String(f.title || '').toUpperCase() }}</text>
          </template>

          <rect
            v-if="selected === f.id"
            :x="f.x - 4"
            :y="f.y - 4"
            :width="f.w + 8"
            :height="f.h + 8"
            rx="7"
            style="fill: none; stroke: var(--pp-violet); stroke-width: 2"
          />
        </g>

        <!-- edges -->
        <g
          v-for="e in edges"
          :key="'e:' + e.id"
          class="ppc-edge"
          :class="{ 'ppc-draw': isFresh('e:' + e.id) && !dashFor(e.kind), 'ppc-fade': isFresh('e:' + e.id) && dashFor(e.kind), 'ppc-dim': dimEdge(e.id), 'ppc-hot': active && active.edgeIds.has(e.id) }"
          :style="drawStyle('e:' + e.id)"
        >
          <path
            :d="e.geo.d"
            :class="{ 'ppc-stroke': !dashFor(e.kind) }"
            :pathLength="dashFor(e.kind) ? undefined : 1"
            :marker-end="`url(#${uid}-arrow-${e.pen || 'ink'})`"
            :style="`fill: none; stroke: ${penColor(e.pen || 'ink')}; stroke-width: ${e.emphasis ? 1.9 : 1.25}; ${dashFor(e.kind) ? 'stroke-dasharray: ' + dashFor(e.kind) : ''}; stroke-linecap: round`"
          />
        </g>

        <!-- nodes -->
        <g
          v-for="n in nodes"
          :key="n.id"
          class="ppc-node"
          :class="{ 'ppc-draw': isFresh(n.id), 'ppc-dim': dimNode(n.id), 'ppc-selectable': n.selectable }"
          :style="drawStyle(n.id)"
          :data-sel="n.selectable ? n.id : undefined"
          :tabindex="n.selectable ? 0 : undefined"
          :role="n.selectable ? (n.href ? 'link' : 'button') : undefined"
          :aria-label="`${n.title}, ${n.subtitle || ''}`"
          @mouseenter="setHover(n.id)"
          @mouseleave="setHover(null)"
          @focus="setHover(n.id)"
          @blur="setHover(null)"
          @keydown="onItemKey($event, n.id)"
        >
          <rect
            :x="n.x"
            :y="n.y"
            :width="n.w"
            :height="n.h"
            rx="3"
            :class="{ 'ppc-stroke': !nodeDash(n.kind) }"
            :pathLength="nodeDash(n.kind) ? undefined : 1"
            :style="`fill: var(--pp-sheet); stroke: ${penColor(n.pen)}; stroke-width: ${n.kind === 'hub' ? 2.2 : 1.2}; ${nodeDash(n.kind) ? 'stroke-dasharray: ' + nodeDash(n.kind) : ''}`"
          />
          <rect :x="n.x" :y="n.y" width="4" :height="n.h" class="ppc-fill" :style="`fill: ${n.kind === 'external' ? `url(#${uid}-hatch)` : penColor(n.pen)}`" />
          <text :x="n.x + 13" :y="n.y + (n.subtitle ? n.h / 2 - 2 : n.h / 2 + 4)" class="ppc-fill" :style="`${fontBody}; font-weight: 700; font-size: ${n.kind === 'hub' ? 14 : 12.2}px; fill: var(--pp-ink)`">{{ fitText(n.title, n.w - (n.tag ? 58 : 22), n.kind === 'hub' ? 14 : 12.2, 0.55) }}</text>
          <text v-if="n.subtitle" :x="n.x + 13" :y="n.y + n.h / 2 + 12" class="ppc-fill" :style="`${fontMono}; font-size: 9.4px; fill: var(--pp-graphite)`">{{ fitText(n.subtitle, n.w - 22, 9.4, 0.6) }}</text>
          <text v-if="n.tag" :x="n.x + n.w - 8" :y="n.y + 13" text-anchor="end" class="ppc-fill" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 8.4px; letter-spacing: 0.1em; fill: var(--pp-faint)`">{{ n.tag }}</text>
          <circle v-if="n.status" :cx="n.x + n.w - 9" :cy="n.y + n.h - 9" r="4" :style="`fill: ${n.status === 'error' ? 'var(--pp-red)' : 'var(--pp-amber)'}`" />
          <rect
            v-if="selected === n.id"
            :x="n.x - 4"
            :y="n.y - 4"
            :width="n.w + 8"
            :height="n.h + 8"
            rx="6"
            style="fill: none; stroke: var(--pp-violet); stroke-width: 2"
          />
        </g>

        <!-- edge labels last so they sit above nodes -->
        <g
          v-for="e in edges.filter((x) => x.label)"
          :key="'l:' + e.id"
          class="ppc-elabel"
          :class="{ 'ppc-dim': dimEdge(e.id), 'ppc-fade': isFresh('e:' + e.id), 'ppc-quiet': !active && e.quietLabel }"
          :style="drawStyle('e:' + e.id)"
        >
          <text
            :x="e.geo.mid.x"
            :y="e.geo.mid.y + 3"
            text-anchor="middle"
            :style="`${fontMono}; font-size: 9px; fill: ${penColor(e.pen || 'ink')}; paint-order: stroke; stroke: var(--pp-sheet); stroke-width: 4px; stroke-linejoin: round`"
          >{{ e.label }}</text>
        </g>

        <!-- free labels -->
        <text
          v-for="(l, i) in labels"
          :key="'t' + i"
          :x="l.x"
          :y="l.y"
          :text-anchor="l.anchor || 'start'"
          class="ppc-fill"
          :style="`${l.mono ? fontMono : fontDisplay}; font-stretch: 78%; font-weight: 650; font-size: ${l.size || 10.5}px; letter-spacing: ${l.mono ? 0 : 0.1}em; fill: var(${l.color || '--pp-graphite'})`"
        >{{ l.text }}</text>

        <!-- title block -->
        <g v-if="titleBox" class="ppc-titleblock">
          <rect :x="titleBox.x" :y="titleBox.y" :width="titleBox.w" :height="titleBox.h" style="fill: var(--pp-sheet); stroke: var(--pp-ink); stroke-width: 1.3" />
          <line :x1="titleBox.x" :x2="titleBox.x + titleBox.w" :y1="titleBox.y + 46" :y2="titleBox.y + 46" style="stroke: var(--pp-ink); stroke-width: 0.8" />
          <line :x1="titleBox.x + titleBox.w - 74" :x2="titleBox.x + titleBox.w - 74" :y1="titleBox.y" :y2="titleBox.y + titleBox.h" style="stroke: var(--pp-ink); stroke-width: 0.8" />
          <line :x1="titleBox.x + 128" :x2="titleBox.x + 128" :y1="titleBox.y + 46" :y2="titleBox.y + titleBox.h" style="stroke: var(--pp-ink); stroke-width: 0.8" />
          <text :x="titleBox.x + 10" :y="titleBox.y + 16" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 8.6px; letter-spacing: 0.14em; fill: var(--pp-graphite)`">{{ (titleBlock.eyebrow || 'TENANT PLAN').toUpperCase() }}</text>
          <text :x="titleBox.x + 10" :y="titleBox.y + 36" :style="`${fontDisplay}; font-stretch: 110%; font-weight: 740; font-size: 15px; fill: var(--pp-ink)`">{{ fitText(titleBlock.title, titleBox.w - 96, 15, 0.64) }}</text>
          <text :x="titleBox.x + titleBox.w - 64" :y="titleBox.y + 16" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 8.6px; letter-spacing: 0.14em; fill: var(--pp-graphite)`">REV</text>
          <text :x="titleBox.x + titleBox.w - 64" :y="titleBox.y + 37" :style="`${fontMono}; font-weight: 600; font-size: 15px; fill: var(--pp-ink)`">{{ String(titleBlock.rev ?? 1).padStart(2, '0') }}</text>
          <template v-for="(c, i) in (titleBlock.cells || []).slice(0, 3)" :key="c.label">
            <text :x="titleBox.x + [10, 138, titleBox.w - 64][i]" :y="titleBox.y + 60" :style="`${fontDisplay}; font-stretch: 76%; font-weight: 650; font-size: 8.4px; letter-spacing: 0.14em; fill: var(--pp-graphite)`">{{ c.label.toUpperCase() }}</text>
            <text :x="titleBox.x + [10, 138, titleBox.w - 64][i]" :y="titleBox.y + 75" :style="`${fontMono}; font-size: 10px; fill: var(--pp-ink)`">{{ fitText(c.value, i === 0 ? 112 : i === 1 ? titleBox.w - 220 : 60, 10, 0.6) }}</text>
          </template>
        </g>
      </g>
    </svg>
    <slot />
  </div>
</template>

<style>
.ppc {
  position: relative;
  width: 100%;
  outline: none;
}

.ppc-interactive {
  height: 100%;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}

.ppc-interactive:active {
  cursor: grabbing;
}

.ppc-interactive:focus-visible {
  box-shadow: inset 0 0 0 2px var(--pp-violet);
}

.ppc-svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

.ppc-interactive .ppc-svg {
  height: 100%;
}

.ppc-selectable {
  cursor: pointer;
}

.ppc-node,
.ppc-frame,
.ppc-edge,
.ppc-elabel {
  transition: opacity 0.18s ease;
}

.ppc-dim {
  opacity: 0.18;
}

.ppc-hot path {
  stroke-width: 2.1px !important;
}

.ppc-quiet {
  opacity: 0;
}

.ppc-node:focus,
.ppc-frame:focus,
.ppc-node:focus-visible,
.ppc-frame:focus-visible {
  outline: none;
}

.ppc-frame:focus-visible > rect:first-child {
  stroke: var(--pp-violet) !important;
}

.ppc-node:focus-visible > rect:first-child {
  stroke: var(--pp-violet) !important;
  stroke-width: 2.4px !important;
}

/* plotter draw-in: strokes are drawn, then fills and lettering appear */
.ppc-draw .ppc-stroke {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: ppc-pen 0.85s cubic-bezier(0.55, 0.1, 0.35, 1) forwards;
  animation-delay: var(--d, 0ms);
}

.ppc-draw .ppc-fill,
.ppc-fade {
  opacity: 0;
  animation: ppc-ink 0.45s ease forwards;
  animation-delay: calc(var(--d, 0ms) + 380ms);
}

@keyframes ppc-pen {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes ppc-ink {
  to {
    opacity: 1;
  }
}
</style>
