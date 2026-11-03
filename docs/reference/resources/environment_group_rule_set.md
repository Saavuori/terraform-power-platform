---
title: powerplatform_environment_group_rule_set
description: "Allows the creation of environment group rulesets."
outline: [2, 3]
editLink: false
---

# powerplatform_environment_group_rule_set

<TypeHeader name="powerplatform_environment_group_rule_set" kind="resource" />

Allows the creation of environment group rulesets. See [Power Platform documentation](https://learn.microsoft.com/power-platform/admin/environment-groups) for more information on the available rules that can be applied to an environment group.

## Relationships

<RelationDiagram name="powerplatform_environment_group_rule_set" kind="resource" />

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

resource "powerplatform_environment_group" "example_group" {
  display_name = "example_environment_group_ruleset"
  description  = "Example environment group"
}

resource "powerplatform_environment_group_rule_set" "example_group_rule_set" {
  environment_group_id = powerplatform_environment_group.example_group.id
  rules = {
    sharing_controls = {
      share_mode      = "exclude sharing with security groups"
      share_max_limit = 42
    }

    usage_insights = {
      insights_enabled = false
    }

    maker_welcome_content = {
      maker_onboarding_url      = "https://contoso.com/onboarding"
      maker_onboarding_markdown = "## Welcome to the environment!\n\n**This is a markdown description.**"
    }

    solution_checker_enforcement = {
      solution_checker_mode = "block"
      send_emails_enabled   = true
    }

    backup_retention = {
      period_in_days = 21
    }

    ai_generated_descriptions = {
      ai_description_enabled = false
    }

    ai_generative_settings = {
      move_data_across_regions_enabled = true
      bing_search_enabled              = false
    }

    advanced_connector_policies_only = {
      enabled = true
    }

    content_security_policy = {
      enabled               = true
      enabled_for_canvas    = true
      enabled_for_code_apps = true

      configuration = {
        img_src     = ["https://example.com"]
        connect_src = ["https://api.example.com"]
        strict_csp  = true
      }

      configuration_for_canvas = {
        connect_src = ["https://canvas-api.example.com"]
        strict_csp  = true
      }

      configuration_for_code_apps = {
        script_src = ["https://cdn.example.com"]
      }
    }

    advanced_connector_policies = {
      allowed_connectors = [
        {
          connector_id = "shared_commondataservice"
          actions_mode = "all_allowed"
        },
        {
          connector_id    = "shared_office365"
          actions_mode    = "some_allowed"
          allowed_actions = ["SendEmail", "GetEvents"]
        }
      ]
    }
  }
}
```

<OpenInBuilder type="powerplatform_environment_group_rule_set" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_group_id`  | String | Unique id of the environment group |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `rules`  | Attributes | Rules for the environment group · [nested schema](#nested-rules) |
| `timeouts`  | Attributes | — · [nested schema](#nested-timeouts) |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique id of the environment group ruleset |
| `policy_id`  | String | Unique id of the rule-based policy backing `maker_welcome_content`, `advanced_connector_policies_only`, `content_security_policy` and `advanced_connector_policies`. Null when none of those rules are configured. |

</div>

### Nested schemas

#### `rules` {#nested-rules}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `advanced_connector_policies`  | Attributes | Manages which connectors are allowed and what actions they can perform in environments within this group. · [nested schema](#nested-rules-advanced-connector-policies) |
| `advanced_connector_policies_only`  | Attributes | Controls whether only advanced connector policies are applied to environments in this group. When enabled, environments in the group will only use advanced connector policies. · [nested schema](#nested-rules-advanced-connector-policies-only) |
| `ai_generated_descriptions`  | Attributes | AI Generated Descriptions · [nested schema](#nested-rules-ai-generated-descriptions) |
| `ai_generative_settings`  | Attributes | AI Generative Settings · [nested schema](#nested-rules-ai-generative-settings) |
| `backup_retention`  | Attributes | Backup Retention · [nested schema](#nested-rules-backup-retention) |
| `content_security_policy`  | Attributes | Configures the [Content Security Policy (CSP)](https://learn.microsoft.com/power-platform/admin/content-security-policy) for Power Apps in this environment group. · [nested schema](#nested-rules-content-security-policy) |
| `maker_welcome_content`  | Attributes | Maker Welcome Content · [nested schema](#nested-rules-maker-welcome-content) |
| `sharing_controls`  | Attributes | Sharing controls · [nested schema](#nested-rules-sharing-controls) |
| `solution_checker_enforcement`  | Attributes | Solution Checker Enforcement · [nested schema](#nested-rules-solution-checker-enforcement) |
| `usage_insights`  | Attributes | Usage Insights · [nested schema](#nested-rules-usage-insights) |

</div>

#### `rules.advanced_connector_policies` {#nested-rules-advanced-connector-policies}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `allowed_connectors`  | Attributes List | List of connectors that are allowed in the environment group · [nested schema](#nested-rules-advanced-connector-policies-allowed-connectors) |

</div>

#### `rules.advanced_connector_policies.allowed_connectors` {#nested-rules-advanced-connector-policies-allowed-connectors}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `actions_mode`  | String | Controls which actions are allowed for this connector. Use `all_allowed` to permit all actions, or `some_allowed` to restrict to specific actions listed in `allowed_actions`.<br>Allowed: `all_allowed`, `some_allowed` |
| `connector_id`  | String | Short connector identifier (e.g., `shared_commondataservice`). The provider automatically prepends `/providers/Microsoft.PowerApps/apis/`. |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `allowed_actions`  | List of String | List of specific action names allowed for this connector. Only used when `actions_mode` is `some_allowed`. |

</div>

#### `rules.advanced_connector_policies_only` {#nested-rules-advanced-connector-policies-only}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enabled`  | Boolean | Enable advanced connector policies only |

</div>

#### `rules.ai_generated_descriptions` {#nested-rules-ai-generated-descriptions}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `ai_description_enabled`  | Boolean | Enable AI generated description |

</div>

#### `rules.ai_generative_settings` {#nested-rules-ai-generative-settings}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `bing_search_enabled`  | Boolean | Agree to enable Bing search features |
| `move_data_across_regions_enabled`  | Boolean | Agree to move data across regions |

</div>

#### `rules.backup_retention` {#nested-rules-backup-retention}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `period_in_days`  | Number | Backup retention period in days: 7, 14, 21, 28<br>Allowed: `7`, `14`, `21`, `28` |

</div>

#### `rules.content_security_policy` {#nested-rules-content-security-policy}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `enabled`  | Boolean | Enable Content Security Policy for model-driven apps |
| `enabled_for_canvas`  | Boolean | Enable Content Security Policy for canvas apps |
| `enabled_for_code_apps`  | Boolean | Enable Content Security Policy for code-first apps |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `configuration`  | Attributes | CSP directive configuration for model-driven apps. Each attribute is a list of allowed source URIs. · [nested schema](#nested-rules-content-security-policy-configuration) |
| `configuration_for_canvas`  | Attributes | CSP directive configuration for canvas apps. Each attribute is a list of allowed source URIs. · [nested schema](#nested-rules-content-security-policy-configuration-for-canvas) |
| `configuration_for_code_apps`  | Attributes | CSP directive configuration for code-first apps. Each attribute is a list of allowed source URIs. · [nested schema](#nested-rules-content-security-policy-configuration-for-code-apps) |
| `report_uri`  | String | URI to send CSP violation reports to |
| `reporting_endpoint`  | String | Reporting endpoint for CSP violations |

</div>

#### `rules.content_security_policy.configuration` {#nested-rules-content-security-policy-configuration}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connect_src`  | List of String | Allowed sources for fetch, XHR, WebSocket (`connect-src` directive) |
| `font_src`  | List of String | Allowed sources for fonts (`font-src` directive) |
| `form_action`  | List of String | Allowed targets for form submissions (`form-action` directive) |
| `frame_ancestor`  | List of String | Allowed sources that can embed this content (`frame-ancestors` directive) |
| `frame_src`  | List of String | Allowed sources for frames (`frame-src` directive) |
| `img_src`  | List of String | Allowed sources for images (`img-src` directive) |
| `script_src`  | List of String | Allowed sources for scripts (`script-src` directive) |
| `strict_csp`  | Boolean | When `true`, enables strict Content Security Policy enforcement for model-driven apps. |
| `style_src`  | List of String | Allowed sources for stylesheets (`style-src` directive) |

</div>

#### `rules.content_security_policy.configuration_for_canvas` {#nested-rules-content-security-policy-configuration-for-canvas}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connect_src`  | List of String | Allowed sources for fetch, XHR, WebSocket (`connect-src` directive) |
| `font_src`  | List of String | Allowed sources for fonts (`font-src` directive) |
| `form_action`  | List of String | Allowed targets for form submissions (`form-action` directive) |
| `frame_ancestor`  | List of String | Allowed sources that can embed this content (`frame-ancestors` directive) |
| `frame_src`  | List of String | Allowed sources for frames (`frame-src` directive) |
| `img_src`  | List of String | Allowed sources for images (`img-src` directive) |
| `script_src`  | List of String | Allowed sources for scripts (`script-src` directive) |
| `strict_csp`  | Boolean | When `true`, enables strict Content Security Policy enforcement for canvas apps. |
| `style_src`  | List of String | Allowed sources for stylesheets (`style-src` directive) |

</div>

#### `rules.content_security_policy.configuration_for_code_apps` {#nested-rules-content-security-policy-configuration-for-code-apps}

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `connect_src`  | List of String | Allowed sources for fetch, XHR, WebSocket (`connect-src` directive) |
| `font_src`  | List of String | Allowed sources for fonts (`font-src` directive) |
| `form_action`  | List of String | Allowed targets for form submissions (`form-action` directive) |
| `frame_ancestor`  | List of String | Allowed sources that can embed this content (`frame-ancestors` directive) |
| `frame_src`  | List of String | Allowed sources for frames (`frame-src` directive) |
| `img_src`  | List of String | Allowed sources for images (`img-src` directive) |
| `script_src`  | List of String | Allowed sources for scripts (`script-src` directive) |
| `style_src`  | List of String | Allowed sources for stylesheets (`style-src` directive) |

</div>

#### `rules.maker_welcome_content` {#nested-rules-maker-welcome-content}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `maker_onboarding_markdown`  | String | Maker onboarding markdown |
| `maker_onboarding_url`  | String | Maker onboarding URL |

</div>

#### `rules.sharing_controls` {#nested-rules-sharing-controls}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `share_mode`  | String | Share mode for canvas apps: `No limit`, `Exclude sharing with security groups`<br>Allowed: `no limit`, `exclude sharing with security groups` |

</div>

**Optional**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `share_max_limit`  | Number | Maximum total of individual who can be shared to: (-1..99). If `share_mode` is `No limit`, this value must be -1. |

</div>

#### `rules.solution_checker_enforcement` {#nested-rules-solution-checker-enforcement}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `send_emails_enabled`  | Boolean | Send emails only when solution is blocked, if unchecked you'll also get emails when there are warnings |
| `solution_checker_mode`  | String | Solution checker enforceemnt mode: none, warm, block<br>Allowed: `none`, `warn`, `block` |

</div>

#### `rules.usage_insights` {#nested-rules-usage-insights}

**Required**

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `insights_enabled`  | Boolean | Inculde insights for all Managed Environment in this group in weekly email digest. |

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

## Import

```shell
# Environment group rule set resource can be imported using the environment group rule set id (replace with a real environment group rule set id)
terraform import powerplatform_environment_group_rule_set.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/environment_group_rule_set) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/environment_group_rule_set/resource_environment_group_rule_set.go)</small>
