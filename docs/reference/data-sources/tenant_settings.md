---
title: powerplatform_tenant_settings
description: "Fetches Power Platform Tenant Settings."
outline: [2, 3]
---

# powerplatform_tenant_settings

<TypeHeader name="powerplatform_tenant_settings" kind="data-source" />

Fetches Power Platform Tenant Settings.  See [Tenant Settings Overview](https://learn.microsoft.com/power-platform/admin/tenant-settings) for more information.

## Relationships

<RelationDiagram name="powerplatform_tenant_settings" kind="data-source" />

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

data "powerplatform_tenant_settings" "settings" {}
```

## Schema

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
| `disable_capacity_allocation_by_environment_admins`  | Boolean | Disable Capacity Allocation By Environment Admins |
| `disable_environment_creation_by_non_admin_users`  | Boolean | Disable Environment Creation By Non Admin Users |
| `disable_newsletter_sendout`  | Boolean | Disable Newsletter Sendout |
| `disable_nps_comments_reachout` <Badge type="danger" text="deprecated" /> | Boolean | Disable NPS Comments Reachout. Deprecated: this attribute will be renamed or moved within tenant settings in v5.0.0. Update configurations and references to use the v5.0.0 tenant settings schema when upgrading. |
| `disable_portals_creation_by_non_admin_users`  | Boolean | Disable Portals Creation By Non Admin Users |
| `disable_support_tickets_visible_by_all_users`  | Boolean | Disable Support Tickets Visible By All Users |
| `disable_survey_feedback` <Badge type="danger" text="deprecated" /> | Boolean | Disable Survey Feedback. Deprecated: this attribute will be renamed or moved within tenant settings in v5.0.0. Update configurations and references to use the v5.0.0 tenant settings schema when upgrading. |
| `disable_trial_environment_creation_by_non_admin_users`  | Boolean | Disable Trial Environment Creation By Non Admin Users |
| `power_platform`  | Attributes | Power Platform · [nested schema](#nested-power-platform) |
| `walk_me_opt_out`  | Boolean | Walk Me Opt Out |

</div>

### Nested schemas

#### `timeouts` {#nested-timeouts}

#### `power_platform` {#nested-power-platform}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `catalog_settings`  | Attributes | Catalog Settings · [nested schema](#nested-power-platform-catalog-settings) |
| `champions`  | Attributes | Champions · [nested schema](#nested-power-platform-champions) |
| `environments`  | Attributes | Environments · [nested schema](#nested-power-platform-environments) |
| `governance`  | Attributes | Governance · [nested schema](#nested-power-platform-governance) |
| `intelligence`  | Attributes | Intelligence · [nested schema](#nested-power-platform-intelligence) |
| `licensing`  | Attributes | Licensing · [nested schema](#nested-power-platform-licensing) |
| `model_experimentation`  | Attributes | Model Experimentation · [nested schema](#nested-power-platform-model-experimentation) |
| `power_apps`  | Attributes | Power Apps · [nested schema](#nested-power-platform-power-apps) |
| `power_automate`  | Attributes | Power Automate · [nested schema](#nested-power-platform-power-automate) |
| `power_pages`  | Attributes | Power Pages · [nested schema](#nested-power-platform-power-pages) |
| `search`  | Attributes | Search · [nested schema](#nested-power-platform-search) |
| `teams_integration`  | Attributes | Teams Integration · [nested schema](#nested-power-platform-teams-integration) |
| `user_management_settings`  | Attributes | User Management Settings · [nested schema](#nested-power-platform-user-management-settings) |

</div>

#### `power_platform.catalog_settings` {#nested-power-platform-catalog-settings}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `power_catalog_audience_setting`  | String | Power Catalog Audience Setting<br>Allowed: `SpecificAdmins`, `All` |

</div>

#### `power_platform.champions` {#nested-power-platform-champions}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_champions_invitation_reachout`  | Boolean | Disable Champions Invitation Reachout |
| `disable_skills_match_invitation_reachout`  | Boolean | Disable Skills Match Invitation Reachout |

</div>

#### `power_platform.environments` {#nested-power-platform-environments}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_preferred_data_location_for_teams_environment`  | Boolean | Disable Preferred Data Location For Teams Environment |

</div>

#### `power_platform.governance` {#nested-power-platform-governance}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_admin_digest`  | Boolean | Disable Admin Digest |
| `disable_developer_environment_creation_by_non_admin_users`  | Boolean | Disable Developer Environment Creation By Non Admin Users |
| `enable_default_environment_routing`  | Boolean | Enable Default Environment Routing |
| `environment_routing_all_makers`  | Boolean | Select who can be routed to a new personal developer environment. (All Makers = true, New Makers = false) |
| `environment_routing_target_environment_group_id`  | String | Assign newly created personal developer environments to a specific environment group |
| `environment_routing_target_security_group_id`  | String | Restrict routing to members of the following security group. (00000000-0000-0000-0000-000000000000 allows all users) |
| `policy`  | Attributes | Policy · [nested schema](#nested-power-platform-governance-policy) |

</div>

#### `power_platform.governance.policy` {#nested-power-platform-governance-policy}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enable_desktop_flow_data_policy_management`  | Boolean | Enable Desktop Flow Data Policy Management |

</div>

#### `power_platform.intelligence` {#nested-power-platform-intelligence}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_copilot`  | Boolean | Disable Copilot |
| `enable_open_ai_bot_publishing` <Badge type="danger" text="deprecated" /> | Boolean | Enable Open AI Bot Publishing. Deprecated: this attribute will be renamed or moved within tenant settings in v5.0.0. Update configurations and references to use the v5.0.0 tenant settings schema when upgrading. |

</div>

#### `power_platform.licensing` {#nested-power-platform-licensing}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_billing_policy_creation_by_non_admin_users`  | Boolean | Disable Billing Policy Creation By Non Admin Users |
| `disable_use_of_unassigned_ai_builder_credits`  | Boolean | Disable Use Of Unassigned AI Builder Credits |
| `enable_tenant_capacity_report_for_environment_admins`  | Boolean | Enable Tenant Capacity Report For Environment Admins |
| `enable_tenant_licensing_report_for_environment_admins`  | Boolean | Enable Tenant Licensing Report For Environment Admins |
| `storage_capacity_consumption_warning_threshold`  | Number | Storage Capacity Consumption Warning Threshold |

</div>

#### `power_platform.model_experimentation` {#nested-power-platform-model-experimentation}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_data_logging`  | Boolean | Disable Data Logging |
| `enable_model_data_sharing`  | Boolean | Enable Model Data Sharing |

</div>

#### `power_platform.power_apps` {#nested-power-platform-power-apps}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_connection_sharing_with_everyone`  | Boolean | Disable Connection Sharing With Everyone |
| `disable_create_from_figma` <Badge type="danger" text="deprecated" /> | Boolean | Disable Create From Figma. Deprecated: this attribute will be removed in v5.0.0 with no replacement. Remove it from configurations and references before upgrading. |
| `disable_create_from_image` <Badge type="danger" text="deprecated" /> | Boolean | Disable Create From Image. Deprecated: this attribute will be removed in v5.0.0 with no replacement. Remove it from configurations and references before upgrading. |
| `disable_maker_match`  | Boolean | Disable Maker Match |
| `disable_share_with_everyone`  | Boolean | Disable Share With Everyone |
| `disable_unused_license_assignment`  | Boolean | Disable Unused License Assignment |
| `enable_guests_to_make`  | Boolean | Enable Guests To Make |

</div>

#### `power_platform.power_automate` {#nested-power-platform-power-automate}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_copilot`  | Boolean | Disable Copilot |

</div>

#### `power_platform.power_pages` {#nested-power-platform-power-pages}

#### `power_platform.search` {#nested-power-platform-search}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `disable_bing_video_search`  | Boolean | Disable Bing Video Search |
| `disable_community_search`  | Boolean | Disable Community Search |
| `disable_docs_search`  | Boolean | Disable Docs Search |

</div>

#### `power_platform.teams_integration` {#nested-power-platform-teams-integration}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `share_with_colleagues_user_limit`  | Number | Share With Colleagues User Limit |

</div>

#### `power_platform.user_management_settings` {#nested-power-platform-user-management-settings}

**Read-only**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enable_delete_disabled_user_in_all_environments`  | Boolean | Enable Delete Disabled User In All Environments |

</div>

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/tenant_settings) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/tenant_settings/datasource_tenant_settings.go)</small>
