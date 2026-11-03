---
title: powerplatform_tenant_isolation_policy
description: "Manages a Power Platform tenant isolation policy."
outline: [2, 3]
---

# powerplatform_tenant_isolation_policy

<TypeHeader name="powerplatform_tenant_isolation_policy" kind="resource" />

Manages a Power Platform tenant isolation policy. Tenant isolation can be used to block external tenants from establishing connections into your tenant (inbound isolation) as well as block your tenant from establishing connections to external tenants (outbound isolation). Learn more: https://docs.microsoft.com/en-us/power-platform/admin/cross-tenant-restrictions

## Relationships

<RelationDiagram name="powerplatform_tenant_isolation_policy" kind="resource" />

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

data "powerplatform_tenant" "current" {}

resource "powerplatform_tenant_isolation_policy" "example" {
  is_disabled = false
  allowed_tenants = [
    {
      tenant_id = "11111111-1111-1111-1111-111111111111"
      inbound   = true
      outbound  = true
    },
    {
      tenant_id = "22222222-2222-2222-2222-222222222222"
      inbound   = true
      outbound  = false
    },
    {
      tenant_id = "33333333-3333-3333-3333-333333333333"
      inbound   = false
      outbound  = true
    },
    {
      tenant_id = "*"
      inbound   = true
      outbound  = false
    }
  ]
}
```

<OpenInBuilder type="powerplatform_tenant_isolation_policy" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `allowed_tenants`  | Attributes Set | List of tenants that are allowed to connect with your tenant. · [nested schema](#nested-allowed-tenants) |
| `is_disabled`  | Boolean | Whether the tenant isolation policy is disabled. |

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
| `id`  | String | The ID of the tenant isolation policy. |

</div>

### Nested schemas

#### `allowed_tenants` {#nested-allowed-tenants}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `inbound`  | Boolean | Whether inbound connections from this tenant are allowed. |
| `outbound`  | Boolean | Whether outbound connections to this tenant are allowed. |
| `tenant_id`  | String | ID of the tenant that is allowed to connect. |

</div>

#### `timeouts` {#nested-timeouts}

## Import

```shell
# Tenant isolation policy resource can be imported using the tenant id (replace with a real tenant id)
terraform import powerplatform_tenant_isolation_policy.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/tenant_isolation_policy) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/tenant_isolation_policy/resource_tenant_isolation_policy.go)</small>
