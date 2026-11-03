---
title: powerplatform_data_record
description: "The Power Platform Data Record Resource allows the management of configuration records that are stored in Dataverse as records."
outline: [2, 3]
---

# powerplatform_data_record

<TypeHeader name="powerplatform_data_record" kind="resource" />

The Power Platform Data Record Resource allows the management of configuration records that are stored in Dataverse as records. This resource is not recommended for managing business data or other data that may be changed by Dataverse users in the context of normal business activities.

Data Record is a special type of a resources, that allows creation of any type Dataverese table record. The syntax for working with `data_record` resource is simmilar to raw WebAPI HTTP requests that this record uses:

- [WebAPI overview - Power Platform | Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview)

## Lookup (relationship) columns

A lookup column is set by nesting a `table_logical_name` / `data_record_id` object under the column name. The provider turns that into an OData `@odata.bind` binding, using **the attribute name exactly as you wrote it**.

That name must be the relationship's `ReferencingEntityNavigationPropertyName`, which is not always the lowercase lookup column name. Most system relationships do match (`primarycontactid`, `businessunitid`), but some expose a PascalCase navigation property instead — for example `environmentvariablevalue` -&gt; `environmentvariabledefinition` binds as `EnvironmentVariableDefinitionId`, not `environmentvariabledefinitionid`. Using the column name where the navigation property differs fails with `0x80048d19` ("undeclared property").

Look the correct name up against your own environment:

```text
GET https://<environment>.crm.dynamics.com/api/data/v9.2/EntityDefinitions(LogicalName='<table>')/ManyToOneRelationships?$select=ReferencingEntityNavigationPropertyName,ReferencedEntity,ReferencingAttribute
```

## End to End Example

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
    azuread = {
      source = "hashicorp/azuread"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}

provider "azuread" {
  use_cli = true
}

resource "powerplatform_environment" "data_record_example_env" {
  display_name     = "powerplatform_data_record_example"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

# get the root business unit by querying for the business unit without a parent
data "powerplatform_data_records" "root_business_unit" {
  environment_id    = powerplatform_environment.data_record_example_env.id
  entity_collection = "businessunits"
  filter            = "parentbusinessunitid eq null"
  select            = ["name"]
}

# Create a new business unit with the root business unit as parent
module "business_unit" {
  source                  = "./res_business_unit"
  environment_id          = powerplatform_environment.data_record_example_env.id
  name                    = "Sales"
  costcenter              = "123"
  parent_business_unit_id = one(data.powerplatform_data_records.root_business_unit.rows).businessunitid
}

# Create a new role
module "custom_role" {
  source           = "./res_role"
  environment_id   = powerplatform_environment.data_record_example_env.id
  role_name        = "my custom role"
  business_unit_id = one(data.powerplatform_data_records.root_business_unit.rows).businessunitid
}

module "team" {
  source           = "./res_team"
  environment_id   = powerplatform_environment.data_record_example_env.id
  team_name        = "main team"
  team_description = "main team description"
  role_ids         = [module.custom_role.role_id]

}

resource "azuread_application_registration" "data_record_app_user" {
  display_name = "powerplatform_data_record_example"
}

resource "azuread_service_principal" "data_record_app_user" {
  client_id = azuread_application_registration.data_record_app_user.client_id
}

module "application_user" {
  source           = "./res_application_user"
  environment_id   = powerplatform_environment.data_record_example_env.id
  application_id   = azuread_application_registration.data_record_app_user.client_id
  business_unit_id = one(data.powerplatform_data_records.root_business_unit.rows).businessunitid
  role_ids         = [module.custom_role.role_id]
}
```

## Relationships

<RelationDiagram name="powerplatform_data_record" kind="resource" />

## Example usage

```hcl
terraform {
  required_providers {
    powerplatform = {
      source = "microsoft/power-platform"
    }
  }
}

variable "environment_id" {
  type = string
}

variable "name" {
  type = string
}

variable "costcenter" {
  type = string
}

variable "parent_business_unit_id" {
  type = string
}

resource "powerplatform_data_record" "business_unit" {
  environment_id     = var.environment_id
  table_logical_name = "businessunit"
  disable_on_destroy = true
  columns = {
    name       = var.name
    costcenter = var.costcenter
    parentbusinessunitid = {
      table_logical_name = "businessunit"
      data_record_id     = var.parent_business_unit_id
    }
  }
}

output "resource_id" {
  value = powerplatform_data_record.business_unit.id
}

output "resource" {
  value = powerplatform_data_record.business_unit
}
```

<OpenInBuilder type="powerplatform_data_record" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `columns`  | Dynamic | Columns of the data record table |
| `environment_id`  | String | Id of the Dynamics 365 environment |
| `table_logical_name`  | String | Logical name of the data record table |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_on_destroy`  | Boolean | If true, the resource will either set isdisabled to true or statecode to 1 with a PATCH request, before attempting to delete the record. |
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
| `delete`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Setting a timeout for a Delete operation is only applicable if changes are saved into state before the destroy operation occurs. |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |
| `update`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |

</div>

## Import

```shell
# Data record resource can be imported using the environment id, the table logical name and the data record id
# in the format: <environment_id>/<table_logical_name>(<data_record_id>)
terraform import powerplatform_data_record.example "00000000-0000-0000-0000-000000000000/account(00000000-0000-0000-0000-000000000001)"
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/data_record) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/data_record/resource_data_record.go)</small>
