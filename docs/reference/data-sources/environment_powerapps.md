---
title: powerplatform_environment_powerapps
description: "Fetches the list of Power Apps in an environment."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_powerapps

<TypeHeader name="powerplatform_environment_powerapps" kind="data-source" />

Fetches the list of Power Apps in an environment.  See [Manage Power Apps](https://learn.microsoft.com/power-platform/admin/admin-manage-apps) for more details about how this data is surfaced in Power Platform Admin Center.

## Relationships

<RelationDiagram name="powerplatform_environment_powerapps" kind="data-source" />

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

data "powerplatform_environment_powerapps" "all" {}
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
| `powerapps`  | Attributes List | List of Power Apps · [nested schema](#nested-powerapps) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `powerapps` {#nested-powerapps}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `created_time`  | String | Created time |
| `display_name`  | String | Display name |
| `id`  | String | Unique environment id (guid) |
| `name`  | String | Name |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/environment_powerapps) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/powerapps/datasource_environment_powerapps.go)</small>
