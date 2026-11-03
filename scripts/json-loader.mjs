// Lets the node test runner import the site's JSON data files the same way
// Vite does (plain `import x from './file.json'`).
import { register } from 'node:module'

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import fs from 'node:fs'
      import { fileURLToPath } from 'node:url'
      export async function load(url, context, next) {
        if (url.endsWith('.json')) {
          const text = fs.readFileSync(fileURLToPath(url), 'utf8')
          return { format: 'module', source: 'export default ' + text, shortCircuit: true }
        }
        return next(url, context)
      }
    `),
  import.meta.url,
)
