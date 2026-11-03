# Power Platform Terraform — visual docs & environment builder

Community documentation for the [`microsoft/power-platform`](https://registry.terraform.io/providers/microsoft/power-platform/latest) Terraform provider, published at **https://saavuori.github.io/terraform-power-platform/**.

- **Environment builder** — pick resources, set their parameters, and get a drawing of the tenant, a simulated `terraform plan`, and the `main.tf` / `variables.tf` / `outputs.tf` that build it. Validates the design against the provider's own rules (exactly-one-of attributes, Dataverse prerequisites, groups only holding Managed Environments, one-per-environment resources). Designs can be shared as links and exported as SVG, PNG, Terraform or JSON.
- **Relationship map** — every resource, data source and Azure / Entra object and the references between them.
- **Reference** — one page per resource and data source, generated from the provider schema, each with its own relation drawing.
- **Guides** — authentication, how resources relate, architecture patterns, provider internals and what changed.

## How it works

The site is a [VitePress](https://vitepress.dev) project. Everything about the provider comes from a checkout of [microsoft/terraform-provider-power-platform](https://github.com/microsoft/terraform-provider-power-platform):

```
scripts/extract-provider.mjs   parses docs/*.md, CHANGELOG.md and the Go services
scripts/catalog.mjs            curated layers, enum values, validators and the relation model
docs/.vitepress/data/          generated: provider.json, schema-lite.json, graph.json, sidebar
docs/reference/**              generated: one page per resource / data source
docs/guide/changelog.md        generated: recent releases and v5.0.0 changes
docs/.vitepress/theme/         theme, SVG plotter canvas, builder and diagrams
```

The extractor validates every curated relation against the parsed schema and prints a warning when the upstream provider changes shape.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/terraform-power-platform/
npm test           # builder logic: templates, HCL generation, validation, layout
npm run build
```

## Update to a newer provider release

```bash
git clone --depth 1 https://github.com/microsoft/terraform-provider-power-platform.git ../provider
npm run extract -- ../provider
npm test && npm run build
```

Review the warnings, adjust `scripts/catalog.mjs` if a new resource or attribute needs a relation, and commit the regenerated files.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `docs/.vitepress/dist` to GitHub Pages.

## Notices

Not affiliated with or endorsed by Microsoft. Generated content derives from the MIT-licensed provider repository — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
