---
title: powerplatform_environment
description: "This resource manages a PowerPlatform environment."
outline: [2, 3]
---

# powerplatform_environment

<TypeHeader name="powerplatform_environment" kind="resource" />

This resource manages a PowerPlatform environment.

**Note:** Creating developer type environments is available as **preview**.

**Known Limitations:** This resource is not supported for with service principal authentication.

A Power Platform environment is a space in which you can store, manage, and share your organization's business data, apps, chatbots, and flows.It also serves as a container to separate apps that may have different roles, security requirements, or target audiences. Each environment is created under an Azure Active Directory tenant and is bound to a geographic location. You can create different types of environments, such as production, sandbox, trial, or developer, depending on your license and permissions. You can also move resources between environments and set data loss prevention policies.A Power Platform environment can have zero or one Microsoft Dataverse database, which provides storage for your apps and chatbots. You can only connect to the data sources that are deployed in the same environment as your app or chatbot. For more information, you can check out the following links:
- [Environments overview - Power Platform | Microsoft Learn](https://learn.microsoft.com/power-platform/admin/environments-overview)
- [Create and manage environments in the Power Platform admin center](https://learn.microsoft.com/power-platform/admin/create-environment)
- [Establishing an environment strategy - Microsoft Power Platform](https://learn.microsoft.com/power-platform/guidance/adoption/environment-strategy)

## Relationships

<RelationDiagram name="powerplatform_environment" kind="resource" />

::: tip Validation rules enforced by the provider
- Set exactly one of `location` or `macro_region`.
- `macro_region` cannot be combined with `azure_region`.
- `administration_mode_enabled` and `background_operation_enabled` must be set together.
:::

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

resource "powerplatform_environment" "development" {
  display_name     = "example_environment"
  description      = "example environment description"
  location         = "europe"
  azure_region     = "northeurope"
  environment_type = "Sandbox"
  cadence          = "Moderate"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}
```

<OpenInBuilder type="powerplatform_environment" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Display name |
| `environment_type`  | String | Type of the environment (Sandbox, Production etc.)<br>Allowed: `Sandbox`, `Production`, `Trial`, `Developer`, `Default` |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `allow_bing_search`  | Boolean | Allow Bing search in the environment |
| `allow_flex_routing`  | Boolean | Allows large language model (LLM) inferencing to occur outside of the European Union (EU) Data Boundary during periods of peak load, to help maintain a consistent Copilot experience. Data is encrypted in transit and at rest, and data at rest continues to be stored inside the EU Data Boundary, except for limited pseudonymized data that may be stored outside of it for security and operational purposes. See [Flex routing during peak load periods](https://go.microsoft.com/fwlink/?linkid=2356920) for more information. |
| `allow_microsoft_365_services`  | Boolean | Allows users in the environment to use features powered by Microsoft 365 services. When enabled, data is sent to Microsoft 365 services that operate outside of the Azure compliance boundary and are governed by the Microsoft 365 terms. When disabled, features powered by Microsoft 365 services are unavailable. See [Microsoft 365 services in Power Platform](https://go.microsoft.com/fwlink/?linkid=2302907) for more information. |
| `allow_moving_data_across_regions`  | Boolean | Allow moving data across regions. When `macro_region` is used, the location specific constraints on this setting are enforced by the service rather than by this provider, because the datacenter location is not known until the environment is created. |
| `azure_region`  | String | Azure region of the environment (westeurope, eastus etc.). Can be queried using the `powerplatform_locations` data source. This property should only be set if absolutely necessary like when trying to create an environment in the same Azure region as Azure resources or Fabric capacity.  Changing this property after environment creation will result in a destroy and recreation of the environment (you can use the [`prevent_destroy` lifecycle metatdata](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle#prevent_destroy) as an added safeguard to prevent accidental deletion of environments). |
| `billing_policy_id`  | String | Billing policy id (guid) for pay-as-you-go environments using Azure subscription billing. To remove the environment from the billing policy, set this attribute to `00000000-0000-0000-0000-000000000000` |
| `cadence`  | String | Cadence of updates for the environment (Frequent, Moderate). For more information check [here](https://learn.microsoft.com/en-us/power-platform/admin/create-environment#setting-an-environment-refresh-cadence).<br>Allowed: `Frequent`, `Moderate` |
| `dataverse`  | Attributes | Dataverse environment details · [nested schema](#nested-dataverse) |
| `description`  | String | Description of the environment |
| `environment_group_id`  | String | Environment group id (guid) that the environment belongs to. See [Environment groups](https://learn.microsoft.com/en-us/power-platform/admin/environment-groups) for more information. To remove the environment from the environment group, set this attribute to `00000000-0000-0000-0000-000000000000` |
| `location`  | String | Location of the environment (europe, unitedstates etc.). Can be queried using the `powerplatform_locations` data source. The region of your Entra tenant may [limit the available locations for Power Platform](https://learn.microsoft.com/power-platform/admin/regions-overview#who-can-create-environments-in-these-regions). Mutually exclusive with `macro_region` - set exactly one. Tenants without tenant-wide Advanced Data Residency provision by macro region instead; use the `powerplatform_macro_regions` data source to discover the available values. When `macro_region` is used the service selects a datacenter location and this attribute reports it. Changing this property after environment creation will result in a destroy and recreation of the environment (you can use the [`prevent_destroy` lifecycle metadata](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle#prevent_destroy) as an added safeguard to prevent accidental deletion of environments). |
| `macro_region`  | String | Macro region geography the environment is provisioned into (`eu-efta`, `north-america` etc.). Can be queried using the `powerplatform_macro_regions` data source. Mutually exclusive with `location`, and cannot be combined with `azure_region` - the service selects the datacenter region within the macro region and reports it back in `location` and `azure_region`. Because the datacenter is not known until the environment is created, the location specific constraints on `allow_moving_data_across_regions` are enforced by the service rather than by this provider. See [macro region geography](https://learn.microsoft.com/power-platform/admin/macro-regions). Changing this property after environment creation will result in a destroy and recreation of the environment. |
| `owner_id`  | String | Entra ID  user id (guid) of the environment owner when creating developer environment |
| `release_cycle`  | String | Gives you the ability to create environments that are updated first. This allows you to experience and validate scenarios that are important to you before any updates reach your business-critical applications. See [more](https://learn.microsoft.com/en-us/power-platform/admin/early-release).<br>Allowed: `Standard`, `Early` |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enterprise_policies`  | Attributes Set | Enterprise policies for the environment. See [Enterprise policies](https://learn.microsoft.com/en-us/power-platform/admin/enterprise-policies) for more details. · [nested schema](#nested-enterprise-policies) |
| `id`  | String | Environment id (guid) |

</div>

### Nested schemas

#### `dataverse` {#nested-dataverse}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `currency_code`  | String | Currency name |
| `language_code`  | Number | Language LCID (integer) |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `administration_mode_enabled`  | Boolean | Select to enable administration mode for the environment. See [Admin mode](https://learn.microsoft.com/en-us/power-platform/admin/admin-mode) for more information. |
| `background_operation_enabled`  | Boolean | Indicates if background operation is enabled |
| `domain`  | String | Domain name of the environment |
| `security_group_id`  | String | Security group id (guid). For an empty security group, set this property to `0000000-0000-0000-0000-000000000000` |
| `template_metadata`  | String | Additional D365 environment template metadata (if any) |
| `templates`  | List of String | The selected instance provisioning template (if any). See [ERP-based template](https://learn.microsoft.com/en-us/power-platform/admin/unified-experience/tutorial-deploy-new-environment-with-erp-template?tabs=PPAC) for more information. |

</div>

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `linked_app_id`  | String | The GUID of the linked D365 application |
| `linked_app_type`  | String | The type of the linked D365 application |
| `linked_app_url`  | String | The URL of the linked D365 application |
| `organization_id`  | String | Organization id (guid) |
| `unique_name`  | String | Unique name of the Dataverse environment |
| `url`  | String | Url of the environment |
| `version`  | String | Version of the environment |

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

#### `enterprise_policies` {#nested-enterprise-policies}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Id (guid) |
| `location`  | String | Location of the policy |
| `status`  | String | Link status of the policy |
| `system_id`  | String | System id (guid) |
| `type`  | String | Type of the policy according to [schema definition](https://learn.microsoft.com/en-us/azure/templates/microsoft.powerplatform/enterprisepolicies?pivots=deployment-language-terraform#enterprisepolicies-2) |

</div>

## Import

```shell
# Environment resource can be imported using the environment id (replace with a real environment guid)
terraform import powerplatform_environment.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment/resource_environment.go)</small>
