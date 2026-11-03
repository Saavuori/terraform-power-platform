---
title: How resources relate
description: Scopes, the environment hub, Dataverse prerequisites, environment groups, hidden dependencies and the Azure / Entra objects the Power Platform provider points at.
---

<script setup>
import { types, relations, external, getType, endpoint } from '../.vitepress/theme/lib/graph.js'
import { withBase } from 'vitepress'

const page = (name) => getType(name)?.page
const envChildren = relations.filter((r) => r.kind === 'parent' && r.to === 'powerplatform_environment')
const needDataverse = envChildren.filter((r) => r.requiresDataverse).map((r) => r.from)
const noDataverse = envChildren.filter((r) => !r.requiresDataverse).map((r) => r.from)
const implicit = relations.filter((r) => r.kind === 'implicit')
const externalRefs = Object.entries(external).map(([key, e]) => ({ key, ...e, users: relations.filter((r) => r.to === key).map((r) => ({ from: r.from, attr: r.attr })) })).filter((e) => e.users.length)
const lookups = relations.filter((r) => r.kind === 'lookup' && r.fromKind === 'resource')
</script>

# How resources relate

Terraform only knows what you tell it. The Power Platform service, on the other hand, has firm rules about what can exist where. This page collects those rules from the provider's code and documentation so you can design a layout that applies cleanly the first time.

## Four scopes

<PatternFigure template="anatomy" interactive :height="520" :code="false" />

- **Tenant** — tenant settings, DLP policies, tenant isolation, billing policies, RBAC role assignments and management apps. Exactly one `powerplatform_tenant_settings` and one `powerplatform_tenant_isolation_policy` make sense per tenant.
- **Environment group** — a folder of environments with a [rule set](/reference/resources/environment_group_rule_set). An environment joins a group through its own `environment_group_id`; groups cannot be nested.
- **Environment** — the container everything else is attached to.
- **Dataverse** — the optional database inside an environment, declared with the `dataverse` block of [`powerplatform_environment`](/reference/resources/environment). Without it, half of the provider is unavailable for that environment.

## The environment is the hub

{{ envChildren.length }} resource types take an `environment_id` and live inside an environment. They never point at each other's environment indirectly — always straight at `powerplatform_environment.<name>.id` — which is why the [relationship map](/guide/relationship-map) has one tall bar in the middle that everything plugs into.

<RelationDiagram name="powerplatform_environment" kind="resource" />

## Dataverse is a prerequisite

These {{ needDataverse.length }} types only work when the environment has a Dataverse database:

<ul class="pp-cols">
  <li v-for="n in needDataverse" :key="n"><a :href="withBase(page(n))"><code>{{ n }}</code></a></li>
</ul>

These {{ noDataverse.length }} work with or without one:

<ul class="pp-cols">
  <li v-for="n in noDataverse" :key="n"><a :href="withBase(page(n))"><code>{{ n }}</code></a></li>
</ul>

::: info Developer environments are the exception
Dataverse is required to make Production, Sandbox and Trial environments managed; Developer environments can be managed without it ([Microsoft Learn](https://learn.microsoft.com/power-platform/admin/managed-environment-enable)).
:::

::: warning Adding Dataverse later
The non-Dataverse roles `Environment Admin` and `Environment Maker` do not work inside Dataverse. If you add Dataverse to an environment later, switch `security_roles` on [`powerplatform_user`](/reference/resources/user) to Dataverse security role ids.
:::

## Environment groups only hold Managed Environments

An environment can be in one group at a time, and only if it is a Managed Environment ([Microsoft Learn](https://learn.microsoft.com/power-platform/admin/environment-groups)). In Terraform that means two resources per grouped environment:

```hcl
resource "powerplatform_environment" "prod" {
  # …
  environment_group_id = powerplatform_environment_group.apps.id
}

resource "powerplatform_managed_environment" "prod" {
  environment_id = powerplatform_environment.prod.id
  # …
}
```

Once the environment is in a group, the group's [rule set](/reference/resources/environment_group_rule_set) owns sharing limits, solution checker enforcement, backup retention and the rest. The provider documents this as a known limitation of `powerplatform_managed_environment`: its settings no longer apply and a warning appears in the plan.

## Dependencies Terraform cannot see

Terraform orders work by following references between resources. A few requirements have no attribute to follow, so add `depends_on` yourself — the builder does it for you:

<table>
  <thead><tr><th>Resource</th><th>Needs first</th><th>Why</th></tr></thead>
  <tbody>
    <tr v-for="(r, i) in implicit" :key="i">
      <td><a :href="withBase(page(r.from))"><code>{{ r.from }}</code></a></td>
      <td><a :href="withBase(page(r.to))"><code>{{ r.to }}</code></a></td>
      <td>{{ r.note }}</td>
    </tr>
  </tbody>
</table>

## One per environment

The service keeps a single copy of some configuration per environment or group. Declaring two Terraform resources for the same parent makes them fight over it:

- one [`powerplatform_managed_environment`](/reference/resources/managed_environment), [`powerplatform_environment_settings`](/reference/resources/environment_settings) and [`powerplatform_environment_disaster_recovery`](/reference/resources/environment_disaster_recovery) per environment;
- one [`powerplatform_enterprise_policy`](/reference/resources/enterprise_policy) per environment and policy type;
- one [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set) per group;
- billing linked either through `billing_policy_id` on the environment **or** through [`powerplatform_billing_policy_environment`](/reference/resources/billing_policy_environment), not both.

## Where values come from

Many attributes expect a value from a lookup rather than a literal. These data sources supply them:

<table>
  <thead><tr><th>Attribute</th><th>Comes from</th></tr></thead>
  <tbody>
    <tr v-for="(r, i) in lookups" :key="i">
      <td><code>{{ r.from.replace('powerplatform_', '') }}.{{ r.attr }}</code></td>
      <td><a :href="withBase(page(r.to))"><code>data.{{ r.to }}</code></a></td>
    </tr>
  </tbody>
</table>

## Outside the provider

This provider never creates Azure or Entra ID objects, but several resources need their ids. Create them with the `azurerm`, `azuread` or `azapi` providers, or pass them in as variables:

<table>
  <thead><tr><th>Object</th><th>Typical provider</th><th>Referenced by</th></tr></thead>
  <tbody>
    <tr v-for="e in externalRefs" :key="e.key">
      <td>{{ e.title }}</td>
      <td><code v-if="e.provider">{{ e.provider }}</code></td>
      <td><span v-for="(u, i) in e.users" :key="i"><a :href="withBase(page(u.from))"><code>{{ u.from.replace('powerplatform_', '') }}</code></a><span class="pp-mono">.{{ u.attr }}</span><br /></span></td>
    </tr>
  </tbody>
</table>

<style>
.pp-cols {
  columns: 2;
  column-gap: 32px;
}

.pp-cols li {
  break-inside: avoid;
}

@media (max-width: 640px) {
  .pp-cols {
    columns: 1;
  }
}
</style>
