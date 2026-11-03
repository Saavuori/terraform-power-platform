<script setup>
// Hand-laid explanatory drawings for the guide pages.
import { computed } from 'vue'
import PlotCanvas from './PlotCanvas.vue'

const props = defineProps({ name: { type: String, required: true } })

const NW = 210
const NH = 46
const n = (id, x, y, title, subtitle, pen = 'tenant', extra = {}) => ({ id, kind: 'resource', x, y, w: NW, h: NH, title, subtitle, pen, ...extra })

function auth() {
  const creds = [
    ['cli', 'Azure CLI', 'use_cli = true'],
    ['dev', 'Azure Developer CLI', 'use_dev_cli = true'],
    ['oidc', 'OIDC federation', 'use_oidc = true'],
    ['secret', 'Client secret', 'client_secret'],
    ['cert', 'Client certificate', 'client_certificate_file_path'],
    ['msi', 'Managed identity', 'use_msi = true'],
  ]
  const apis = [
    ['bapi', 'BAPI', 'api.bap.microsoft.com'],
    ['pp', 'Power Platform API', 'api.powerplatform.com'],
    ['dv', 'Dataverse Web API', '<org>.crm*.dynamics.com'],
    ['pa', 'Power Apps API', 'api.powerapps.com'],
    ['lic', 'Licensing API', 'licensing.powerplatform…'],
    ['adv', 'Advisor API', 'api.advisor.powerapps.com'],
  ]
  const step = NH + 12
  const nodes = [
    n('tf', 0, step * 2.5 - NH / 2 + NH / 2, 'provider "powerplatform"', 'block or POWER_PLATFORM_* vars', 'governance'),
    ...creds.map(([id, t, s], i) => n(`c:${id}`, 290, i * step, t, s, 'access')),
    { id: 'entra', kind: 'hub', x: 580, y: step * 1.5, w: NW, h: step * 3 - 12, title: 'Microsoft Entra ID', subtitle: 'token per API scope', pen: 'environments' },
    ...apis.map(([id, t, s], i) => n(`a:${id}`, 870, i * step, t, s, 'copilot')),
  ]
  const edges = [
    ...creds.map(([id]) => ({ id: `tf-${id}`, from: 'tf', to: `c:${id}`, kind: 'lookup', pen: 'governance' })),
    ...creds.map(([id]) => ({ id: `${id}-e`, from: `c:${id}`, to: 'entra', kind: 'reference', pen: 'access' })),
    ...apis.map(([id]) => ({ id: `e-${id}`, from: 'entra', to: `a:${id}`, kind: 'reference', pen: 'environments' })),
  ]
  const labels = [
    { x: 0, y: -14, text: 'CONFIGURE' },
    { x: 290, y: -14, text: 'ONE CREDENTIAL' },
    { x: 580, y: -14, text: 'TOKEN' },
    { x: 870, y: -14, text: 'CALL' },
  ]
  return { nodes, edges, labels, frames: [] }
}

function request() {
  const cx = 300
  const step = 84
  const chain = [
    ['core', 'Terraform core', 'plan · apply · import', 'tenant'],
    ['fw', 'Provider server', 'terraform-plugin-framework v1.18', 'governance'],
    ['res', 'Resource / data source', 'Schema · Create · Read · Update · Delete', 'environments'],
    ['svc', 'Service client', 'internal/services/<name>/api_*.go', 'alm'],
    ['api', 'API client', 'internal/api: auth, retries, polling', 'copilot'],
  ]
  const nodes = chain.map(([id, t, s, pen], i) => n(id, cx, i * step, t, s, pen, { w: 250 }))
  const side = [
    ['cfg', 'Provider configuration', 'cloud, credentials, partner id', 'fw', 0, 1],
    ['val', 'Validators & plan modifiers', 'internal/validators, modifiers', 'res', 0, 2],
    ['cloud', 'Cloud endpoints', 'internal/constants: public, gcc, dod…', 'api', 0, 4],
    ['azid', 'azidentity credential', 'token cache per scope', 'api', 640, 4],
    ['lro', 'Lifecycle operations', 'poll Location / Retry-After', 'api', 640, 3],
  ].map(([id, t, s, to, x, row]) => ({ node: n(id, x, row * step, t, s, 'tenant', { kind: 'data' }), to }))
  const ends = [
    ['bapi', 'BAPI'],
    ['pp', 'Power Platform API'],
    ['dv', 'Dataverse Web API'],
    ['pa', 'Power Apps API'],
  ].map(([id, t], i) => n(`e:${id}`, i * 225 - 10, 5 * step + 30, t, 'HTTPS + bearer token', 'copilot', { kind: 'external', w: 205 }))
  return {
    nodes: [...nodes, ...side.map((s) => s.node), ...ends],
    edges: [
      ...chain.slice(1).map(([id], i) => ({ id: `ch${i}`, from: chain[i][0], to: id, kind: 'reference', pen: 'ink', label: ['gRPC', 'CRUD call', 'typed DTOs', 'HTTP request'][i] })),
      ...side.map((s) => ({ id: `s-${s.node.id}`, from: s.node.id, to: s.to, kind: 'lookup', pen: 'tenant' })),
      ...ends.map((e) => ({ id: `api-${e.id}`, from: 'api', to: e.id, kind: 'reference', pen: 'copilot' })),
    ],
    labels: [],
    frames: [],
  }
}

const scene = computed(() => (props.name === 'auth' ? auth() : request()))
</script>

<template>
  <figure class="ff">
    <div class="ff-sheet">
      <PlotCanvas :scene="scene" :padding="24" :aria-label="name === 'auth' ? 'How the provider authenticates' : 'How a resource call flows through the provider'" />
    </div>
    <figcaption><slot /></figcaption>
  </figure>
</template>

<style scoped>
.ff {
  margin: 18px 0 26px;
}

.ff-sheet {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--pp-film);
}

figcaption {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}
</style>
