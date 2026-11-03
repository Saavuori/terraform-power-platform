---
title: powerplatform_billing_policy
description: "Manages a Power Platform Billing Policy."
outline: [2, 3]
---

# powerplatform_billing_policy

<TypeHeader name="powerplatform_billing_policy" kind="resource" />

Manages a Power Platform Billing Policy. 

A Power Platform billing policy is a mechanism that allows you to manage the costs associated with your Power Platform usage. It's linked to an Azure subscription and is used to set up pay-as-you-go billing for an environment.

Additional Resources:

* [What is a billing policy](https://learn.microsoft.com/power-platform/admin/pay-as-you-go-overview#what-is-a-billing-policy)
* [Power Platform Billing Policy API](https://learn.microsoft.com/rest/api/power-platform/licensing/billing-policy/get-billing-policy)

## Relationships

<RelationDiagram name="powerplatform_billing_policy" kind="resource" />

## Example usage

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
    azurerm = {
      source = "hashicorp/azurerm"
    }
    azurecaf = {
      source = "aztfmod/azurecaf"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}

provider "azurerm" {
  features {}
  use_cli = true
}

provider "azurecaf" {
}

data "azurerm_client_config" "current" {
}

resource "azurecaf_name" "rg_example_name" {
  name          = "power-platform-billing"
  resource_type = "azurerm_resource_group"
  random_length = 5
  clean_input   = true
}

resource "azurerm_resource_group" "rg_example" {
  name     = azurecaf_name.rg_example_name.result
  location = "westeurope"
}

resource "powerplatform_billing_policy" "pay_as_you_go" {
  name     = "payAsYouGoBillingPolicyExample"
  location = "europe"
  status   = "Enabled"
  billing_instrument = {
    resource_group  = azurerm_resource_group.rg_example.name
    subscription_id = data.azurerm_client_config.current.subscription_id
  }
}
```

<OpenInBuilder type="powerplatform_billing_policy" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `billing_instrument`  | Attributes | The billing instrument of the billing policy · [nested schema](#nested-billing-instrument) |
| `location`  | String | The location of the billing policy |
| `name`  | String | The name of the billing policy |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `status`  | String | The status of the billing policy (Enabled, Disabled)<br>Allowed: `Enabled`, `Disabled` |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | The id of the billing policy |

</div>

### Nested schemas

#### `billing_instrument` {#nested-billing-instrument}

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

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `create`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |
| `delete`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Setting a timeout for a Delete operation is only applicable if changes are saved into state before the destroy operation occurs. |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |
| `update`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |

</div>

## Import

```shell
# Billing policies can be imported using the billing policy id (replace with a real billing policy guid)
terraform import powerplatform_billing_policy.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/billing_policy) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/licensing/resource_billing_policy.go)</small>
