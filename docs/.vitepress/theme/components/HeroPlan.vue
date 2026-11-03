<script setup>
// A small live tenant plan: flip a few switches and the drawing re-plots,
// exactly as the builder would draw it.
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import PlotCanvas from './PlotCanvas.vue'
import { emptyDesign } from '../lib/builder/model.js'
import { specFor } from '../lib/builder/specs.js'
import { generate } from '../lib/builder/hcl.js'
import { architectureScene } from '../lib/builder/layout.js'
import { encodeDesign } from '../lib/builder/share.js'

const envCount = ref(3)
const governed = ref(true)
const payg = ref(true)
const dlp = ref(true)
const agents = ref(false)

const clone = (v) => JSON.parse(JSON.stringify(v ?? {}))

const design = computed(() => {
  const d = emptyDesign()
  d.title = 'Contoso tenant'
  const add = (type, name, values = {}, refs = {}) => {
    const inst = { id: `h${d.instances.length + 1}`, type, name, values: { ...clone(specFor(type).defaults), ...values }, refs }
    d.instances.push(inst)
    return inst
  }
  const group = governed.value ? add('powerplatform_environment_group', 'apps', { display_name: 'Business apps' }) : null
  if (group) add('powerplatform_environment_group_rule_set', 'apps', {}, { environment_group_id: group.id })
  const policy = payg.value ? add('powerplatform_billing_policy', 'payg', { name: 'payg-europe' }) : null
  if (dlp.value) add('powerplatform_data_loss_prevention_policy', 'baseline')
  const envs = [
    ['dev', 'Contoso Dev', 'Sandbox'],
    ['test', 'Contoso Test', 'Sandbox'],
    ['prod', 'Contoso Prod', 'Production'],
  ]
    .slice(0, envCount.value)
    .map(([name, display, type]) =>
      add('powerplatform_environment', name, { display_name: display, environment_type: type, location: 'europe', dataverse: { language_code: 1033, currency_code: 'EUR' } }, group ? { environment_group_id: group.id } : {}),
    )
  for (const env of envs) {
    if (governed.value) add('powerplatform_managed_environment', env.name, {}, { environment_id: env.id })
    if (env.name !== 'dev') add('powerplatform_managed_solution', `core_${env.name}`, {}, { environment_id: env.id })
  }
  if (agents.value) add('powerplatform_copilot_studio_application_insights', 'agent', {}, { environment_id: envs.at(-1).id })
  if (policy) add('powerplatform_billing_policy_environment', 'payg', {}, { billing_policy_id: policy.id, environments: envs.map((e) => e.id) })
  return d
})

const generated = computed(() => generate(design.value))
const scene = computed(() => architectureScene(design.value, { varNames: generated.value.autoVars, implicit: generated.value.implicit, showExternal: true, showImplicit: false }))
const count = computed(() => design.value.instances.length)
const titleBlock = computed(() => ({
  title: 'Contoso tenant',
  rev: 1 + Number(governed.value) + Number(payg.value) + Number(dlp.value) + Number(agents.value) + envCount.value,
  cells: [
    { label: 'Provider', value: 'power-platform ~> 4.2' },
    { label: 'Resources', value: `${count.value} to add` },
    { label: 'Scale', value: 'not to scale' },
  ],
}))

async function openInBuilder() {
  const token = await encodeDesign(design.value)
  window.location.href = withBase(`/builder#design=${token}`)
}
</script>

<template>
  <div class="hp">
    <div class="hp-controls" role="group" aria-label="Shape the tenant">
      <div class="hp-seg" role="radiogroup" aria-label="Environments">
        <span class="pp-label">Environments</span>
        <button v-for="n in [1, 2, 3]" :key="n" type="button" role="radio" :aria-checked="envCount === n" :class="{ on: envCount === n }" @click="envCount = n">{{ ['Dev', 'Dev + Test', 'Dev + Test + Prod'][n - 1] }}</button>
      </div>
      <label class="hp-switch"><input v-model="governed" type="checkbox" /><span class="hp-pen" style="background: var(--pen-environments)" />Managed &amp; grouped</label>
      <label class="hp-switch"><input v-model="payg" type="checkbox" /><span class="hp-pen" style="background: var(--pen-billing)" />Pay-as-you-go</label>
      <label class="hp-switch"><input v-model="dlp" type="checkbox" /><span class="hp-pen" style="background: var(--pen-governance)" />DLP policy</label>
      <label class="hp-switch"><input v-model="agents" type="checkbox" /><span class="hp-pen" style="background: var(--pen-copilot)" />Agent telemetry</label>
    </div>
    <div class="hp-sheet">
      <PlotCanvas :scene="scene" :title-block="titleBlock" :padding="22" aria-label="Live tenant plan" />
    </div>
    <div class="hp-foot">
      <code class="hp-plan"><span class="plus">+</span> Plan: {{ count }} to add, 0 to change, 0 to destroy.</code>
      <button type="button" class="hp-open" @click="openInBuilder">Keep editing in the builder →</button>
    </div>
  </div>
</template>

<style scoped>
.hp {
  display: grid;
  gap: 12px;
}

.hp-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.hp-seg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.hp-seg .pp-label {
  margin-right: 6px;
}

.hp-seg button {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.hp-seg button.on {
  background: var(--pp-ink);
  border-color: var(--pp-ink);
  color: var(--pp-film);
}

.hp-switch {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  cursor: pointer;
}

.hp-switch input {
  accent-color: var(--pp-violet);
}

.hp-pen {
  width: 14px;
  height: 3px;
  border-radius: 2px;
}

.hp-sheet {
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--pp-film);
  overflow: hidden;
  box-shadow: 0 1px 0 var(--vp-c-divider), 0 24px 60px -30px rgba(21, 33, 58, 0.35);
}

.hp-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.hp-plan {
  font-family: var(--pp-font-mono);
  font-size: 13px;
  background: none;
  padding: 0;
  color: var(--vp-c-text-1);
}

.plus {
  color: var(--pp-green);
  font-weight: 700;
}

.hp-open {
  border: 0;
  background: none;
  padding: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--pp-violet);
  cursor: pointer;
}
</style>
