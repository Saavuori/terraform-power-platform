---
title: powerplatform_currencies
description: "Fetches the list of available Dynamics 365 currencies."
outline: [2, 3]
editLink: false
---

# powerplatform_currencies

<TypeHeader name="powerplatform_currencies" kind="data-source" />

Fetches the list of available Dynamics 365 currencies. For more information see [Power Platform Currencies](https://learn.microsoft.com/power-platform/admin/manage-transactions-with-multiple-currencies)

## Relationships

<RelationDiagram name="powerplatform_currencies" kind="data-source" />

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

data "powerplatform_locations" "all_locations" {}

data "powerplatform_currencies" "all_currencies_by_location" {
  location = data.powerplatform_locations.all_locations.locations[0].name
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `location`  | String | Location of the currencies |

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
| `currencies`  | Attributes List | List of available currencies · [nested schema](#nested-currencies) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `currencies` {#nested-currencies}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `code`  | String | Code of the location |
| `id`  | String | Unique identifier of the currency |
| `is_tenant_default`  | Boolean | Is the currency the default for the tenant |
| `name`  | String | Name of the currency |
| `symbol`  | String | Symbol of the currency |
| `type`  | String | Type of the currency |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/currencies) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/currencies/datasource_currencies.go)</small>
