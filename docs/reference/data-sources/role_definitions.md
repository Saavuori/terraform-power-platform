---
title: powerplatform_role_definitions
description: "Fetches available role definitions from Power Platform."
outline: [2, 3]
editLink: false
---

# powerplatform_role_definitions

<TypeHeader name="powerplatform_role_definitions" kind="data-source" />

Fetches available [role definitions](https://learn.microsoft.com/en-us/rest/api/power-platform/authorization/role-based-access-control/list-role-definitions) from Power Platform. Use this data source to discover available roles that can be assigned to service principals or users at the tenant, environment group or environment scope.

## Relationships

<RelationDiagram name="powerplatform_role_definitions" kind="data-source" />

## Example usage

```hcl
# List all available role definitions
data "powerplatform_role_definitions" "all" {
}

output "roles" {
  value = data.powerplatform_role_definitions.all.role_definitions
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
| `role_definitions`  | Attributes List | List of available role definitions · [nested schema](#nested-role-definitions) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `role_definitions` {#nested-role-definitions}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `permissions`  | List of String | List of permissions granted by this role |
| `role_definition_id`  | String | The unique identifier of the role definition |
| `role_definition_name`  | String | The display name of the role |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/role_definitions) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/role_based_access/datasource_role_definitions.go)</small>
