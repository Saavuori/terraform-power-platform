<script setup>
// The resource categories as drafting layers: one pen colour each.
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { categories, types } from '../lib/graph.js'

const props = defineProps({ compact: { type: Boolean, default: false } })

const layers = computed(() =>
  categories.map((c) => {
    const list = types.filter((t) => t.category === c.id)
    return { ...c, resources: list.filter((t) => t.kind === 'resource'), data: list.filter((t) => t.kind === 'data-source') }
  }),
)
</script>

<template>
  <div class="ll" :class="{ compact }">
    <div v-for="l in layers" :key="l.id" class="ll-row">
      <span class="ll-pen" :style="{ background: `var(--pen-${l.id})` }" />
      <div class="ll-body">
        <p class="ll-title">{{ l.title }}</p>
        <p v-if="!compact" class="ll-blurb">{{ l.blurb }}</p>
        <p class="ll-types">
          <a v-for="t in l.resources" :key="t.name" :href="withBase(t.page)" class="ll-type">{{ t.short }}</a>
          <a v-for="t in l.data" :key="t.name" :href="withBase(t.page)" class="ll-type is-data">{{ t.short }}</a>
        </p>
      </div>
      <span class="ll-count"><strong>{{ l.resources.length }}</strong> res · {{ l.data.length }} data</span>
    </div>
  </div>
</template>

<style scoped>
.ll {
  display: grid;
  border-top: 1px solid var(--vp-c-divider);
  margin: 18px 0;
}

.ll-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ll-pen {
  margin-top: 9px;
  width: 34px;
  height: 4px;
  border-radius: 2px;
}

.ll-title {
  margin: 0 !important;
  font-family: var(--pp-font-display);
  font-stretch: 108%;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.3 !important;
}

.ll-blurb {
  margin: 2px 0 0 !important;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5 !important;
}

.ll-types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 6px 0 0 !important;
  line-height: 1.4 !important;
}

.ll-type {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  text-decoration: none !important;
  color: var(--vp-c-text-1) !important;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ll-type:hover {
  border-bottom-color: var(--pp-violet);
}

.ll-type.is-data {
  color: var(--vp-c-text-2) !important;
  border-bottom-style: dashed;
}

.ll-count {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  padding-top: 3px;
}

.ll-count strong {
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .ll-row {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .ll-pen {
    width: 24px;
  }

  .ll-count {
    grid-column: 2;
  }
}
</style>
