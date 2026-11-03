<script setup>
// Edits one provider attribute of a builder instance. Recurses into nested
// objects and lists of objects; knows about references, Azure/Entra ids that
// become variables, and the DLP connector groups.
import { computed, ref } from 'vue'
import { attrsAt, isEmpty } from '../../lib/builder/schema.js'
import { specFor } from '../../lib/builder/specs.js'
import { refDefs, displayTitle, shortAddress } from '../../lib/builder/model.js'
import { variableName } from '../../lib/builder/hcl.js'
import { CONNECTORS, connectorLabel } from '../../lib/builder/lists.js'

defineOptions({ name: 'FieldEditor' })

const props = defineProps({
  inst: { type: Object, required: true },
  design: { type: Object, required: true },
  attr: { type: Object, required: true },
  path: { type: String, required: true },
  holder: { type: Object, required: true }, // object that owns this attribute's value
  inList: { type: Boolean, default: false },
  issues: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
})

const spec = computed(() => specFor(props.inst.type))
const field = computed(() => (spec.value.fields || {})[props.path] || {})
const def = computed(() => (props.inList ? null : refDefs(props.inst.type)[props.path]))
const ext = computed(() => (spec.value.external || {})[props.path])
const required = computed(() => props.attr.section === 'required')
const fieldId = computed(() => `f-${props.inst.id}-${props.path.replace(/\./g, '-')}${props.inList ? '-' + Math.random().toString(36).slice(2, 6) : ''}`)
const myIssues = computed(() => props.issues.filter((i) => i.path === props.path))

const value = computed({
  get: () => props.holder[props.attr.name],
  set: (v) => {
    if (v === undefined || v === '' || (Array.isArray(v) && !v.length && !required.value)) delete props.holder[props.attr.name]
    else props.holder[props.attr.name] = v
  },
})

const options = computed(() => {
  const o = field.value.options
  if (typeof o === 'function') return o(props.inst)
  if (o) return o
  if (props.attr.enum) return props.attr.enum.map((e) => [e, String(e)])
  return null
})

const inputKind = computed(() => {
  if (field.value.input) return field.value.input
  if (props.attr.enum) return 'select'
  return null
})

// ---------------------------------------------------------------- references
const candidates = computed(() => (def.value ? props.design.instances.filter((i) => i.type === def.value.to && i.id !== props.inst.id) : []))
const refValue = computed({
  get: () => props.inst.refs[props.path] || (isEmpty(value.value) ? '' : '__custom'),
  set: (v) => {
    if (v === '__custom') {
      delete props.inst.refs[props.path]
      if (isEmpty(value.value)) value.value = ''
      customMode.value = true
    } else if (v) {
      props.inst.refs[props.path] = v
      delete props.holder[props.attr.name]
      customMode.value = false
      for (const [p, d] of Object.entries(refDefs(props.inst.type))) if (d.follows === props.path) props.inst.refs[p] = v
    } else {
      delete props.inst.refs[props.path]
      customMode.value = false
      for (const [p, d] of Object.entries(refDefs(props.inst.type))) if (d.follows === props.path) delete props.inst.refs[p]
    }
  },
})
const customMode = ref(!props.inst.refs[props.path] && !isEmpty(props.holder[props.attr.name]))

function toggleMany(id, on) {
  const list = [...(props.inst.refs[props.path] || [])]
  const i = list.indexOf(id)
  if (on && i < 0) list.push(id)
  if (!on && i >= 0) list.splice(i, 1)
  props.inst.refs[props.path] = list
}

// map with reference values (managed solution connection references)
const mapRows = computed(() => Object.keys(value.value || {}))
const newKey = ref('')
function addMapRow() {
  const k = newKey.value.trim()
  if (!k) return
  value.value = { ...(value.value || {}), [k]: '' }
  newKey.value = ''
}
function removeMapRow(k) {
  const next = { ...(value.value || {}) }
  delete next[k]
  delete props.inst.refs[`${props.path}.${k}`]
  value.value = Object.keys(next).length ? next : undefined
}
function setMapValue(k, v) {
  value.value = { ...(value.value || {}), [k]: v }
}
function setMapRef(k, id) {
  if (id) props.inst.refs[`${props.path}.${k}`] = id
  else delete props.inst.refs[`${props.path}.${k}`]
}

// ---------------------------------------------------------------- lists / tags
const tagDraft = ref('')
function addTag() {
  const raw = tagDraft.value.trim()
  if (!raw) return
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  const cast = (s) => (props.attr.elem === 'number' && !isNaN(Number(s)) ? Number(s) : s)
  const list = [...(Array.isArray(value.value) ? value.value : [])]
  for (const p of parts) if (!list.includes(cast(p))) list.push(cast(p))
  value.value = list
  tagDraft.value = ''
}
function removeTag(i) {
  const list = [...value.value]
  list.splice(i, 1)
  value.value = list
}

const connectorDraft = ref('')
function toggleConnector(id, on) {
  const list = [...(Array.isArray(value.value) ? value.value : [])]
  const i = list.indexOf(id)
  if (on && i < 0) list.push(id)
  if (!on && i >= 0) list.splice(i, 1)
  props.holder[props.attr.name] = list
}
function addCustomConnector() {
  let id = connectorDraft.value.trim()
  if (!id) return
  if (!id.startsWith('/')) id = `/providers/Microsoft.PowerApps/apis/${id}`
  toggleConnector(id, true)
  connectorDraft.value = ''
}
const customConnectors = computed(() => (Array.isArray(value.value) ? value.value : []).filter((id) => !CONNECTORS.some((c) => c.id === id)))

// ---------------------------------------------------------------- objects
const nested = computed(() => (props.attr.type.startsWith('object') ? attrsAt(props.inst.type, props.path) : []))
const included = computed({
  get: () => value.value !== undefined && value.value !== null,
  set: (on) => {
    if (on) props.holder[props.attr.name] = props.attr.type === 'object' ? {} : []
    else delete props.holder[props.attr.name]
  },
})
const open = ref(props.depth < 1 && (required.value || included.value))
function addItem() {
  const list = Array.isArray(value.value) ? [...value.value] : []
  list.push({})
  props.holder[props.attr.name] = list
  open.value = true
}
function removeItem(i) {
  const list = [...value.value]
  list.splice(i, 1)
  props.holder[props.attr.name] = list
}

// ---------------------------------------------------------------- scalars
const boolState = computed({
  get: () => (value.value === true ? 'true' : value.value === false ? 'false' : ''),
  set: (v) => (value.value = v === '' ? undefined : v === 'true'),
})

function onNumber(e) {
  const raw = e.target.value
  if (raw === '') value.value = undefined
  else if (!isNaN(Number(raw))) value.value = Number(raw)
}

function onSelect(e) {
  const raw = e.target.value
  if (raw === '') return (value.value = undefined)
  const opt = (options.value || []).find(([v]) => String(v) === raw)
  value.value = opt ? opt[0] : raw
}

const autoVar = computed(() => (ext.value && required.value && !props.inList ? `var.${variableName(props.inst, props.path, ext.value)}` : null))
const extTag = computed(() => {
  if (!ext.value) return null
  const k = ext.value.key
  return k.startsWith('entra') ? 'Entra ID' : k.startsWith('azure') ? 'Azure' : k.startsWith('copilot') ? 'Copilot Studio' : 'Input'
})
const datalistId = computed(() => `${fieldId.value}-list`)
const describe = computed(() => props.attr.description || '')
</script>

<template>
  <!-- nested object -->
  <div v-if="attr.type === 'object'" class="fe fe-object" :class="{ 'is-open': open && included }">
    <div class="fe-objhead">
      <button type="button" class="fe-disclose" :aria-expanded="open && included" :disabled="!included" @click="open = !open">
        <span class="fe-chev" aria-hidden="true">›</span>
        <span class="fe-name">{{ attr.name }}</span>
        <span v-if="required" class="fe-req" title="required">*</span>
        <span class="fe-count" v-if="included">{{ Object.keys(value || {}).length }} set</span>
      </button>
      <label v-if="!required" class="fe-switch" :title="included ? 'Remove this block' : 'Add this block'">
        <input type="checkbox" :checked="included" @change="included = $event.target.checked; open = $event.target.checked" />
        <span>{{ included ? 'On' : 'Off' }}</span>
      </label>
    </div>
    <p v-if="describe && (open || !included)" class="fe-help">{{ describe }}</p>
    <div v-if="included && open" class="fe-children">
      <FieldEditor
        v-for="a in nested"
        :key="a.name"
        :inst="inst"
        :design="design"
        :attr="a"
        :path="`${path}.${a.name}`"
        :holder="value"
        :in-list="inList"
        :issues="issues"
        :depth="depth + 1"
      />
    </div>
  </div>

  <!-- DLP connector group -->
  <div v-else-if="inputKind === 'connectors'" class="fe">
    <div class="fe-label">
      <span class="fe-name">{{ attr.name }}</span><span v-if="required" class="fe-req">*</span>
      <span class="fe-count">{{ (value || []).length }} connectors</span>
    </div>
    <div class="fe-checks">
      <label v-for="c in CONNECTORS" :key="c.id" class="fe-check">
        <input type="checkbox" :checked="(value || []).includes(c.id)" @change="toggleConnector(c.id, $event.target.checked)" />
        <span>{{ c.label }}</span>
      </label>
      <label v-for="id in customConnectors" :key="id" class="fe-check">
        <input type="checkbox" checked @change="toggleConnector(id, $event.target.checked)" />
        <span class="pp-mono">{{ connectorLabel(id) }}</span>
      </label>
    </div>
    <div class="fe-row">
      <input v-model="connectorDraft" class="fe-input" placeholder="Another connector, e.g. shared_servicebus" @keydown.enter.prevent="addCustomConnector" />
      <button type="button" class="pp-btn small ghost" @click="addCustomConnector">Add</button>
    </div>
  </div>

  <!-- list / set of objects -->
  <div v-else-if="attr.type === 'object_list' || attr.type === 'object_set'" class="fe fe-object is-open">
    <div class="fe-objhead">
      <span class="fe-name">{{ attr.name }}</span><span v-if="required" class="fe-req">*</span>
      <span class="fe-count">{{ (value || []).length }} items</span>
      <button type="button" class="pp-btn small ghost fe-add" @click="addItem">Add item</button>
    </div>
    <p v-if="describe" class="fe-help">{{ describe }}</p>
    <div v-for="(item, i) in value || []" :key="i" class="fe-item">
      <div class="fe-itemhead">
        <span class="pp-label">Item {{ i + 1 }}</span>
        <button type="button" class="fe-remove" :aria-label="`Remove item ${i + 1}`" @click="removeItem(i)">Remove</button>
      </div>
      <FieldEditor
        v-for="a in nested"
        :key="a.name"
        :inst="inst"
        :design="design"
        :attr="a"
        :path="`${path}.${a.name}`"
        :holder="item"
        :in-list="true"
        :issues="issues"
        :depth="depth + 1"
      />
    </div>
  </div>

  <!-- scalar / list / map / reference -->
  <div v-else class="fe" :class="{ 'has-error': myIssues.some((i) => i.level === 'error') }">
    <label class="fe-label" :for="fieldId">
      <span class="fe-name">{{ attr.name }}</span><span v-if="required" class="fe-req" title="required">*</span>
      <span v-if="extTag" class="fe-ext">{{ extTag }}</span>
      <span v-if="attr.sensitive" class="fe-ext is-warn">sensitive</span>
    </label>

    <!-- single reference -->
    <template v-if="def && !def.many && !def.map && !def.follows">
      <select :id="fieldId" v-model="refValue" class="fe-input">
        <option value="">{{ required ? 'Choose…' : 'Not set' }}</option>
        <option v-for="c in candidates" :key="c.id" :value="c.id">{{ displayTitle(c) }} — {{ shortAddress(c) }}</option>
        <option value="__custom">Type a value…</option>
      </select>
      <input
        v-if="refValue === '__custom' || customMode"
        v-model="value"
        class="fe-input fe-gap"
        :placeholder="attr.type === 'string' ? 'GUID, var.name or an expression' : ''"
      />
      <p v-if="!candidates.length" class="fe-help">No {{ def.to.replace('powerplatform_', '').replace(/_/g, ' ') }} in this design yet.</p>
    </template>

    <!-- reference that mirrors another one -->
    <template v-else-if="def && def.follows">
      <p class="fe-follow pp-mono">{{ inst.refs[path] ? `follows ${def.follows}` : `set ${def.follows} first` }}</p>
    </template>

    <!-- many references -->
    <template v-else-if="def && def.many">
      <div class="fe-checks">
        <label v-for="c in candidates" :key="c.id" class="fe-check">
          <input type="checkbox" :checked="(inst.refs[path] || []).includes(c.id)" @change="toggleMany(c.id, $event.target.checked)" />
          <span>{{ displayTitle(c) }}</span>
        </label>
        <p v-if="!candidates.length" class="fe-help">Add environments to choose from.</p>
      </div>
    </template>

    <!-- map with reference values -->
    <template v-else-if="def && def.map">
      <div v-for="k in mapRows" :key="k" class="fe-maprow">
        <span class="pp-mono fe-mapkey">{{ k }}</span>
        <select class="fe-input" :value="inst.refs[`${path}.${k}`] || ''" @change="setMapRef(k, $event.target.value)">
          <option value="">Literal value</option>
          <option v-for="c in candidates" :key="c.id" :value="c.id">{{ displayTitle(c) }}</option>
        </select>
        <input v-if="!inst.refs[`${path}.${k}`]" class="fe-input" :value="value[k]" placeholder="connection id" @input="setMapValue(k, $event.target.value)" />
        <button type="button" class="fe-remove" @click="removeMapRow(k)">Remove</button>
      </div>
      <div class="fe-row">
        <input v-model="newKey" class="fe-input" placeholder="connection reference logical name" @keydown.enter.prevent="addMapRow" />
        <button type="button" class="pp-btn small ghost" @click="addMapRow">Add</button>
      </div>
    </template>

    <!-- booleans -->
    <template v-else-if="attr.type === 'bool'">
      <div class="fe-seg" role="radiogroup" :aria-label="attr.name">
        <label v-if="!required" :class="{ on: boolState === '' }"><input type="radio" :name="fieldId" value="" v-model="boolState" />not set</label>
        <label :class="{ on: boolState === 'true' }"><input type="radio" :name="fieldId" value="true" v-model="boolState" />true</label>
        <label :class="{ on: boolState === 'false' }"><input type="radio" :name="fieldId" value="false" v-model="boolState" />false</label>
      </div>
    </template>

    <!-- lists / sets -->
    <template v-else-if="attr.type === 'list' || attr.type === 'set' || inputKind === 'tags'">
      <div class="fe-tags">
        <span v-for="(t, i) in value || []" :key="t" class="fe-tag">
          <span class="pp-mono">{{ t }}</span>
          <button type="button" :aria-label="`Remove ${t}`" @click="removeTag(i)">×</button>
        </span>
        <input
          :id="fieldId"
          v-model="tagDraft"
          class="fe-taginput"
          :list="options ? datalistId : undefined"
          placeholder="type and press Enter"
          @keydown.enter.prevent="addTag"
          @blur="addTag"
        />
        <datalist v-if="options" :id="datalistId">
          <option v-for="o in options" :key="o[0] || o" :value="Array.isArray(o) ? o[0] : o">{{ Array.isArray(o) ? o[1] : o }}</option>
        </datalist>
      </div>
    </template>

    <!-- plain maps -->
    <template v-else-if="attr.type === 'map'">
      <div v-for="k in mapRows" :key="k" class="fe-maprow">
        <span class="pp-mono fe-mapkey">{{ k }}</span>
        <input class="fe-input" :value="value[k]" @input="setMapValue(k, $event.target.value)" />
        <button type="button" class="fe-remove" @click="removeMapRow(k)">Remove</button>
      </div>
      <div class="fe-row">
        <input v-model="newKey" class="fe-input" placeholder="key" @keydown.enter.prevent="addMapRow" />
        <button type="button" class="pp-btn small ghost" @click="addMapRow">Add</button>
      </div>
    </template>

    <!-- code / dynamic -->
    <template v-else-if="attr.type === 'dynamic' || inputKind === 'code'">
      <textarea :id="fieldId" v-model="value" class="fe-input fe-code" :rows="field.rows || 4" spellcheck="false" />
    </template>

    <!-- enum -->
    <template v-else-if="inputKind === 'select' && options">
      <select :id="fieldId" class="fe-input" :value="value ?? ''" @change="onSelect">
        <option value="">{{ required ? 'Choose…' : 'Not set' }}</option>
        <option v-for="[v, label] in options" :key="v" :value="v">{{ label }}</option>
      </select>
    </template>

    <!-- numbers -->
    <template v-else-if="attr.type === 'number'">
      <input :id="fieldId" type="number" class="fe-input" :value="value ?? ''" :placeholder="field.placeholder" @input="onNumber" />
    </template>

    <!-- long text -->
    <template v-else-if="inputKind === 'textarea'">
      <textarea :id="fieldId" v-model="value" class="fe-input" :rows="field.rows || 3" :placeholder="field.placeholder" />
    </template>

    <!-- text with suggestions -->
    <template v-else>
      <input
        :id="fieldId"
        v-model="value"
        class="fe-input"
        :type="attr.sensitive ? 'password' : 'text'"
        :list="options ? datalistId : undefined"
        :placeholder="autoVar && isEmpty(value) ? `empty → ${autoVar}` : field.placeholder || ''"
        autocomplete="off"
        spellcheck="false"
      />
      <datalist v-if="options" :id="datalistId">
        <option v-for="[v, label] in options" :key="v" :value="v">{{ label }}</option>
      </datalist>
    </template>

    <p v-for="(iss, k) in myIssues" :key="k" class="fe-issue" :class="iss.level">{{ iss.text }}</p>
    <p v-if="field.help" class="fe-help" v-html="field.help.replace(/`([^`]+)`/g, '<code>$1</code>')" />
    <p v-else-if="describe" class="fe-help">{{ describe }}</p>
  </div>
</template>

<style scoped>
.fe {
  padding: 10px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.fe:last-child {
  border-bottom: 0;
}

.fe-label,
.fe-objhead {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
  min-height: 22px;
}

.fe-name {
  font-family: var(--pp-font-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.fe-req {
  color: var(--pp-red);
  font-weight: 700;
}

.fe-count {
  margin-left: auto;
  font-family: var(--pp-font-display);
  font-stretch: 80%;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.fe-ext {
  font-family: var(--pp-font-display);
  font-stretch: 80%;
  font-weight: 650;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pen-external);
  border: 1px dashed currentColor;
  border-radius: 3px;
  padding: 0 5px;
}

.fe-ext.is-warn {
  color: var(--pp-amber);
}

.fe-input {
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13.5px;
  font-family: var(--pp-font-body);
}

select.fe-input {
  appearance: auto;
}

.fe-input:focus {
  border-color: var(--pp-violet);
  outline: none;
  box-shadow: 0 0 0 3px var(--pp-violet-soft);
}

.fe-code {
  font-family: var(--pp-font-mono);
  font-size: 12.5px;
  line-height: 1.5;
  resize: vertical;
}

.fe-gap {
  margin-top: 6px;
}

.fe-help {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.fe-help :deep(code) {
  font-size: 11.5px;
}

.fe-issue {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
}

.fe-issue.error {
  color: var(--pp-red);
}

.fe-issue.warn {
  color: var(--pp-amber);
}

.fe-issue.info {
  color: var(--vp-c-text-2);
}

.has-error .fe-input {
  border-color: var(--pp-red);
}

.fe-seg {
  display: inline-flex;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  overflow: hidden;
}

.fe-seg label {
  position: relative;
  padding: 4px 11px;
  font-family: var(--pp-font-mono);
  font-size: 12px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  border-right: 1px solid var(--vp-c-border);
}

.fe-seg label:last-child {
  border-right: 0;
}

.fe-seg label.on {
  background: var(--pp-ink);
  color: var(--pp-film);
}

.fe-seg input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.fe-seg label:focus-within {
  outline: 2px solid var(--pp-violet);
  outline-offset: -2px;
}

.fe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
}

.fe-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px 1px 8px;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}

.fe-tag button {
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1;
  padding: 0 3px;
}

.fe-taginput {
  flex: 1;
  min-width: 120px;
  border: 0;
  background: transparent;
  font-size: 13px;
  padding: 3px;
  color: var(--vp-c-text-1);
}

.fe-taginput:focus {
  outline: none;
}

.fe-checks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 2px 10px;
}

.fe-check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  padding: 3px 0;
  cursor: pointer;
}

.fe-check input {
  accent-color: var(--pp-violet);
}

.fe-row,
.fe-maprow {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
}

.fe-mapkey {
  min-width: 90px;
  font-size: 12px;
}

.fe-remove {
  border: 0;
  background: none;
  color: var(--pp-red);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.fe-follow {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.fe-object {
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  padding: 8px 10px;
  margin: 10px 0;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 40%, transparent);
}

.fe-object.is-open {
  background: transparent;
}

.fe-disclose {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  text-align: left;
  color: inherit;
}

.fe-disclose:disabled {
  cursor: default;
}

.fe-chev {
  display: inline-block;
  transition: transform 0.15s ease;
  font-size: 16px;
  line-height: 1;
  color: var(--vp-c-text-3);
}

.is-open > .fe-objhead .fe-chev {
  transform: rotate(90deg);
}

.fe-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--pp-font-display);
  font-stretch: 80%;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.fe-switch input {
  accent-color: var(--pp-violet);
}

.fe-children {
  padding-left: 10px;
  border-left: 2px solid var(--vp-c-divider);
  margin-top: 4px;
}

.fe-add {
  margin-left: 8px;
}

.fe-item {
  border-left: 2px solid var(--pen-environments);
  padding: 4px 0 4px 10px;
  margin: 8px 0;
}

.fe-itemhead {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
