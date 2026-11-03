---
title: powerplatform_copilot_studio_application_insights
description: "Manages the Application Insights configuration for a Copilot."
outline: [2, 3]
---

# powerplatform_copilot_studio_application_insights

<TypeHeader name="powerplatform_copilot_studio_application_insights" kind="resource" />

Manages the [Application Insights configuration for a Copilot](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry?tabs=webApp).

**Note:** This resource is available as **preview**

**Known Limitation**: This resource currently does not work when authenticated using service principal.

## Relationships

<RelationDiagram name="powerplatform_copilot_studio_application_insights" kind="resource" />

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

resource "powerplatform_copilot_studio_application_insights" "cps_app_insights_config" {
  environment_id                         = var.environment_id
  bot_id                                 = var.bot_id
  application_insights_connection_string = var.application_insights_connection_string
  include_activities                     = true
  include_sensitive_information          = false
  include_actions                        = false
}
```

<OpenInBuilder type="powerplatform_copilot_studio_application_insights" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `application_insights_connection_string`  | String | The connection string for the target Application Insights resource in Azure. If needed, follow [these instructions](https://learn.microsoft.com/en-us/azure/azure-monitor/app/connection-strings?tabs=net#find-your-connection-string) to find your connection string. |
| `bot_id`  | String | The ID of the Copilot for which the Application Insights configuration is to be managed. |
| `environment_id`  | String | Environment ID for the Power Platform environment where the Copilot exists |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `include_actions`  | Boolean | Whether to log an event each time a node within a topic is executed. |
| `include_activities`  | Boolean | Whether to log details of incoming/outgoing messages and events. |
| `include_sensitive_information`  | Boolean | Whether to log sensitive properties such as user ID, name, and text. |

</div>

### Read-only

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `id`  | String | Unique id of the Copilot Studio Application Insights configuration |

</div>

## Import

```shell
# Copilot Application Insights resource can be imported using the id in format `<environmentid>_<botid>` (replace with a real id guid)
terraform import powerplatform_copilot_studio_application_insights.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/copilot_studio_application_insights) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/copilot_studio_application_insights/resource_copilot_studio_application_insights.go)</small>
