---
title: powerplatform_environment_application_package_install
description: "This resource allows you to install a Dynamics 365 application in an environment."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_application_package_install

<TypeHeader name="powerplatform_environment_application_package_install" kind="resource" />

This resource allows you to install a Dynamics 365 application in an environment. This is functionally equivalent to the 'Install' button in the Power Platform admin center or [`pac application install` in the Power Platform CLI](https://docs.microsoft.com/powerapps/developer/data-platform/powerapps-cli#pac-application-install).  This resource uses the [Install Application Package](https://learn.microsoft.com/rest/api/power-platform/appmanagement/applications/install-application-package) endpoint in the Power Platform API.

## Known Limitations

- This resource only supports the installation of applications. Once installed, the application will remain until the environment is deleted; updates or deletions are not supported.
- Not all applications are available in every region. Depending on the location of your `powerplatform_environment`, you may encounter the `Package requested for installation was not found` error if the application is not available in that region.

## Relationships

<RelationDiagram name="powerplatform_environment_application_package_install" kind="resource" />

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

resource "powerplatform_environment" "env" {
  display_name     = "example_environment"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

data "powerplatform_environment_application_packages" "application_to_install" {
  environment_id = powerplatform_environment.env.id
  name           = "Power Platform Pipelines"
  publisher_name = "Microsoft Dynamics 365"
}

data "powerplatform_environment_application_packages" "all_applications" {
  environment_id = powerplatform_environment.env.id
}

locals {
  onboarding_essential_application = toset([for each in data.powerplatform_environment_application_packages.all_applications.applications : each if each.application_name == "Onboarding essentials"])
}

resource "powerplatform_environment_application_package_install" "install_sample_application" {
  environment_id = powerplatform_environment.env.id
  unique_name    = data.powerplatform_environment_application_packages.application_to_install.applications[0].unique_name
}
```

<OpenInBuilder type="powerplatform_environment_application_package_install" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Id of the Dynamics 365 environment |
| `unique_name`  | String | Unique name of the application |

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
| `id`  | String | Unique id (guid) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `create`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |

</div>

## Import

```shell
# Application package install resource can be imported using the environment application package install id (replace with a real environment application package install in format {environment_id}_{unique_name})
terraform import powerplatform_environment_application_package_install.example 00000000-0000-0000-0000-000000000000_example-package-unique-name
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_application_package_install) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/application/resource_environment_application_package_install.go)</small>
