---
title: powerplatform_connection
description: "Manages a Connection."
outline: [2, 3]
editLink: false
---

# powerplatform_connection

<TypeHeader name="powerplatform_connection" kind="resource" />

Manages a [Connection](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/add-manage-connections). A connection in Power Platform serves as a means to integrate external data sources and services with your Power Platform apps, flows, and other solutions. It acts as a bridge, facilitating secure communication between your solutions and various external systems.

## Relationships

<RelationDiagram name="powerplatform_connection" kind="resource" />

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


resource "powerplatform_connection" "azure_openai_connection" {
  environment_id = var.environment_id
  name           = "shared_azureopenai"
  display_name   = "OpenAI Connection"
  connection_parameters = jsonencode({
    "azureOpenAIResourceName" : "${var.azure_openai_resource_name}",
    "azureOpenAIApiKey" : "${var.azure_openai_api_key}"
    "azureSearchEndpointUrl" : "${var.azure_search_endpoint_url}",
    "azureSearchApiKey" : "${var.azure_search_api_key}"
  })

  lifecycle {
    ignore_changes = [
      connection_parameters
    ]
  }
}
```

<OpenInBuilder type="powerplatform_connection" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Display name of the connection |
| `environment_id`  | String | Environment id where the connection is to be created |
| `name`  | String | Name of the connection. This can be found using `powerplatform_connectors` data source by using the `name` attribute |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connection_parameters`  | String | Connection parameters. Json string containing the authentication connection parameters (if connection is interactive, leave blank), (for example)[https://learn.microsoft.com/en-us/power-automate/desktop-flows/alm/alm-connection#create-a-connection-using-your-service-principal]. Depending on required authentication parameters of a given connector, the connection parameters can vary. Due to how connection parameters and served by the platform, not all values are retrieved. If you don't want the connection to requried in-place-update all the time, consider using `ignore_changes` in the resource block. |
| `connection_parameters_set`  | String | Set of connection parameters. Json string containing the authentication connection parameters (if connection is interactive, leave blank), (for example)[https://learn.microsoft.com/en-us/power-automate/desktop-flows/alm/alm-connection#create-a-connection-using-your-service-principal]. Depending on required authentication parameters of a given connector, the connection parameters can vary. Due to how connection parameters and served by the platform, not all values are retrieved. If you don't want the connection to requried in-place-update all the time, consider using `ignore_changes` in the resource block. |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique connection id |
| `status`  | Set of String | List of connection statuses |

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
# Connection resource can be imported using the connection id (replace with a real connection id that can be found in the URL of the connection details page in Power Apps maker portal)
terraform import powerplatform_connection.example 000000000000000000000000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/connection) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/connection/resource_connection.go)</small>
