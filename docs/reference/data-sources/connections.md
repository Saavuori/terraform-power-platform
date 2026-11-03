---
title: powerplatform_connections
description: "Fetches a list of Connection for a given environment."
outline: [2, 3]
---

# powerplatform_connections

<TypeHeader name="powerplatform_connections" kind="data-source" />

Fetches a list of [Connection](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/add-manage-connections) for a given environment. Each connection represents an connection instance to an external data source or service.

## Relationships

<RelationDiagram name="powerplatform_connections" kind="data-source" />

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

data "powerplatform_environments" "all_environments" {}

data "powerplatform_connections" "all_connections" {
  environment_id = data.powerplatform_environments.all_environments.environments[0].id
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
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
| `connections`  | Attributes List | List of Connections · [nested schema](#nested-connections) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `connections` {#nested-connections}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connection_parameters`  | String | Connection parameters. Json string containing the authentication connection parameters (if connection is interactive, leave blank), (for example)[https://learn.microsoft.com/en-us/power-automate/desktop-flows/alm/alm-connection#create-a-connection-using-your-service-principal]. Depending on required authentication parameters of a given connector, the connection parameters can vary. |
| `connection_parameters_set`  | String | Set of connection parameters. Json string containing the authentication connection parameters (if connection is interactive, leave blank), (for example)[https://learn.microsoft.com/en-us/power-automate/desktop-flows/alm/alm-connection#create-a-connection-using-your-service-principal]. Depending on required authentication parameters of a given connector, the connection parameters can vary. |
| `display_name`  | String | Display name of the connection. |
| `id`  | String | Unique connection id |
| `name`  | String | Name of the connection. |
| `status`  | Set of String | List of connection statuses |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/connections) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/connection/datasource_connections.go)</small>
