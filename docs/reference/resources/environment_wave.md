---
title: powerplatform_environment_wave
description: "Manages wave feature installation in a Power Platform environment."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_wave

<TypeHeader name="powerplatform_environment_wave" kind="resource" />

Manages wave feature installation in a Power Platform environment. 

**Note:** This resource is available as **preview**

**Known Limitations:** This resource is not supported for with service principal authentication.

## Relationships

<RelationDiagram name="powerplatform_environment_wave" kind="resource" />

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

resource "powerplatform_environment" "example" {
  display_name     = "wave_feature_example"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_environment_wave" "example" {
  environment_id = powerplatform_environment.example.id
  feature_name   = "April2025Update"

  timeouts {
    create = "45m" # Allow up to 45 minutes for the feature to be installed
  }
}
```

<OpenInBuilder type="powerplatform_environment_wave" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | The ID of the environment to install the wave feature on |
| `feature_name`  | String | The name of the wave feature to install |

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
| `id`  | String | The unique identifier of the wave feature installation. Computed as environment_id/feature_name. |
| `state`  | String | The current state of the wave feature. Possible values are: `upgrading`, `enabled`, `error` |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `create`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_wave) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_wave/resource_environment_wave.go)</small>
