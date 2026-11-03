---
title: powerplatform_environment_settings
description: "Power Platform Environment Settings Data Source."
outline: [2, 3]
---

# powerplatform_environment_settings

<TypeHeader name="powerplatform_environment_settings" kind="data-source" />

Power Platform Environment Settings Data Source. Power Platform Settings are configuration options that apply to a specific environment. They control various aspects of Power Platform features and behaviors, See [Environment Settings Overview](https://learn.microsoft.com/power-platform/admin/admin-settings) for more details.  While this data source provides access to some specific environment settings, many environment settings are stored as records in Dataverse.  You may be able to read those settings using the [`powerplatform_data_records` resource](./data_records).

## Relationships

<RelationDiagram name="powerplatform_environment_settings" kind="data-source" />

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

data "powerplatform_environment_settings" "example" {
  environment_id = "00000000-0000-0000-0000-000000000001"
}
```

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Unique environment id (guid) |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `audit_and_logs`  | Attributes | Audit and Logs · [nested schema](#nested-audit-and-logs) |
| `email`  | Attributes | Email · [nested schema](#nested-email) |
| `privacy_and_security`  | Attributes | Privacy and Security settings. See the environment Privacy + Security settings for more details. · [nested schema](#nested-privacy-and-security) |
| `product`  | Attributes | Product · [nested schema](#nested-product) |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Nested schemas

#### `audit_and_logs` {#nested-audit-and-logs}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `audit_settings`  | Attributes | Audit Settings. See [Audit Settings Overview](https://learn.microsoft.com/power-platform/admin/system-settings-dialog-box-auditing-tab) for more details. · [nested schema](#nested-audit-and-logs-audit-settings) |
| `plugin_trace_log_setting`  | String | Plugin trace log setting. Available options: Off, Exception, All. See [Plugin Trace Log Settings Overview](https://learn.microsoft.com/power-apps/developer/data-platform/logging-tracing) for more details.<br>Allowed: `Off`, `Exception`, `All` |

</div>

#### `audit_and_logs.audit_settings` {#nested-audit-and-logs-audit-settings}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `is_audit_enabled`  | Boolean | Is audit enabled |
| `is_read_audit_enabled`  | Boolean | Is read audit enabled |
| `is_user_access_audit_enabled`  | Boolean | Is user access audit enabled |
| `log_retention_period_in_days`  | Number | Retain these logs for. See [Start/stop auditing for an environment and set retention policy](https://learn.microsoft.com/power-platform/admin/manage-dataverse-auditing#startstop-auditing-for-an-environment-and-set-retention-policy) You can set a retention period for how long audit logs are kept in an environment. Under Retain these logs for, choose the period of time you wish to retain the logs. |

</div>

#### `email` {#nested-email}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `email_settings`  | Attributes | Email Settings. See [Email Settings Overview](https://learn.microsoft.com/power-platform/admin/settings-email) for more details. · [nested schema](#nested-email-email-settings) |

</div>

#### `email.email_settings` {#nested-email-email-settings}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `max_upload_file_size_in_bytes`  | Number | Maximum file size that can be uploaded to the environment |

</div>

#### `privacy_and_security` {#nested-privacy-and-security}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `blocked_attachment_extensions`  | Set of String | Blocked attachment extensions enforced at the environment level. |

</div>

#### `product` {#nested-product}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `behavior_settings`  | Attributes | Behavior Settings.See [Behavior Settings Overview](https://learn.microsoft.com/power-platform/admin/settings-behavior) for more details. · [nested schema](#nested-product-behavior-settings) |
| `features`  | Attributes | Features. See [Features Overview](https://learn.microsoft.com/power-platform/admin/settings-features) for more details. · [nested schema](#nested-product-features) |
| `security`  | Attributes | Security. See [Security Overview](https://learn.microsoft.com/en-us/power-platform/admin/settings-privacy-security) for more details. · [nested schema](#nested-product-security) |

</div>

#### `product.behavior_settings` {#nested-product-behavior-settings}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `show_dashboard_cards_in_expanded_state`  | Boolean | Show dashboard cards in expanded state |

</div>

#### `product.features` {#nested-product-features}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `ai_form_fill_automatic_suggestions`  | String | Allows AI to generate automatic suggestions<br>Allowed: `On`, `Off`, `Default` |
| `ai_form_fill_smart_paste_and_file_suggestions`  | String | Allows AI to provide smart paste and file suggestions<br>Allowed: `On`, `Off`, `Default` |
| `ai_form_fill_toolbar`  | String | Allows AI to provide a form fill toolbar with suggestions<br>Allowed: `On`, `Off`, `Default` |
| `allow_ai_to_generate_charts`  | String | Allow AI to generate charts to visualize the data in a view. [Learn more](https://go.microsoft.com/fwlink/?linkid=2300297)<br>Allowed: `On`, `Off`, `Auto` |
| `enable_access_to_session_transcripts_for_copilot_studio`  | Boolean | Allow agent access owners and editors to see session transcripts from conversations interactions in their agents. |
| `enable_ai_powered_chat`  | String | Allow users to analyze data using an AI-powered chat experience in [canvas](https://go.microsoft.com/fwlink/?linkid=2244583) and [model-driven apps](https://go.microsoft.com/fwlink/?linkid=2244584). [Learn more](https://go.microsoft.com/fwlink/?linkid=2247541) [Requires Copilot licensing](https://go.microsoft.com/fwlink/?linkid=2263413)<br>Allowed: `On`, `Off`, `Default` |
| `enable_ai_prompts`  | Boolean | Enable the AI prompts feature in Power Platform and Copilot Studio. [Learn more](https://go.microsoft.com/fwlink/?linkid=2283738) |
| `enable_copilot_answer_control`  | Boolean | Allow canvas editors to insert the Copilot answer component, which allows users to receive an AI-powered answer to a predefined data query. |
| `enable_copilot_studio_cross_geo_share_data_with_viva_insights`  | Boolean | Allow cross-geo sharing of aggregated analytics data if your tenant preferred data location for Viva Insights is different from the location of your Copilot Studio environment. |
| `enable_copilot_studio_share_data_with_viva_insights`  | Boolean | Allow Copilot Studio to share data with Viva Insights. |
| `enable_powerapps_maker_bot`  | Boolean | Enable new AI-powered Copilot features for people who make apps. [Learn more](https://go.microsoft.com/fwlink/?linkid=2223555) |
| `enable_preview_and_experimental_ai_models`  | Boolean | Let people use AI models that are experimental or in preview to make agents, prompts, apps, flow and more in Copilot Studio. [Learn more](https://go.microsoft.com/fwlink/?linkid=2331400) |
| `enable_transcript_recording_for_copilot_studio`  | Boolean | Allow conversation transcripts and their associated metadata to be saved in Dataverse (required for enhanced reporting). |
| `natural_language_grid_and_view_search`  | String | Find your data in model-driven app views with the help of Copilot. [Learn more](https://go.microsoft.com/fwlink/?linkid=2281374)<br>Allowed: `AllUsers`, `UserAsFeatureBecomesAvailable`, `NoOne` |
| `power_apps_component_framework_for_canvas_apps`  | Boolean | Power Apps component framework for canvas apps |

</div>

#### `product.security` {#nested-product-security}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `allow_application_user_access`  | Boolean | Allow application user access |
| `allow_microsoft_trusted_service_tags`  | Boolean | Allow Microsoft trusted service tags |
| `allowed_ip_range_for_firewall`  | Set of String | Allowed IP range for firewall |
| `allowed_service_tags_for_firewall`  | Set of String | Allowed service tags for firewall |
| `enable_ip_based_cookie_binding`  | Boolean | Enable IP based cookie binding |
| `enable_ip_based_firewall_rule`  | Boolean | Enable IP based firewall rule |
| `enable_ip_based_firewall_rule_in_audit_mode`  | Boolean | Enable IP based firewall rule in audit mode |
| `reverse_proxy_ip_addresses`  | Set of String | Reverse proxy IP addresses |

</div>

#### `timeouts` {#nested-timeouts}

---

<small>Data source generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/data-sources/environment_settings) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_settings/datasource_environment_settings.go)</small>
