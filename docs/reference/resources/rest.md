---
title: powerplatform_rest
description: "Deprecated: powerplatformrest will be removed in v5.0.0."
outline: [2, 3]
---

# powerplatform_rest

<TypeHeader name="powerplatform_rest" kind="resource" />

Deprecated: `powerplatform_rest` will be removed in v5.0.0. Migrate to purpose-built resources for your use case before upgrading. If no suitable resource exists, open a GitHub issue requesting one. This removal does not affect the `powerplatform_rest_query` data source.

Resource to execute web api requests. There are four distinct operations, that you can define independently. The HTTP response' body of the operation, that was called as last, will be returned in 'output.body' \n\n:
		* Create: will be called once during the lifecycle of the resource (first 'terraform apply')
		* Read: terraform will call this operation every time during 'plan' and 'apply' to get the current state of the resource
		* Update: will be called every time during 'terraform apply' if the resource has changed (change done by the user or different values returned by the 'read' operation than those in the current state)
		* Destroy: will be called once during the lifecycle of the resource (last 'terraform destroy')
		\n\nYou don't have to define all the operations but there are some things to consider:
		* lack of 'create' operation will result in no reasource being created. If you only need to read values consider using datasource 'powerplatform_rest_query' instead
		* lack of 'read' operation will result in no resource changes being tracked. That means that the 'update' operation will never be called
		* lack of destroy will cause that the resource to not be deleted during 'terraform destroy'

## Relationships

<RelationDiagram name="powerplatform_rest" kind="resource" />

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
  display_name     = "sample_data_environment"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_rest" "install_sample_data" {
  create = {
    scope                = "${powerplatform_environment.env.dataverse.url}/.default"
    url                  = "${powerplatform_environment.env.dataverse.url}/api/data/v9.2/InstallSampleData"
    method               = "POST"
    expected_http_status = [204]
  }
  destroy = {
    scope                = "${powerplatform_environment.env.dataverse.url}/.default"
    url                  = "${powerplatform_environment.env.dataverse.url}/api/data/v9.2/UninstallSampleData"
    method               = "POST"
    expected_http_status = [204]
  }
}
```

<OpenInBuilder type="powerplatform_rest" />

## Schema

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `create`  | Attributes | Create operation · [nested schema](#nested-create) |
| `destroy`  | Attributes | Destroy operation · [nested schema](#nested-destroy) |
| `id`  | String | Unique id (guid) |
| `output`  | Attributes | Response after executing the web api request · [nested schema](#nested-output) |
| `read`  | Attributes | Read operation · [nested schema](#nested-read) |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |
| `update`  | Attributes | Update operation · [nested schema](#nested-update) |

</div>

### Nested schemas

#### `create` {#nested-create}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `method`  | String | HTTP method |
| `scope`  | String | Authentication scope for the request. See more: [Authentication Scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc) |
| `url`  | String | Absolute url of the api call |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Body of the request |
| `expected_http_status`  | Set of Number | Expected HTTP status code. If the response status code does not match any of the expected status codes, the operation will fail. |
| `headers`  | Attributes List | Headers of the request · [nested schema](#nested-create-headers) |

</div>

#### `create.headers` {#nested-create-headers}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `name`  | String | Header name |
| `value`  | String | Header value |

</div>

#### `destroy` {#nested-destroy}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `method`  | String | HTTP method |
| `scope`  | String | Authentication scope for the request. See more: [Authentication Scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc) |
| `url`  | String | Absolute url of the api call |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Body of the request |
| `expected_http_status`  | Set of Number | Expected HTTP status code. If the response status code does not match any of the expected status codes, the operation will fail. |
| `headers`  | Attributes List | Headers of the request · [nested schema](#nested-destroy-headers) |

</div>

#### `destroy.headers` {#nested-destroy-headers}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `name`  | String | Header name |
| `value`  | String | Header value |

</div>

#### `output` {#nested-output}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Response body after executing the web api request |

</div>

#### `read` {#nested-read}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `method`  | String | HTTP method |
| `scope`  | String | Authentication scope for the request. See more: [Authentication Scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc) |
| `url`  | String | Absolute url of the api call |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Body of the request |
| `expected_http_status`  | Set of Number | Expected HTTP status code. If the response status code does not match any of the expected status codes, the operation will fail. |
| `headers`  | Attributes List | Headers of the request · [nested schema](#nested-read-headers) |

</div>

#### `read.headers` {#nested-read-headers}

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
| `create`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |
| `delete`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Setting a timeout for a Delete operation is only applicable if changes are saved into state before the destroy operation occurs. |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |
| `update`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |

</div>

#### `update` {#nested-update}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `method`  | String | HTTP method |
| `scope`  | String | Authentication scope for the request. See more: [Authentication Scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc) |
| `url`  | String | Absolute url of the api call |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `body`  | String | Body of the request |
| `expected_http_status`  | Set of Number | Expected HTTP status code. If the response status code does not match any of the expected status codes, the operation will fail. |
| `headers`  | Attributes List | Headers of the request · [nested schema](#nested-update-headers) |

</div>

#### `update.headers` {#nested-update-headers}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `name`  | String | Header name |
| `value`  | String | Header value |

</div>

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/rest) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/rest/resource_rest.go)</small>
