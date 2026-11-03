---
title: powerplatform_publishers
description: "Fetches the list of Dataverse publishers in an environment."
outline: [2, 3]
editLink: false
---

# powerplatform_publishers

<TypeHeader name="powerplatform_publishers" kind="data-source" />

Fetches the list of Dataverse publishers in an environment.

## Relationships

<RelationDiagram name="powerplatform_publishers" kind="data-source" />

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

data "powerplatform_publishers" "example" {
  environment_id = "00000000-0000-0000-0000-000000000000"
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Id of the Dataverse-enabled environment to fetch publishers from. |

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
| `publishers`  | Attributes List | List of Dataverse publishers in the environment. · [nested schema](#nested-publishers) |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `read`  | String | A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled. |

</div>

#### `publishers` {#nested-publishers}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `address`  | Attributes List | Publisher addresses mapped from Dataverse address slots 1 and 2. · [nested schema](#nested-publishers-address) |
| `customization_option_value_prefix`  | Number | Option value prefix used for option set values created by this publisher. |
| `customization_prefix`  | String | Customization prefix used for solution components created by this publisher. |
| `description`  | String | Description of the publisher. |
| `email_address`  | String | Email address for the publisher. |
| `environment_id`  | String | Id of the Dataverse-enabled environment containing the publisher. |
| `friendly_name`  | String | Display name of the publisher. |
| `id`  | String | Dataverse publisher id. |
| `is_read_only`  | Boolean | Whether Dataverse reports this publisher as read only. |
| `supporting_website_url`  | String | Supporting website URL for the publisher. |
| `uniquename`  | String | Unique name of the publisher. |

</div>

#### `publishers.address` {#nested-publishers-address}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `address_id`  | String | Dataverse address identifier for the slot. |
| `address_type_code`  | Number | Address type code. |
| `city`  | String | City name. |
| `country`  | String | Country or region name. |
| `county`  | String | County name. |
| `fax`  | String | Fax number. |
| `latitude`  | Number | Latitude value. |
| `line1`  | String | Street line 1. |
| `line2`  | String | Street line 2. |
| `line3`  | String | Street line 3. |
| `longitude`  | Number | Longitude value. |
| `name`  | String | Address name. |
| `post_office_box`  | String | Post office box. |
| `postal_code`  | String | Postal code. |
| `shipping_method_code`  | Number | Shipping method code. |
| `slot`  | Number | Address slot number in Dataverse. Valid values are `1` and `2`. |
| `state_or_province`  | String | State or province name. |
| `telephone1`  | String | Primary telephone number. |
| `telephone2`  | String | Secondary telephone number. |
| `telephone3`  | String | Tertiary telephone number. |
| `ups_zone`  | String | UPS zone value. |
| `utc_offset`  | Number | UTC offset for the address. |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/publishers) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/publisher/datasource_publishers.go)</small>
