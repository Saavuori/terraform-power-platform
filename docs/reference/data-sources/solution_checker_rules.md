---
title: powerplatform_solution_checker_rules
description: "Fetches the list of solution checker rules for a Power Platform environment."
outline: [2, 3]
---

# powerplatform_solution_checker_rules

<TypeHeader name="powerplatform_solution_checker_rules" kind="data-source" />

Fetches the list of solution checker rules for a Power Platform environment. Solution checker helps identify potential issues in solutions by analyzing components against a set of best practice rules. This data source can be used to retrieve the available rules for configuration in managed environments.

Additional Resources:

* [Managed Environment Solution Checker](https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-solution-checker)

## Relationships

<RelationDiagram name="powerplatform_solution_checker_rules" kind="data-source" />

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

# Create an environment to use for solution checker rules
resource "powerplatform_environment" "example" {
  display_name     = "Solution Checker Example"
  location         = "unitedstates"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

# Use the created environment's ID for solution checker rules
data "powerplatform_solution_checker_rules" "example" {
  # Only proceed after both environment ID and Dataverse URL are available
  depends_on     = [powerplatform_environment.example]
  environment_id = powerplatform_environment.example.id
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | The ID of the environment to retrieve solution checker rules from |

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
| `rules`  | Attributes List | List of solution checker rules · [nested schema](#nested-rules) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `rules` {#nested-rules}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `code`  | String | The unique code of the rule |
| `component_type`  | Number | The type of component this rule applies to |
| `description`  | String | A detailed description of the rule |
| `guidance_url`  | String | URL to detailed guidance on addressing the issue |
| `how_to_fix`  | String | Instructions on how to fix issues identified by the rule |
| `include`  | Boolean | Whether the rule is included/enabled by default |
| `primary_category`  | Number | The primary category of the rule |
| `primary_category_description`  | String | Description of the primary category |
| `severity`  | Number | The severity level of the rule (1-5, with 5 being most severe) |
| `summary`  | String | A brief summary of the rule |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/solution_checker_rules) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/solution_checker_rules/datasource_solution_checker_rules.go)</small>
