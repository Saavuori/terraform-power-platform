---
title: powerplatform_connectors
description: "Fetches the list of available connectors within a specific Power Platform tenant."
outline: [2, 3]
editLink: false
---

# powerplatform_connectors

<TypeHeader name="powerplatform_connectors" kind="data-source" />

Fetches the list of available connectors within a specific Power Platform tenant. Each connector represents a service that can be used to enhance the capabilities of Power Apps, Power Automate, and Power Virtual Agents. The returned list includes both standard and custom connectors, providing a comprehensive view of the services that can be integrated into your Power Platform solutions. The list can be used to understand what services are readily available for use within your tenant, and can assist in planning and developing new applications or flows. It's important to note that the availability of connectors may vary based on the specific licenses and permissions assigned within your tenant.

Additional Resources:

* [Connectors Overview](https://learn.microsoft.com/connectors/connectors)

## Relationships

<RelationDiagram name="powerplatform_connectors" kind="data-source" />

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

data "powerplatform_connectors" "all_connectors" {}
```

## Schema

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Id of the environment to filter connectors. If not specified, defaults to 'Default' environment which returns tenant-level connectors. Specify an environment Id to get all connectors including those that are specific for environments, including custom connectors. |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connectors`  | Attributes List | List of Connectors · [nested schema](#nested-connectors) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `connectors` {#nested-connectors}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `description`  | String | Description |
| `display_name`  | String | Display name |
| `id`  | String | Id |
| `name`  | String | Name |
| `publisher`  | String | Publisher |
| `tier`  | String | Tier |
| `type`  | String | Type |
| `unblockable`  | Boolean | Indicates if the connector can be blocked in a Data Loss Prevention policy. If true, the connector has to be in 'Non-Business' connectors group. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/connectors) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/connectors/datasource_connectors.go)</small>
