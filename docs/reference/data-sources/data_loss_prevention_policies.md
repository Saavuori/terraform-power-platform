---
title: powerplatform_data_loss_prevention_policies
description: "Fetches the list of Data Loss Prevention Policies in a Power Platform tenant."
outline: [2, 3]
---

# powerplatform_data_loss_prevention_policies

<TypeHeader name="powerplatform_data_loss_prevention_policies" kind="data-source" />

Fetches the list of Data Loss Prevention Policies in a Power Platform tenant. See [Manage data loss prevention policies](https://learn.microsoft.com/power-platform/admin/prevent-data-loss) for more information.

## Relationships

<RelationDiagram name="powerplatform_data_loss_prevention_policies" kind="data-source" />

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

data "powerplatform_data_loss_prevention_policies" "tenant_data_loss_prevention_policies" {
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
| `policies`  | Attributes List | List of Data Loss Prevention Policies · [nested schema](#nested-policies) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

#### `policies` {#nested-policies}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_type`  | String | Default environment handling for the policy ("AllEnvironments", "ExceptEnvironments", "OnlyEnvironments") |

</div>

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `blocked_connectors`  | Attributes Set | Blocked connectors can’t be used where this policy is applied. · [nested schema](#nested-policies-blocked-connectors) |
| `business_connectors`  | Attributes Set | Connectors for sensitive data · [nested schema](#nested-policies-business-connectors) |
| `created_by`  | String | User who created the policy |
| `created_time`  | String | Time when the policy was created |
| `custom_connectors_patterns`  | Attributes Set | Custom connectors patterns · [nested schema](#nested-policies-custom-connectors-patterns) |
| `default_connectors_classification`  | String | Default classification for connectors ("General", "Confidential", "Blocked") |
| `display_name`  | String | Display name of the policy |
| `environments`  | Set of String | Environment to which the policy is applied |
| `id`  | String | Unique name of the policy |
| `last_modified_by`  | String | User who last modified the policy |
| `last_modified_time`  | String | Time when the policy was last modified |
| `non_business_connectors`  | Attributes Set | Connectors for non-sensitive data · [nested schema](#nested-policies-non-business-connectors) |

</div>

#### `policies.blocked_connectors` {#nested-policies-blocked-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-policies-blocked-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-policies-blocked-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `policies.blocked_connectors.action_rules` {#nested-policies-blocked-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `policies.blocked_connectors.endpoint_rules` {#nested-policies-blocked-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

</div>

#### `policies.business_connectors` {#nested-policies-business-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-policies-business-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-policies-business-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `policies.business_connectors.action_rules` {#nested-policies-business-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `policies.business_connectors.endpoint_rules` {#nested-policies-business-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

</div>

#### `policies.custom_connectors_patterns` {#nested-policies-custom-connectors-patterns}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `data_group`  | String | Data group of the connector ("Business", "NonBusiness", "Blocked", "Ignore") |
| `host_url_pattern`  | String | Pattern of the connector |
| `order`  | Number | Order of the connector |

</div>

#### `policies.non_business_connectors` {#nested-policies-non-business-connectors}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_rules`  | Attributes List | Action rules for the connector · [nested schema](#nested-policies-non-business-connectors-action-rules) |
| `default_action_rule_behavior`  | String | Default action rule behavior for the connector ("Allow", "Block") |
| `endpoint_rules`  | Attributes List | Endpoint rules for the connector · [nested schema](#nested-policies-non-business-connectors-endpoint-rules) |
| `id`  | String | ID of the connector |

</div>

#### `policies.non_business_connectors.action_rules` {#nested-policies-non-business-connectors-action-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `action_id`  | String | ID of the action rule |
| `behavior`  | String | Behavior of the action rule ("Allow", "Block") |

</div>

#### `policies.non_business_connectors.endpoint_rules` {#nested-policies-non-business-connectors-endpoint-rules}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior`  | String | Behavior of the endpoint rule ("Allow", "Deny") |
| `endpoint`  | String | Endpoint of the endpoint rule |
| `order`  | Number | Order of the endpoint rule |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/data_loss_prevention_policies) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/dlp_policy/datasource_dlp_policy.go)</small>
