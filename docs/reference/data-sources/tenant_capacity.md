---
title: powerplatform_tenant_capacity
description: "Fetches the capacity information for a given tenant."
outline: [2, 3]
editLink: false
---

# powerplatform_tenant_capacity

<TypeHeader name="powerplatform_tenant_capacity" kind="data-source" />

Fetches the capacity information for a given tenant.

## Relationships

<RelationDiagram name="powerplatform_tenant_capacity" kind="data-source" />

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

data "powerplatform_tenant" "current" {}

data "powerplatform_tenant_capacity" "capacity" {
  tenant_id = data.powerplatform_tenant.current.tenant_id
}
```

## Schema

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `tenant_id` <Badge type="danger" text="deprecated" /> | String | Deprecated: this attribute will be removed in v5.0.0. Remove it from your configuration and use the provider's tenant configuration instead. Capacity information is fetched for the tenant configured in the provider. |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `license_model_type`  | String | The license model type for which the capacity information is to be fetched. |
| `tenant_capacities`  | Attributes List | The list of capacities for the given tenant. · [nested schema](#nested-tenant-capacities) |

</div>

### Nested schemas

#### `tenant_capacities` {#nested-tenant-capacities}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `capacity_type`  | String | The type of the capacity. |
| `capacity_units`  | String | The units of the capacity. |
| `consumption`  | Attributes | The consumption details. · [nested schema](#nested-tenant-capacities-consumption) |
| `max_capacity`  | Number | The maximum capacity. |
| `status`  | String | The status of the capacity. |
| `total_capacity`  | Number | The total capacity. |

</div>

#### `tenant_capacities.consumption` {#nested-tenant-capacities-consumption}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `actual`  | Number | The actual consumption. |
| `actual_updated_on`  | String | The actual consumption updated on. |
| `rated`  | Number | The rated consumption. |
| `rated_updated_on`  | String | The rated consumption updated on. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/tenant_capacity) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/capacity/datasource_tenant_capacity.go)</small>
