---
title: powerplatform_environment_group
description: "This resource manages an Environment Group."
outline: [2, 3]
---

# powerplatform_environment_group

<TypeHeader name="powerplatform_environment_group" kind="resource" />

This resource manages an [Environment Group](https://learn.microsoft.com/en-us/power-platform/admin/environment-groups).

## Relationships

<RelationDiagram name="powerplatform_environment_group" kind="resource" />

## Example usage

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

resource "azuread_group" "environment_routing_target_security_group" {
  display_name     = "example_security_group"
  description      = "Example security group"
  mail_enabled     = false
  security_enabled = true
}

resource "powerplatform_environment_group" "example_group" {
  display_name = "example_environment_group"
  description  = "Example environment group"
}

resource "powerplatform_tenant_settings" "environment_routing" {
  power_platform = {
    governance = {
      enable_default_environment_routing              = false
      environment_routing_all_makers                  = false
      environment_routing_target_environment_group_id = powerplatform_environment_group.example_group.id
      environment_routing_target_security_group_id    = azuread_group.environment_routing_target_security_group.id
    }
  }

  walk_me_opt_out = true
}
```

<OpenInBuilder type="powerplatform_environment_group" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `description`  | String | Display name of the environment group |
| `display_name`  | String | Display name of the environment group |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique id of the environment group |

</div>

## Import

```shell
# Environment Groups can be imported using the environment group id (replace with a real environment group guid)
terraform import powerplatform_environment_group.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_group) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_groups/resource_environment_group.go)</small>
