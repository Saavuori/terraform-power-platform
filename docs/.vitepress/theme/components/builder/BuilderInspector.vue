<script setup>
import { computed, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import FieldEditor from './FieldEditor.vue'
import { attrsAt, typeInfo, isEmpty } from '../../lib/builder/schema.js'
import { specFor, BUILDER_ENV, BUILDER_GROUP } from '../../lib/builder/specs.js'
import { refDefs, byId, displayTitle, address, childrenOf, membersOf, validName } from '../../lib/builder/model.js'
import { AUTH_METHODS, CLOUDS } from '../../lib/builder/lists.js'

const props = defineProps({
  design: { type: Object, required: true },
  selectedId: { type: String, default: null },
  issues: { type: Array, default: () => [] },
})
const emit = defineEmits(['select', 'add', 'remove', 'duplicate'])

const inst = computed(() => (props.selectedId ? byId(props.design, props.selectedId) : null))
const info = computed(() => (inst.value ? typeInfo(inst.value.type) : null))
const spec = computed(() => (inst.value ? specFor(inst.value.type) : null))
const myIssues = computed(() => (inst.value ? props.issues.filter((i) => i.id === inst.value.id) : []))
const levelIcon = { error: '✕', warn: '!', info: 'i' }

const showMore = ref(false)
watch(() => props.selectedId, () => (showMore.value = false))

const fields = computed(() => {
  if (!inst.value) return { primary: [], rest: [] }
  const type = inst.value.type
  const s = spec.value
  const attrs = attrsAt(type, '').filter((a) => !(s.hidden || []).includes(a.name) || !isEmpty(inst.value.values[a.name]))
  const defs = refDefs(type)
  const primaryNames = new Set([...(s.order || []), ...Object.keys(defs).filter((k) => !k.includes('.') && !k.startsWith('@')), ...Object.keys(s.external || {}).map((k) => k.split('.')[0])])
  const order = s.order || []
  const rank = (a) => (a.name === s.parent ? -1 : order.includes(a.name) ? order.indexOf(a.name) : a.section === 'required' ? 100 : 200)
  const sorted = [...attrs].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
  const isPrimary = (a) => primaryNames.has(a.name) || a.section === 'required' || !isEmpty(inst.value.values[a.name]) || inst.value.refs[a.name]
  return { primary: sorted.filter(isPrimary), rest: sorted.filter((a) => !isPrimary(a)) }
})

const nameDraft = ref('')
watch(inst, (i) => (nameDraft.value = i ? i.name : ''), { immediate: true })
const nameOk = computed(() => validName(nameDraft.value) && !props.design.instances.some((o) => o !== inst.value && o.type === inst.value?.type && o.name === nameDraft.value))
function commitName() {
  if (inst.value && nameOk.value) inst.value.name = nameDraft.value
  else if (inst.value) nameDraft.value = inst.value.name
}

const ENV_CHILDREN = [
  'powerplatform_managed_environment',
  'powerplatform_environment_settings',
  'powerplatform_managed_solution',
  'powerplatform_application_user',
  'powerplatform_security_role_assignment',
  'powerplatform_connection',
  'powerplatform_enterprise_policy',
  'powerplatform_environment_disaster_recovery',
  'powerplatform_copilot_studio_application_insights',
]
const GROUP_CHILDREN = [BUILDER_ENV, 'powerplatform_environment_group_rule_set', 'powerplatform_rbac_role_assignment']
const quickAdd = computed(() => {
  if (!inst.value) return []
  if (inst.value.type === BUILDER_ENV) return ENV_CHILDREN
  if (inst.value.type === BUILDER_GROUP) return GROUP_CHILDREN
  return []
})
const quickTitle = (t) => (t === BUILDER_ENV ? 'Environment in this group' : typeInfo(t)?.title || t)

const removeLabel = computed(() => {
  if (!inst.value) return ''
  const kids = childrenOf(props.design, inst.value.id).length
  return kids ? `Delete with ${kids} attached` : 'Delete'
})

// ---------------------------------------------------------------- overview (no selection)
const tree = computed(() => {
  const d = props.design
  const groups = d.instances.filter((i) => i.type === BUILDER_GROUP)
  const envs = d.instances.filter((i) => i.type === BUILDER_ENV)
  const tenant = d.instances.filter((i) => !specFor(i.type).parent && i.type !== BUILDER_ENV && i.type !== BUILDER_GROUP)
  const envNode = (e) => ({ inst: e, children: childrenOf(d, e.id) })
  return {
    tenant,
    groups: groups.map((g) => ({ inst: g, children: childrenOf(d, g.id), envs: membersOf(d, g.id).map(envNode) })),
    loose: envs.filter((e) => !groups.some((g) => g.id === e.refs.environment_group_id)).map(envNode),
  }
})
const auth = computed(() => AUTH_METHODS.find((a) => a.id === props.design.provider.auth))
const issueCount = (id) => props.issues.filter((i) => i.id === id && i.level === 'error').length
</script>

<template>
  <div class="bi">
    <template v-if="inst">
      <header class="bi-head">
        <div class="bi-type">
          <span class="pp-swatch" :style="{ background: `var(--pen-${info?.category})` }" />
          <span class="pp-label">{{ info?.title }}</span>
          <a v-if="info" class="bi-ref" :href="withBase(info.page)" target="_blank" rel="noopener">Reference ↗</a>
        </div>
        <h3 class="bi-title pp-display">{{ displayTitle(inst) }}</h3>
        <label class="bi-addr">
          <span class="pp-mono">{{ inst.type }}.</span>
          <input
            v-model="nameDraft"
            class="bi-name"
            :class="{ bad: !nameOk }"
            aria-label="Terraform resource name"
            spellcheck="false"
            @blur="commitName"
            @keydown.enter.prevent="commitName"
          />
        </label>
      </header>

      <ul v-if="myIssues.length" class="bi-issues">
        <li v-for="(i, k) in myIssues" :key="k" :class="i.level">
          <span class="bi-ico" aria-hidden="true">{{ levelIcon[i.level] }}</span>{{ i.text }}
        </li>
      </ul>

      <div v-if="quickAdd.length" class="bi-quick">
        <p class="pp-label">Add to {{ inst.type === BUILDER_ENV ? 'this environment' : 'this group' }}</p>
        <div class="bi-chips">
          <button v-for="t in quickAdd" :key="t" type="button" class="bi-chip" @click="emit('add', t, inst.id)">
            <span class="pp-swatch" :style="{ background: `var(--pen-${typeInfo(t)?.category})` }" />+ {{ quickTitle(t) }}
          </button>
        </div>
      </div>

      <div class="bi-fields">
        <FieldEditor
          v-for="a in fields.primary"
          :key="inst.id + a.name"
          :inst="inst"
          :design="design"
          :attr="a"
          :path="a.name"
          :holder="inst.values"
          :issues="myIssues"
        />
      </div>

      <div v-if="fields.rest.length" class="bi-more">
        <button type="button" class="bi-moretoggle" :aria-expanded="showMore" @click="showMore = !showMore">
          {{ showMore ? 'Hide' : 'Show' }} {{ fields.rest.length }} more attributes
        </button>
        <div v-if="showMore" class="bi-fields">
          <FieldEditor
            v-for="a in fields.rest"
            :key="inst.id + a.name"
            :inst="inst"
            :design="design"
            :attr="a"
            :path="a.name"
            :holder="inst.values"
            :issues="myIssues"
          />
        </div>
      </div>

      <footer class="bi-actions">
        <button type="button" class="pp-btn small ghost" @click="emit('duplicate', inst.id)">Duplicate</button>
        <button type="button" class="pp-btn small ghost bi-danger" @click="emit('remove', inst.id)">{{ removeLabel }}</button>
      </footer>
    </template>

    <template v-else>
      <header class="bi-head">
        <p class="pp-label">Design</p>
        <input v-model="design.title" class="bi-titleinput pp-display" aria-label="Design title" />
        <p class="bi-hint">Select anything on the drawing to configure it, or add resources from the palette.</p>
      </header>

      <section class="bi-section">
        <p class="pp-label">Provider</p>
        <label class="bi-field">
          <span class="bi-fl">Authentication</span>
          <select v-model="design.provider.auth" class="fe-like">
            <option v-for="a in AUTH_METHODS" :key="a.id" :value="a.id">{{ a.label }}</option>
          </select>
          <span class="bi-note" v-html="auth?.note.replace(/`([^`]+)`/g, '<code>$1</code>')" />
        </label>
        <div class="bi-row">
          <label class="bi-field">
            <span class="bi-fl">Cloud</span>
            <select v-model="design.provider.cloud" class="fe-like">
              <option v-for="c in CLOUDS" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label class="bi-field">
            <span class="bi-fl">Version</span>
            <input v-model="design.provider.version" class="fe-like pp-mono" spellcheck="false" />
          </label>
        </div>
      </section>

      <section class="bi-section">
        <p class="pp-label">Resources · {{ design.instances.length }}</p>
        <p v-if="!design.instances.length" class="bi-hint">Nothing yet. Pick a template above the drawing or add an environment.</p>
        <ul class="bi-tree">
          <li v-for="t in tree.tenant" :key="t.id">
            <button type="button" @click="emit('select', t.id)"><span class="pp-swatch" :style="{ background: `var(--pen-${typeInfo(t.type)?.category})` }" />{{ displayTitle(t) }}<em v-if="issueCount(t.id)">{{ issueCount(t.id) }}</em></button>
          </li>
          <li v-for="g in tree.groups" :key="g.inst.id">
            <button type="button" class="is-group" @click="emit('select', g.inst.id)"><span class="pp-swatch" style="background: var(--pen-environments)" />{{ displayTitle(g.inst) }}</button>
            <ul>
              <li v-for="c in g.children" :key="c.id"><button type="button" @click="emit('select', c.id)">{{ displayTitle(c) }}<em v-if="issueCount(c.id)">{{ issueCount(c.id) }}</em></button></li>
              <li v-for="e in g.envs" :key="e.inst.id">
                <button type="button" class="is-env" @click="emit('select', e.inst.id)">{{ displayTitle(e.inst) }}<em v-if="issueCount(e.inst.id)">{{ issueCount(e.inst.id) }}</em></button>
                <ul>
                  <li v-for="c in e.children" :key="c.id"><button type="button" @click="emit('select', c.id)">{{ displayTitle(c) }}<em v-if="issueCount(c.id)">{{ issueCount(c.id) }}</em></button></li>
                </ul>
              </li>
            </ul>
          </li>
          <li v-for="e in tree.loose" :key="e.inst.id">
            <button type="button" class="is-env" @click="emit('select', e.inst.id)"><span class="pp-swatch" style="background: var(--pen-environments)" />{{ displayTitle(e.inst) }}<em v-if="issueCount(e.inst.id)">{{ issueCount(e.inst.id) }}</em></button>
            <ul>
              <li v-for="c in e.children" :key="c.id"><button type="button" @click="emit('select', c.id)">{{ displayTitle(c) }}<em v-if="issueCount(c.id)">{{ issueCount(c.id) }}</em></button></li>
            </ul>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.bi {
  padding: 16px 18px 28px;
}

.bi-head {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.bi-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bi-ref {
  margin-left: auto;
  font-size: 12.5px;
  text-decoration: none;
}

.bi-title {
  margin: 6px 0 4px;
  font-size: 19px;
  font-weight: 740;
  line-height: 1.2;
  border: 0;
  padding: 0;
}

.bi-addr {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.bi-name {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  border: 0;
  border-bottom: 1px dashed var(--vp-c-border);
  background: transparent;
  padding: 1px 2px;
  color: var(--vp-c-text-1);
  min-width: 60px;
  width: 40%;
}

.bi-name:focus {
  outline: none;
  border-bottom-color: var(--pp-violet);
}

.bi-name.bad {
  border-bottom-color: var(--pp-red);
}

.bi-issues {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.bi-issues li {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.45;
  padding: 7px 9px;
  border-radius: 4px;
  border-left: 3px solid;
}

.bi-issues li.error {
  border-color: var(--pp-red);
  background: var(--vp-c-danger-soft);
}

.bi-issues li.warn {
  border-color: var(--pp-amber);
  background: var(--vp-c-warning-soft);
}

.bi-issues li.info {
  border-color: var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.bi-ico {
  font-family: var(--pp-font-mono);
  font-weight: 700;
}

.bi-quick {
  margin-top: 14px;
}

.bi-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.bi-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.bi-chip:hover {
  border-color: var(--pp-ink);
}

.bi-fields {
  margin-top: 8px;
}

.bi-more {
  margin-top: 6px;
}

.bi-moretoggle {
  border: 0;
  background: none;
  padding: 8px 0;
  font-size: 13px;
  color: var(--pp-violet);
  cursor: pointer;
}

.bi-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.bi-danger {
  color: var(--pp-red) !important;
}

.bi-titleinput {
  width: 100%;
  font-size: 19px;
  font-weight: 740;
  border: 0;
  border-bottom: 1px dashed var(--vp-c-border);
  background: transparent;
  padding: 4px 0;
  color: var(--vp-c-text-1);
}

.bi-titleinput:focus {
  outline: none;
  border-bottom-color: var(--pp-violet);
}

.bi-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.bi-section {
  margin-top: 18px;
}

.bi-field {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  flex: 1;
}

.bi-row {
  display: flex;
  gap: 10px;
}

.bi-fl {
  font-family: var(--pp-font-mono);
  font-size: 12px;
  font-weight: 600;
}

.bi-note {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.fe-like {
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13.5px;
  appearance: auto;
}

.bi-tree,
.bi-tree ul {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.bi-tree ul {
  padding-left: 14px;
  border-left: 1px solid var(--vp-c-divider);
  margin-left: 4px;
}

.bi-tree button {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  border: 0;
  background: none;
  padding: 4px 4px;
  font-size: 13px;
  text-align: left;
  color: var(--vp-c-text-1);
  cursor: pointer;
  border-radius: 3px;
}

.bi-tree button:hover {
  background: var(--vp-c-bg-soft);
}

.bi-tree button.is-env,
.bi-tree button.is-group {
  font-weight: 700;
}

.bi-tree em {
  margin-left: auto;
  font-style: normal;
  font-size: 11px;
  color: #fff;
  background: var(--pp-red);
  border-radius: 999px;
  padding: 0 6px;
}
</style>
