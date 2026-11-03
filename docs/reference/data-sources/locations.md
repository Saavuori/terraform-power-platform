---
title: powerplatform_locations
description: "Fetches the list of available Dynamics 365 locations."
outline: [2, 3]
editLink: false
---

# powerplatform_locations

<TypeHeader name="powerplatform_locations" kind="data-source" />

Fetches the list of available Dynamics 365 locations. For more information see [Power Platform Geos](https://learn.microsoft.com/power-platform/admin/regions-overview).

**Upcoming breaking change in v5.0.0:** This data source will additionally support macro regions, changing its response structure. When upgrading, update expressions and module outputs that consume its results to match the v5.0.0 schema. The data source itself is not deprecated; its current response structure remains unchanged until v5.0.0.

## Relationships

<RelationDiagram name="powerplatform_locations" kind="data-source" />

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

data "powerplatform_locations" "all_locations" {
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
| `locations`  | Attributes List | List of available locations · [nested schema](#nested-locations) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `locations` {#nested-locations}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `azure_regions`  | List of String | List of Azure regions |
| `can_provision_customer_engagement_database`  | Boolean | Can the location provision a customer engagement database |
| `can_provision_database`  | Boolean | Can the location provision a database |
| `code`  | String | Code of the location |
| `display_name`  | String | Display name of the location |
| `id`  | String | Unique identifier of the location |
| `is_default`  | Boolean | Is the location default |
| `is_disabled`  | Boolean | Is the location disabled |
| `name`  | String | Name of the location |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/locations) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/locations/datasource_locations.go)</small>
