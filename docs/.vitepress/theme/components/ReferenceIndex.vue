<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { categories, types, relations } from '../lib/graph.js'

const query = ref('')
const kind = ref('all')

const linkCount = (t) => relations.filter((r) => (r.from === t.name && r.fromKind === t.kind) || (r.to === t.name && r.toKind === t.kind)).length

const layers = computed(() => {
  const q = query.value.trim().toLowerCase()
  return categories
    .map((c) => ({
      ...c,
      items: types
        .filter((t) => t.category === c.id)
        .filter((t) => kind.value === 'all' || t.kind === kind.value)
        .filter((t) => !q || t.name.includes(q) || t.title.toLowerCase().includes(q) || (t.summary || '').toLowerCase().includes(q))
        .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'resource' ? -1 : 1)),
    }))
    .filter((l) => l.items.length)
})
const total = computed(() => layers.value.reduce((n, l) => n + l.items.length, 0))
</script>

<template>
  <div class="ri">
    <div class="ri-bar">
      <input v-model="query" type="search" class="ri-search" placeholder="Filter by name or purpose" aria-label="Filter resources and data sources" />
      <div class="ri-seg" role="radiogroup" aria-label="Kind">
        <button v-for="k in [['all', 'All'], ['resource', 'Resources'], ['data-source', 'Data sources']]" :key="k[0]" type="button" role="radio" :aria-checked="kind === k[0]" :class="{ on: kind === k[0] }" @click="kind = k[0]">{{ k[1] }}</button>
      </div>
      <span class="ri-count">{{ total }} shown</span>
    </div>

    <section v-for="l in layers" :key="l.id" class="ri-layer">
      <h2 :id="`layer-${l.id}`" class="ri-layerhead">
        <span class="ri-pen" :style="{ background: `var(--pen-${l.id})` }" />{{ l.title }}
      </h2>
      <div class="ri-grid">
        <a v-for="t in l.items" :key="t.kind + t.name" class="ri-card" :class="{ 'is-data': t.kind === 'data-source' }" :href="withBase(t.page)" :style="{ '--pen': `var(--pen-${t.category})` }">
          <span class="ri-name">{{ t.kind === 'data-source' ? 'data.' : '' }}{{ t.name }}</span>
          <span class="ri-title">{{ t.title }}</span>
          <span class="ri-summary">{{ t.summary }}</span>
          <span class="ri-meta">
            <span>{{ t.kind === 'resource' ? 'Resource' : 'Data source' }}</span>
            <span>{{ t.attributeCount }} attributes</span>
            <span>{{ linkCount(t) }} links</span>
            <span v-if="t.preview" class="warn">preview</span>
            <span v-if="t.deprecation" class="bad">deprecated</span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ri-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 18px 0 8px;
}

.ri-search {
  flex: 1;
  min-width: 220px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.ri-search:focus {
  outline: none;
  border-color: var(--pp-violet);
}

.ri-seg {
  display: inline-flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  overflow: hidden;
}

.ri-seg button {
  height: 34px;
  padding: 0 12px;
  border: 0;
  background: var(--vp-c-bg);
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.ri-seg button.on {
  background: var(--pp-ink);
  color: var(--pp-film);
}

.ri-count {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.ri-layerhead {
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 0 !important;
  margin-top: 28px !important;
  padding-top: 0 !important;
  font-size: 18px !important;
}

.ri-pen {
  width: 26px;
  height: 4px;
  border-radius: 2px;
}

.ri-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.ri-card {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 12px 14px 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--pen);
  border-radius: 4px;
  background: var(--vp-c-bg);
  text-decoration: none !important;
  color: var(--vp-c-text-1) !important;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.ri-card:hover {
  border-color: var(--pen);
  transform: translateY(-1px);
}

.ri-card.is-data {
  border-left-style: dashed;
}

.ri-name {
  font-family: var(--pp-font-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  word-break: break-all;
}

.ri-title {
  font-family: var(--pp-font-display);
  font-stretch: 104%;
  font-weight: 700;
  font-size: 15.5px;
  line-height: 1.25;
}

.ri-summary {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.ri-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 4px;
  font-family: var(--pp-font-display);
  font-stretch: 80%;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.ri-meta .warn {
  color: var(--pp-amber);
}

.ri-meta .bad {
  color: var(--pp-red);
}
</style>
