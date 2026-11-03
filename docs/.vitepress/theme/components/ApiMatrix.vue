<script setup>
// Which Go service package implements which types, and which back-end APIs it calls.
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { types } from '../lib/graph.js'

const apis = computed(() => {
  const order = ['BAPI', 'Power Platform API', 'Dataverse Web API', 'Power Apps API', 'Admin API', 'Power Apps Advisor API', 'Copilot Studio API']
  const used = new Set(types.flatMap((t) => t.apis || []))
  return order.filter((a) => used.has(a))
})

const rows = computed(() => {
  const m = new Map()
  for (const t of types) {
    if (!t.service) continue
    if (!m.has(t.service)) m.set(t.service, { service: t.service, apis: new Set(t.apis || []), items: [] })
    m.get(t.service).items.push(t)
  }
  return [...m.values()].sort((a, b) => a.service.localeCompare(b.service))
})
</script>

<template>
  <div class="am">
    <table>
      <thead>
        <tr>
          <th scope="col">Package <span class="pp-mono">internal/services/…</span></th>
          <th v-for="a in apis" :key="a" scope="col" class="am-api"><span>{{ a }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.service">
          <th scope="row">
            <span class="pp-mono am-svc">{{ r.service }}</span>
            <span class="am-types">
              <a v-for="t in r.items" :key="t.kind + t.name" :href="withBase(t.page)" :class="{ 'is-data': t.kind === 'data-source' }">{{ t.short }}</a>
            </span>
          </th>
          <td v-for="a in apis" :key="a" class="am-cell">
            <span v-if="r.apis.has(a)" class="am-dot" :title="`${r.service} calls ${a}`" aria-label="yes" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.am {
  overflow-x: auto;
  margin: 16px 0;
}

.am table {
  display: table;
  border-collapse: collapse;
  min-width: 640px;
}

.am th,
.am td {
  border-top: 1px solid var(--vp-c-divider);
  padding: 8px 10px;
  vertical-align: top;
}

.am thead th {
  vertical-align: bottom;
  background: var(--vp-c-bg-alt);
}

.am-api {
  width: 64px;
  font-size: 11px !important;
  text-align: center;
}

.am-api span {
  display: inline-block;
  max-width: 76px;
  line-height: 1.2;
}

.am-svc {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.am-types {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 8px;
  margin-top: 3px;
  font-weight: 400;
}

.am-types a {
  font-family: var(--pp-font-mono);
  font-size: 11.5px;
  text-decoration: none;
}

.am-types a.is-data {
  color: var(--vp-c-text-2);
}

.am-cell {
  text-align: center;
  vertical-align: middle !important;
}

.am-dot {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--pp-ink);
}
</style>
