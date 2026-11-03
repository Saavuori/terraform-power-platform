---
title: powerplatform_billing_policies_environments
description: "Fetches the environments associated with a billing policy."
outline: [2, 3]
---

# powerplatform_billing_policies_environments

<TypeHeader name="powerplatform_billing_policies_environments" kind="data-source" />

Fetches the environments associated with a [billing policy](https://learn.microsoft.com/power-platform/admin/pay-as-you-go-overview#what-is-a-billing-policy).

This data source uses the [List Billing Policy Environments](https://learn.microsoft.com/rest/api/power-platform/licensing/billing-policy-environment/list-billing-policy-environments) endpoint in the Power Platform API.

## Relationships

<RelationDiagram name="powerplatform_billing_policies_environments" kind="data-source" />

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

data "powerplatform_billing_policies_environments" "all_pay_as_you_go_policy_envs" {
  billing_policy_id = "00000000-0000-0000-0000-000000000000"
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `billing_policy_id`  | String | The id of the billing policy |

</div>

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
| `environments`  | Set of String | The environments associated with the billing policy |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/billing_policies_environments) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/licensing/datasource_billing_policies_environments.go)</small>
