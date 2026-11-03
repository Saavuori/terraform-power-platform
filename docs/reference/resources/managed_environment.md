---
title: powerplatform_managed_environment
description: "Manages a Managed Environment and associated settings."
outline: [2, 3]
editLink: false
---

# powerplatform_managed_environment

<TypeHeader name="powerplatform_managed_environment" kind="resource" />

Manages a [Managed Environment](https://learn.microsoft.com/power-platform/admin/managed-environment-overview) and associated settings. A Power Platform Managed Environment is a suite of premium capabilities that allows administrators to manage Power Platform at scale with more control, less effort, and more insights. Once an environment is managed, it unlocks additional features across the Power Platform

## Known Limitations

- **Environment Groups**: When an environment is part of an environment group, managed environment settings do not apply. Any updates or deletions of this resource will not change its attributes. A warning will be returned in the `terraform plan/apply` output.

## More Information

[Solution Checker enforcement](https://learn.microsoft.com/power-platform/admin/managed-environment-solution-checker).
- `timeouts` (Attributes) (see [below for nested schema](#nestedatt--timeouts))

### Read-Only

- `id` (String) Unique managed environment settings id (guid)
- `protection_level` (String) Protection level

&lt;a id="nestedatt--timeouts"&gt;&lt;/a&gt;
### Nested Schema for `timeouts`

Optional:

- `create` (String) A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).
- `delete` (String) A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Setting a timeout for a Delete operation is only applicable if changes are saved into state before the destroy operation occurs.
- `read` (String) A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours). Read operations occur during any refresh or planning operation when refresh is enabled.
- `update` (String) A string that can be [parsed as a duration](https://pkg.go.dev/time#ParseDuration) consisting of numbers and unit suffixes, such as "30s" or "2h45m". Valid time units are "s" (seconds), "m" (minutes), "h" (hours).

## Relationships

<RelationDiagram name="powerplatform_managed_environment" kind="resource" />

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

resource "powerplatform_environment" "development" {
  display_name     = "example_managed_environment"
  location         = "europe"
  environment_type = "Sandbox"
  dataverse = {
    language_code     = "1033"
    currency_code     = "USD"
    security_group_id = "00000000-0000-0000-0000-000000000000"
  }
}

resource "powerplatform_managed_environment" "managed_development" {
  environment_id                                     = powerplatform_environment.development.id
  is_usage_insights_disabled                         = true
  is_group_sharing_disabled                          = true
  limit_sharing_mode                                 = "ExcludeSharingToSecurityGroups"
  max_limit_user_sharing                             = 10
  solution_checker_mode                              = "Warn"
  suppress_validation_emails                         = true
  solution_checker_rule_overrides                    = toset(["meta-avoid-reg-no-attribute", "meta-avoid-reg-retrieve", "app-use-delayoutput-text-input"])
  power_automate_is_sharing_disabled                 = true
  copilot_allow_grant_editor_permissions_when_shared = false
  copilot_limit_sharing_mode                         = "ExcludeSharingToSecurityGroups"
  copilot_max_limit_user_sharing                     = 55
}
```

<OpenInBuilder type="powerplatform_managed_environment" />

## Schema

### Required

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `environment_id`  | String | Unique environment id (guid), of the environment that is managed by these settings |
| `is_group_sharing_disabled`  | Boolean | Limits how widely canvas apps can be shared. See [Managed Environment sharing limits](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#canvas-app-sharing-rules) for more details. |
| `is_usage_insights_disabled`  | Boolean | [Weekly insights digest for the environment](https://learn.microsoft.com/power-platform/admin/managed-environment-usage-insights) |
| `limit_sharing_mode`  | String | Limits how widely canvas apps can be shared. See [Managed Environment sharing limits](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#canvas-app-sharing-rules) for more details.<br>Allowed: `ExcludeSharingToSecurityGroups`, `NoLimit` |
| `max_limit_user_sharing`  | Number | Limits how many users can share canvas apps. if 'is_group_sharing_disabled' is 'False', then this values should be '-1' |
| `solution_checker_mode`  | String | Automatically verify solution checker results for security and reliability issues before solution import. See [Solution Checker enforcement](https://learn.microsoft.com/power-platform/admin/managed-environment-solution-checker) for more details.<br>Allowed: `None`, `Warn`, `Block` |
| `suppress_validation_emails`  | Boolean | Send emails only when a solution is blocked. If 'False', you'll also get emails when there are warnings |

</div>

### Optional

<div class="pp-attrs">

| Attribute | Type | Description |
| --- | --- | --- |
| `copilot_allow_grant_editor_permissions_when_shared`  | Boolean | Allow Power Automate Copilot to grant `Editor` permissions when agent is shared. See [Agent sharing rules](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#agent-sharing-rules) for more details. |
| `copilot_limit_sharing_mode`  | String | Limits how widely Copilot agents can be shared. Value `DisableSharing` will block granting `Viewer` permissions when sharing the agent. See [Agent sharing rules](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#agent-sharing-rules) for more details.<br>Allowed: `DisableSharing`, `ExcludeSharingToSecurityGroups`, `NoLimit` |
| `copilot_max_limit_user_sharing`  | Number | Limits how many users can share copilot agents. If 'is_group_sharing_disabled' is 'False', then this value should be '-1'. See [Agent sharing rules](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#agent-sharing-rules) for more details. |
| `power_automate_is_sharing_disabled`  | Boolean | If set to `true`, sharing of solution-aware cloud flows is disabled. If set to `false`, people can share solution-aware cloud flows. See [Solution-aware cloud flow sharing rules](https://learn.microsoft.com/power-platform/admin/managed-environment-sharing-limits?tabs=new#solution-aware-cloud-flow-sharing-rules) for more details. |
| `solution_checker_rule_overrides`  | Set of String | # Solution Checker Rules |

</div>

## Import

```shell
# Managed environment resource can be imported using the environment id (replace with a real environment id)
terraform import powerplatform_managed_environment.example 00000000-0000-0000-0000-000000000000
```

---

<small>Resource generated from the upstream schema docs (provider v4.2.1). [Terraform Registry](https://registry.terraform.io/providers/microsoft/power-platform/latest/docs/resources/managed_environment) · [Go source](https://github.com/microsoft/terraform-provider-power-platform/blob/main/internal/services/managed_environment/resource_managed_environment.go)</small>
