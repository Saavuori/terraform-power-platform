---
title: powerplatform_solution
description: "Deprecated: powerplatformsolution will be replaced in v5.0.0 by powerplatformmanagedsolution for managed solutions and powerplatformunmanagedsolution for unmanaged solutions."
outline: [2, 3]
---

# powerplatform_solution

<TypeHeader name="powerplatform_solution" kind="resource" />

Deprecated: `powerplatform_solution` will be replaced in v5.0.0 by `powerplatform_managed_solution` for managed solutions and `powerplatform_unmanaged_solution` for unmanaged solutions. When upgrading, migrate to the resource that matches your solution type.

Resource for importing exporting solutions in Power Platform environments.  This is the equivalent of the [`pac solution import`](https://learn.microsoft.com/power-platform/developer/cli/reference/solution#pac-solution-import) command in the Power Platform CLI.

## Relationships

<RelationDiagram name="powerplatform_solution" kind="resource" />

## Example usage

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
    local = {
      version = "2.9.1"
      source  = "hashicorp/local"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}

provider "local" {}

resource "local_file" "solution_settings_file" {
  filename = "${path.module}/solution_settings.json"
  content  = <<EOF
{
  "EnvironmentVariables": [
    {
      "SchemaName": "cra6e_SolutionVariableDataSource",
      "Value": "/sites/Shared%20Documents1"
    },
    {
      "SchemaName": "cra6e_SolutionVariableJson",
      "Value": "{ \"value\": 1234, \"text\": \"abc\" }"
    },
    {
      "SchemaName": "cra6e_SolutionVariableText",
      "Value": "${powerplatform_environment.environment.id}"
    }
  ],
  "ConnectionReferences": [
    {
      "LogicalName": "cra6e_ConnectionReferenceSharePoint",
      "ConnectionId": "00000000-0000-0000-0000-000000000000",
      "ConnectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline"
    }
  ]
}
EOF
}

resource "powerplatform_environment" "environment" {
  display_name     = "Solution Import Test 1"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_solution" "solution" {
  environment_id = powerplatform_environment.environment.id
  solution_file  = "${path.module}/TerraformTestSolution_Complex_1_1_0_0.zip"
  settings_file  = local_file.solution_settings_file.filename
}
```

<OpenInBuilder type="powerplatform_solution" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Id of the environment where the solution is imported |
| `solution_file`  | String | Path to the solution file |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `settings_file`  | String | Path to the settings file. The settings file uses the same format as pac cli. See https://learn.microsoft.com/power-platform/alm/conn-ref-env-variables-build-tools#deployment-settings-file for more details |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Display name of the solution |
| `id`  | String | Unique identifier of the solution |
| `is_managed`  | Boolean | Indicates whether the solution is managed or not |
| `settings_file_checksum`  | String | Checksum of the settings file |
| `solution_file_checksum`  | String | Checksum of the solution file |
| `solution_version`  | String | Version of the solution |

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
# Solution resource can be imported using the solution id (replace with a real solution id in format {environment_id}_{solution_id})
terraform import powerplatform_solution.example 00000000-0000-0000-0000-000000000000_00000000-0000-0000-0000-000000000001
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/solution) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/solution/resource_solution.go)</small>
