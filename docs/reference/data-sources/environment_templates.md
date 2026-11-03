---
title: powerplatform_environment_templates
description: "Fetches the list of Dynamics 365 environment templates."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_templates

<TypeHeader name="powerplatform_environment_templates" kind="data-source" />

Fetches the list of Dynamics 365 environment templates.

## Relationships

<RelationDiagram name="powerplatform_environment_templates" kind="data-source" />

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

data "powerplatform_environment_templates" "all_environment_templates_by_location" {
  location = data.powerplatform_locations.all_locations.locations[0].name
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `location`  | String | Location of the environment templates |

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
| `environment_templates`  | Attributes List | List of available environment templates · [nested schema](#nested-environment-templates) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `environment_templates` {#nested-environment-templates}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `category`  | String | Category of the environment template |
| `disabled_reason_code`  | String | Code of the reason why the environment template is disabled |
| `disabled_reason_message`  | String | Message of the reason why the environment template is disabled |
| `display_name`  | String | Display name of the environment template |
| `id`  | String | Unique identifier of the environment template |
| `is_customer_engagement`  | Boolean | Indicates if the environment template is for customer engagement |
| `is_disabled`  | Boolean | Indicates if the environment template is disabled |
| `is_supported_for_reset_operation`  | Boolean | Indicates if the environment template is supported for reset operation |
| `location`  | String | Location of the environment template |
| `name`  | String | Name of the environment template |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/environment_templates) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_templates/datasource_environment_templates.go)</small>
