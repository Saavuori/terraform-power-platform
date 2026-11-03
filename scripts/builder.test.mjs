import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TEMPLATES } from '../docs/.vitepress/theme/lib/builder/templates.js'
import { generate, planText, isExpression } from '../docs/.vitepress/theme/lib/builder/hcl.js'
import { validate } from '../docs/.vitepress/theme/lib/builder/validate.js'
import { architectureScene, applyOrderScene } from '../docs/.vitepress/theme/lib/builder/layout.js'
import { emptyDesign, addInstance, removeInstance, byId } from '../docs/.vitepress/theme/lib/builder/model.js'
import { resourceTypes } from '../docs/.vitepress/theme/lib/builder/schema.js'

function balanced(code) {
  let depth = 0
  let inStr = false
  for (let i = 0; i < code.length; i++) {
    const c = code[i]
    if (inStr) {
      if (c === '\\') i++
      else if (c === '"') inStr = false
      continue
    }
    if (c === '#') {
      while (i < code.length && code[i] !== '\n') i++
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') depth--
    if (depth < 0) return false
  }
  return depth === 0 && !inStr
}

for (const t of TEMPLATES) {
  test(`template ${t.id} generates valid-looking HCL without errors`, () => {
    const d = t.build()
    const gen = generate(d)
    const main = gen.files['main.tf']
    assert.ok(balanced(main), 'braces balance')
    assert.equal((main.match(/^resource "/gm) || []).length, d.instances.length)
    assert.ok(!main.includes('TODO'), 'no TODO placeholders:\n' + main)
    const errors = validate(d).filter((i) => i.level === 'error')
    assert.deepEqual(errors, [], JSON.stringify(errors, null, 1))
    const arch = architectureScene(d, { varNames: gen.autoVars, implicit: gen.implicit })
    assert.ok(arch.frames.length >= 1)
    const ids = new Set([...arch.frames, ...arch.nodes].map((b) => b.id))
    for (const e of arch.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `edge ${e.id} endpoints exist`)
    const order = applyOrderScene(d, { varNames: gen.autoVars, implicit: gen.implicit })
    assert.ok(order.nodes.length >= d.instances.length)
    assert.match(planText(d, gen), new RegExp(`Plan: ${d.instances.length} to add`))
  })
}

test('every resource type can be added to an empty design', () => {
  for (const type of resourceTypes) {
    const d = emptyDesign()
    const { inst } = addInstance(d, type.name)
    assert.ok(byId(d, inst.id))
    const gen = generate(d)
    assert.ok(balanced(gen.files['main.tf']), `${type.name} balanced`)
  }
})

test('adding an environment-scoped resource creates and links an environment', () => {
  const d = emptyDesign()
  const { inst, created } = addInstance(d, 'powerplatform_managed_environment')
  assert.equal(created.length, 2)
  const env = created.find((c) => c.type === 'powerplatform_environment')
  assert.equal(inst.refs.environment_id, env.id)
  assert.match(generate(d).files['main.tf'], /environment_id\s+= powerplatform_environment\.\w+\.id/)
})

test('removing an environment removes its attached resources and clears references', () => {
  const d = TEMPLATES.find((t) => t.id === 'payg').build()
  const finance = d.instances.find((i) => i.name === 'finance')
  removeInstance(d, finance.id)
  const link = d.instances.find((i) => i.type === 'powerplatform_billing_policy_environment')
  assert.equal(link.refs.environments.length, 1)
})

test('required external ids become variables', () => {
  const d = TEMPLATES.find((t) => t.id === 'payg').build()
  const gen = generate(d)
  assert.match(gen.files['main.tf'], /subscription_id = var\.payg_subscription_id/)
  assert.match(gen.files['variables.tf'], /variable "payg_subscription_id"/)
})

test('validation catches platform rules', () => {
  const d = emptyDesign()
  const { inst: group } = addInstance(d, 'powerplatform_environment_group')
  const { inst: env } = addInstance(d, 'powerplatform_environment', group)
  assert.equal(env.refs.environment_group_id, group.id)
  const issues = validate(d)
  assert.ok(issues.some((i) => i.id === env.id && /Managed Environment/.test(i.text)))
  delete env.values.dataverse
  addInstance(d, 'powerplatform_solution', env)
  assert.ok(validate(d).some((i) => /needs a Dataverse database/.test(i.text)))
})

test('expression detection', () => {
  assert.ok(isExpression('var.x'))
  assert.ok(isExpression('powerplatform_environment.dev.id'))
  assert.ok(isExpression('jsonencode({a = 1})'))
  assert.ok(!isExpression('Contoso Dev'))
  assert.ok(!isExpression('${path.module}/file.zip'))
})
