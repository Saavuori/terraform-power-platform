---
title: powerplatform_connection_shares
description: "Lists connection shares found in an environment."
outline: [2, 3]
---

# powerplatform_connection_shares

<TypeHeader name="powerplatform_connection_shares" kind="data-source" />

Lists connection shares found in an environment. For more information about the connection sharing, see [Share a connection reference](https://learn.microsoft.com/en-us/power-automate/connection-sharing)

## Relationships

<RelationDiagram name="powerplatform_connection_shares" kind="data-source" />

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

data "powerplatform_connection_shares" "all_shares" {
  environment_id = var.environment_id
  connector_name = "shared_azureopenai"
  connection_id  = var.azure_openai_connection_id
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connection_id`  | String | Connection Id. The unique identifier of the connection that the shares are associated with. |
| `connector_name`  | String | Connector Name. The unique identifier of the connector that the connection are associated with. |
| `environment_id`  | String | Environment Id. The unique identifier of the environment that the connection are associated with. |

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
| `shares`  | Attributes List | List of shares for a given connection. · [nested schema](#nested-shares) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `shares` {#nested-shares}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique share id |
| `principal`  | Attributes | — · [nested schema](#nested-shares-principal) |
| `role_name`  | String | Role name of the share |

</div>

#### `shares.principal` {#nested-shares-principal}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Principal Display Name |
| `entra_object_id`  | String | Entra Object Id of the principal |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/connection_shares) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/connection/datasource_connection_shares.go)</small>
