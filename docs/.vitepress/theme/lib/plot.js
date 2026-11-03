// Geometry for the plotter diagrams: where an edge leaves one box and enters
// another, the curve between them, and text fitting.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function anchors(a, b) {
  const acx = a.x + a.w / 2
  const acy = a.y + a.h / 2
  const bcx = b.x + b.w / 2
  const bcy = b.y + b.h / 2
  const gapX = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w))
  const gapY = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h))
  const inset = 12
  if (gapX >= gapY && gapX > -40) {
    const right = bcx >= acx
    return {
      axis: 'h',
      sign: right ? 1 : -1,
      sx: right ? a.x + a.w : a.x,
      sy: clamp(bcy, a.y + Math.min(inset, a.h / 2), a.y + a.h - Math.min(inset, a.h / 2)),
      ex: right ? b.x : b.x + b.w,
      ey: clamp(acy, b.y + Math.min(inset, b.h / 2), b.y + b.h - Math.min(inset, b.h / 2)),
    }
  }
  const down = bcy >= acy
  return {
    axis: 'v',
    sign: down ? 1 : -1,
    sx: clamp(bcx, a.x + Math.min(inset, a.w / 2), a.x + a.w - Math.min(inset, a.w / 2)),
    sy: down ? a.y + a.h : a.y,
    ex: clamp(acx, b.x + Math.min(inset, b.w / 2), b.x + b.w - Math.min(inset, b.w / 2)),
    ey: down ? b.y : b.y + b.h,
  }
}

export function edgeGeometry(a, b, bend = 0.45) {
  const p = anchors(a, b)
  const dist = p.axis === 'h' ? Math.abs(p.ex - p.sx) : Math.abs(p.ey - p.sy)
  const k = Math.max(28, dist * bend)
  const c1 = p.axis === 'h' ? [p.sx + k * p.sign, p.sy] : [p.sx, p.sy + k * p.sign]
  const c2 = p.axis === 'h' ? [p.ex - k * p.sign, p.ey] : [p.ex, p.ey - k * p.sign]
  const d = `M${r(p.sx)},${r(p.sy)} C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p.ex)},${r(p.ey)}`
  const mid = {
    x: (p.sx + 3 * c1[0] + 3 * c2[0] + p.ex) / 8,
    y: (p.sy + 3 * c1[1] + 3 * c2[1] + p.ey) / 8,
  }
  return { d, mid, start: [p.sx, p.sy], end: [p.ex, p.ey] }
}

const r = (n) => Math.round(n * 10) / 10

// Approximate width-based truncation; good enough for labels in fixed boxes.
export function fitText(text, maxWidth, fontSize, ratio = 0.56) {
  const s = String(text ?? '')
  const max = Math.max(3, Math.floor(maxWidth / (fontSize * ratio)))
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export function union(boxes) {
  if (!boxes.length) return { x: 0, y: 0, w: 0, h: 0 }
  let x1 = Infinity
  let y1 = Infinity
  let x2 = -Infinity
  let y2 = -Infinity
  for (const b of boxes) {
    x1 = Math.min(x1, b.x)
    y1 = Math.min(y1, b.y)
    x2 = Math.max(x2, b.x + b.w)
    y2 = Math.max(y2, b.y + b.h)
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}
