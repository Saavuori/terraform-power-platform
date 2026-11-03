// Lays a design out as a drawable scene for PlotCanvas.
//  architectureScene: tenant frame > environment groups > environments, with
//                     tenant-wide resources on top and Entra / Azure lanes beside
//  applyOrderScene:   dependency waves — what Terraform can create first
import { typeInfo, getPath, isEmpty, categories } from './schema.js'
import { specFor, scopeOf, BUILDER_ENV as ENV, BUILDER_GROUP as GROUP } from './specs.js'
import { refDefs, displayTitle, shortAddress, managedFor, hasDataverse, dependencies } from './model.js'
import { worstLevel } from './validate.js'
import graph from '../../../data/graph.json'
import { union } from '../plot.js'

const NW = 214
const NH = 48
const GAP = 12
const PAD = 16
const ENV_HEAD = 64
const GROUP_HEAD = 50
const TENANT_HEAD = 62
const FRAME_GAP = 26
const LANE_GAP = 70
const MAX_ROW = 1500

const catIndex = new Map(categories.map((c, i) => [c.id, i]))
const categoryOf = (type) => typeInfo(type)?.category || 'tenant'
const byCategory = (a, b) =>
  (catIndex.get(categoryOf(a.type)) ?? 99) - (catIndex.get(categoryOf(b.type)) ?? 99) || a.type.localeCompare(b.type) || a.name.localeCompare(b.name)

function statusOf(issues, id) {
  return worstLevel(issues.filter((i) => i.id === id && i.level !== 'info'))
}

function envBadges(design, env) {
  const v = env.values
  const b = []
  if (v.environment_type) b.push({ text: String(v.environment_type).toUpperCase(), tone: v.environment_type === 'Production' ? 'violet' : '' })
  if (v.location || v.macro_region) b.push({ text: String(v.location || v.macro_region).toUpperCase() })
  b.push(hasDataverse(env) ? { text: 'DATAVERSE', tone: 'green' } : { text: 'NO DATAVERSE' })
  if (managedFor(design, env.id)) b.push({ text: 'MANAGED', tone: 'violet' })
  const payg = env.refs.billing_policy_id || design.instances.some((o) => o.type === 'powerplatform_billing_policy_environment' && (o.refs.environments || []).includes(env.id))
  if (payg) b.push({ text: 'PAYG', tone: 'amber' })
  return b
}

function nodeFor(inst, x, y, issues) {
  return {
    id: inst.id,
    kind: 'resource',
    x,
    y,
    w: NW,
    h: NH,
    title: displayTitle(inst),
    subtitle: shortAddress(inst),
    pen: categoryOf(inst.type),
    status: statusOf(issues, inst.id),
    selectable: true,
  }
}

// externals referenced by the design, deduplicated by value
function collectExternals(design, visible, varNames) {
  const ext = new Map()
  const add = (inst, path, def, value) => {
    const meta = graph.external[def.key] || { title: def.key, side: 'azure' }
    const k = `${def.key}|${value}`
    if (!ext.has(k)) ext.set(k, { id: `x:${k}`, key: def.key, side: meta.side, title: meta.title, subtitle: value, sources: [] })
    ext.get(k).sources.push({ inst, path })
  }
  for (const inst of design.instances) {
    if (!visible(inst)) continue
    const spec = specFor(inst.type)
    for (const [path, def] of Object.entries(spec.external || {})) {
      const head = path.split('.')[0]
      const listVal = inst.values[head]
      if (Array.isArray(listVal) && path.includes('.')) {
        const leaf = path.split('.').slice(1).join('.')
        for (const item of listVal) if (!isEmpty(getPath(item, leaf))) add(inst, path, def, String(getPath(item, leaf)))
        continue
      }
      let v = getPath(inst.values, path)
      if (isEmpty(v)) {
        const auto = varNames.get(`${inst.id}|${path}`)
        if (!auto) continue
        v = `var.${auto}`
      }
      add(inst, path, def, String(v))
    }
  }
  return [...ext.values()]
}

export function architectureScene(design, opts = {}) {
  const { issues = [], hidden = new Set(), showExternal = true, showImplicit = true, varNames = new Map(), implicit = new Map() } = opts
  const visible = (inst) => inst.type === ENV || inst.type === GROUP || !hidden.has(categoryOf(inst.type))

  const frames = []
  const nodes = []
  const edges = []
  const labels = []

  const envs = design.instances.filter((i) => i.type === ENV)
  const groups = design.instances.filter((i) => i.type === GROUP)
  const envKids = new Map(envs.map((e) => [e.id, []]))
  const groupKids = new Map(groups.map((g) => [g.id, []]))
  const tenantLevel = []
  const unplaced = []

  for (const inst of design.instances) {
    if (inst.type === ENV || inst.type === GROUP || !visible(inst)) continue
    const scope = scopeOf(inst.type)
    const parentKey = specFor(inst.type).parent
    if (scope === 'environment') (envKids.get(inst.refs[parentKey]) || unplaced).push(inst)
    else if (scope === 'group') (groupKids.get(inst.refs.environment_group_id) || unplaced).push(inst)
    else tenantLevel.push(inst)
  }
  for (const list of [...envKids.values(), ...groupKids.values(), tenantLevel, unplaced]) list.sort(byCategory)

  const measureEnv = (env) => {
    const kids = envKids.get(env.id)
    const n = kids.length
    const cols = n <= 3 ? 1 : n <= 8 ? 2 : 3
    const rows = Math.ceil(n / cols)
    return {
      kind: 'env',
      inst: env,
      kids,
      cols,
      w: Math.max(254, PAD * 2 + cols * NW + (cols - 1) * GAP),
      h: ENV_HEAD + (n ? PAD + rows * NH + (rows - 1) * GAP + PAD : 46),
    }
  }

  const measureGroup = (g) => {
    const members = envs.filter((e) => e.refs.environment_group_id === g.id).map(measureEnv)
    const rules = groupKids.get(g.id)
    const ruleRow = rules.length ? NH + GAP + 4 : 0
    const membersW = members.reduce((s, m) => s + m.w, 0) + Math.max(0, members.length - 1) * FRAME_GAP
    const rulesW = rules.length * NW + Math.max(0, rules.length - 1) * GAP
    const membersH = members.length ? Math.max(...members.map((m) => m.h)) : 44
    return { kind: 'group', inst: g, members, rules, ruleRow, w: Math.max(membersW, rulesW, 250) + PAD * 2, h: GROUP_HEAD + ruleRow + membersH + PAD }
  }

  const placeEnv = (m, x, y, depth) => {
    frames.push({
      id: m.inst.id,
      kind: 'env',
      x,
      y,
      w: m.w,
      h: m.h,
      header: ENV_HEAD - 4,
      title: displayTitle(m.inst),
      subtitle: shortAddress(m.inst),
      pen: 'environments',
      badges: envBadges(design, m.inst),
      status: statusOf(issues, m.inst.id),
      selectable: true,
      depth,
    })
    if (!m.kids.length) labels.push({ x: x + 16, y: y + ENV_HEAD + 24, text: 'NO RESOURCES YET', size: 9.5, color: '--pp-faint' })
    m.kids.forEach((k, i) => {
      const r = Math.floor(i / m.cols)
      const c = i % m.cols
      nodes.push(nodeFor(k, x + PAD + c * (NW + GAP), y + ENV_HEAD + PAD + r * (NH + GAP), issues))
    })
  }

  const placeGroup = (m, x, y) => {
    frames.push({ id: m.inst.id, kind: 'group', x, y, w: m.w, h: m.h, title: displayTitle(m.inst), pen: 'environments', selectable: true, status: statusOf(issues, m.inst.id), depth: 1 })
    m.rules.forEach((r, i) => nodes.push(nodeFor(r, x + PAD + i * (NW + GAP), y + GROUP_HEAD, issues)))
    let cx = x + PAD
    const top = y + GROUP_HEAD + m.ruleRow
    if (!m.members.length) labels.push({ x: x + PAD, y: top + 24, text: 'NO ENVIRONMENTS IN THIS GROUP', size: 9.5, color: '--pp-faint' })
    for (const env of m.members) {
      placeEnv(env, cx, top, 2)
      cx += env.w + FRAME_GAP
    }
  }

  // tenant band
  const left = 24
  let cy = TENANT_HEAD
  const perRow = 5
  tenantLevel.forEach((inst, i) => nodes.push(nodeFor(inst, left + (i % perRow) * (NW + GAP), cy + Math.floor(i / perRow) * (NH + GAP), issues)))
  const bandRows = Math.ceil(tenantLevel.length / perRow)
  const bandW = Math.min(tenantLevel.length, perRow) * (NW + GAP)
  let bandH = bandRows ? bandRows * (NH + GAP) - GAP : 0
  if (unplaced.length) {
    const ux = left + bandW + (bandW ? FRAME_GAP - GAP : 0)
    const uh = 34 + unplaced.length * (NH + GAP) - GAP + PAD
    frames.push({ id: 'unplaced', kind: 'unplaced', x: ux, y: cy, w: NW + PAD * 2, h: uh, title: 'Not attached yet', depth: 1 })
    unplaced.forEach((inst, i) => nodes.push(nodeFor(inst, ux + PAD, cy + 34 + i * (NH + GAP), issues)))
    bandH = Math.max(bandH, uh)
  }
  if (bandH) cy += bandH + 30

  // groups, then environments that are not in a group
  const items = [...groups.map(measureGroup), ...envs.filter((e) => !groups.some((g) => g.id === e.refs.environment_group_id)).map(measureEnv)]
  let x = left
  let rowY = cy
  let rowH = 0
  let right = left + Math.max(bandW - GAP, 0) + (unplaced.length ? NW + PAD * 2 + FRAME_GAP : 0)
  for (const it of items) {
    if (x > left && x + it.w > MAX_ROW) {
      x = left
      rowY += rowH + FRAME_GAP
      rowH = 0
    }
    if (it.kind === 'group') placeGroup(it, x, rowY)
    else placeEnv(it, x, rowY, 1)
    x += it.w + FRAME_GAP
    rowH = Math.max(rowH, it.h)
    right = Math.max(right, x - FRAME_GAP)
  }
  const bottom = items.length ? rowY + rowH : cy + (bandH ? -10 : 40)
  if (!design.instances.length) labels.push({ x: left, y: TENANT_HEAD + 18, text: 'EMPTY TENANT — PICK A TEMPLATE OR ADD AN ENVIRONMENT', size: 10, color: '--pp-faint' })
  const tenant = { id: 'tenant', kind: 'tenant', x: 0, y: 0, w: Math.max(right + 24, 560), h: bottom + 26, title: design.title || 'Power Platform tenant', eyebrow: 'Power Platform tenant', depth: 0 }
  frames.unshift(tenant)

  const boxOf = (id) => frames.find((f) => f.id === id) || nodes.find((n) => n.id === id)

  // references between resources
  for (const inst of design.instances) {
    if (!visible(inst) || !boxOf(inst.id)) continue
    const defs = refDefs(inst.type)
    for (const [path, def] of Object.entries(defs)) {
      if (def.parent || def.follows) continue
      if (inst.type === ENV && path === 'environment_group_id') continue
      let targets = []
      if (def.many) targets = inst.refs[path] || []
      else if (def.map) targets = Object.keys(getPath(inst.values, path) || {}).map((k) => inst.refs[`${path}.${k}`])
      else targets = [inst.refs[path]]
      for (const t of targets.filter(Boolean)) {
        if (!boxOf(t)) continue
        edges.push({ id: `${inst.id}>${t}:${path}`, from: inst.id, to: t, kind: 'reference', label: path.split('.').pop(), pen: categoryOf(inst.type) })
      }
    }
  }
  if (showImplicit) {
    for (const [from, tos] of implicit) {
      const src = design.instances.find((i) => i.id === from)
      if (!src || !boxOf(from)) continue
      for (const t of tos) if (boxOf(t)) edges.push({ id: `${from}~${t}`, from, to: t, kind: 'implicit', label: 'depends_on', pen: categoryOf(src.type), quietLabel: true })
    }
  }

  // Entra / Azure lanes
  if (showExternal) {
    const ext = collectExternals(design, visible, varNames)
    const sides = [
      { side: 'entra', title: 'Microsoft Entra ID', place: 'left' },
      { side: 'azure', title: 'Azure subscription', place: 'right' },
      { side: 'environment', title: 'Copilot Studio', place: 'right' },
    ]
    let rightY = 0
    for (const s of sides) {
      const list = ext.filter((e) => e.side === s.side)
      if (!list.length) continue
      for (const e of list) {
        const ys = e.sources.map((src) => boxOf(src.inst.id)).filter(Boolean).map((b) => b.y + Math.min(b.h, 90) / 2)
        e.want = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length - NH / 2 : 0
      }
      list.sort((a, b) => a.want - b.want)
      const laneW = NW + 24
      const lx = s.place === 'left' ? -LANE_GAP - laneW : tenant.w + LANE_GAP
      const ly = s.place === 'left' ? 0 : rightY
      let y = ly + 42
      for (const e of list) {
        y = Math.max(y, e.want)
        nodes.push({ id: e.id, kind: 'external', x: lx + 12, y, w: NW, h: NH, title: e.title, subtitle: e.subtitle, pen: 'external', tag: s.side === 'entra' ? 'ENTRA' : s.side === 'azure' ? 'AZURE' : 'COPILOT', selectable: false })
        for (const src of e.sources) edges.push({ id: `${src.inst.id}>${e.id}:${src.path}`, from: src.inst.id, to: e.id, kind: 'external', label: src.path.split('.').pop(), pen: 'external', quietLabel: true })
        y += NH + GAP
      }
      const lh = y - ly + 6
      frames.push({ id: `lane:${s.side}`, kind: 'lane', x: lx, y: ly, w: laneW, h: lh, title: s.title, depth: 0 })
      if (s.place === 'right') rightY = ly + lh + 24
    }
  }

  return { frames, nodes, edges, labels, bounds: union([...frames, ...nodes]) }
}

export function applyOrderScene(design, opts = {}) {
  const { issues = [], hidden = new Set(), showExternal = true, varNames = new Map(), implicit = new Map() } = opts
  const visible = (inst) => !hidden.has(categoryOf(inst.type)) || inst.type === ENV || inst.type === GROUP
  const list = design.instances.filter(visible)
  const ids = new Set(list.map((i) => i.id))
  const deps = new Map(list.map((i) => [i.id, [...dependencies(design, i, implicit)].filter(([id]) => ids.has(id))]))
  const depth = new Map()
  const visiting = new Set()
  const depthOf = (id) => {
    if (depth.has(id)) return depth.get(id)
    if (visiting.has(id)) return 0
    visiting.add(id)
    const d = (deps.get(id) || []).reduce((m, [dep]) => Math.max(m, depthOf(dep) + 1), 0)
    visiting.delete(id)
    depth.set(id, d)
    return d
  }
  list.forEach((i) => depthOf(i.id))

  const frames = []
  const nodes = []
  const edges = []
  const COLW = NW + 104
  const ext = showExternal ? collectExternals(design, visible, varNames) : []
  const offset = ext.length ? 1 : 0
  const maxDepth = Math.max(-1, ...depth.values())

  if (ext.length) {
    frames.push({ id: 'col:inputs', kind: 'column', x: 0, y: 0, w: NW, h: 40, title: 'Inputs', subtitle: `${ext.length} values`, depth: 0 })
    ext.forEach((e, i) => {
      nodes.push({ id: e.id, kind: 'external', x: 0, y: 46 + i * (NH + 14), w: NW, h: NH, title: e.title, subtitle: e.subtitle, pen: 'external', tag: e.side === 'entra' ? 'ENTRA' : e.side === 'azure' ? 'AZURE' : 'COPILOT' })
      for (const src of e.sources) edges.push({ id: `${e.id}>${src.inst.id}:${src.path}`, from: e.id, to: src.inst.id, kind: 'external', label: src.path.split('.').pop(), pen: 'external', quietLabel: true })
    })
  }
  for (let d = 0; d <= maxDepth; d++) {
    const col = list.filter((i) => depth.get(i.id) === d).sort(byCategory)
    const x = (d + offset) * COLW
    frames.push({ id: `col:${d}`, kind: 'column', x, y: 0, w: NW, h: 40, title: `Wave ${d + 1}`, subtitle: `${col.length} to add`, depth: 0 })
    col.forEach((inst, i) => nodes.push(nodeFor(inst, x, 46 + i * (NH + 14), issues)))
  }
  for (const inst of list) {
    for (const [dep, info] of deps.get(inst.id) || []) {
      const src = list.find((i) => i.id === dep)
      edges.push({ id: `${dep}>${inst.id}:${info.path}`, from: dep, to: inst.id, kind: info.kind === 'implicit' ? 'implicit' : 'reference', label: info.path.split('.').pop(), pen: categoryOf(src.type), quietLabel: info.kind === 'parent' })
    }
  }
  return { frames, nodes, edges, labels: [], bounds: union([...frames, ...nodes]), waves: maxDepth + 1 }
}
