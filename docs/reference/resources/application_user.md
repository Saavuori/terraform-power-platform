---
title: powerplatform_application_user
description: "Manages the unique active Dataverse application user for a Microsoft Entra service principal within an environment using the Dataverse systemusers API."
outline: [2, 3]
---

# powerplatform_application_user

<TypeHeader name="powerplatform_application_user" kind="resource" />

Manages the unique active Dataverse application user for a Microsoft Entra service principal within an environment using the Dataverse `systemusers` API. Create adopts an existing active user with the same environment and application id, or creates a non-interactive application user (`accessmode = 4`) when absent. Adoption fails on multiple active matches or an explicitly configured business-unit mismatch, and reconciles the requested disabled state. Dataverse security-role assignment is managed separately. Adoption takes ownership: destroying this resource deactivates and permanently deletes the application user even if it was adopted rather than created by Terraform. To abandon an application user without deleting it, remove the resource from state (for example with `terraform state rm`) instead of destroying it.

## Relationships

<RelationDiagram name="powerplatform_application_user" kind="resource" />

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

resource "powerplatform_environment" "env" {
  display_name     = "Example Environment"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_application_user" "application_user" {
  environment_id = powerplatform_environment.env.id
  application_id = var.application_id
}
```

<OpenInBuilder type="powerplatform_application_user" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `application_id`  | String | Service principal application (client) ID. |
| `environment_id`  | String | Dataverse environment ID. |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `business_unit_id`  | String | Business unit ID for the application user. Defaults to the root business unit when omitted. |
| `disabled`  | Boolean | Whether the Dataverse application user is disabled. Defaults to `false` and is actively reconciled by the resource. |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique Dataverse application user ID (guid). This is the Dataverse principal ID for the application user. |
| `system_user_id`  | String | Dataverse system user ID for the application user. |

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

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/application_user) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/application/resource_application_user.go)</small>
