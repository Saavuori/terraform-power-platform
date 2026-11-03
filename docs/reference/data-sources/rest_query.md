---
title: powerplatform_rest_query
description: "Datasource to fetch api requests"
outline: [2, 3]
---

# powerplatform_rest_query

<TypeHeader name="powerplatform_rest_query" kind="data-source" />

Datasource to fetch api requests

## Relationships

<RelationDiagram name="powerplatform_rest_query" kind="data-source" />

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
  location         = "europe"
  azure_region     = "northeurope"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

data "powerplatform_rest_query" "webapi_query" {
  scope                = "${powerplatform_environment.development.dataverse.url}/.default"
  url                  = "${powerplatform_environment.development.dataverse.url}/api/data/v9.2/RetrieveCurrentOrganization(AccessType=@p1)?@p1=Microsoft.Dynamics.CRM.EndpointAccessType'Default'"
  method               = "GET"
  expected_http_status = [200]
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `method`  | String | HTTP method |
| `scope`  | String | Authentication scope for the request. See more: [Authentication Scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc) |
| `url`  | String | Absolute url of the api call |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Body of the request |
| `expected_http_status`  | Set of Number | Expected HTTP status code. If the response status code does not match any of the expected status codes, the operation will fail. |
| `headers`  | Attributes List | Headers of the request · [nested schema](#nested-headers) |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `output`  | Attributes | Response body after executing the web api request · [nested schema](#nested-output) |

</div>

### Nested schemas

#### `headers` {#nested-headers}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `name`  | String | Header name |
| `value`  | String | Header value |

</div>

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `output` {#nested-output}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Response body after executing the web api request |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/rest_query) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/rest/datasource_rest_query.go)</small>
