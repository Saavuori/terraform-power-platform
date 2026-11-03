---
title: powerplatform_data_records
description: "Resource for retrieving data records from Dataverse using (OData Query)[https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-data-web-api#page-results]."
outline: [2, 3]
---

# powerplatform_data_records

<TypeHeader name="powerplatform_data_records" kind="data-source" />

Resource for retrieving data records from Dataverse using (OData Query)[https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-data-web-api#page-results].

## Relationships

<RelationDiagram name="powerplatform_data_records" kind="data-source" />

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
  display_name     = "powerplatform_data_record_example"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

data "powerplatform_data_records" "data_query" {
  environment_id    = powerplatform_environment.env.id
  entity_collection = "systemusers"
  filter            = "isdisabled eq false"
  select            = ["firstname", "lastname", "domainname"]
  top               = 2
  order_by          = "lastname asc"

  expand = [
    {
      navigation_property = "systemuserroles_association",
      select              = ["name"],
    },
    {
      navigation_property = "teammembership_association",
      select              = ["name"],
    }
  ]
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `entity_collection`  | String | Value of the enitiy (collection of the query)[https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-data-web-api#entity-collections]. Example: |
| `environment_id`  | String | Id of the Power Platform environment |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `apply`  | String | Apply the aggregation function to the data records. |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `return_total_rows_count`  | Boolean | Should total records count be also retrived. |
| `saved_query`  | String | predefined saved query to be used for filtering the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |
| `top`  | Number | Number of records to be retrieved. |
| `user_query`  | String | Predefined user query to be used for filtering the data records. |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `rows`  | Dynamic | Columns of the data record table |
| `total_rows_count`  | Number | Total number of records if attribute `return_total_rows_count` is set to `true` |
| `total_rows_count_limit_exceeded`  | Boolean | Is total records count limit exceeded. |

</div>

### Nested schemas

#### `expand` {#nested-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand` {#nested-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand` {#nested-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand` {#nested-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `expand`  | Attributes List | Expand the navigation property of the entity collection. |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `expand.expand.expand.expand.expand.expand.expand.expand.expand.expand.expand` {#nested-expand-expand-expand-expand-expand-expand-expand-expand-expand-expand-expand}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `navigation_property`  | String | Navigation property of the entity collection. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `filter`  | String | Filter the data records. |
| `order_by`  | String | Order the data records. |
| `select`  | List of String | List of columns to be selected from record(s) defined in entity collection. |
| `top`  | Number | Number of records to be retrieved. |

</div>

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/data_records) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/data_record/datasource_data_record.go)</small>
