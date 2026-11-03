<script setup>
// A builder template drawn as a figure, with the Terraform it produces.
import { computed, nextTick, ref } from 'vue'
import { withBase } from 'vitepress'
import PlotCanvas from './PlotCanvas.vue'
import CodeView from './builder/CodeView.vue'
import { templateById } from '../lib/builder/templates.js'
import { generate } from '../lib/builder/hcl.js'
import { architectureScene, applyOrderScene } from '../lib/builder/layout.js'

const props = defineProps({
  template: { type: String, required: true },
  interactive: { type: Boolean, default: false },
  height: { type: Number, default: 520 },
  code: { type: Boolean, default: true },
  view: { type: String, default: 'architecture' },
})

const t = templateById(props.template)
const design = t ? t.build() : null
const mode = ref(props.view)
const generated = design ? generate(design) : null
const scene = computed(() => {
  if (!design) return { nodes: [], frames: [], edges: [] }
  const opts = { varNames: generated.autoVars, implicit: generated.implicit }
  return mode.value === 'apply' ? applyOrderScene(design, opts) : architectureScene(design, opts)
})
const canvas = ref(null)
const showCode = ref(false)
const href = withBase(`/builder#template=${props.template}`)

// full-screen, pannable copy of the drawing
const zoomed = ref(false)
const dialog = ref(null)
const bigCanvas = ref(null)
let opener = null
function enlarge(e) {
  opener = e?.currentTarget || document.activeElement
  zoomed.value = true
  nextTick(() => dialog.value?.focus())
}
function shrink() {
  zoomed.value = false
  nextTick(() => opener?.focus?.())
}
</script>

<template>
  <figure v-if="design" class="pf">
    <div class="pf-bar">
      <span class="pp-label">{{ t.title }} · {{ design.instances.length }} resources</span>
      <div class="pf-seg" role="radiogroup" aria-label="Drawing">
        <button type="button" role="radio" :aria-checked="mode === 'architecture'" :class="{ on: mode === 'architecture' }" @click="mode = 'architecture'">Architecture</button>
        <button type="button" role="radio" :aria-checked="mode === 'apply'" :class="{ on: mode === 'apply' }" @click="mode = 'apply'">Apply order</button>
      </div>
      <button v-if="interactive" type="button" class="pf-btn" @click="canvas?.fit()">Fit</button>
      <button type="button" class="pf-btn" @click="enlarge">Enlarge</button>
      <a class="pf-btn pf-open" :href="href">Open in builder</a>
    </div>
    <div class="pf-sheet" :class="{ 'is-static': !interactive }" :style="interactive ? { height: height + 'px' } : null" :title="interactive ? null : 'Click to enlarge'" @click="!interactive && enlarge($event)">
      <PlotCanvas ref="canvas" :scene="scene" :interactive="interactive" :padding="20" :aria-label="`${t.title} diagram`" />
    </div>
    <Teleport to="body">
      <div v-if="zoomed" ref="dialog" class="pf-lightbox" role="dialog" aria-modal="true" :aria-label="`${t.title} — enlarged drawing`" tabindex="-1" @keydown.esc="shrink">
        <div class="pf-lbbar">
          <strong class="pp-display">{{ t.title }}</strong>
          <div class="pf-seg" role="radiogroup" aria-label="Drawing">
            <button type="button" role="radio" :aria-checked="mode === 'architecture'" :class="{ on: mode === 'architecture' }" @click="mode = 'architecture'; $nextTick(() => bigCanvas?.fit())">Architecture</button>
            <button type="button" role="radio" :aria-checked="mode === 'apply'" :class="{ on: mode === 'apply' }" @click="mode = 'apply'; $nextTick(() => bigCanvas?.fit())">Apply order</button>
          </div>
          <button type="button" class="pf-btn" @click="bigCanvas?.fit()">Fit</button>
          <a class="pf-btn pf-open" :href="href">Open in builder</a>
          <button type="button" class="pf-btn" aria-label="Close" @click="shrink">Close ✕</button>
        </div>
        <div class="pf-lbcanvas">
          <PlotCanvas ref="bigCanvas" :scene="scene" interactive :animate="false" :aria-label="`${t.title} diagram`" />
        </div>
      </div>
    </Teleport>
    <figcaption class="pf-caption">{{ t.blurb }}</figcaption>
    <div v-if="code" class="pf-code">
      <button type="button" class="pf-toggle" :aria-expanded="showCode" @click="showCode = !showCode">{{ showCode ? 'Hide' : 'Show' }} the Terraform ({{ generated.files['main.tf'].split('\n').length }} lines)</button>
      <div v-if="showCode" class="pf-codebox">
        <CodeView :files="generated.files" :combined="generated.combined" />
      </div>
    </div>
  </figure>
</template>

<style scoped>
.pf {
  margin: 20px 0 28px;
}

.pf-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pf-bar .pp-label {
  margin-right: auto;
}

.pf-seg {
  display: inline-flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  overflow: hidden;
}

.pf-seg button {
  height: 28px;
  padding: 0 10px;
  border: 0;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.pf-seg button.on {
  background: var(--pp-ink);
  color: var(--pp-film);
}

.pf-btn {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 11px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  color: var(--vp-c-text-1) !important;
  text-decoration: none !important;
  cursor: pointer;
}

.pf-open {
  background: var(--pp-ink);
  border-color: var(--pp-ink);
  color: var(--pp-film) !important;
}

.pf-sheet {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--pp-film);
}

.pf-sheet.is-static {
  cursor: zoom-in;
}

.pf-lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--pp-film);
  outline: none;
}

.pf-lbbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.pf-lbbar strong {
  margin-right: auto;
  font-size: 16px;
  font-weight: 720;
}

.pf-lbcanvas {
  flex: 1;
  min-height: 0;
}

.pf-caption {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}

.pf-toggle {
  margin-top: 6px;
  border: 0;
  background: none;
  padding: 4px 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--pp-violet);
  cursor: pointer;
}

.pf-codebox {
  margin-top: 6px;
  height: 420px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
