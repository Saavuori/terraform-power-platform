<script setup>
import { computed } from 'vue'
import { getType, categoryById, relationsFrom, relationsTo } from '../lib/graph.js'

const props = defineProps({
  name: { type: String, required: true },
  kind: { type: String, default: 'resource' },
})

const t = computed(() => getType(props.name, props.kind))
const cat = computed(() => (t.value ? categoryById.get(t.value.category) : null))
const outCount = computed(() => relationsFrom(props.name, props.kind).length)
const inCount = computed(() => relationsTo(props.name, props.kind).length)
</script>

<template>
  <div v-if="t" class="th">
    <div class="th-row">
      <span class="th-layer">
        <span class="th-pen" :style="{ background: `var(--pen-${t.category})` }" />
        <span class="pp-label">{{ cat?.title }}</span>
      </span>
      <span class="pp-pill">{{ kind === 'resource' ? 'Resource' : 'Data source' }}</span>
      <span v-if="t.preview" class="pp-pill th-preview">Preview</span>
      <span v-if="t.deprecation" class="pp-pill th-deprecated">Deprecated</span>
      <span v-if="t.breakingChange" class="pp-pill th-breaking">Changes in v5</span>
      <span v-if="t.importable" class="pp-pill">Importable</span>
    </div>
    <dl class="th-facts">
      <div>
        <dt class="pp-label">Address</dt>
        <dd class="pp-mono">{{ kind === 'data-source' ? 'data.' : '' }}{{ t.name }}.&lt;name&gt;</dd>
      </div>
      <div v-if="t.service">
        <dt class="pp-label">Go package</dt>
        <dd class="pp-mono">services/{{ t.service }}</dd>
      </div>
      <div v-if="t.apis?.length">
        <dt class="pp-label">Talks to</dt>
        <dd>{{ t.apis.join(' · ') }}</dd>
      </div>
      <div>
        <dt class="pp-label">Links</dt>
        <dd>{{ outCount }} out · {{ inCount }} in</dd>
      </div>
    </dl>
    <p v-if="t.deprecation" class="th-note th-deprecated-note"><strong>Deprecated.</strong> {{ t.deprecation }}</p>
    <p v-if="t.breakingChange" class="th-note"><strong>Upcoming in v5.0.0.</strong> {{ t.breakingChange }}</p>
  </div>
</template>

<style scoped>
.th {
  margin: 12px 0 22px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
}

.th-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.th-layer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 6px;
}

.th-pen {
  width: 22px;
  height: 4px;
  border-radius: 2px;
}

.th-preview {
  color: var(--pp-amber);
  border-color: currentColor;
}

.th-deprecated {
  color: var(--pp-red);
  border-color: currentColor;
}

.th-breaking {
  color: var(--pp-violet);
  border-color: currentColor;
}

.th-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin: 12px 0 0;
}

.th-facts div {
  display: grid;
  gap: 2px;
}

.th-facts dt {
  font-size: 10.5px;
}

.th-facts dd {
  margin: 0;
  font-size: 13.5px;
  overflow-wrap: anywhere;
}

.th-facts div {
  min-width: 0;
}

.th-note {
  margin: 12px 0 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.th-deprecated-note strong {
  color: var(--pp-red);
}
</style>
