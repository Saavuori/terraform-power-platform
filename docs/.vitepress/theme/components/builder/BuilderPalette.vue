<script setup>
import { computed, ref } from 'vue'
import { resourceTypes, categories } from '../../lib/builder/schema.js'
import { scopeOf } from '../../lib/builder/specs.js'

const props = defineProps({
  contextLabel: { type: String, default: '' },
  counts: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['add'])

const query = ref('')
const collapsed = ref(new Set())

const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return categories
    .map((c) => ({
      ...c,
      types: resourceTypes
        .filter((t) => t.category === c.id)
        .filter((t) => !q || t.name.includes(q) || t.title.toLowerCase().includes(q) || (t.summary || '').toLowerCase().includes(q)),
    }))
    .filter((g) => g.types.length)
})

function toggle(id) {
  const s = new Set(collapsed.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsed.value = s
}

const scopeText = { tenant: 'tenant-wide', environment: 'in an environment', group: 'in a group' }
</script>

<template>
  <div class="bp">
    <div class="bp-search">
      <input v-model="query" type="search" placeholder="Filter resources" aria-label="Filter resources" />
    </div>
    <p v-if="contextLabel" class="bp-context">Adds to <strong>{{ contextLabel }}</strong></p>
    <section v-for="g in groups" :key="g.id" class="bp-layer">
      <button type="button" class="bp-layerhead" :aria-expanded="!collapsed.has(g.id)" @click="toggle(g.id)">
        <span class="bp-pen" :style="{ background: `var(--pen-${g.id})` }" />
        <span class="pp-label bp-layertitle">{{ g.title }}</span>
        <span class="bp-count">{{ g.types.length }}</span>
      </button>
      <ul v-show="!collapsed.has(g.id) || query" class="bp-list">
        <li v-for="t in g.types" :key="t.name">
          <button type="button" class="bp-item" :title="t.summary" @click="emit('add', t.name)">
            <span class="bp-plus" aria-hidden="true">+</span>
            <span class="bp-text">
              <span class="bp-title">{{ t.title }}<span v-if="counts[t.name]" class="bp-used">×{{ counts[t.name] }}</span></span>
              <span class="bp-name">{{ t.short }} · {{ scopeText[scopeOf(t.name)] }}</span>
            </span>
            <span v-if="t.preview" class="bp-flag">preview</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bp {
  padding: 12px 10px 24px;
}

.bp-search input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 13.5px;
  color: var(--vp-c-text-1);
}

.bp-search input:focus {
  outline: none;
  border-color: var(--pp-violet);
}

.bp-context {
  margin: 10px 4px 2px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.bp-layer {
  margin-top: 12px;
}

.bp-layerhead {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 0;
  background: none;
  padding: 4px;
  cursor: pointer;
}

.bp-pen {
  width: 14px;
  height: 3px;
  border-radius: 2px;
}

.bp-layertitle {
  color: var(--vp-c-text-1);
}

.bp-count {
  margin-left: auto;
  font-family: var(--pp-font-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.bp-list {
  list-style: none;
  margin: 2px 0 0;
  padding: 0;
}

.bp-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  padding: 6px 6px;
  text-align: left;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.bp-item:hover,
.bp-item:focus-visible {
  border-color: var(--vp-c-border);
  background: var(--vp-c-bg);
}

.bp-plus {
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 3px;
  font-family: var(--pp-font-mono);
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.bp-item:hover .bp-plus {
  border-color: var(--pp-ink);
  color: var(--pp-ink);
}

.bp-text {
  display: grid;
  min-width: 0;
}

.bp-title {
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.25;
}

.bp-used {
  margin-left: 6px;
  font-family: var(--pp-font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--pp-green);
}

.bp-name {
  font-family: var(--pp-font-mono);
  font-size: 10.5px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bp-flag {
  margin-left: auto;
  font-family: var(--pp-font-display);
  font-stretch: 78%;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pp-amber);
}
</style>
