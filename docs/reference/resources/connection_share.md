---
title: powerplatform_connection_share
description: ""
outline: [2, 3]
---

# powerplatform_connection_share

<TypeHeader name="powerplatform_connection_share" kind="resource" />



## Relationships

<RelationDiagram name="powerplatform_connection_share" kind="resource" />

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


resource "powerplatform_connection" "new_sql_connection" {
  environment_id = var.environment_id
  name           = "shared_sql"
  display_name   = "My SQL Connection"
  connection_parameters_set = jsonencode({
    "name" : "oauthSP",
    "values" : {
      "token" : {
        "value" : "https://global.consent.azure-apim.net/redirect/sql"
      },
      "token:TenantId" : {
        "value" : "${var.tenant_id}"
      },
      "token:clientId" : {
        "value" : "${var.client_id}"
      },
      "token:clientSecret" : {
        "value" : "${var.client_secret}"
      }
    }
  })

  lifecycle {
    ignore_changes = [
      connection_parameters_set
    ]
  }
}

resource "powerplatform_connection_share" "share_with_admin" {
  environment_id = var.environment_id
  connector_name = powerplatform_connection.new_sql_connection.name
  connection_id  = powerplatform_connection.new_sql_connection.id
  role_name      = "CanEdit"
  principal = {
    entra_object_id = var.user_object_id
  }
}
```

<OpenInBuilder type="powerplatform_connection_share" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connection_id`  | String | Unique identifier of the connection |
| `connector_name`  | String | Name of the connector |
| `environment_id`  | String | Unique identifier of the environment |
| `principal`  | Attributes | Principal to share the connection with · [nested schema](#nested-principal) |
| `role_name`  | String | Name of the role to assign to the principal<br>Allowed: `CanView`, `CanViewWithShare`, `CanEdit` |

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
| `id`  | String | Unique identifier of the connection share |

</div>

### Nested schemas

#### `principal` {#nested-principal}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `entra_object_id`  | String | Entra Object Id of the principal |

</div>

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Display name of the principal |

</div>

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
# Connection share resource can be imported using the connection share id (replace with a real connection share id)
terraform import powerplatform_connection_share.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/connection_share) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/connection/resource_connection_share.go)</small>
