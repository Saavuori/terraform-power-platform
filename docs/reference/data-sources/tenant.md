---
title: powerplatform_tenant
description: "Fetches the client configuration for the given tenant."
outline: [2, 3]
---

# powerplatform_tenant

<TypeHeader name="powerplatform_tenant" kind="data-source" />

Fetches the client configuration for the given tenant.

**Note:** This resource is available as **preview**

**Known Limitations:** This resource is not supported for with service principal authentication.

## Relationships

<RelationDiagram name="powerplatform_tenant" kind="data-source" />

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

data "powerplatform_tenant" "current_tenant" {}
```

## Schema

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `aad_country_geo`  | String | AAD country geo. |
| `aad_data_boundary`  | String | AAD data boundary. |
| `data_storage_geo`  | String | Data storage geo. |
| `default_environment_geo`  | String | Default environment geo. |
| `fed_ramp_high_certification_required`  | Boolean | FedRAMP high certification required. |
| `location`  | String | Location of the tenant. |
| `state`  | String | State of the tenant. |
| `tenant_id`  | String | Tenant ID of the application. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/tenant) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/tenant/datasource_tenant.go)</small>
