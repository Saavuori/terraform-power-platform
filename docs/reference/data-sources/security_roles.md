---
title: powerplatform_security_roles
description: "Fetches the list of Dataverse security roles for a given environment and business unit."
outline: [2, 3]
---

# powerplatform_security_roles

<TypeHeader name="powerplatform_security_roles" kind="data-source" />

Fetches the list of Dataverse security roles for a given environment and business unit.  For more information see [About security roles and privileges](https://learn.microsoft.com/power-platform/admin/security-roles-privileges)

## Relationships

<RelationDiagram name="powerplatform_security_roles" kind="data-source" />

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
| `business_unit_id`  | String | Id of the business unit to filter the security roles |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `security_roles`  | Attributes List | List of security roles · [nested schema](#nested-security-roles) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `security_roles` {#nested-security-roles}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `business_unit_id`  | String | Id of the business unit |
| `is_managed`  | Boolean | Is the security role managed |
| `name`  | String | Security role name |
| `role_id`  | String | Security role id |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/security_roles) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/authorization/datasource_securityroles.go)</small>
