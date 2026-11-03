<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import HeroPlan from './HeroPlan.vue'
import LayerLegend from './LayerLegend.vue'
import { provider, types, relations } from '../lib/graph.js'

const resources = types.filter((t) => t.kind === 'resource')
const dataSources = types.filter((t) => t.kind === 'data-source')
const envChildren = relations.filter((r) => r.kind === 'parent' && r.to === 'powerplatform_environment')
const needDataverse = envChildren.filter((r) => r.requiresDataverse)
const apis = [...new Set(types.flatMap((t) => t.apis || []))]
const deprecated = types.filter((t) => t.deprecation).map((t) => t.name)
const external = [...new Set(relations.filter((r) => r.toKind === 'external').map((r) => r.to))]

const notes = computed(() => [
  {
    text: `${envChildren.length} of ${resources.length} resource types attach to an environment through environment_id. The environment is the hub almost everything plugs into.`,
    link: '/guide/resource-model#the-environment-is-the-hub',
  },
  {
    text: `${needDataverse.length} of them only work when the environment has a Dataverse database — solutions, users, settings, records and Managed Environments among them.`,
    link: '/guide/resource-model#dataverse-is-a-prerequisite',
  },
  {
    text: `Behind the resources sit ${apis.length} service APIs: ${apis.join(', ')}.`,
    link: '/guide/internals',
  },
  {
    text: `${external.length} kinds of Azure and Entra ID object are referenced but never created by this provider — subscriptions, security groups, app registrations, enterprise policies.`,
    link: '/guide/resource-model#outside-the-provider',
  },
  {
    text: `v5.0.0 is announced: ${deprecated.join(' and ')} are on their way out.`,
    link: '/guide/changelog',
  },
])

const sheets = [
  { title: 'Environment builder', shows: 'Compose a tenant from real resources; get the drawing, a simulated plan and main.tf.', link: '/builder' },
  { title: 'Relationship map', shows: `All ${types.length} types and ${relations.length} references on one sheet.`, link: '/guide/relationship-map' },
  { title: 'How resources relate', shows: 'Scopes, the environment hub, Dataverse prerequisites and hidden depends_on rules.', link: '/guide/resource-model' },
  { title: 'Architecture patterns', shows: 'Reference layouts — ALM, governance, billing, private networking, agents — with code.', link: '/guide/patterns' },
  { title: 'Provider internals', shows: 'How a resource call travels from Terraform through the Go code to Power Platform APIs.', link: '/guide/internals' },
  { title: 'Reference', shows: `${resources.length + dataSources.length} pages generated from the provider schema, each with its own relation drawing.`, link: '/reference/' },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-text">
        <p class="pp-label hero-eyebrow">Terraform provider · {{ provider.name }} · v{{ provider.version }}</p>
        <h1 class="hero-title">Draw the tenant.<br />Ship the Terraform.</h1>
        <p class="hero-lede">
          Visual documentation for the Power Platform provider: all {{ resources.length }} resources and {{ dataSources.length }} data sources, how they wire together, and a builder that turns
          your choices into a tenant plan and the HCL that creates it.
        </p>
        <div class="hero-actions">
          <a class="pp-btn" :href="withBase('/builder')">Open the builder</a>
          <a class="pp-btn ghost" :href="withBase('/guide/')">Read the guide</a>
        </div>
      </div>
      <div class="hero-plan">
        <ClientOnly>
          <HeroPlan />
        </ClientOnly>
      </div>
    </section>

    <section class="band">
      <div class="band-head">
        <p class="pp-label">General notes</p>
        <h2 class="pp-display">What the provider code says</h2>
      </div>
      <ul class="notes">
        <li v-for="n in notes" :key="n.text">
          <p>{{ n.text }}</p>
          <a :href="withBase(n.link)">Details →</a>
        </li>
      </ul>
    </section>

    <section class="band">
      <div class="band-head">
        <p class="pp-label">Sheets in this set</p>
        <h2 class="pp-display">Where to look</h2>
      </div>
      <table class="sheets">
        <tbody>
          <tr v-for="s in sheets" :key="s.title">
            <th scope="row"><a :href="withBase(s.link)">{{ s.title }}</a></th>
            <td>{{ s.shows }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="band">
      <div class="band-head">
        <p class="pp-label">Layers</p>
        <h2 class="pp-display">Every resource has a pen colour</h2>
        <p class="band-lede">Diagrams on this site draw each category of resource with its own pen, the way a drawing set separates disciplines into layers.</p>
      </div>
      <LayerLegend />
    </section>

    <p class="colophon">
      Schema extracted from <a :href="provider.repo">{{ provider.repo.replace('https://github.com/', '') }}</a> at
      <code>{{ String(provider.upstreamCommit || '').slice(0, 7) }}</code> on {{ provider.extractedAt }}. Community documentation — not affiliated with Microsoft.
    </p>
  </div>
</template>

<style scoped>
.home {
  --gutter: clamp(16px, 4vw, 48px);
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--gutter) 64px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
  padding: clamp(28px, 5vw, 64px) 0 48px;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0 calc(var(--gutter) * -1);
  z-index: -1;
  background-color: var(--pp-film);
  background-image: linear-gradient(var(--pp-grid) 1px, transparent 1px), linear-gradient(90deg, var(--pp-grid) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(to bottom, #000 70%, transparent);
}

.hero-eyebrow {
  margin: 0 0 18px;
}

.hero-title {
  margin: 0;
  font-family: var(--pp-font-display);
  font-stretch: 122%;
  font-weight: 800;
  font-size: clamp(38px, 5.2vw, 72px);
  line-height: 0.98;
  letter-spacing: -0.028em;
  color: var(--vp-c-text-1);
}

.hero-lede {
  margin: 22px 0 0;
  max-width: 34em;
  font-size: clamp(16px, 1.4vw, 18.5px);
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.band {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  gap: 24px 48px;
  padding: 44px 0;
  border-top: 1.5px solid var(--vp-c-text-1);
}

.band-head h2 {
  margin: 8px 0 0;
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 760;
  line-height: 1.15;
}

.band-lede {
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.notes {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--vp-c-divider);
}

.notes li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: baseline;
  padding: 14px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.notes p {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
}

.notes a {
  font-size: 13.5px;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;
}

.sheets {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid var(--vp-c-divider);
}

.sheets th,
.sheets td {
  padding: 14px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  vertical-align: baseline;
}

.sheets th {
  width: 34%;
  padding-right: 18px;
}

.sheets th a {
  font-family: var(--pp-font-display);
  font-stretch: 108%;
  font-weight: 720;
  font-size: 17px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  border-bottom: 2px solid var(--pp-violet);
}

.sheets td {
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.colophon {
  margin-top: 32px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

@media (max-width: 1080px) {
  .hero,
  .band {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .notes li {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .sheets th,
  .sheets td {
    display: block;
    width: auto;
    padding: 6px 0;
    border-bottom: 0;
  }

  .sheets tr {
    display: block;
    padding: 8px 0;
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
