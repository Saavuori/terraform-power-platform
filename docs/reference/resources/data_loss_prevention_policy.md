---
title: powerplatform_data_loss_prevention_policy
description: "This resource manages a Data Loss Prevention Policy."
outline: [2, 3]
editLink: false
---

# powerplatform_data_loss_prevention_policy

<TypeHeader name="powerplatform_data_loss_prevention_policy" kind="resource" />

This resource manages a Data Loss Prevention Policy. See [Data Loss Prevention](https://learn.microsoft.com/power-platform/admin/prevent-data-loss) for more information.

## Relationships

<RelationDiagram name="powerplatform_data_loss_prevention_policy" kind="resource" />

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

locals {

  business_connectors = toset([
    {
      action_rules = [
        {
          action_id = "DeleteItem_V2"
          behavior  = "Block"
        },
        {
          action_id = "ExecutePassThroughNativeQuery_V2"
          behavior  = "Block"
        },
      ]
      default_action_rule_behavior = "Allow"
      endpoint_rules = [
        {
          behavior = "Allow"
          endpoint = "contoso.com"
          order    = 1
        },
        {
          behavior = "Deny"
          endpoint = "*"
          order    = 2
        },
      ]
      id = "/providers/Microsoft.PowerApps/apis/shared_sql"
    },
    {
      action_rules                 = []
      default_action_rule_behavior = ""
      endpoint_rules               = []
      id                           = "/providers/Microsoft.PowerApps/apis/shared_approvals"
    },
    {
      action_rules                 = []
      default_action_rule_behavior = ""
      endpoint_rules               = []
      id                           = "/providers/Microsoft.PowerApps/apis/shared_cloudappsecurity"
    }
  ])

  non_business_connectors = toset([for conn
    in data.powerplatform_connectors.all_connectors.connectors :
    {
      id                           = conn.id
      name                         = conn.name
      default_action_rule_behavior = ""
      action_rules                 = [],
      endpoint_rules               = []
    }
    if conn.unblockable == true && !contains([for bus_conn in local.business_connectors : bus_conn.id], conn.id)
  ])

  blocked_connectors = toset([for conn
    in data.powerplatform_connectors.all_connectors.connectors :
    {
      id                           = conn.id
      default_action_rule_behavior = ""
      action_rules                 = [],
      endpoint_rules               = []
    }
  if conn.unblockable == false && !contains([for bus_conn in local.business_connectors : bus_conn.id], conn.id)])
}

resource "powerplatform_data_loss_prevention_policy" "my_policy" {
  display_name                      = "Block All Policy"
  default_connectors_classification = "Blocked"
  environment_type                  = "AllEnvironments"
  environments                      = []

  business_connectors     = local.business_connectors
  non_business_connectors = local.non_business_connectors
  blocked_connectors      = local.blocked_connectors

  custom_connectors_patterns = toset([
    {
      order            = 1
      host_url_pattern = "https://*.contoso.com"
      data_group       = "Blocked"
    },
    {
      order            = 2
      host_url_pattern = "*"
      data_group       = "Ignore"
    }
  ])
}
```

<OpenInBuilder type="powerplatform_data_loss_prevention_policy" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `blocked_connectors`  | Attributes Set | Blocked connectors can’t be used where this policy is applied. · [nested schema](#nested-blocked-connectors) |
| `business_connectors`  | Attributes Set | Connectors for sensitive data · [nested schema](#nested-business-connectors) |
| `custom_connectors_patterns`  | Attributes Set | Custom connectors patterns · [nested schema](#nested-custom-connectors-patterns) |
| `default_connectors_classification`  | String | Default classification for connectors ("General", "Confidential", "Blocked")<br>Allowed: `General`, `Confidential`, `Blocked` |
| `display_name`  | String | Display name of the policy |
| `environment_type`  | String | Default environment handling for the policy ("AllEnvironments", "ExceptEnvironments", "OnlyEnvironments")<br>Allowed: `AllEnvironments`, `ExceptEnvironments`, `OnlyEnvironments` |
| `non_business_connectors`  | Attributes Set | Connectors for non-sensitive data · [nested schema](#nested-non-business-connectors) |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environments`  | Set of String | Environment to which the policy is applied |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `created_by`  | String | User who created the policy |
| `created_time`  | String | Time when the policy was created |
| `id`  | String | Unique name of the policy |
| `last_modified_by`  | String | User who last modified the policy |
| `last_modified_time`  | String | Time when the policy was last modified |

</div>

### Nested schemas

#### `blocked_connectors` {#nested-blocked-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-blocked-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block", "") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-blocked-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `blocked_connectors.action_rules` {#nested-blocked-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `blocked_connectors.endpoint_rules` {#nested-blocked-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

</div>

#### `business_connectors` {#nested-business-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-business-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block", "") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-business-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `business_connectors.action_rules` {#nested-business-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `business_connectors.endpoint_rules` {#nested-business-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

</div>

#### `custom_connectors_patterns` {#nested-custom-connectors-patterns}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `data_group`  | String | Data group of the connector ("Business", "NonBusiness", "Blocked", "Ignore") |
| `host_url_pattern`  | String | Pattern of the connector |
| `order`  | Number | Order of the connector |

</div>

#### `non_business_connectors` {#nested-non-business-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-non-business-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block", "") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-non-business-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `non_business_connectors.action_rules` {#nested-non-business-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `non_business_connectors.endpoint_rules` {#nested-non-business-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

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
# DLP Policies can be imported using the DLP policy id (replace with a real DLP Policy guid)
terraform import powerplatform_data_loss_prevention_policy.example_dlp 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/data_loss_prevention_policy) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/dlp_policy/resource_dlp_policy.go)</small>
