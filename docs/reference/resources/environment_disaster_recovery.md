---
title: powerplatform_environment_disaster_recovery
description: "Manages Disaster Recovery for a Power Platform environment."
outline: [2, 3]
---

# powerplatform_environment_disaster_recovery

<TypeHeader name="powerplatform_environment_disaster_recovery" kind="resource" />

Manages [Disaster Recovery](https://learn.microsoft.com/en-us/power-platform/admin/business-continuity-disaster-recovery?tabs=new#cross-region-self-service-disaster-recovery) for a Power Platform environment. This resource enables or disables disaster recovery for an existing production environment. The environment must be a managed environment with a billing policy attached. The paired/secondary region is determined by the environment's configuration and is not user-selectable through this resource.

## Relationships

<RelationDiagram name="powerplatform_environment_disaster_recovery" kind="resource" />

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


resource "powerplatform_billing_policy" "prod" {
  name     = "prodBillingPolicy"
  location = "unitedstates"
  status   = "Enabled"
  billing_instrument = {
    resource_group  = "your-resource-group"
    subscription_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_environment" "prod" {
  display_name      = "Production Environment"
  location          = "unitedstates"
  environment_type  = "Production"
  billing_policy_id = powerplatform_billing_policy.prod.id
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_managed_environment" "prod" {
  environment_id             = powerplatform_environment.prod.id
  is_usage_insights_disabled = true
  is_group_sharing_disabled  = false
  limit_sharing_mode         = "NoLimit"
  max_limit_user_sharing     = -1
  solution_checker_mode      = "None"
  suppress_validation_emails = true
}

resource "powerplatform_environment_disaster_recovery" "prod" {
  environment_id = powerplatform_environment.prod.id
  enabled        = true

  depends_on = [powerplatform_managed_environment.prod]
}
```

<OpenInBuilder type="powerplatform_environment_disaster_recovery" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | The unique identifier (GUID) of the environment to enable disaster recovery for. The environment must be a production managed environment. |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enabled`  | Boolean | Whether disaster recovery is enabled for the environment. Defaults to `true`. |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique identifier of the disaster recovery resource (same as the environment ID) |

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
# Import disaster recovery state for an environment using the environment ID
terraform import powerplatform_environment_disaster_recovery.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_disaster_recovery) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/disaster_recovery/resource_disaster_recovery.go)</small>
