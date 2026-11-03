---
title: What changed
description: Recent releases of the Power Platform Terraform provider and what is coming in v5.0.0.
outline: [2, 3]
---

# What changed

The latest releases of `microsoft/power-platform`, taken from the upstream [CHANGELOG.md](https://github.com/microsoft/terraform-provider-power-platform/blob/main/CHANGELOG.md). Type names link to their reference pages.

## Coming in v5.0.0

| Type | Change |
| --- | --- |
| [`powerplatform_rest`](/reference/resources/rest) | `powerplatform_rest` will be removed in v5.0.0. Migrate to purpose-built resources for your use case before upgrading. If no suitable resource exists, open a GitHub issue requesting one. This removal does not affect the `powerplatform_rest_query` data source. |
| [`powerplatform_solution`](/reference/resources/solution) | `powerplatform_solution` will be replaced in v5.0.0 by `powerplatform_managed_solution` for managed solutions and `powerplatform_unmanaged_solution` for unmanaged solutions. When upgrading, migrate to the resource that matches your solution type. |
| [`powerplatform_user`](/reference/resources/user) | Import IDs will require the composite `environment_id/user_aad_id` format, where `user_aad_id` is the user's Microsoft Entra object ID (`aad_id`). Legacy single-ID imports will no longer be supported. Update import commands and import blocks when upgrading. This resource is not deprecated, and current import behavior remains unchanged until v5.0.0. |
| [`powerplatform_locations`](/reference/data-sources/locations) | This data source will additionally support macro regions, changing its response structure. When upgrading, update expressions and module outputs that consume its results to match the v5.0.0 schema. The data source itself is not deprecated; its current response structure remains unchanged until v5.0.0. |

## 4.2.1 <Badge type="info" text="2026-10-14" />

### Fixed

- [#1113](https://github.com/microsoft/terraform-provider-power-platform/issues/1113) Fix unintended IP firewall updates when configuring product features on non-managed environments
- [#1281](https://github.com/microsoft/terraform-provider-power-platform/issues/1281) Importing or refreshing [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set) no longer fails with `MaximumShareLimit value not found in response` for groups that have further `Sharing` parameters (for example `AuthoringBot`, created by the "Sharing agents with Editor permissions" rule in the admin center). `sharing_controls` is now read from the `App` sharing parameter only, and a missing `MaximumShareLimit` is read as null.
- [#1248](https://github.com/microsoft/terraform-provider-power-platform/issues/1248) Return the HTTP client error when a redirect policy fails instead of masking it with a response body read error
- [#1247](https://github.com/microsoft/terraform-provider-power-platform/issues/1247) Data sources now enforce the configured `timeouts.read` value
- [#1285](https://github.com/microsoft/terraform-provider-power-platform/issues/1285) [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set) no longer removes rule set parameters not managed by Terraform (e.g. `Sharing` for `AuthoringBot` set in the admin center) on update or destroy, and adopts an existing rule set on create instead of failing with `RuleSetAlreadyExistsError`
- [#1289](https://github.com/microsoft/terraform-provider-power-platform/issues/1289) Updating [`powerplatform_environment`](/reference/resources/environment) no longer shows untouched attributes (`allow_bing_search`, `allow_microsoft_365_services`, `allow_moving_data_across_regions`, `allow_flex_routing`, `dataverse.templates`, and `dataverse` for environments without Dataverse) as `(known after apply)`.
- [#1246](https://github.com/microsoft/terraform-provider-power-platform/issues/1246) Cap retries of transient HTTP statuses in the shared API client at MAX_RETRY_COUNT and repeated 401 responses at MAX_UNAUTHORIZED_RETRIES so permanent failures surface instead of retrying until the operation timeout

## 4.2.0 <Badge type="info" text="2026-09-08" />

### Added

- [#1089](https://github.com/microsoft/terraform-provider-power-platform/issues/1089) Add x-ms-useragent header to all backend requests when telemetry is not opted out
- [#1133](https://github.com/microsoft/terraform-provider-power-platform/issues/1133) Add powerplatform_publisher resource and powerplatform_publishers data source with Dataverse CRUD support and nested address handling. **Contributor: @AdamCoulterOz**.
- [#1225](https://github.com/microsoft/terraform-provider-power-platform/issues/1225) Add [`powerplatform_environment_variable_value`](/reference/resources/environment_variable_value) resource to manage current environment-scoped values for existing environment variable definitions; the resource manages only the value, definitions ship in solutions. It creates the value record for a definition that has none and updates the existing one otherwise. **Contributor: @AdamCoulterOz**.
- [#1143](https://github.com/microsoft/terraform-provider-power-platform/issues/1143) Add [`powerplatform_managed_solution`](/reference/resources/managed_solution) resource for identity-driven managed solution deployment with apply-time package validation for managed state, connection references, environment variable satisfiability, and dependency versions. **Contributor: @AdamCoulterOz**.
- [#946](https://github.com/microsoft/terraform-provider-power-platform/issues/946) Add powerplatform_environment_disaster_recovery resource to enable/disable disaster recovery for Power Platform environments
- [#1210](https://github.com/microsoft/terraform-provider-power-platform/issues/1210) Add `advanced_connector_policies_only`, `content_security_policy` and `advanced_connector_policies` rules to [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set), along with a computed `policy_id` attribute. These rules are served by the rule-based policies API rather than the rule sets API used by the remaining rules. An existing policy already assigned to the environment group is adopted rather than replaced, and a policy created by the resource is deleted again when the resource is destroyed. **Contributor: @metjuperry**.
- [#1209](https://github.com/microsoft/terraform-provider-power-platform/issues/1209) [`powerplatform_environment`](/reference/resources/environment) and [`powerplatform_environments`](/reference/data-sources/environments) adding `allow_microsoft_365_services` and `allow_flex_routing` attributes. **Contributor: @ferronsw**.
- [#1190](https://github.com/microsoft/terraform-provider-power-platform/issues/1190) Added [`powerplatform_rbac_role_assignment`](/reference/resources/rbac_role_assignment) resource to assign a Power Platform role to an enterprise application, user or group. The required `scope_type` names where it applies: `tenant`, `environment` with `environment_id`, or `environment_group` with `environment_group_id`. The role is selected by `role_definition_id` or `role_definition_name`. **Contributors: @metjuperry, @AdamCoulterOz**.
- [#1190](https://github.com/microsoft/terraform-provider-power-platform/issues/1190) Added [`powerplatform_role_definitions`](/reference/data-sources/role_definitions) data source to list the Power Platform roles that can be assigned at tenant, environment group or environment scope. **Contributor: @metjuperry**.
- [#1190](https://github.com/microsoft/terraform-provider-power-platform/issues/1190) Added [`powerplatform_rbac_role_assignments`](/reference/data-sources/rbac_role_assignments) data source to list role assignments. The required `scope_type` names which assignments to read: `tenant`, `environment` with `environment_id`, or `environment_group` with `environment_group_id`. **Contributors: @metjuperry, @AdamCoulterOz**.
- [#1223](https://github.com/microsoft/terraform-provider-power-platform/issues/1223) Add [`powerplatform_application_user`](/reference/resources/application_user) resource for managing non-interactive Dataverse application users (service principals) with business unit selection, live-user adoption on create, and disabled-state reconciliation. **Contributor: @AdamCoulterOz**.
- [#1224](https://github.com/microsoft/terraform-provider-power-platform/issues/1224) Add [`powerplatform_security_role_assignment`](/reference/resources/security_role_assignment) resource for assigning a Dataverse security role to a user, application user or team, independently of the principal's lifecycle. Set `system_user_id` or `team_id` for the principal, and `security_role_name` or `security_role_id` for the role. **Contributor: @AdamCoulterOz**.
- [#1226](https://github.com/microsoft/terraform-provider-power-platform/issues/1226) Add `privacy_and_security.blocked_attachment_extensions` support to [`powerplatform_environment_settings`](/reference/data-sources/environment_settings) resource and data source. **Contributor: @AdamCoulterOz**.
- [#1227](https://github.com/microsoft/terraform-provider-power-platform/issues/1227) Add `macro_region` to [`powerplatform_environment`](/reference/resources/environment) and the [`powerplatform_environments`](/reference/data-sources/environments) data source, plus a new [`powerplatform_macro_regions`](/reference/data-sources/macro_regions) data source. Environment creation previously failed on tenants that provision by macro region, where the service rejects `location` outright.

### Deprecated

- [#860](https://github.com/microsoft/terraform-provider-power-platform/issues/860) docs: announce the v5.0.0 removal of the [`powerplatform_rest`](/reference/resources/rest) resource. Migrate to purpose-built resources before upgrading. The [`powerplatform_rest_query`](/reference/data-sources/rest_query) data source is not affected. The resource remains supported until v5.0.0.
- [#1136](https://github.com/microsoft/terraform-provider-power-platform/issues/1136) docs: announce the v5.0.0 replacement of [`powerplatform_solution`](/reference/resources/solution) by [`powerplatform_managed_solution`](/reference/resources/managed_solution) and `powerplatform_unmanaged_solution`. Plan migration according to the solution type when upgrading. The existing resource remains supported until v5.0.0.
- [#969](https://github.com/microsoft/terraform-provider-power-platform/issues/969) docs: announce the v5.0.0 removal of `powerplatform_tenant_capacity.tenant_id`. Remove configurations and references using this attribute; capacity is fetched for the tenant configured in the provider. The attribute remains supported until v5.0.0.
- [#959](https://github.com/microsoft/terraform-provider-power-platform/issues/959) docs: announce v5.0.0 deprecations for [`powerplatform_tenant_settings`](/reference/data-sources/tenant_settings) (resource and data source). `disable_survey_feedback`, `disable_nps_comments_reachout`, and `power_platform.intelligence.enable_open_ai_bot_publishing` will be renamed or moved within tenant settings. Update configurations and references to match the v5.0.0 schema when upgrading. `power_platform.power_apps.disable_create_from_image` and `power_platform.power_apps.disable_create_from_figma` will be removed with no replacement. Current attributes remain supported until v5.0.0.

### Fixed

- [#1066](https://github.com/microsoft/terraform-provider-power-platform/issues/1066) Fix managed environment import failing due to missing environment_id attribute in import state
- [#1102](https://github.com/microsoft/terraform-provider-power-platform/issues/1102) Fix powerplatform_environment delete failing when lifecycle operation poll returns 404 after environment is already deleted
- [#1112](https://github.com/microsoft/terraform-provider-power-platform/issues/1112) Fixed crash when importing powerplatform_environment_group_rule_set caused by testify assert calls in production DTO conversion code
- [#1122](https://github.com/microsoft/terraform-provider-power-platform/issues/1122) Fixed managed environment import failing when environment does not have managed environment settings enabled
- [#1129](https://github.com/microsoft/terraform-provider-power-platform/issues/1129) Handle missing parent environments for powerplatform_user resources during refresh and delete. **Contributor: @AdamCoulterOz**.
- [#1130](https://github.com/microsoft/terraform-provider-power-platform/issues/1130) Preserve dataverse security group updates when updating existing environments. **Contributor: @AdamCoulterOz**.
- [#1138](https://github.com/microsoft/terraform-provider-power-platform/issues/1138) Fix create-time powerplatform_solution.settings_file_checksum plan inconsistency when settings_file is generated during the same apply. **Contributor: @AdamCoulterOz**.
- [#1139](https://github.com/microsoft/terraform-provider-power-platform/issues/1139) Fix connection parameter apply state normalization. **Contributor: @AdamCoulterOz**.
- [#1165](https://github.com/microsoft/terraform-provider-power-platform/issues/1165) Child resources (environment_settings, enterprise_policy, connection_share, connection, data_record, environment_application_admin, billing_policy_environment, environment_disaster_recovery, environment_wave, user) now remove themselves from state when their parent resource no longer exists, instead of failing indefinitely during refresh
- [#1210](https://github.com/microsoft/terraform-provider-power-platform/issues/1210) Fixed [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set) returning "Provider produced inconsistent result after apply" for `share_max_limit` when `share_mode` was changed to `no limit`. **Contributor: @metjuperry**.
- [#1210](https://github.com/microsoft/terraform-provider-power-platform/issues/1210) Fixed [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set) losing `maker_welcome_content` after the rule was edited in the Power Platform admin center. Maker welcome content is now written to the rule-based policies API, which is where the admin center stores it, and is still read from the legacy rule set for rule sets created before the move. **Contributor: @metjuperry**.
- [#1211](https://github.com/microsoft/terraform-provider-power-platform/issues/1211) Importing an existing [`powerplatform_data_record`](/reference/resources/data_record) failed with ENVIRONMENT_URL_NOT_FOUND because the import id was not parsed into `environment_id` and `table_logical_name`
- [#1193](https://github.com/microsoft/terraform-provider-power-platform/issues/1193) powerplatform_environment no longer returns stale allow_bing_search and allow_moving_data_across_regions values after apply, and no longer disables allow_microsoft_365_services and allow_flex_routing when they are not configured
- [#1199](https://github.com/microsoft/terraform-provider-power-platform/issues/1199) powerplatform_environment no longer returns a null dataverse after create when the Power Platform API reports the environment lifecycle operation as succeeded before the Dataverse metadata is readable
- [#1237](https://github.com/microsoft/terraform-provider-power-platform/issues/1237) Environment creation outside the EU data boundary no longer fails when `allow_flex_routing` is unset; unknown Optional+Computed copilot policy attributes are no longer sent as `false`. **Contributor: @AdamCoulterOz**.
- [#1238](https://github.com/microsoft/terraform-provider-power-platform/issues/1238) Environment creation now saves state as soon as the environment exists, so a failure in a later step no longer leaves an untracked environment that blocks the next apply with `DomainNameAlreadyInUse`. **Contributor: @AdamCoulterOz**.
- [#1238](https://github.com/microsoft/terraform-provider-power-platform/issues/1238) `billing_policy_id` is confirmed against the licensing service instead of the environment record, fixing "Provider produced inconsistent result after apply". **Contributor: @AdamCoulterOz**.
- [#1238](https://github.com/microsoft/terraform-provider-power-platform/issues/1238) An `environment_group_id` of the empty guid is no longer sent when creating an environment. It previously put the environment in a group, which blocked [`powerplatform_managed_environment`](/reference/resources/managed_environment) from ever being enabled on it. **Contributor: @AdamCoulterOz**.
- [#1239](https://github.com/microsoft/terraform-provider-power-platform/issues/1239) Enabling a managed environment no longer treats a 409 as success, which silently skipped enablement. Whether an environment is already managed is now read from `protectionLevel` rather than from whether settings are present. **Contributor: @AdamCoulterOz**.
- [#1236](https://github.com/microsoft/terraform-provider-power-platform/issues/1236) powerplatform_environment now rejects allow_flex_routing outside of the EU Data Boundary with a clear error instead of an opaque API 400
- [#1236](https://github.com/microsoft/terraform-provider-power-platform/issues/1236) powerplatform_connection now retries while the connectivity endpoint has not yet caught up with a newly created environment
- [#1244](https://github.com/microsoft/terraform-provider-power-platform/issues/1244) A cancelled or timed out retry loop no longer returns an empty 503. It returns the last real HTTP failure instead. **Contributor: @AdamCoulterOz**.
- [#1236](https://github.com/microsoft/terraform-provider-power-platform/issues/1236) powerplatform_managed_solution now retries Dataverse reads that a freshly provisioned environment rejects with 403, and access denied errors report the service response body
- [#1240](https://github.com/microsoft/terraform-provider-power-platform/issues/1240) Managed environment disable and enterprise policy operations now verify the requested state before treating a 409 response as success. **Contributor: @shin4141**.
- [#1257](https://github.com/microsoft/terraform-provider-power-platform/issues/1257) Billing policy create and delete now use the same `/licensing/billingPolicies` path spelling as the other billing policy calls and as the published API. **Contributor: @AdamCoulterOz**.
- [#1258](https://github.com/microsoft/terraform-provider-power-platform/issues/1258) Removed three internal API client methods that no resource or data source called. **Contributor: @AdamCoulterOz**.
- [#1259](https://github.com/microsoft/terraform-provider-power-platform/issues/1259) Wait for managed environment enablement to propagate after lifecycle completion

### Documentation

- [#1210](https://github.com/microsoft/terraform-provider-power-platform/issues/1210) Removed the service principal limitation and preview notes from [`powerplatform_environment_group_rule_set`](/reference/resources/environment_group_rule_set); the full create, read, update and delete lifecycle is verified against service principal authentication by acceptance tests. **Contributor: @metjuperry**.
- [#1266](https://github.com/microsoft/terraform-provider-power-platform/issues/1266) docs: announce an upcoming breaking change to [`powerplatform_user`](/reference/resources/user) imports in v5.0.0. Import IDs will require the composite `environment_id/user_aad_id` format, where `user_aad_id` is the Microsoft Entra object ID (`aad_id`). Legacy single-ID imports will no longer be supported; update import commands and import blocks when upgrading. The resource itself is not deprecated, and current import behavior remains unchanged until v5.0.0.
- [#1266](https://github.com/microsoft/terraform-provider-power-platform/issues/1266) docs: announce an upcoming breaking change to the [`powerplatform_locations`](/reference/data-sources/locations) response structure in v5.0.0. The data source will additionally support macro regions, changing its response structure. Update expressions and module outputs consuming its results to match the v5.0.0 schema when upgrading. The data source itself is not deprecated, and its current response structure remains unchanged until v5.0.0.

### New Contributors

- @AdamCoulterOz
- @ferronsw
- @metjuperry
- @shin4141

## 4.1.0 <Badge type="info" text="2026-01-23" />

### Changed

- [#917](https://github.com/microsoft/terraform-provider-power-platform/issues/917) Extended powerplatform_enterprise_policy resource to support Identity policy type

### Deprecated

- [#1039](https://github.com/microsoft/terraform-provider-power-platform/issues/1039) Deprecated tenant settings attributes: 'disable_survey_feedback', 'disable_nps_comments_reachout', 'disable_create_from_image', 'disable_create_from_figma' and 'enable_open_ai_bot_publishing'

### Fixed

- [#922](https://github.com/microsoft/terraform-provider-power-platform/issues/922) Change error to warning when deactivating system user in Delete method for powerplatform_environment_application_admin resource

### Documentation

- [#1035](https://github.com/microsoft/terraform-provider-power-platform/issues/1035) Add import instructions and examples for billing_policy_environment, connection, connection_share, data_record, environment_group_rule_set, environment_settings, managed_environment, solution, tenant_isolation_policy, tenant_settings, and user resources

## 4.0.0 <Badge type="info" text="2025-12-16" />

### Breaking

- [#1000](https://github.com/microsoft/terraform-provider-power-platform/issues/1000) powerplatform_managed_environment removing no longer supported attributes (maker_onboarding_markdown, maker_onboarding_url) added new attributes (power_automate_is_sharing_disabled, copilot_allow_grant_editor_permissions_when_shared, copilot_limit_sharing_mode, copilot_max_limit_user_sharing)

### Fixed

- [#931](https://github.com/microsoft/terraform-provider-power-platform/issues/931) Fixed error when environment is part of an Environment Group by adding warning instead of error when managed environment settings cannot be applied
- [#984](https://github.com/microsoft/terraform-provider-power-platform/issues/984) Deprecate tenant_id attribute in tenant capacity data source and migrate to new API endpoint with expanded response structure
- [#1006](https://github.com/microsoft/terraform-provider-power-platform/issues/1006) Handle 404 status on environment read/delete as deleted resource instead of fatal error

## 3.9.1 <Badge type="info" text="2025-10-06" />

### Fixed

- [#943](https://github.com/microsoft/terraform-provider-power-platform/issues/943) Fixed custom connector URL patterns in data loss prevention policies to maintain correct order based on rule order property

## 3.9.0 <Badge type="info" text="2025-10-01" />

### Changed

- [#928](https://github.com/microsoft/terraform-provider-power-platform/issues/928) Enhanced powerplatform_connectors data source to support filtering by environment_id
- [#910](https://github.com/microsoft/terraform-provider-power-platform/issues/910) Extended powerplatform_environment_settings resource to support new AI-powered features including Copilot Studio settings, PowerApps Maker Bot, AI form fill capabilities, and natural language search features

### Fixed

- [#877](https://github.com/microsoft/terraform-provider-power-platform/issues/877) update API permissions for Power Platform Provider documentation
- [#878](https://github.com/microsoft/terraform-provider-power-platform/issues/878) update power catalog audience setting validation to include SpecificAdmins option and correct string validator option
