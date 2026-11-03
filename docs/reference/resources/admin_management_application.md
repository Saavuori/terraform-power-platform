---
title: powerplatform_admin_management_application
description: "This resource allows you to register a service principal as an administrator for Power Platform."
outline: [2, 3]
editLink: false
---

# powerplatform_admin_management_application

<TypeHeader name="powerplatform_admin_management_application" kind="resource" />

This resource allows you to register a service principal as an administrator for Power Platform.

This resource implements the process documented here [Registering an admin management application](https://learn.microsoft.com/power-platform/admin/powerplatform-api-create-service-principal). A service principal can't register itself—by design, the application must be registered by an administrator.

## Relationships

<RelationDiagram name="powerplatform_admin_management_application" kind="resource" />

## Example usage

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~>3.0"
    }
    azurecaf = {
      source = "aztfmod/azurecaf"
      version = "~>1.2"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}

provider "azuread" {
  use_cli = true
}

resource "azuread_application_registration" "example_app" {
  display_name = "Power Platform Example Admin Management Application"
}

resource "azuread_service_principal" "example_sp" {
  client_id = azuread_application_registration.example_app.client_id
}

resource "powerplatform_admin_management_application" "example_registration" {
  id = azuread_application_registration.example_app.client_id
}
```

<OpenInBuilder type="powerplatform_admin_management_application" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Client id for the service principal |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

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

</div>

## Import

```shell
# Already registered admin management applications can be imported using the client id of a service principal (replace with a real client id)
terraform import powerplatform_admin_management_application.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/admin_management_application) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/admin_management_application/resource_admin_management_application.go)</small>
