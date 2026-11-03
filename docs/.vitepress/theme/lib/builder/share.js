// Designs travel in the URL hash (#design=...) so a link reproduces the
// diagram and the code. Deflate when the browser supports it.

const b64url = (bytes) => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64url = (str) => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

export async function encodeDesign(design) {
  const json = new TextEncoder().encode(JSON.stringify(design))
  if (typeof CompressionStream !== 'undefined') return 'z' + b64url(await pipe(json, new CompressionStream('deflate-raw')))
  return 'j' + b64url(json)
}

export async function decodeDesign(token) {
  if (!token) return null
  try {
    const kind = token[0]
    const bytes = fromB64url(token.slice(1))
    const raw = kind === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes
    return JSON.parse(new TextDecoder().decode(raw))
  } catch {
    return null
  }
}

const KEY = 'pp-builder-design'

export function saveLocal(design) {
  try {
    localStorage.setItem(KEY, JSON.stringify(design))
  } catch {
    // storage can be unavailable (private mode, blocked site data)
  }
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
