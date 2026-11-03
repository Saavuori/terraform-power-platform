---
title: powerplatform_environment_application_packages
description: "Fetches the list of Dynamics 365 applications in a tenant."
outline: [2, 3]
---

# powerplatform_environment_application_packages

<TypeHeader name="powerplatform_environment_application_packages" kind="data-source" />

Fetches the list of Dynamics 365 applications in a tenant.  The data source can be filtered by name and publisher name.

This is functionally equivalent to the [Environment-level view of apps](https://learn.microsoft.com/power-platform/admin/manage-apps#environment-level-view-of-apps) in the Power Platform Admin Center or the [`pac application list` command from Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/reference/application#pac-application-list).  This data source uses the [Get Environment Application Package](https://learn.microsoft.com/rest/api/power-platform/appmanagement/applications/get-environment-application-package) endpoint in the Power Platform API.

## Relationships

<RelationDiagram name="powerplatform_environment_application_packages" kind="data-source" />

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

data "powerplatform_environment_application_packages" "all_applications" {
  environment_id = data.powerplatform_environments.all_environments.environments[0].id
}

data "powerplatform_environment_application_packages" "all_applications_from_publisher" {
  environment_id = data.powerplatform_environments.all_environments.environments[0].id
  publisher_name = "Power Platform Host Service"
}

data "powerplatform_environment_application_packages" "specific_application" {
  environment_id = data.powerplatform_environments.all_environments.environments[0].id
  publisher_name = "Microsoft Dynamics 365"
  name           = "Virtual connectors in Dataverse"
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Id of the Dynamics 365 environment |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Id of the read operation |
| `name`  | String | Name of the Dynamics 365 application |
| `publisher_name`  | String | Publisher Name of the Dynamics 365 application |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `applications`  | Attributes List | List of Applications · [nested schema](#nested-applications) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `applications` {#nested-applications}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `application_id`  | String | ApplicaitonId |
| `application_name`  | String | Name |
| `application_visibility`  | String | Application Visibility |
| `description`  | String | Localized Description |
| `learn_more_url`  | String | Learn More Url |
| `publisher_id`  | String | Publisher Id |
| `publisher_name`  | String | Publisher Name |
| `state`  | String | State |
| `unique_name`  | String | Unique Name |
| `version`  | String | Version |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/environment_application_packages) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/application/datasource_environment_application_packages.go)</small>
