---
title: powerplatform_macro_regions
description: "Fetches the macro region geographies available to this tenant."
outline: [2, 3]
editLink: false
---

# powerplatform_macro_regions

<TypeHeader name="powerplatform_macro_regions" kind="data-source" />

Fetches the macro region geographies available to this tenant. A macro region geography is a data residency boundary; tenants without tenant-wide Advanced Data Residency must create environments with a `macro_region` instead of a `location`. For more information see [macro region geography](https://learn.microsoft.com/power-platform/admin/macro-regions).

## Relationships

<RelationDiagram name="powerplatform_macro_regions" kind="data-source" />

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

data "powerplatform_macro_regions" "all_macro_regions" {
}
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
| `macro_regions`  | Attributes List | Macro region geographies available to this tenant. Empty when the tenant provisions by datacenter location. Use `macro_region_id` as the `macro_region` of a `powerplatform_environment`. · [nested schema](#nested-macro-regions) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `macro_regions` {#nested-macro-regions}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `data_residency_note`  | String | Data residency statement shown for this macro region geography. Null when the service does not provide one. |
| `display_name`  | String | Display name of the macro region geography. |
| `macro_region_id`  | String | Identifier of the macro region geography (for example `eu-efta`, `north-america`). |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/macro_regions) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/locations/datasource_macro_regions.go)</small>
