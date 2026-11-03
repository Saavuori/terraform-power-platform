#!/usr/bin/env node
// Reads a checkout of microsoft/terraform-provider-power-platform and produces
//   docs/.vitepress/data/provider.json   structured schema + relations for the site
//   docs/reference/**.md                 one generated page per resource / data source
//
// usage: node scripts/extract-provider.mjs <path-to-provider-checkout>

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, TYPES, EXTERNAL, ENUMS, CONSTRAINTS, RELATIONS, DATA_SOURCE_RELATIONS, SERVICE_API } from './catalog.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const upstream = path.resolve(process.argv[2] || '')
if (!process.argv[2] || !fs.existsSync(path.join(upstream, 'docs', 'resources'))) {
  console.error('usage: node scripts/extract-provider.mjs <path-to-terraform-provider-power-platform>')
  process.exit(1)
}

const REPO = 'https://github.com/microsoft/terraform-provider-power-platform'
const REGISTRY = 'https://registry.terraform.io/providers/microsoft/power-platform/latest/docs'

// ---------------------------------------------------------------- parsing

function splitFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!m) return { fm: {}, body: src }
  const fm = {}
  const lines = m[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([a-z_]+):\s*(.*)$/)
    if (!kv) continue
    let value = kv[2]
    if (value === '|-' || value === '|') {
      const block = []
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) block.push(lines[++i].trim())
      value = block.join('\n')
    }
    fm[kv[1]] = value.replace(/^"|"$/g, '')
  }
  return { fm, body: src.slice(m[0].length) }
}

function parseType(raw) {
  const flags = raw.split(',').map((s) => s.trim())
  const base = flags.shift()
  const t = { raw, sensitive: flags.includes('Sensitive'), deprecated: flags.includes('Deprecated') }
  let m
  if (base === 'String' || base === 'Number' || base === 'Boolean' || base === 'Dynamic') {
    t.type = { String: 'string', Number: 'number', Boolean: 'bool', Dynamic: 'dynamic' }[base]
  } else if ((m = base.match(/^(List|Set|Map) of (String|Number|Boolean)$/))) {
    t.type = m[1].toLowerCase()
    t.elem = { String: 'string', Number: 'number', Boolean: 'bool' }[m[2]]
  } else if (base === 'Attributes' || base === 'Block') {
    t.type = 'object'
  } else if ((m = base.match(/^(?:Attributes|Block) (List|Set|Map)$/))) {
    t.type = 'object_' + m[1].toLowerCase()
  } else {
    t.type = 'unknown'
  }
  return t
}

const SECTION_KEYS = { Required: 'required', Optional: 'optional', 'Read-Only': 'readOnly' }

function parseAttrLine(line) {
  const m = line.match(/^- `([^`]+)` \(([^)]*)\)\s*(.*)$/)
  if (!m) return null
  let description = m[3]
  let nested = null
  const n = description.match(/\(see \[below for nested schema\]\(#nested(?:att|block)--([^)]+)\)\)/)
  if (n) {
    nested = n[1].split('--').join('.')
    description = description.replace(n[0], '').trim()
  }
  return { name: m[1], ...parseType(m[2]), description: description.trim(), nested }
}

function parseSchema(body) {
  const start = body.indexOf('## Schema')
  if (start < 0) return { attributes: [], nested: {} }
  const end = body.indexOf('\n## ', start + 5)
  const lines = body.slice(start, end < 0 ? undefined : end).split(/\r?\n/)
  const attributes = []
  const nested = {}
  let scope = null // null = top level, else nested path
  let section = null
  let last = null
  for (const line of lines) {
    let m
    if ((m = line.match(/^### (Required|Optional|Read-Only)\s*$/))) {
      scope = null
      section = SECTION_KEYS[m[1]]
      continue
    }
    if ((m = line.match(/^### Nested Schema for `([^`]+)`/))) {
      scope = m[1]
      nested[scope] = nested[scope] || []
      section = null
      continue
    }
    if ((m = line.match(/^(Required|Optional|Read-Only):\s*$/))) {
      section = SECTION_KEYS[m[1]]
      continue
    }
    if (line.startsWith('- `')) {
      const attr = parseAttrLine(line)
      if (!attr) continue
      // tfplugindocs omits the section header inside nested schemas for some types (e.g. timeouts)
      attr.section = section || 'optional'
      ;(scope ? nested[scope] : attributes).push(attr)
      last = attr
      continue
    }
    if (last && line.trim() && !line.startsWith('#') && !line.startsWith('<a ')) {
      last.description += ' ' + line.trim()
    } else if (!line.trim()) {
      last = null
    }
  }
  return { attributes, nested }
}

function firstCodeBlock(text, langs) {
  const re = /```([a-z]*)\r?\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(text))) if (!langs || langs.includes(m[1])) return m[2].replace(/\s+$/, '')
  return null
}

// The provider index lists the preview resources explicitly.
const PREVIEW_LIST = (() => {
  const index = fs.readFileSync(path.join(upstream, 'docs', 'index.md'), 'utf8')
  const block = index.split('in **preview**:')[1] || ''
  const names = new Set()
  for (const line of block.split(/\r?\n/).slice(0, 20)) {
    const m = line.match(/^- (powerplatform_[a-z_]+)/)
    if (m) names.add(m[1])
    else if (names.size && line.startsWith('#')) break
  }
  return names
})()

function lineAfter(text, re) {
  const m = text.match(new RegExp(re.source + '([^\\n]+)', re.flags))
  if (!m) return null
  return m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '').trim()
}

function section(body, heading) {
  const i = body.indexOf(`\n## ${heading}`)
  if (i < 0) return null
  const j = body.indexOf('\n## ', i + 4)
  return body.slice(i, j < 0 ? undefined : j)
}

function parseDoc(file, kind) {
  const src = fs.readFileSync(file, 'utf8')
  const { fm, body } = splitFrontMatter(src)
  const h1 = body.match(/^# (\S+) \((Resource|Data Source)\)/m)
  const name = h1 ? h1[1] : 'powerplatform_' + path.basename(file, '.md')
  const afterH1 = h1 ? body.slice(body.indexOf(h1[0]) + h1[0].length) : body
  const descEnd = afterH1.search(/\n## |\n<!-- schema generated/)
  const description = afterH1.slice(0, descEnd < 0 ? undefined : descEnd).trim()
  const exampleSection = section(body, 'Example Usage')
  const importSection = section(body, 'Import')
  const { attributes, nested } = parseSchema(body)
  // Any hand-written H2 sections (Known Limitations, End to End Example …)
  const extraSections = []
  const h2 = /^## (.+)$/gm
  let hm
  while ((hm = h2.exec(body))) {
    const title = hm[1].trim()
    if (['Example Usage', 'Schema', 'Import'].includes(title)) continue
    const next = body.indexOf('\n## ', hm.index + 3)
    const text = body.slice(hm.index + hm[0].length, next < 0 ? undefined : next).replace(/<!-- schema generated by tfplugindocs -->/, '').trim()
    extraSections.push({ title, body: text })
  }
  return {
    name,
    kind,
    file: path.basename(file),
    description,
    extraSections,
    example: exampleSection ? firstCodeBlock(exampleSection, ['terraform', 'hcl', '']) : null,
    import: importSection ? firstCodeBlock(importSection, ['shell', 'sh', 'bash', '']) : null,
    preview: PREVIEW_LIST.has(name) || /(available as|is in) \**\[?preview/i.test(description),
    deprecation: lineAfter(description, /\**Deprecated:?\**:?\s*/),
    breakingChange: lineAfter(description, /\**Upcoming breaking change[^:]*:\**\s*/),
    attributes,
    nested,
    subcategory: fm.subcategory || '',
  }
}

// ------------------------------------------------------------ go sources

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function scanGoSources() {
  const servicesDir = path.join(upstream, 'internal', 'services')
  const byType = {}
  for (const file of walk(servicesDir)) {
    if (!file.endsWith('.go') || file.endsWith('_test.go')) continue
    const src = fs.readFileSync(file, 'utf8')
    const m = src.match(/TypeName:\s+"([a-z_]+)"/)
    if (!m) continue
    const base = path.basename(file)
    const kind = base.startsWith('datasource') ? 'data-source' : 'resource'
    const rel = path.relative(upstream, file).split(path.sep).join('/')
    const service = rel.split('/')[2]
    byType[`${kind}:powerplatform_${m[1]}`] = { service, source: rel }
  }
  return byType
}

function changelog() {
  const src = fs.readFileSync(path.join(upstream, 'CHANGELOG.md'), 'utf8')
  const versions = []
  const re = /^## (\d+\.\d+\.\d+) - (\d{4}-\d{2}-\d{2})\s*$/gm
  let m
  const marks = []
  while ((m = re.exec(src))) marks.push({ version: m[1], date: m[2], at: m.index, end: m.index + m[0].length })
  marks.forEach((mk, i) => {
    const text = src.slice(mk.end, marks[i + 1] ? marks[i + 1].at : undefined)
    const groups = {}
    let current = null
    for (const line of text.split(/\r?\n/)) {
      const h = line.match(/^### (.+)$/)
      if (h) {
        current = h[1].replace(/^[^\w]+/, '').trim()
        groups[current] = []
      } else if (current && line.startsWith('* ')) {
        groups[current].push(line.slice(2).trim())
      }
    }
    versions.push({ version: mk.version, date: mk.date, groups })
  })
  return versions
}

function gitInfo() {
  const git = (...args) => execFileSync('git', ['-c', 'core.longpaths=true', '-C', upstream, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  let sha = null
  let date = null
  try {
    sha = git('rev-parse', 'HEAD')
    date = git('log', '-1', '--format=%cI')
  } catch {
    // shallow clones on Windows sometimes cannot read the commit object; the sha is enough
  }
  return { sha, date }
}

// ------------------------------------------------------------- assembly

const go = scanGoSources()
const enumFor = (key) => ENUMS[key] || null

function decorate(doc) {
  const key = doc.kind === 'data-source' && TYPES[doc.name + '__ds'] ? doc.name + '__ds' : doc.name
  const meta = TYPES[key] || { title: doc.name.replace('powerplatform_', '').replace(/_/g, ' '), category: 'tenant' }
  const goInfo = go[`${doc.kind}:${doc.name}`] || {}
  const short = doc.name.replace(/^powerplatform_/, '')
  const enrich = (attrs, prefix) =>
    attrs.map((a) => {
      const e = enumFor(`${doc.name}.${prefix}${a.name}`)
      return e ? { ...a, enum: e } : a
    })
  const nested = {}
  for (const [p, attrs] of Object.entries(doc.nested)) nested[p] = enrich(attrs, p + '.')
  return {
    ...doc,
    short,
    title: meta.title,
    category: meta.category,
    icon: meta.icon || null,
    summary: summarize(doc.description),
    attributes: enrich(doc.attributes, ''),
    nested,
    constraints: doc.kind === 'resource' ? CONSTRAINTS[doc.name] || [] : [],
    service: goInfo.service || null,
    source: goInfo.source || null,
    apis: goInfo.service ? SERVICE_API[goInfo.service] || [] : [],
    docsUrl: `${REGISTRY}/${doc.kind === 'resource' ? 'resources' : 'data-sources'}/${short}`,
    sourceUrl: goInfo.source ? `${REPO}/blob/main/${goInfo.source}` : null,
    page: `/reference/${doc.kind === 'resource' ? 'resources' : 'data-sources'}/${short}`,
  }
}

function summarize(description) {
  const plain = description
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const m = plain.match(/^(.+?\.)(\s|$)/)
  return (m ? m[1] : plain).slice(0, 220)
}

function attrExists(doc, dotted) {
  if (!dotted) return true
  const parts = dotted.split('.')
  if (parts.length === 1) return doc.attributes.some((a) => a.name === parts[0])
  const parent = parts.slice(0, -1).join('.')
  return (doc.nested[parent] || []).some((a) => a.name === parts.at(-1))
}

const resources = fs
  .readdirSync(path.join(upstream, 'docs', 'resources'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => decorate(parseDoc(path.join(upstream, 'docs', 'resources', f), 'resource')))
  .sort((a, b) => a.name.localeCompare(b.name))

const dataSources = fs
  .readdirSync(path.join(upstream, 'docs', 'data-sources'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => decorate(parseDoc(path.join(upstream, 'docs', 'data-sources', f), 'data-source')))
  .sort((a, b) => a.name.localeCompare(b.name))

const resourceNames = new Set(resources.map((r) => r.name))
const dataSourceNames = new Set(dataSources.map((d) => d.name))

// Relations: curated list, validated against the parsed schema so drift in the
// upstream provider shows up as a warning instead of a silently wrong diagram.
const warnings = []
const relations = []
for (const rel of RELATIONS) {
  const from = resources.find((r) => r.name === rel.from)
  if (!from) {
    warnings.push(`relation source ${rel.from} is not a resource`)
    continue
  }
  if (!attrExists(from, rel.attr)) warnings.push(`${rel.from}.${rel.attr} not found in schema`)
  const toKind = resourceNames.has(rel.to) ? 'resource' : dataSourceNames.has(rel.to) ? 'data-source' : EXTERNAL[rel.to] ? 'external' : null
  if (!toKind) warnings.push(`relation target ${rel.to} is unknown`)
  relations.push({ ...rel, fromKind: 'resource', toKind })
}

// data source relations: anything with environment_id / environment_group_id + curated extras
for (const ds of dataSources) {
  for (const a of ds.attributes) {
    if (a.section === 'readOnly') continue
    if (a.name === 'environment_id')
      relations.push({ from: ds.name, fromKind: 'data-source', attr: 'environment_id', to: 'powerplatform_environment', toKind: 'resource', kind: 'reference', label: 'reads from' })
    if (a.name === 'environment_group_id')
      relations.push({ from: ds.name, fromKind: 'data-source', attr: 'environment_group_id', to: 'powerplatform_environment_group', toKind: 'resource', kind: 'reference', label: 'reads from' })
  }
}
for (const rel of DATA_SOURCE_RELATIONS) {
  const from = dataSources.find((d) => d.name === rel.from)
  if (!from) {
    warnings.push(`data source relation source ${rel.from} missing`)
    continue
  }
  if (!attrExists(from, rel.attr)) warnings.push(`${rel.from}.${rel.attr} not found in data source schema`)
  if (relations.some((r) => r.from === rel.from && r.attr === rel.attr && r.to === rel.to)) continue
  const toKind = resourceNames.has(rel.to) ? 'resource' : dataSourceNames.has(rel.to) ? 'data-source' : 'external'
  relations.push({ ...rel, fromKind: 'data-source', toKind })
}

// Example-derived references: every `powerplatform_x.y.attr` used in an example
// block, so the docs can show which wiring the upstream examples actually use.
function exampleRefs(doc) {
  if (!doc.example) return []
  const refs = new Set()
  const re = /(?<![\w.])(data\.)?(powerplatform_[a-z_]+)\.[a-z0-9_-]+\.([a-z_]+)/g
  let m
  while ((m = re.exec(doc.example))) {
    const target = m[2]
    if (target !== doc.name) refs.add(`${m[1] ? 'data.' : ''}${target}`)
  }
  return [...refs].sort()
}
for (const d of [...resources, ...dataSources]) d.exampleRefs = exampleRefs(d)

const versions = changelog()
const git = gitInfo()
const provider = {
  name: 'microsoft/power-platform',
  version: versions[0]?.version,
  released: versions[0]?.date,
  upstreamCommit: git.sha,
  upstreamCommitDate: git.date,
  extractedAt: new Date().toISOString().slice(0, 10),
  repo: REPO,
  registry: REGISTRY,
}

const data = {
  provider,
  categories: CATEGORIES,
  external: EXTERNAL,
  resources,
  dataSources,
  relations,
  changelog: versions.slice(0, 6),
}

const dataDir = path.join(root, 'docs', '.vitepress', 'data')
fs.mkdirSync(dataDir, { recursive: true })
fs.writeFileSync(path.join(dataDir, 'provider.json'), JSON.stringify(data, null, 1))

// A compact copy for the interactive pages (builder / relationship map): no
// long descriptions, examples or changelog.
const lite = {
  provider,
  categories: CATEGORIES,
  external: EXTERNAL,
  relations,
  types: [...resources, ...dataSources].map((d) => ({
    name: d.name,
    kind: d.kind,
    short: d.short,
    title: d.title,
    category: d.category,
    icon: d.icon,
    summary: d.summary,
    page: d.page,
    preview: d.preview,
    constraints: d.constraints,
    attributes: liteAttrs(d.attributes),
    nested: Object.fromEntries(Object.entries(d.nested).filter(([k]) => k !== 'timeouts' && !k.startsWith('timeouts.')).map(([k, v]) => [k, liteAttrs(v)])),
  })),
}
function liteAttrs(attrs) {
  return attrs
    .filter((a) => a.name !== 'timeouts')
    .map((a) => {
      const o = { name: a.name, type: a.type, section: a.section, description: shortDesc(a.description) }
      if (a.elem) o.elem = a.elem
      if (a.enum) o.enum = a.enum
      if (a.nested) o.nested = a.nested
      if (a.sensitive) o.sensitive = true
      if (a.deprecated) o.deprecated = true
      return o
    })
}
function shortDesc(s) {
  const plain = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim()
  const m = plain.match(/^(.{0,240}?[.!?])(\s|$)/)
  return m ? m[1] : plain.slice(0, 240)
}
fs.writeFileSync(path.join(dataDir, 'schema-lite.json'), JSON.stringify(lite))

// The smallest copy: just the graph, for components that render on every
// reference page (header badges, relation diagrams).
const graph = {
  provider,
  categories: CATEGORIES,
  external: EXTERNAL,
  relations: relations.map(({ note, ...r }) => (note ? { ...r, note } : r)),
  types: [...resources, ...dataSources].map((d) => ({
    name: d.name,
    kind: d.kind,
    short: d.short,
    title: d.title,
    category: d.category,
    summary: d.summary,
    page: d.page,
    preview: d.preview,
    deprecation: d.deprecation,
    breakingChange: d.breakingChange,
    service: d.service,
    apis: d.apis,
    docsUrl: d.docsUrl,
    sourceUrl: d.sourceUrl,
    attributeCount: d.attributes.length + Object.values(d.nested).reduce((n, a) => n + a.length, 0),
    importable: Boolean(d.import),
  })),
}
fs.writeFileSync(path.join(dataDir, 'graph.json'), JSON.stringify(graph))

// ---------------------------------------------------------- page output

// Markdown from upstream descriptions can carry raw `<` that Vue would read as a
// tag and `{{` that it would interpolate. Fenced blocks are left alone because
// VitePress renders them with v-pre.
function safeInline(s) {
  return String(s)
    .split(/(```[\s\S]*?```)/g)
    .map((chunk, i) =>
      i % 2
        ? chunk
        : chunk
            .split(/(`[^`\n]*`)/g)
            .map((p, j) => (j % 2 ? p : p.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
            .join('')
            .replace(/\{\{/g, '&#123;&#123;')
            .replace(/\}\}/g, '&#125;&#125;'),
    )
    .join('')
}
const cell = (s) => safeInline(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')

function typeLabel(a) {
  return a.raw.replace(/, (Sensitive|Deprecated)/g, '')
}

function attrTable(attrs, doc) {
  if (!attrs.length) return ''
  const rows = attrs.map((a) => {
    const flags = []
    if (a.sensitive) flags.push('<Badge type="warning" text="sensitive" />')
    if (a.deprecated) flags.push('<Badge type="danger" text="deprecated" />')
    const nestedLink = a.nested ? ` · [nested schema](#${anchor(a.nested)})` : ''
    const enumText = a.enum ? `<br>Allowed: ${a.enum.map((v) => '`' + v + '`').join(', ')}` : ''
    return `| \`${a.name}\` ${flags.join(' ')} | ${typeLabel(a)} | ${cell(a.description || '—')}${enumText}${nestedLink} |`
  })
  return ['<div class="pp-attrs">', '', '| Attribute | Type | Description |', '| --- | --- | --- |', ...rows, '', '</div>'].join('\n')
}

const anchor = (p) => 'nested-' + p.replace(/\./g, '-').replace(/_/g, '-')

// tfplugindocs callouts (!> danger, ~> warning, -> note) become VitePress containers.
function callouts(md) {
  return md
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(/^(!>|~>|->)\s*(.*)$/)
      if (!m) return line
      const kind = { '!>': 'danger', '~>': 'warning', '->': 'info' }[m[1]]
      return `\n::: ${kind}\n${m[2]}\n:::\n`
    })
    .join('\n')
}

function renderPage(doc) {
  const lines = []
  const kindLabel = doc.kind === 'resource' ? 'Resource' : 'Data source'
  lines.push('---')
  lines.push(`title: ${doc.name}`)
  lines.push(`description: ${JSON.stringify(doc.summary)}`)
  lines.push('outline: [2, 3]')
  lines.push('---')
  lines.push('')
  lines.push(`# ${doc.name}`)
  lines.push('')
  lines.push(`<TypeHeader name="${doc.name}" kind="${doc.kind}" />`)
  lines.push('')
  lines.push(safeInline(callouts(doc.description)))
  lines.push('')
  for (const extra of doc.extraSections) {
    lines.push(`## ${extra.title}`)
    lines.push('')
    lines.push(safeInline(callouts(extra.body)).replace(/```terraform/g, '```hcl'))
    lines.push('')
  }
  const sec = { required: [], optional: [], readOnly: [] }
  for (const a of doc.attributes) sec[a.section].push(a)
  lines.push('## Relationships')
  lines.push('')
  lines.push(`<RelationDiagram name="${doc.name}" kind="${doc.kind}" />`)
  lines.push('')
  if (doc.constraints.length) {
    lines.push('::: tip Validation rules enforced by the provider')
    for (const c of doc.constraints) lines.push(`- ${c.text}`)
    lines.push(':::')
    lines.push('')
  }
  if (doc.example) {
    lines.push('## Example usage')
    lines.push('')
    lines.push('```hcl')
    lines.push(doc.example)
    lines.push('```')
    lines.push('')
    if (doc.kind === 'resource') {
      lines.push(`<OpenInBuilder type="${doc.name}" />`)
      lines.push('')
    }
  }
  lines.push('## Schema')
  lines.push('')
  for (const [key, title] of [['required', 'Required'], ['optional', 'Optional'], ['readOnly', 'Read-only']]) {
    if (!sec[key].length) continue
    lines.push(`### ${title}`)
    lines.push('')
    lines.push(attrTable(sec[key], doc))
    lines.push('')
  }
  const nestedPaths = Object.keys(doc.nested)
  if (nestedPaths.length) {
    lines.push('### Nested schemas')
    lines.push('')
    for (const p of nestedPaths) {
      lines.push(`#### \`${p}\` {#${anchor(p)}}`)
      lines.push('')
      const attrs = doc.nested[p]
      const groups = { required: [], optional: [], readOnly: [] }
      for (const a of attrs) groups[a.section].push(a)
      for (const [key, title] of [['required', 'Required'], ['optional', 'Optional'], ['readOnly', 'Read-only']]) {
        if (!groups[key].length) continue
        lines.push(`**${title}**`)
        lines.push('')
        lines.push(attrTable(groups[key], doc))
        lines.push('')
      }
    }
  }
  if (doc.import) {
    lines.push('## Import')
    lines.push('')
    lines.push('```shell')
    lines.push(doc.import)
    lines.push('```')
    lines.push('')
  }
  lines.push('---')
  lines.push('')
  const links = [`[Terraform Registry](${doc.docsUrl})`]
  if (doc.sourceUrl) links.push(`[Go source](${doc.sourceUrl})`)
  lines.push(`<small>${kindLabel} generated from the upstream schema docs (provider v${provider.version}). ${links.join(' · ')}</small>`)
  lines.push('')
  return lines.join('\n')
}

for (const [list, dir] of [[resources, 'resources'], [dataSources, 'data-sources']]) {
  const out = path.join(root, 'docs', 'reference', dir)
  fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out, { recursive: true })
  for (const doc of list) fs.writeFileSync(path.join(out, `${doc.short}.md`), renderPage(doc))
}

// sidebar for the reference section, grouped by category
const sidebar = []
for (const cat of CATEGORIES) {
  const res = resources.filter((r) => r.category === cat.id)
  const ds = dataSources.filter((d) => d.category === cat.id)
  if (!res.length && !ds.length) continue
  sidebar.push({
    text: cat.title,
    collapsed: true,
    items: [
      ...res.map((r) => ({ text: r.short, link: r.page })),
      ...ds.map((d) => ({ text: `${d.short} (data)`, link: d.page })),
    ],
  })
}
fs.writeFileSync(path.join(dataDir, 'sidebar-reference.json'), JSON.stringify(sidebar, null, 1))

// What changed: the latest releases from the upstream changelog, with links
// to the reference pages of the types each entry mentions.
const known = new Map([...resources, ...dataSources].map((d) => [d.name, d.page]))
const linkTypes = (text) =>
  safeInline(text)
    .replace(/\[#(\d+)\]\((https:[^)]+)\)/g, '[#$1]($2)')
    .replace(/`(powerplatform_[a-z_]+)`/g, (m, name) => (known.has(name) ? `[\`${name}\`](${known.get(name)})` : m))
const cl = ['---', 'title: What changed', 'description: Recent releases of the Power Platform Terraform provider and what is coming in v5.0.0.', 'outline: [2, 3]', '---', '', '# What changed', '']
cl.push(`The latest releases of \`${provider.name}\`, taken from the upstream [CHANGELOG.md](${REPO}/blob/main/CHANGELOG.md). Type names link to their reference pages.`, '')
const upcoming = [...resources, ...dataSources].filter((d) => d.deprecation || d.breakingChange)
if (upcoming.length) {
  cl.push('## Coming in v5.0.0', '')
  cl.push('| Type | Change |', '| --- | --- |')
  for (const d of upcoming) cl.push(`| [\`${d.name}\`](${d.page}) | ${cell(d.deprecation || d.breakingChange)} |`)
  cl.push('')
}
for (const v of versions.slice(0, 6)) {
  cl.push(`## ${v.version} <Badge type="info" text="${v.date}" />`, '')
  for (const [group, items] of Object.entries(v.groups)) {
    if (!items.length) continue
    cl.push(`### ${group}`, '')
    for (const item of items) cl.push(`- ${linkTypes(item)}`)
    cl.push('')
  }
}
fs.writeFileSync(path.join(root, 'docs', 'guide', 'changelog.md'), cl.join('\n'))

console.log(`provider v${provider.version} (${provider.released}) @ ${String(git.sha).slice(0, 7)}`)
console.log(`${resources.length} resources, ${dataSources.length} data sources, ${relations.length} relations`)
for (const w of warnings) console.warn('warning:', w)
