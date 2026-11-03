---
title: powerplatform_environment_variable_value
description: "Manages the current value for an existing Power Platform environment variable definition."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_variable_value

<TypeHeader name="powerplatform_environment_variable_value" kind="resource" />

Manages the current value for an existing Power Platform environment variable definition. This resource does not create the definition itself. The definition must already exist in the target environment, typically because it was deployed by a solution. Deleting this resource removes the current value record so the environment falls back to the definition's default value, if one exists.

## Relationships

<RelationDiagram name="powerplatform_environment_variable_value" kind="resource" />

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

# This resource manages the current value for an existing definition.
# The definition itself must already exist in the environment, typically
# because it was deployed by a solution.
resource "powerplatform_environment_variable_value" "api_base_url" {
  environment_id = "00000000-0000-0000-0000-000000000000"
  schema_name    = "contoso_ApiBaseUrl"
  value          = "https://api.contoso.example"
}
```

<OpenInBuilder type="powerplatform_environment_variable_value" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Environment id where the environment variable definition already exists. |
| `schema_name`  | String | Schema name of the existing environment variable definition to manage. |
| `value` <Badge type="warning" text="sensitive" /> | String | Current value to set for the environment variable in the target environment. |

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
| `description`  | String | Description of the environment variable definition. |
| `display_name`  | String | Display name of the environment variable definition. |
| `environment_variable_definition_id`  | String | Dataverse id of the environment variable definition. |
| `environment_variable_value_id`  | String | Dataverse id of the current environment variable value record. |
| `id`  | String | Composite resource id in the format `{environment_id}/{schema_name}`. |
| `secret_store`  | String | Secret store configured on the environment variable definition. |
| `type`  | String | Type of the environment variable definition. |
| `value_schema`  | String | Value schema declared on the environment variable definition, when present. |

</div>

### Nested schemas

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
# Environment variable resource can be imported using:
# {environment_id}/{schema_name}
terraform import powerplatform_environment_variable_value.api_base_url 00000000-0000-0000-0000-000000000000/contoso_ApiBaseUrl
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_variable_value) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_variable/resource_environment_variable.go)</small>
