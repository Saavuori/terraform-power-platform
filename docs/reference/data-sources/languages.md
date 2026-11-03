---
title: powerplatform_languages
description: "Fetches the list of Dynamics 365 languages."
outline: [2, 3]
---

# powerplatform_languages

<TypeHeader name="powerplatform_languages" kind="data-source" />

Fetches the list of Dynamics 365 languages. For more information see [Power Platform Enable Languages](https://learn.microsoft.com/power-platform/admin/enable-languages)

## Relationships

<RelationDiagram name="powerplatform_languages" kind="data-source" />

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

data "powerplatform_locations" "all_locations" {}

data "powerplatform_languages" "all_languages_by_location" {
  location = data.powerplatform_locations.all_locations.locations[0].name
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `location`  | String | Location of the languages |

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
| `languages`  | Attributes List | List of available languages · [nested schema](#nested-languages) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `languages` {#nested-languages}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `display_name`  | String | Display name of the location |
| `id`  | String | Unique identifier of the location |
| `is_tenant_default`  | Boolean | Is the location the default for the tenant |
| `locale_id`  | Number | Locale ID of the location |
| `localized_name`  | String | Localized name of the location |
| `name`  | String | Name of the location |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/languages) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/languages/datasource_languages.go)</small>
