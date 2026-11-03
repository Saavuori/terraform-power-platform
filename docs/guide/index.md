---
title: Overview
description: What the Power Platform Terraform provider manages, how its resources fit together, and how this site was built from the provider source.
---

<script setup>
import { provider, types, relations } from '../.vitepress/theme/lib/graph.js'
const resources = types.filter((t) => t.kind === 'resource').length
const dataSources = types.filter((t) => t.kind === 'data-source').length
</script>

# Overview

The [`microsoft/power-platform`](https://registry.terraform.io/providers/microsoft/power-platform/latest) provider lets you manage Microsoft Power Platform as code: environments and their Dataverse databases, the policies that govern a tenant, pay-as-you-go billing, solutions, users and connections. This site documents version **{{ provider.version }}** — {{ resources }} resources and {{ dataSources }} data sources — with drawings of how they connect and a builder that writes the Terraform for you.

::: tip Fastest way in
Open the [environment builder](/builder), pick the **Dev / Test / Prod with ALM** template and click through the drawing. Every box is a real resource with its real attributes; the **Terraform** tab shows the code it adds up to.
:::

## The mental model

Power Platform is organised in nested scopes. Terraform resources live at one of four levels, and most of them hang off an environment:

| Scope | What lives here | Examples |
| --- | --- | --- |
| **Tenant** | Rules that apply to every environment | [tenant settings](/reference/resources/tenant_settings), [DLP policies](/reference/resources/data_loss_prevention_policy), [tenant isolation](/reference/resources/tenant_isolation_policy), [billing policies](/reference/resources/billing_policy) |
| **Environment group** | Folders of Managed Environments with shared rules | [environment group](/reference/resources/environment_group), [rule set](/reference/resources/environment_group_rule_set) |
| **Environment** | The container for apps, flows, agents and data | [environment](/reference/resources/environment), [managed environment](/reference/resources/managed_environment), [settings](/reference/resources/environment_settings), [connections](/reference/resources/connection) |
| **Dataverse** | The optional database inside an environment | [solutions](/reference/resources/managed_solution), [application users](/reference/resources/application_user), [records](/reference/resources/data_record), [publishers](/reference/resources/publisher) |

Here is a tenant with something in every scope. Drag to pan, scroll to zoom, hover a box to trace what it connects to.

<PatternFigure template="anatomy" interactive :height="560" />

[How resources relate](/guide/resource-model) explains the rules behind this picture: why everything points at the environment, which resources need Dataverse, and which dependencies Terraform cannot see on its own.

## Layers

Every drawing on this site uses one pen colour per category of resource.

<LayerLegend />

## How this site is made

Nothing here is written by hand from memory. A script reads a checkout of [microsoft/terraform-provider-power-platform]({{ provider.repo }}) and extracts:

- **Schemas** — every attribute, its type, whether it is required, optional or read-only, and nested blocks — from the generated `docs/resources/*.md` and `docs/data-sources/*.md`.
- **Allowed values** — from the `stringvalidator.OneOf(…)` validators in the Go code, so dropdowns in the builder only offer values the provider accepts.
- **Relations** — a curated model of which attribute points at which resource ({{ relations.length }} references). The script checks each one against the extracted schema and warns when the upstream schema drifts.
- **Implementation** — which Go service package implements each type and which back-end API it calls, for the [internals](/guide/internals) page.

The extracted snapshot is from commit `{{ String(provider.upstreamCommit).slice(0, 7) }}` (provider v{{ provider.version }}, released {{ provider.released }}). See the repository README to regenerate it against a newer provider.
