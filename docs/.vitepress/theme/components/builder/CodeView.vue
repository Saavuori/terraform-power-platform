<script setup>
// Highlighted, copyable code with optional file tabs.
import { computed, ref, watch } from 'vue'
import { highlight } from '../../lib/builder/hcl.js'

const props = defineProps({
  files: { type: Object, required: true }, // { 'main.tf': '...' }
  download: { type: Boolean, default: true },
  combined: { type: String, default: '' },
})

const names = computed(() => Object.keys(props.files))
const active = ref(names.value[0])
watch(names, (n) => {
  if (!n.includes(active.value)) active.value = n[0]
})
const code = computed(() => props.files[active.value] || '')
const html = computed(() => highlight(code.value))
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    copied.value = false
  }
}

function save(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <div class="cv">
    <div class="cv-bar">
      <div class="cv-tabs" role="tablist">
        <button
          v-for="n in names"
          :key="n"
          type="button"
          role="tab"
          :aria-selected="active === n"
          class="cv-tab"
          :class="{ on: active === n }"
          @click="active = n"
        >{{ n }}</button>
      </div>
      <div class="cv-actions">
        <button type="button" class="cv-btn" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button>
        <button v-if="download" type="button" class="cv-btn" @click="save(active, code)">Download</button>
        <button v-if="download && combined && names.length > 1" type="button" class="cv-btn" title="main.tf with variables and outputs in one file" @click="save('main.tf', combined)">All in one file</button>
      </div>
    </div>
    <pre class="cv-pre"><code v-html="html" /></pre>
  </div>
</template>

<style scoped>
.cv {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.cv-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.cv-tabs {
  display: flex;
  gap: 2px;
}

.cv-tab {
  border: 0;
  background: none;
  padding: 4px 9px;
  border-radius: 3px;
  font-family: var(--pp-font-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.cv-tab.on {
  background: var(--pp-ink);
  color: var(--pp-film);
}

.cv-actions {
  display: flex;
  gap: 6px;
}

.cv-btn {
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  border-radius: 3px;
  padding: 3px 9px;
  font-size: 12px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.cv-btn:hover {
  border-color: var(--pp-ink);
}

.cv-pre {
  flex: 1;
  margin: 0;
  padding: 14px 16px 24px;
  overflow: auto;
  font-family: var(--pp-font-mono);
  font-size: 12.5px;
  line-height: 1.6;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  tab-size: 2;
}

.cv-pre :deep(.hk-kw) {
  color: var(--pp-violet);
  font-weight: 700;
}

.cv-pre :deep(.hk-key) {
  color: var(--pen-environments);
}

.cv-pre :deep(.hk-str) {
  color: var(--pen-alm);
}

.cv-pre :deep(.hk-interp) {
  color: var(--pen-billing);
}

.cv-pre :deep(.hk-num),
.cv-pre :deep(.hk-bool) {
  color: var(--pen-connectivity);
}

.cv-pre :deep(.hk-ref) {
  color: var(--pen-governance);
}

.cv-pre :deep(.hk-comment) {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.cv-pre :deep(.hk-add) {
  color: var(--pp-green);
  font-weight: 700;
}

.cv-pre :deep(.hk-plan) {
  color: var(--pp-green);
  font-weight: 700;
}
</style>
