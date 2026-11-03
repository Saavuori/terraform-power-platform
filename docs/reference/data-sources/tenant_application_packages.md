---
title: powerplatform_tenant_application_packages
description: "Fetches the list of Dynamics 365 tenant level applications"
outline: [2, 3]
editLink: false
---

# powerplatform_tenant_application_packages

<TypeHeader name="powerplatform_tenant_application_packages" kind="data-source" />

Fetches the list of Dynamics 365 tenant level applications

## Relationships

<RelationDiagram name="powerplatform_tenant_application_packages" kind="data-source" />

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

data "powerplatform_tenant_application_packages" "all_applications" {
}

data "powerplatform_tenant_application_packages" "all_applications_from_publisher" {
  publisher_name = "Microsoft Dynamics SMB"
}

data "powerplatform_tenant_application_packages" "specific_application" {
  name = "Healthcare Home Health"
}
```

## Schema

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
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
| `application_descprition`  | String | Applicaiton Description |
| `application_id`  | String | ApplicaitonId |
| `application_name`  | String | Name |
| `application_visibility`  | String | Application Visibility |
| `catalog_visibility`  | String | Catalog Visibility |
| `last_error`  | Attributes List | Last Error · [nested schema](#nested-applications-last-error) |
| `learn_more_url`  | String | Learn More Url |
| `localized_description`  | String | Localized Description |
| `localized_name`  | String | Localized Name |
| `publisher_id`  | String | Publisher Id |
| `publisher_name`  | String | Publisher Name |
| `unique_name`  | String | Unique Name |

</div>

#### `applications.last_error` {#nested-applications-last-error}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `error_code`  | String | Error Code |
| `error_name`  | String | Error Name |
| `message`  | String | Message |
| `source`  | String | Source |
| `status_code`  | Number | Status Code |
| `type`  | String | Type |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/tenant_application_packages) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/application/datasource_tenant_application_packages.go)</small>
