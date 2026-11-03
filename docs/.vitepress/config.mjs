import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const readJson = (rel) => JSON.parse(fs.readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8'))
const referenceSidebar = readJson('./data/sidebar-reference.json')
const { provider } = readJson('./data/graph.json')

const base = '/terraform-power-platform/'
const repo = 'https://github.com/Saavuori/terraform-power-platform'

export default defineConfig({
  base,
  lang: 'en',
  title: 'Power Platform Terraform',
  description: 'Visual documentation and an environment builder for the microsoft/power-platform Terraform provider.',
  cleanUrls: true,
  lastUpdated: false,
  appearance: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#15213a' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Power Platform Terraform — visual docs & builder' }],
    ['meta', { property: 'og:description', content: 'Every resource of the microsoft/power-platform provider, how they connect, and a builder that draws your tenant and writes the Terraform.' }],
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },
  themeConfig: {
    logo: { src: '/logo.svg', alt: '' },
    siteTitle: 'Power Platform Terraform',
    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '^/guide/(?!relationship-map)' },
      { text: 'Builder', link: '/builder' },
      { text: 'Map', link: '/guide/relationship-map' },
      { text: 'Reference', link: '/reference/', activeMatch: '^/reference/' },
      {
        text: `v${provider.version}`,
        items: [
          { text: 'What changed', link: '/guide/changelog' },
          { text: 'Terraform Registry', link: provider.registry },
          { text: 'Provider source', link: provider.repo },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'How resources relate', link: '/guide/resource-model' },
            { text: 'Architecture patterns', link: '/guide/patterns' },
            { text: 'Provider internals', link: '/guide/internals' },
            { text: 'What changed', link: '/guide/changelog' },
          ],
        },
        {
          text: 'Interactive',
          items: [
            { text: 'Environment builder', link: '/builder' },
            { text: 'Relationship map', link: '/guide/relationship-map' },
          ],
        },
      ],
      '/reference/': [{ text: 'Reference', items: [{ text: 'All resources & data sources', link: '/reference/' }] }, ...referenceSidebar],
    },
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'Suggest a change to this page',
    },
    footer: {
      message: `Generated from <a href="${provider.repo}">microsoft/terraform-provider-power-platform</a> v${provider.version} (MIT). Not an official Microsoft site.`,
      copyright: `Schema extracted ${provider.extractedAt}`,
    },
    docFooter: { prev: 'Previous', next: 'Next' },
  },
})
