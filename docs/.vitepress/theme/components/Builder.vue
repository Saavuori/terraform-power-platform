<script setup>
// The environment builder: pick resources, set their parameters, and watch the
// tenant plan and the Terraform it needs update together.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PlotCanvas from './PlotCanvas.vue'
import BuilderPalette from './builder/BuilderPalette.vue'
import BuilderInspector from './builder/BuilderInspector.vue'
import CodeView from './builder/CodeView.vue'
import { categories, typeInfo, provider } from '../lib/builder/schema.js'
import { BUILDER_ENV, BUILDER_GROUP } from '../lib/builder/specs.js'
import { emptyDesign, normalize, addInstance, removeInstance, duplicateInstance, byId, displayTitle } from '../lib/builder/model.js'
import { generate, planText, highlight } from '../lib/builder/hcl.js'
import { validate } from '../lib/builder/validate.js'
import { architectureScene, applyOrderScene } from '../lib/builder/layout.js'
import { TEMPLATES, templateById } from '../lib/builder/templates.js'
import { encodeDesign, decodeDesign, saveLocal, loadLocal } from '../lib/builder/share.js'

const design = ref(emptyDesign())
const selectedId = ref(null)
const view = ref('architecture')
const panel = ref('configure')
const mobileTab = ref('canvas')
const hidden = ref(new Set())
const showExternal = ref(true)
const showImplicit = ref(true)
const rev = ref(1)
const canvas = ref(null)
const menu = ref(null) // 'templates' | 'layers' | 'export'
const toastText = ref('')
const ready = ref(false)

const generated = computed(() => generate(design.value))
const issues = computed(() => validate(design.value))
const counts = computed(() => {
  const c = {}
  for (const i of design.value.instances) c[i.type] = (c[i.type] || 0) + 1
  return c
})
const errorCount = computed(() => issues.value.filter((i) => i.level === 'error').length)
const warnCount = computed(() => issues.value.filter((i) => i.level === 'warn').length)

const layoutOpts = computed(() => ({
  issues: issues.value,
  hidden: hidden.value,
  showExternal: showExternal.value,
  showImplicit: showImplicit.value,
  varNames: generated.value.autoVars,
  implicit: generated.value.implicit,
}))
const scene = computed(() => (view.value === 'architecture' ? architectureScene(design.value, layoutOpts.value) : applyOrderScene(design.value, layoutOpts.value)))
const today = new Date().toISOString().slice(0, 10)
const titleBlock = computed(() => ({
  eyebrow: view.value === 'architecture' ? 'Tenant plan' : 'Apply order',
  title: design.value.title,
  rev: rev.value,
  cells: [
    { label: 'Provider', value: `power-platform ${design.value.provider.version}` },
    { label: 'Resources', value: `${design.value.instances.length} to add${view.value === 'apply' ? ` · ${scene.value.waves || 0} waves` : ''}` },
    { label: 'Date', value: today },
  ],
}))
const plan = computed(() => planText(design.value, generated.value))
const planHtml = computed(() => highlight(plan.value))

const selected = computed(() => (selectedId.value ? byId(design.value, selectedId.value) : null))
const contextLabel = computed(() => {
  const s = selected.value
  if (!s) return ''
  if (s.type === BUILDER_ENV || s.type === BUILDER_GROUP) return displayTitle(s)
  const envId = s.refs.environment_id || s.refs['@environment']
  const env = envId ? byId(design.value, envId) : null
  return env ? displayTitle(env) : ''
})

// ---------------------------------------------------------------- history
const past = []
let future = []
let lastSnap = ''
let timer = null
watch(
  design,
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const snap = JSON.stringify(design.value)
      if (snap === lastSnap) return
      if (lastSnap) past.push(lastSnap)
      if (past.length > 100) past.shift()
      future = []
      lastSnap = snap
      rev.value = past.length + 1
      saveLocal(design.value)
    }, 300)
  },
  { deep: true },
)
function restore(snap) {
  lastSnap = snap
  design.value = JSON.parse(snap)
  rev.value = past.length + 1
  if (selectedId.value && !byId(design.value, selectedId.value)) selectedId.value = null
}
function undo() {
  if (!past.length) return
  future.push(lastSnap)
  restore(past.pop())
  toast('Undone')
}
function redo() {
  if (!future.length) return
  past.push(lastSnap)
  restore(future.pop())
  toast('Redone')
}

// ---------------------------------------------------------------- actions
function toast(text) {
  toastText.value = text
  clearTimeout(toast.t)
  toast.t = setTimeout(() => (toastText.value = ''), 2200)
}

function select(id) {
  if (!id || id === 'tenant' || id.startsWith('lane:') || id.startsWith('col:') || id.startsWith('x:') || id === 'unplaced') {
    selectedId.value = null
    return
  }
  selectedId.value = id
  panel.value = 'configure'
  if (mobileTab.value === 'canvas') mobileTab.value = 'configure'
}

function add(type, contextId) {
  const ctx = contextId ? byId(design.value, contextId) : selected.value
  const { inst, created } = addInstance(design.value, type, ctx)
  if (type === BUILDER_ENV && ctx && ctx.type === BUILDER_GROUP) addInstance(design.value, 'powerplatform_managed_environment', inst)
  selectedId.value = inst.id
  panel.value = 'configure'
  const extra = created.length - 1
  toast(`Added ${typeInfo(type).title}${extra ? ` and a new ${typeInfo(created[1].type).title.toLowerCase()} for it` : ''}`)
  if (window.matchMedia('(max-width: 900px)').matches) mobileTab.value = 'configure'
}

function remove(id) {
  const inst = byId(design.value, id)
  if (!inst) return
  const gone = removeInstance(design.value, id)
  selectedId.value = null
  toast(`Removed ${displayTitle(inst)}${gone.size > 1 ? ` and ${gone.size - 1} attached` : ''}`)
}

function duplicate(id) {
  const copy = duplicateInstance(design.value, id)
  if (copy) {
    selectedId.value = copy.id
    toast(`Duplicated as ${copy.name}`)
  }
}

function loadTemplate(id) {
  const t = templateById(id)
  if (!t) return
  design.value = t.build()
  selectedId.value = null
  menu.value = null
  nextTick(() => canvas.value?.fit())
  toast(`Loaded “${t.title}”`)
}

function toggleLayer(id) {
  const s = new Set(hidden.value)
  s.has(id) ? s.delete(id) : s.add(id)
  hidden.value = s
}

function download(name, blobOrText, type = 'text/plain') {
  const blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

const fileBase = computed(() => (design.value.title || 'tenant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tenant')

async function exportAs(kind) {
  menu.value = null
  if (kind === 'svg') download(`${fileBase.value}-plan.svg`, canvas.value.exportSvg(), 'image/svg+xml')
  if (kind === 'png') download(`${fileBase.value}-plan.png`, await canvas.value.exportPng())
  if (kind === 'tf') download('main.tf', generated.value.combined)
  if (kind === 'json') download(`${fileBase.value}.design.json`, JSON.stringify(design.value, null, 2), 'application/json')
}

async function share() {
  const token = await encodeDesign(design.value)
  const url = `${location.origin}${location.pathname}#design=${token}`
  history.replaceState(null, '', url)
  try {
    await navigator.clipboard.writeText(url)
    toast('Link copied — it rebuilds this exact design')
  } catch {
    toast('Link is in the address bar')
  }
}

const fileInput = ref(null)
async function importDesign(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    design.value = normalize(JSON.parse(await file.text()))
    selectedId.value = null
    nextTick(() => canvas.value?.fit())
    toast(`Imported ${file.name}`)
  } catch {
    toast('That file is not a builder design (.json)')
  }
  e.target.value = ''
  menu.value = null
}

function onKey(e) {
  const tag = (e.target.tagName || '').toLowerCase()
  const typing = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) {
    e.preventDefault()
    e.shiftKey ? redo() : undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !typing) {
    e.preventDefault()
    redo()
  } else if (e.key === 'Escape') {
    if (menu.value) menu.value = null
    else if (!typing) selectedId.value = null
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selectedId.value) {
    e.preventDefault()
    remove(selectedId.value)
  }
}

function onDocClick(e) {
  if (menu.value && !e.target.closest('.bd-menuwrap')) menu.value = null
}

// #design=… (shared link), #template=… or #add=<type> (links from the docs)
async function loadFromHash(initial) {
  const params = new URLSearchParams(location.hash.slice(1))
  let d = null
  if (params.get('design')) d = await decodeDesign(params.get('design'))
  if (!d && params.get('template')) d = templateById(params.get('template'))?.build()
  if (!d && initial) d = loadLocal() || templateById('alm').build()
  if (d) {
    design.value = normalize(d)
    selectedId.value = null
    if (initial) lastSnap = JSON.stringify(design.value)
    saveLocal(design.value)
  }
  const addType = params.get('add')
  if (addType && typeInfo(addType)) add(addType)
  // the design now lives in local storage; a reload should not re-apply the link
  if (location.hash) history.replaceState(null, '', location.pathname)
  nextTick(() => canvas.value?.fit())
}
const onHash = () => loadFromHash(false)

onMounted(async () => {
  await loadFromHash(true)
  ready.value = true
  nextTick(() => canvas.value?.fit())
  window.addEventListener('keydown', onKey)
  window.addEventListener('hashchange', onHash)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('hashchange', onHash)
  document.removeEventListener('click', onDocClick)
})

const issueLink = (i) => {
  if (i.id) select(i.id)
}
</script>

<template>
  <div class="bd" :class="`bd-tab-${mobileTab}`">
    <aside class="bd-palette" aria-label="Resource palette">
      <div class="bd-panehead">
        <span class="pp-label">Add resources</span>
        <span class="bd-sub">{{ provider.version ? `provider ${provider.version}` : '' }}</span>
      </div>
      <BuilderPalette :context-label="contextLabel" :counts="counts" @add="add" />
    </aside>

    <section class="bd-stage" aria-label="Tenant plan">
      <div class="bd-toolbar">
        <div class="bd-menuwrap">
          <button type="button" class="bd-tool" :aria-expanded="menu === 'templates'" @click="menu = menu === 'templates' ? null : 'templates'">Templates ▾</button>
          <div v-if="menu === 'templates'" class="bd-menu bd-templates" role="menu">
            <button v-for="t in TEMPLATES" :key="t.id" type="button" role="menuitem" class="bd-template" @click="loadTemplate(t.id)">
              <strong>{{ t.title }}</strong>
              <span>{{ t.blurb }}</span>
            </button>
          </div>
        </div>

        <div class="bd-seg" role="radiogroup" aria-label="Drawing">
          <button type="button" role="radio" :aria-checked="view === 'architecture'" :class="{ on: view === 'architecture' }" @click="view = 'architecture'; $nextTick(() => canvas?.fit())">Architecture</button>
          <button type="button" role="radio" :aria-checked="view === 'apply'" :class="{ on: view === 'apply' }" @click="view = 'apply'; $nextTick(() => canvas?.fit())">Apply order</button>
        </div>

        <div class="bd-menuwrap">
          <button type="button" class="bd-tool" :aria-expanded="menu === 'layers'" @click="menu = menu === 'layers' ? null : 'layers'">Layers ▾</button>
          <div v-if="menu === 'layers'" class="bd-menu bd-layers" role="menu">
            <p class="pp-label">Pens</p>
            <label v-for="c in categories" :key="c.id" class="bd-layer">
              <input type="checkbox" :checked="!hidden.has(c.id)" :disabled="c.id === 'environments'" @change="toggleLayer(c.id)" />
              <span class="bd-pen" :style="{ background: `var(--pen-${c.id})` }" />{{ c.title }}
            </label>
            <p class="pp-label bd-gap">Overlays</p>
            <label class="bd-layer"><input v-model="showExternal" type="checkbox" /><span class="bd-pen dashed" />Azure &amp; Entra objects</label>
            <label class="bd-layer"><input v-model="showImplicit" type="checkbox" /><span class="bd-pen dotted" />depends_on links</label>
          </div>
        </div>

        <span class="bd-spacer" />

        <button type="button" class="bd-tool" title="Undo (Ctrl+Z)" aria-label="Undo" @click="undo">↶</button>
        <button type="button" class="bd-tool" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" @click="redo">↷</button>
        <button type="button" class="bd-tool" title="Zoom out" aria-label="Zoom out" @click="canvas?.zoomBy(1 / 1.25)">−</button>
        <button type="button" class="bd-tool" title="Fit drawing" @click="canvas?.fit()">Fit</button>
        <button type="button" class="bd-tool" title="Zoom in" aria-label="Zoom in" @click="canvas?.zoomBy(1.25)">+</button>
        <div class="bd-menuwrap">
          <button type="button" class="bd-tool" :aria-expanded="menu === 'export'" @click="menu = menu === 'export' ? null : 'export'">Export ▾</button>
          <div v-if="menu === 'export'" class="bd-menu bd-export" role="menu">
            <button type="button" role="menuitem" @click="exportAs('svg')">Drawing as SVG</button>
            <button type="button" role="menuitem" @click="exportAs('png')">Drawing as PNG</button>
            <button type="button" role="menuitem" @click="exportAs('tf')">Terraform (main.tf)</button>
            <button type="button" role="menuitem" @click="exportAs('json')">Design file (.json)</button>
            <button type="button" role="menuitem" @click="fileInput.click()">Open a design file…</button>
          </div>
          <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importDesign" />
        </div>
        <button type="button" class="bd-tool bd-share" @click="share">Share link</button>
      </div>

      <div class="bd-canvas">
        <PlotCanvas
          v-if="ready"
          ref="canvas"
          :scene="scene"
          :interactive="true"
          :selected="selectedId"
          :title-block="titleBlock"
          aria-label="Tenant plan drawing"
          @select="select"
          @background="selectedId = null"
        />
      </div>

      <div class="bd-status">
        <span class="bd-plan"><span class="bd-plus">+</span> Plan: {{ design.instances.length }} to add, 0 to change, 0 to destroy.</span>
        <button v-if="errorCount || warnCount" type="button" class="bd-issues" @click="panel = 'plan'; mobileTab = 'code'">
          <span v-if="errorCount" class="e">{{ errorCount }} {{ errorCount === 1 ? 'error' : 'errors' }}</span>
          <span v-if="warnCount" class="w">{{ warnCount }} {{ warnCount === 1 ? 'warning' : 'warnings' }}</span>
        </button>
        <span v-else class="bd-ok">Ready to plan</span>
      </div>
    </section>

    <aside class="bd-side" aria-label="Configure and code">
      <div class="bd-tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="panel === 'configure'" :class="{ on: panel === 'configure' }" @click="panel = 'configure'">Configure</button>
        <button type="button" role="tab" :aria-selected="panel === 'code'" :class="{ on: panel === 'code' }" @click="panel = 'code'">Terraform</button>
        <button type="button" role="tab" :aria-selected="panel === 'plan'" :class="{ on: panel === 'plan' }" @click="panel = 'plan'">
          Plan<span v-if="errorCount" class="bd-badge">{{ errorCount }}</span>
        </button>
      </div>
      <div class="bd-sidebody">
        <BuilderInspector
          v-show="panel === 'configure'"
          :design="design"
          :selected-id="selectedId"
          :issues="issues"
          @select="select"
          @add="add"
          @remove="remove"
          @duplicate="duplicate"
        />
        <CodeView v-if="panel === 'code'" :files="generated.files" :combined="generated.combined" />
        <div v-if="panel === 'plan'" class="bd-planpane">
          <ul v-if="issues.length" class="bd-issuelist">
            <li v-for="(i, k) in issues.filter((x) => x.level !== 'info').concat(issues.filter((x) => x.level === 'info'))" :key="k" :class="i.level">
              <button type="button" @click="issueLink(i)">
                <span class="bd-lvl">{{ i.level }}</span>
                <span class="bd-where pp-mono">{{ i.id && byId(design, i.id) ? byId(design, i.id).name : 'design' }}</span>
                <span>{{ i.text }}</span>
              </button>
            </li>
          </ul>
          <pre class="bd-planpre"><code v-html="planHtml" /></pre>
        </div>
      </div>
    </aside>

    <nav class="bd-mobiletabs" aria-label="Builder sections">
      <button type="button" :class="{ on: mobileTab === 'add' }" @click="mobileTab = 'add'">Add</button>
      <button type="button" :class="{ on: mobileTab === 'canvas' }" @click="mobileTab = 'canvas'">Drawing</button>
      <button type="button" :class="{ on: mobileTab === 'configure' }" @click="mobileTab = 'configure'; panel = 'configure'">Configure</button>
      <button type="button" :class="{ on: mobileTab === 'code' }" @click="mobileTab = 'code'; panel = panel === 'configure' ? 'code' : panel">Code</button>
    </nav>

    <div class="bd-toast" role="status" aria-live="polite">
      <span v-if="toastText">{{ toastText }}</span>
    </div>
  </div>
</template>

<style scoped>
.bd {
  --bd-h: calc(100dvh - var(--vp-nav-height));
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr) 410px;
  height: var(--bd-h);
  background: var(--pp-film);
  position: relative;
}

.bd-palette,
.bd-side {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
}

.bd-palette {
  border-right: 1px solid var(--vp-c-divider);
  overflow-y: auto;
}

.bd-side {
  border-left: 1px solid var(--vp-c-divider);
}

.bd-panehead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 14px 0;
}

.bd-sub {
  font-family: var(--pp-font-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.bd-stage {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.bd-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 85%, transparent);
  flex-wrap: wrap;
}

.bd-spacer {
  flex: 1;
}

.bd-tool {
  height: 30px;
  min-width: 30px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.bd-tool:hover {
  border-color: var(--pp-ink);
}

.bd-share {
  background: var(--pp-ink);
  color: var(--pp-film);
  border-color: var(--pp-ink);
  font-family: var(--pp-font-display);
  font-stretch: 94%;
  font-weight: 650;
}

.bd-seg {
  display: inline-flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  overflow: hidden;
  margin-left: 4px;
}

.bd-seg button {
  height: 28px;
  padding: 0 12px;
  border: 0;
  background: var(--vp-c-bg);
  font-family: var(--pp-font-display);
  font-stretch: 88%;
  font-weight: 640;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.bd-seg button.on {
  background: var(--pp-ink);
  color: var(--pp-film);
}

.bd-menuwrap {
  position: relative;
}

.bd-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 230px;
  padding: 8px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgba(10, 20, 40, 0.18);
}

.bd-export {
  left: auto;
  right: 0;
  display: grid;
}

.bd-export button {
  text-align: left;
  border: 0;
  background: none;
  padding: 7px 9px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.bd-export button:hover {
  background: var(--vp-c-bg-soft);
}

.bd-templates {
  width: 340px;
  display: grid;
  gap: 2px;
}

.bd-template {
  display: grid;
  gap: 2px;
  text-align: left;
  border: 0;
  background: none;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.bd-template:hover {
  background: var(--vp-c-bg-soft);
}

.bd-template strong {
  font-family: var(--pp-font-display);
  font-stretch: 100%;
  font-size: 14px;
}

.bd-template span {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.bd-layer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px;
  font-size: 13px;
  cursor: pointer;
}

.bd-layer input {
  accent-color: var(--pp-violet);
}

.bd-pen {
  width: 18px;
  height: 3px;
  border-radius: 2px;
}

.bd-pen.dashed {
  background: repeating-linear-gradient(90deg, var(--pen-external) 0 3px, transparent 3px 6px);
}

.bd-pen.dotted {
  background: repeating-linear-gradient(90deg, var(--pp-graphite) 0 5px, transparent 5px 7px, var(--pp-graphite) 7px 8px, transparent 8px 10px);
}

.bd-gap {
  margin-top: 10px;
}

.bd-canvas {
  min-height: 0;
  position: relative;
}

.bd-status {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 7px 14px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-family: var(--pp-font-mono);
  font-size: 12.5px;
  flex-wrap: wrap;
}

.bd-plan {
  color: var(--vp-c-text-1);
}

.bd-plus {
  color: var(--pp-green);
  font-weight: 700;
}

.bd-issues {
  display: inline-flex;
  gap: 10px;
  border: 0;
  background: none;
  font-family: var(--pp-font-mono);
  font-size: 12.5px;
  cursor: pointer;
  padding: 0;
}

.bd-issues .e {
  color: var(--pp-red);
}

.bd-issues .w {
  color: var(--pp-amber);
}

.bd-ok {
  color: var(--pp-green);
}

.bd-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0 8px;
}

.bd-tabs button {
  position: relative;
  border: 0;
  background: none;
  padding: 12px 12px 10px;
  font-family: var(--pp-font-display);
  font-stretch: 90%;
  font-weight: 650;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.bd-tabs button.on {
  color: var(--vp-c-text-1);
  border-bottom-color: var(--pp-ink);
}

.bd-badge {
  margin-left: 6px;
  font-family: var(--pp-font-mono);
  font-size: 10.5px;
  color: #fff;
  background: var(--pp-red);
  border-radius: 999px;
  padding: 0 6px;
}

.bd-sidebody {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.bd-sidebody > :deep(.cv) {
  flex: 1;
}

.bd-planpane {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bd-issuelist {
  list-style: none;
  margin: 0;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.bd-issuelist button {
  display: grid;
  grid-template-columns: 52px 92px 1fr;
  gap: 8px;
  width: 100%;
  border: 0;
  background: none;
  text-align: left;
  font-size: 12.5px;
  line-height: 1.45;
  padding: 5px 4px;
  border-radius: 3px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.bd-issuelist button:hover {
  background: var(--vp-c-bg-soft);
}

.bd-lvl {
  font-family: var(--pp-font-display);
  font-stretch: 78%;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
}

.error .bd-lvl {
  color: var(--pp-red);
}

.warn .bd-lvl {
  color: var(--pp-amber);
}

.info .bd-lvl {
  color: var(--vp-c-text-3);
}

.bd-where {
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bd-planpre {
  margin: 0;
  padding: 14px 16px 30px;
  font-family: var(--pp-font-mono);
  font-size: 12px;
  line-height: 1.6;
  background: var(--vp-c-bg-alt);
  overflow: auto;
  flex: 1;
}

.bd-planpre :deep(.hk-add),
.bd-planpre :deep(.hk-plan) {
  color: var(--pp-green);
  font-weight: 700;
}

.bd-planpre :deep(.hk-key) {
  color: var(--pen-environments);
}

.bd-planpre :deep(.hk-str) {
  color: var(--pen-alm);
}

.bd-planpre :deep(.hk-comment) {
  color: var(--vp-c-text-3);
}

.bd-mobiletabs {
  display: none;
}

.bd-toast {
  position: absolute;
  left: 50%;
  bottom: 54px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 30;
}

.bd-toast span {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 4px;
  background: var(--pp-ink);
  color: var(--pp-film);
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(10, 20, 40, 0.25);
}

@media (max-width: 1240px) {
  .bd {
    grid-template-columns: 236px minmax(0, 1fr) 360px;
  }
}

@media (max-width: 900px) {
  .bd {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .bd-palette,
  .bd-stage,
  .bd-side {
    grid-row: 1;
    grid-column: 1;
    display: none;
  }

  .bd-tab-add .bd-palette,
  .bd-tab-configure .bd-side,
  .bd-tab-code .bd-side {
    display: flex;
  }

  .bd-tab-canvas .bd-stage {
    display: grid;
  }

  .bd-mobiletabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg);
  }

  .bd-mobiletabs button {
    border: 0;
    background: none;
    padding: 12px 4px;
    font-family: var(--pp-font-display);
    font-stretch: 90%;
    font-weight: 650;
    font-size: 13px;
    color: var(--vp-c-text-2);
    border-top: 2px solid transparent;
  }

  .bd-mobiletabs button.on {
    color: var(--vp-c-text-1);
    border-top-color: var(--pp-ink);
  }

  .bd-toolbar .bd-tool[title^='Zoom'],
  .bd-toolbar .bd-tool[aria-label='Undo'],
  .bd-toolbar .bd-tool[aria-label='Redo'] {
    display: none;
  }
}
</style>
