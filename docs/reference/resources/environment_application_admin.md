---
title: powerplatform_environment_application_admin
description: "Ensures a Microsoft Entra service principal exists in a Dataverse environment as an application user with the System Administrator role."
outline: [2, 3]
---

# powerplatform_environment_application_admin

<TypeHeader name="powerplatform_environment_application_admin" kind="resource" />

Ensures a Microsoft Entra **service principal** exists in a Dataverse environment as an **application user** with the **System Administrator** role. *Required for imported environments.* Environments created by the SP already include it. **Deletion behavior**: When this resource is destroyed, the application user will be deactivated and then deleted from the Dataverse environment. **Reference**: [Create a Dataverse application user (preview)](https://learn.microsoft.com/en-us/power-platform/admin/create-dataverseapplicationuser)

## Relationships

<RelationDiagram name="powerplatform_environment_application_admin" kind="resource" />

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

resource "powerplatform_environment_application_admin" "application_user_import" {
  environment_id = "00000000-0000-0000-0000-000000000001"
  application_id = "00000000-0000-0000-0000-000000000002"
}
```

<OpenInBuilder type="powerplatform_environment_application_admin" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `application_id`  | String | Service‑principal *application_id* (client ID). |
| `environment_id`  | String | Dataverse environment ID. |

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
| `id`  | String | Composite ID `{environment_id}/{application_id}`. |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `create`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |

</div>

## Import

```shell
#!/bin/bash
# Import an existing application admin user from a Dataverse environment
# The import ID format is "environment_id/application_id"
terraform import powerplatform_environment_application_admin.import_fix 00000000-0000-0000-0000-000000000001/00000000-0000-0000-0000-000000000002
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_application_admin) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/application/resource_environment_application_admin.go)</small>
