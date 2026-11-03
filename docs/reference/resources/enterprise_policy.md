---
title: powerplatform_enterprise_policy
description: "Enterprise Policy environment assignment"
outline: [2, 3]
editLink: false
---

# powerplatform_enterprise_policy

<TypeHeader name="powerplatform_enterprise_policy" kind="resource" />

Enterprise Policy environment assignment

## Relationships

<RelationDiagram name="powerplatform_enterprise_policy" kind="resource" />

## Example usage

```hcl
terraform {
  required_version = "> 1.7.0"
  required_providers {
    powerplatform = {
      source  = "microsoft/power-platform"
      version = "~>4.0"
    }
    azapi = {
      source  = "azure/azapi"
      version = "~>2.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>5.0"
    }
  }
}
provider "powerplatform" {
  use_cli = true
}

provider "azurerm" {
  use_cli         = true
  subscription_id = var.subscription_id
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

// getting all locations available for the environment and their azure regions
data "powerplatform_locations" "all_locations" {
}

// getting european loocation details. Policy has to be in the same azure region as the environment
locals {
  europe_location = [for location in data.powerplatform_locations.all_locations.locations : location if location.name == "europe"]
}

// creating environment that will have the policies applied
resource "powerplatform_environment" "example_environment" {
  display_name     = "example_environment"
  location         = local.europe_location[0].name
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

// creating managed environment for the environment as this is required for encryption policy
resource "powerplatform_managed_environment" "managed_development" {
  environment_id             = powerplatform_environment.example_environment.id
  is_usage_insights_disabled = true
  is_group_sharing_disabled  = true
  limit_sharing_mode         = "ExcludeSharingToSecurityGroups"
  max_limit_user_sharing     = 10
  solution_checker_mode      = "None"
  suppress_validation_emails = true
}

// module that creates all azure resources required for the identity policy and the policy itself
module "identity" {
  source = "./identity"

  should_register_provider = false

  //Entra Object ID for administrator user that will configure Azure Synapse Link using Managed Identity
  policy_reader_object_id = "00000000-0000-0000-0000-000000000000"

  environment_id = powerplatform_environment.example_environment.id

  resource_group_name     = "rg_example_identity"
  resource_group_location = local.europe_location[0].azure_regions[0]

  enterprise_policy_name     = "ep_example_identity_policy"
  enterprise_policy_location = local.europe_location[0].name
}

// module that creates all azure resources required for the network injection policy and the policy itself
module "network_injection" {
  source = "./network_injection"

  should_register_provider = false

  environment_id = powerplatform_environment.example_environment.id

  resource_group_name        = "rg_example_network_injection_policy"
  resource_group_location    = local.europe_location[0].azure_regions[0]
  vnet_locations             = local.europe_location[0].azure_regions
  enterprise_policy_name     = "ep_example_network_injection_policy"
  enterprise_policy_location = local.europe_location[0].name
// let's wait for first policy to be executed
  depends_on = [module.identity]
}

// module that creates all azure resources required for the encryption policy and the policy itself
module "encryption" {
  source = "./encryption"

  should_register_provider = false

  environment_id = powerplatform_environment.example_environment.id

  resource_group_name        = "rg_example_encryption_policy"
  resource_group_location    = local.europe_location[0].azure_regions[0]
  enterprise_policy_name     = "ep_example_encryption_policy"
  enterprise_policy_location = "europe"
  keyvault_name              = "kv-ep-example"
  // let's wait for second policy to be executed
  depends_on = [module.network_injection]
}
```

<OpenInBuilder type="powerplatform_enterprise_policy" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Environment id |
| `policy_type`  | String | Policy type [NetworkInjection, Encryption, Identity]<br>Allowed: `NetworkInjection`, `Encryption`, `Identity` |
| `system_id`  | String | Policy SystemId value in following format `/regions/<location>/providers/Microsoft.PowerPlatform/enterprisePolicies/<policyid>` |

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
| `id`  | String | Id of the resource |

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

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/enterprise_policy) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/enterprise_policy/resource_enterprise_policy.go)</small>
