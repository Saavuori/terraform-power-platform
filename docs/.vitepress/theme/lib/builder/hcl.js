// Turns a builder design into Terraform: main.tf, variables.tf, outputs.tf,
// plus a simulated `terraform plan` and a tiny HCL highlighter.
import { attrsAt, typeInfo, isEmpty } from './schema.js'
import { specFor } from './specs.js'
import { refDefs, byId, address, dependencies, implicitDependencies, hasDataverse } from './model.js'

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_-]*$/
const EXPR = [
  /^(var|local|data|module|path|terraform|each|count)\.[\w.[\]"*-]+$/,
  /^(powerplatform|azurerm|azuread|azapi|random|time|azurecaf)_[a-z0-9_]+\.[\w-]+(\.[\w[\]".-]+)+$/,
  /^(jsonencode|toset|tolist|tomap|file|filebase64|templatefile|format|lookup|merge|concat|coalesce|base64encode)\(/,
]
export const isExpression = (s) => typeof s === 'string' && EXPR.some((re) => re.test(s.trim()))

function quote(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"'
}

function scalar(v, attrType) {
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (attrType === 'number' && v !== '' && !isNaN(Number(v))) return String(Number(v))
  if (attrType === 'bool' && (v === 'true' || v === 'false')) return v
  if (isExpression(v)) return String(v).trim()
  return quote(v)
}

function inlineList(items, depth) {
  const one = `[${items.join(', ')}]`
  if (one.length + depth * 2 < 78) return { value: one }
  const pad = '  '.repeat(depth + 1)
  return { lines: items.map((x) => `${pad}${x},`), open: '[', close: ']' }
}

const key = (k) => (IDENT.test(k) ? k : quote(k))

function emit(items, depth) {
  const pad = '  '.repeat(depth)
  const out = []
  let run = []
  const flush = () => {
    if (!run.length) return
    const w = Math.max(...run.map((i) => i.key.length))
    for (const i of run) out.push(`${pad}${i.key.padEnd(w)} = ${i.value}${i.comment ? ' # ' + i.comment : ''}`)
    run = []
  }
  for (const it of items) {
    if (it.raw) {
      flush()
      out.push(...it.raw.map((l) => pad + l))
    } else if (it.lines) {
      flush()
      out.push(`${pad}${it.key} = ${it.open}`, ...it.lines, `${pad}${it.close}`)
    } else run.push(it)
  }
  flush()
  return out
}

// --------------------------------------------------------------- context

export function variableName(inst, path, def) {
  return `${inst.name}_${def.variable || path.split('.').pop()}`.replace(/-/g, '_')
}

function buildContext(design) {
  const implicit = implicitDependencies(design)
  const vars = new Map()
  const addVar = (name, v) => {
    if (!vars.has(name)) vars.set(name, v)
  }

  // provider variables
  const auth = design.provider.auth
  if (['oidc', 'secret', 'certificate'].includes(auth)) {
    addVar('tenant_id', { description: 'Entra tenant id', type: 'string' })
    addVar('client_id', { description: 'Client id of the service principal Terraform runs as', type: 'string' })
  }
  if (auth === 'secret') addVar('client_secret', { description: 'Client secret of the service principal', type: 'string', sensitive: true })
  if (auth === 'certificate') {
    addVar('client_certificate_file_path', { description: 'Path to the PFX certificate of the service principal', type: 'string' })
    addVar('client_certificate_password', { description: 'Password of the certificate', type: 'string', sensitive: true })
  }

  const autoVars = new Map() // `${inst.id}|${path}` -> var name
  for (const inst of design.instances) {
    const spec = specFor(inst.type)
    for (const [path, def] of Object.entries(spec.external || {})) {
      if (path.includes('.') && path.split('.')[0] && attrIsInList(inst.type, path)) continue
      const attr = attrOf(inst.type, path)
      if (!attr || attr.section !== 'required') continue
      if (!isEmpty(valueOf(inst.values, path))) continue
      let name = variableName(inst, path, def)
      if (vars.has(name)) name = `${inst.type.replace('powerplatform_', '')}_${name}`
      autoVars.set(`${inst.id}|${path}`, name)
      addVar(name, { description: def.description || `${path} for ${address(inst)}`, type: 'string', sensitive: def.sensitive })
    }
    // any var.x typed into a value gets declared too
    const text = JSON.stringify(inst.values)
    for (const m of text.matchAll(/\bvar\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) addVar(m[1], { description: `Used by ${address(inst)}`, type: 'string' })
  }
  return { design, implicit, vars, autoVars }
}

function attrOf(type, dotted) {
  const parts = dotted.split('.')
  const parent = parts.slice(0, -1).join('.')
  return attrsAt(type, parent).find((a) => a.name === parts.at(-1)) || null
}

function attrIsInList(type, dotted) {
  const parts = dotted.split('.')
  for (let i = 1; i < parts.length; i++) {
    const a = attrOf(type, parts.slice(0, i).join('.'))
    if (a && (a.type === 'object_list' || a.type === 'object_set')) return true
  }
  return false
}

function valueOf(values, dotted) {
  let cur = values
  for (const k of dotted.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

// --------------------------------------------------------------- attributes

function orderedAttrs(type, path) {
  const attrs = attrsAt(type, path)
  if (path) return attrs
  const spec = specFor(type)
  const order = spec.order || []
  const idx = (a) => {
    if (a.name === spec.parent) return -1
    const i = order.indexOf(a.name)
    return i < 0 ? 100 + (a.section === 'required' ? 0 : 50) : i
  }
  return [...attrs].sort((a, b) => idx(a) - idx(b))
}

function renderBody(inst, path, values, depth, ctx, inList = false) {
  const items = []
  const spec = specFor(inst.type)
  for (const attr of orderedAttrs(inst.type, path)) {
    const p = path ? `${path}.${attr.name}` : attr.name
    if ((spec.hidden || []).includes(p) && isEmpty(values?.[attr.name])) continue
    const item = renderAttr(inst, attr, p, values ? values[attr.name] : undefined, depth, ctx, inList)
    if (item) items.push(item)
  }
  return emit(items, depth)
}

function refExpr(target, def) {
  return `${target.type}.${target.name}.${def.toAttr || 'id'}`
}

function renderAttr(inst, attr, path, value, depth, ctx, inList) {
  const defs = refDefs(inst.type)
  const spec = specFor(inst.type)
  const field = (spec.fields || {})[path] || {}
  const def = inList ? null : defs[path]

  if (def && !def.virtual) {
    if (def.many) {
      const ids = (inst.refs[path] || []).map((id) => byId(ctx.design, id)).filter(Boolean)
      const literal = Array.isArray(value) ? value.map((v) => scalar(v, attr.elem)) : []
      const all = [...ids.map((t) => refExpr(t, def)), ...literal]
      if (!all.length) return attr.section === 'required' ? { key: attr.name, value: '[]' } : null
      return { key: attr.name, ...inlineList(all, depth) }
    }
    if (def.map) {
      const entries = Object.entries(value || {})
      if (!entries.length) return null
      const pad = '  '.repeat(depth + 1)
      const lines = emit(
        entries.map(([k, v]) => {
          const ref = byId(ctx.design, inst.refs[`${path}.${k}`])
          return { key: key(k), value: ref ? refExpr(ref, def) : scalar(v, 'string') }
        }),
        depth + 1,
      ).map((l) => l)
      return { key: attr.name, lines, open: '{', close: '}', pad }
    }
    const target = byId(ctx.design, inst.refs[path])
    if (target) return { key: attr.name, value: refExpr(target, def) }
  }

  // REST scopes default to the parent environment's Dataverse URL
  if (!inList && /(^|\.)scope$/.test(path) && inst.type === 'powerplatform_rest' && isEmpty(value)) {
    const env = byId(ctx.design, inst.refs['@environment'])
    if (env) return { key: attr.name, value: `"\${powerplatform_environment.${env.name}.dataverse.url}/.default"` }
  }

  const auto = ctx.autoVars.get(`${inst.id}|${path}`)
  if (auto && isEmpty(value)) return { key: attr.name, value: `var.${auto}` }

  if (field.input === 'connectors') {
    const ids = Array.isArray(value) ? value : []
    if (!ids.length) return attr.section === 'required' ? { key: attr.name, value: '[]' } : null
    const pad = '  '.repeat(depth + 1)
    const lines = []
    for (const id of ids) {
      lines.push(`${pad}{`)
      lines.push(
        ...emit(
          [
            { key: 'id', value: quote(id) },
            { key: 'default_action_rule_behavior', value: '""' },
            { key: 'action_rules', value: '[]' },
            { key: 'endpoint_rules', value: '[]' },
          ],
          depth + 2,
        ),
      )
      lines.push(`${pad}},`)
    }
    return { key: attr.name, lines, open: '[', close: ']' }
  }

  switch (attr.type) {
    case 'object': {
      if ((value === undefined || value === null) && attr.section !== 'required') return null
      const lines = renderBody(inst, path, value || {}, depth + 1, ctx, inList)
      if (!lines.length) return { key: attr.name, value: '{}' }
      return { key: attr.name, lines, open: '{', close: '}' }
    }
    case 'object_list':
    case 'object_set': {
      const list = Array.isArray(value) ? value : []
      if (!list.length) return attr.section === 'required' ? { key: attr.name, value: '[]' } : null
      const pad = '  '.repeat(depth + 1)
      const lines = []
      for (const item of list) {
        lines.push(`${pad}{`)
        lines.push(...renderBody(inst, path, item, depth + 2, ctx, true))
        lines.push(`${pad}},`)
      }
      return { key: attr.name, lines, open: '[', close: ']' }
    }
    case 'list':
    case 'set': {
      if (isEmpty(value)) return attr.section === 'required' ? { key: attr.name, value: '[]' } : null
      const arr = Array.isArray(value) ? value : String(value).split(',').map((s) => s.trim()).filter(Boolean)
      return { key: attr.name, ...inlineList(arr.map((v) => scalar(v, attr.elem)), depth) }
    }
    case 'map': {
      const entries = Object.entries(value || {})
      if (!entries.length) return null
      const lines = emit(entries.map(([k, v]) => ({ key: key(k), value: scalar(v, attr.elem) })), depth + 1)
      return { key: attr.name, lines, open: '{', close: '}' }
    }
    case 'dynamic': {
      if (isEmpty(value)) return attr.section === 'required' ? todo(attr) : null
      const text = String(value).trim()
      const [first, ...rest] = text.split('\n')
      if (!rest.length) return { key: attr.name, value: first }
      return { raw: [`${attr.name} = ${first}`, ...rest.map((l) => l.replace(/^\s{0,2}/, '  ').replace(/^ {2}(?=\})/, ''))] }
    }
    default: {
      if (isEmpty(value)) return attr.section === 'required' && !inList ? todo(attr) : null
      return { key: attr.name, value: scalar(value, attr.type) }
    }
  }
}

const todo = (attr) => ({ raw: [`# TODO: set ${attr.name} (required)`] })

// --------------------------------------------------------------- files

export function orderInstances(design, implicit) {
  const ids = design.instances.map((i) => i.id)
  const deps = new Map(design.instances.map((i) => [i.id, [...dependencies(design, i, implicit).keys()]]))
  const done = new Set()
  const out = []
  const visiting = new Set()
  const visit = (id) => {
    if (done.has(id) || visiting.has(id)) return
    visiting.add(id)
    for (const d of deps.get(id) || []) visit(d)
    visiting.delete(id)
    done.add(id)
    out.push(byId(design, id))
  }
  ids.forEach(visit)
  return out.filter(Boolean)
}

function providerBlock(design) {
  const p = design.provider
  const items = []
  const add = (k, v) => items.push({ key: k, value: v })
  if (p.auth === 'cli') add('use_cli', 'true')
  if (p.auth === 'dev_cli') add('use_dev_cli', 'true')
  if (p.auth === 'msi') add('use_msi', 'true')
  if (p.auth === 'oidc') {
    add('use_oidc', 'true')
    add('client_id', 'var.client_id')
    add('tenant_id', 'var.tenant_id')
  }
  if (p.auth === 'secret') {
    add('client_id', 'var.client_id')
    add('client_secret', 'var.client_secret')
    add('tenant_id', 'var.tenant_id')
  }
  if (p.auth === 'certificate') {
    add('client_id', 'var.client_id')
    add('tenant_id', 'var.tenant_id')
    add('client_certificate_file_path', 'var.client_certificate_file_path')
    add('client_certificate_password', 'var.client_certificate_password')
  }
  if (p.cloud && p.cloud !== 'public') add('cloud', quote(p.cloud))
  return ['provider "powerplatform" {', ...emit(items, 1), '}']
}

export function generate(design) {
  const ctx = buildContext(design)
  const ordered = orderInstances(design, ctx.implicit)

  const main = [
    'terraform {',
    '  required_providers {',
    '    powerplatform = {',
    '      source  = "microsoft/power-platform"',
    `      version = ${quote(design.provider.version || '~> 4.2')}`,
    '    }',
    '  }',
    '}',
    '',
    ...providerBlock(design),
  ]

  for (const inst of ordered) {
    main.push('')
    main.push(`resource "${inst.type}" "${inst.name}" {`)
    const deps = (ctx.implicit.get(inst.id) || []).map((id) => byId(design, id)).filter(Boolean)
    if (deps.length) {
      main.push(`  depends_on = [${deps.map(address).join(', ')}]`)
      main.push('')
    }
    main.push(...renderBody(inst, '', inst.values, 1, ctx))
    main.push('}')
  }

  const variables = []
  for (const [name, v] of ctx.vars) {
    if (variables.length) variables.push('')
    variables.push(`variable "${name}" {`)
    variables.push(...emit([{ key: 'description', value: quote(v.description) }, { key: 'type', value: v.type || 'string' }, ...(v.sensitive ? [{ key: 'sensitive', value: 'true' }] : [])], 1))
    variables.push('}')
  }

  const outputs = []
  for (const env of ordered.filter((i) => i.type === 'powerplatform_environment')) {
    if (outputs.length) outputs.push('')
    outputs.push(`output "${env.name}_environment_id" {`, `  value = powerplatform_environment.${env.name}.id`, '}')
    if (hasDataverse(env)) outputs.push('', `output "${env.name}_dataverse_url" {`, `  value = powerplatform_environment.${env.name}.dataverse.url`, '}')
  }

  const files = { 'main.tf': main.join('\n') + '\n' }
  if (variables.length) files['variables.tf'] = variables.join('\n') + '\n'
  if (outputs.length) files['outputs.tf'] = outputs.join('\n') + '\n'
  const combined = [files['main.tf'], variables.length ? '\n# ---- variables\n\n' + files['variables.tf'] : '', outputs.length ? '\n# ---- outputs\n\n' + files['outputs.tf'] : ''].join('')
  return { files, combined, ordered, variables: [...ctx.vars.keys()], implicit: ctx.implicit, autoVars: ctx.autoVars }
}

// --------------------------------------------------------------- plan

export function planText(design, generated) {
  const lines = ['Terraform will perform the following actions:', '']
  for (const inst of generated.ordered) {
    lines.push(`  # ${address(inst)} will be created`)
    lines.push(`  + resource "${inst.type}" "${inst.name}" {`)
    const t = typeInfo(inst.type)
    const items = []
    for (const attr of orderedAttrs(inst.type, '')) {
      const v = inst.values[attr.name]
      const def = refDefs(inst.type)[attr.name]
      if (def && !def.virtual && inst.refs[attr.name] && !def.many) {
        items.push({ key: `+ ${attr.name}`, value: '(known after apply)' })
        continue
      }
      if (attr.type === 'object' && v) {
        items.push({ key: `+ ${attr.name}`, value: '{ … }' })
        continue
      }
      if (isEmpty(v) || attr.type.startsWith('object') || attr.type === 'dynamic') continue
      items.push({ key: `+ ${attr.name}`, value: Array.isArray(v) ? `[ ${v.length} items ]` : scalar(v, attr.type) })
    }
    for (const a of (t?.attributes || []).filter((x) => x.section === 'readOnly' && !x.type.startsWith('object')).slice(0, 3)) items.push({ key: `+ ${a.name}`, value: '(known after apply)' })
    lines.push(...emit(items, 3))
    lines.push('    }', '')
  }
  lines.push(`Plan: ${generated.ordered.length} to add, 0 to change, 0 to destroy.`)
  return lines.join('\n')
}

// --------------------------------------------------------------- highlight

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const KEYWORDS = /^(\s*)(resource|data|provider|terraform|variable|output|locals|module|required_providers)\b/

function highlightCode(seg) {
  return esc(seg)
    .replace(/\b(true|false|null)\b/g, '<span class="hk-bool">$1</span>')
    .replace(/\b(var|local|data|module|path)\.([\w.[\]-]+)/g, '<span class="hk-ref">$1.$2</span>')
    .replace(/\b(powerplatform_[a-z_]+)\.([\w-]+)\.([\w.]+)/g, '<span class="hk-ref">$1.$2.$3</span>')
    .replace(/(^|[^\w.])(-?\d+(?:\.\d+)?)(?![\w.])/g, '$1<span class="hk-num">$2</span>')
}

export function highlight(code) {
  return code
    .split('\n')
    .map((line) => {
      let out = ''
      let i = 0
      let lead = line.match(KEYWORDS)
      if (lead) {
        out += esc(lead[1]) + `<span class="hk-kw">${lead[2]}</span>`
        i = lead[0].length
      } else {
        const k = line.match(/^(\s*[+~-]?\s*)([a-zA-Z_][\w-]*)(\s*=)/)
        if (k) {
          const sign = k[1].includes('+') ? '<span class="hk-add">' + esc(k[1]) + '</span>' : esc(k[1])
          out += sign + `<span class="hk-key">${k[2]}</span>` + esc(k[3])
          i = k[0].length
        }
      }
      let buf = ''
      while (i < line.length) {
        const ch = line[i]
        if (ch === '"') {
          out += highlightCode(buf)
          buf = ''
          let j = i + 1
          while (j < line.length && line[j] !== '"') j += line[j] === '\\' ? 2 : 1
          const str = line.slice(i, j + 1)
          out += '<span class="hk-str">' + esc(str).replace(/\$\{([^}]*)\}/g, '<span class="hk-interp">${$1}</span>') + '</span>'
          i = j + 1
          continue
        }
        if (ch === '#' || (ch === '/' && line[i + 1] === '/')) {
          out += highlightCode(buf) + `<span class="hk-comment">${esc(line.slice(i))}</span>`
          buf = ''
          i = line.length
          break
        }
        buf += ch
        i++
      }
      out += highlightCode(buf)
      if (/^\s*\+ resource|^\s*\+ /.test(line) && !lead) out = out.replace(/^(\s*)\+/, '$1<span class="hk-add">+</span>')
      if (/^Plan: /.test(line)) out = `<span class="hk-plan">${esc(line)}</span>`
      return out
    })
    .join('\n')
}
