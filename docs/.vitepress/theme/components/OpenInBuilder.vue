<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { getType } from '../lib/graph.js'

const props = defineProps({
  type: { type: String, default: '' },
  template: { type: String, default: '' },
  label: { type: String, default: '' },
})

const href = computed(() => withBase(`/builder#${props.template ? `template=${props.template}` : `add=${props.type}`}`))
const text = computed(() => props.label || (props.template ? 'Open this layout in the builder' : `Add a ${getType(props.type)?.title || 'resource'} in the builder`))
</script>

<template>
  <p class="oib">
    <a class="pp-btn small" :href="href">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 4V1h3M10 1h3v3M13 10v3h-3M4 13H1v-3" fill="none" stroke="currentColor" stroke-width="1.4" /><rect x="4.5" y="4.5" width="5" height="5" fill="currentColor" /></svg>
      {{ text }}
    </a>
  </p>
</template>

<style scoped>
.oib {
  margin: 14px 0 6px;
}
</style>
