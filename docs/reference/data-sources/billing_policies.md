---
title: powerplatform_billing_policies
description: "Fetches the list of billing policies in a tenant."
outline: [2, 3]
editLink: false
---

# powerplatform_billing_policies

<TypeHeader name="powerplatform_billing_policies" kind="data-source" />

Fetches the list of [billing policies](https://learn.microsoft.com/power-platform/admin/pay-as-you-go-overview#what-is-a-billing-policy) in a tenant. A billing policy is a set of rules that define how a tenant is billed for usage of Power Platform services. A billing policy is associated with a billing instrument, which is a subscription and resource group that is used to pay for usage of Power Platform services.

## Relationships

<RelationDiagram name="powerplatform_billing_policies" kind="data-source" />

## Example usage

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}

data "powerplatform_billing_policies" "all_policies" {}
```

## Schema

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `billing_policies`  | Attributes List | [Power Platform Billing Policy](https://learn.microsoft.com/rest/api/power-platform/licensing/billing-policy/get-billing-policy#billingpolicyresponsemodel) · [nested schema](#nested-billing-policies) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `billing_policies` {#nested-billing-policies}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `billing_instrument`  | Attributes | The billing instrument of the billing policy · [nested schema](#nested-billing-policies-billing-instrument) |
| `location`  | String | The location of the billing policy |
| `name`  | String | The name of the billing policy |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `status`  | String | The status of the billing policy (Enabled, Disabled) |

</div>

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | The id of the billing policy |

</div>

#### `billing_policies.billing_instrument` {#nested-billing-policies-billing-instrument}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `resource_group`  | String | The resource group of the billing instrument |
| `subscription_id`  | String | The subscription id of the billing instrument |

</div>

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | The id of the billing instrument |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/billing_policies) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/licensing/datasource_billing_policies.go)</small>
