---
title: powerplatform_analytics_data_exports
description: "Analytics Data Export configurations."
outline: [2, 3]
editLink: false
---

# powerplatform_analytics_data_exports

<TypeHeader name="powerplatform_analytics_data_exports" kind="data-source" />

Analytics Data Export configurations. See [documentation](https://learn.microsoft.com/en-us/power-platform/admin/set-up-export-application-insights) for more details.

**Note:** This resource is available as **preview**

**Known Limitations:** This resource is not supported for with service principal authentication.

## Relationships

<RelationDiagram name="powerplatform_analytics_data_exports" kind="data-source" />

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

data "powerplatform_analytics_data_exports" "example" {}
```

## Schema

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `exports`  | Attributes Set | The collection of analytics data exports · [nested schema](#nested-exports) |

</div>

### Nested schemas

#### `exports` {#nested-exports}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `ai_type`  | String | The AI type for the analytics data |
| `environments`  | Set of String | The environment IDs configured for analytics data export |
| `id`  | String | The unique identifier of the analytics data export |
| `package_name`  | String | The package name for the analytics data |
| `resource_provider`  | String | The resource provider for the analytics data |
| `scenarios`  | List of String | The list of scenarios covered by this analytics export |
| `sink`  | Attributes | The sink configuration for analytics data · [nested schema](#nested-exports-sink) |
| `source`  | String | The source of the analytics data |
| `status`  | Attributes Set | The status information for the analytics data export · [nested schema](#nested-exports-status) |

</div>

#### `exports.sink` {#nested-exports-sink}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | The resource ID of the sink |
| `key`  | String | The key for accessing the sink |
| `resource_group_name`  | String | The Azure resource group name |
| `resource_name`  | String | The name of the sink resource |
| `subscription_id`  | String | The Azure subscription ID |
| `type`  | String | The type of the sink |

</div>

#### `exports.status` {#nested-exports-status}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `last_run_on`  | String | The timestamp of the last execution |
| `message`  | String | Any message associated with the status |
| `name`  | String | The name of the status entry |
| `state`  | String | The current state of the analytics component |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/analytics_data_exports) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/analytics_data_export/datasource_analytics_data_exports.go)</small>
