---
title: powerplatform_solutions
description: "Fetches the list of Solutions in an environment."
outline: [2, 3]
editLink: false
---

# powerplatform_solutions

<TypeHeader name="powerplatform_solutions" kind="data-source" />

Fetches the list of Solutions in an environment.  This is the equivalent of the [`pac solution list`](https://learn.microsoft.com/power-platform/developer/cli/reference/solution#pac-solution-list) command in the Power Platform CLI.

## Relationships

<RelationDiagram name="powerplatform_solutions" kind="data-source" />

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

data "powerplatform_solutions" "all" {
  environment_id = var.environment_id
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Unique environment id (guid) |

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
| `solutions`  | Attributes List | List of Solutions · [nested schema](#nested-solutions) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `solutions` {#nested-solutions}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `created_time`  | String | Created time |
| `display_name`  | String | Display name |
| `environment_id`  | String | Unique environment id (guid) |
| `id`  | String | Solution id |
| `install_time`  | String | Created time |
| `is_managed`  | Boolean | Is managed |
| `modified_time`  | String | Created time |
| `name`  | String | Name |
| `version`  | String | Created time |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/solutions) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/solution/datasource_solutions.go)</small>
