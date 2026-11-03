---
title: Authentication
description: Every way the Power Platform provider can sign in — Azure CLI, OIDC, client secret or certificate, managed identity — and which clouds it supports.
---

# Authentication

The provider never talks to Power Platform with a password. It asks Microsoft Entra ID for a token per API it is about to call, using exactly one credential that you choose in the provider block or through environment variables. Under the hood every option is an [azidentity](https://learn.microsoft.com/azure/developer/go/azure-sdk-authentication) credential from the Azure SDK for Go (`internal/api/auth.go`).

<FlowFigure name="auth">
Configure one credential; the provider exchanges it for a token per API scope and caches it for the run.
</FlowFigure>

## Pick a method

| Method | Provider block | Environment variables | Use it for |
| --- | --- | --- | --- |
| Azure CLI | `use_cli = true` | `POWER_PLATFORM_USE_CLI` | Local work as yourself |
| Azure Developer CLI | `use_dev_cli = true` | `POWER_PLATFORM_USE_DEV_CLI` | Local work with `azd` |
| OIDC (GitHub Actions, generic) | `use_oidc = true`, `client_id`, `tenant_id` | `POWER_PLATFORM_USE_OIDC`, `POWER_PLATFORM_CLIENT_ID`, `POWER_PLATFORM_TENANT_ID` | CI without secrets — recommended |
| Azure DevOps workload identity | `use_oidc = true`, `azdo_service_connection_id` | `POWER_PLATFORM_AZDO_SERVICE_CONNECTION_ID` | Azure Pipelines service connections |
| Client secret | `client_id`, `client_secret`, `tenant_id` | `POWER_PLATFORM_CLIENT_ID`, `POWER_PLATFORM_CLIENT_SECRET`, `POWER_PLATFORM_TENANT_ID` | CI where federation is not available |
| Client certificate | `client_certificate` or `client_certificate_file_path` | `POWER_PLATFORM_CLIENT_CERTIFICATE`, `POWER_PLATFORM_CLIENT_CERTIFICATE_FILE_PATH` | Certificate-based service principals |
| Managed identity | `use_msi = true` (+ `client_id` for user-assigned) | `POWER_PLATFORM_USE_MSI` | Runners on Azure compute |

Values set in the provider block win over environment variables.

::: tip Recommended setup
Use a service principal with OIDC federated credentials in pipelines and the Azure CLI on your machine. The [builder](/builder) writes the matching provider block and variables for whichever method you choose.
:::

## Examples

::: code-group

```hcl [Azure CLI]
provider "powerplatform" {
  use_cli = true
}
```

```hcl [OIDC]
provider "powerplatform" {
  use_oidc  = true
  client_id = var.client_id
  tenant_id = var.tenant_id
}
```

```hcl [Client secret]
provider "powerplatform" {
  client_id     = var.client_id
  client_secret = var.client_secret # mark the variable sensitive
  tenant_id     = var.tenant_id
}
```

```hcl [Managed identity]
provider "powerplatform" {
  use_msi = true
}
```

:::

## Before a service principal can sign in

1. Create an app registration in Entra ID (or use a managed identity).
2. **Register it with Power Platform as an admin management application.** An administrator has to do this; a service principal cannot register itself. Use [`powerplatform_admin_management_application`](/reference/resources/admin_management_application) from a run that signs in as an admin, or PowerShell.
3. Give it the Dataverse access it needs inside environments it did not create — [`powerplatform_environment_application_admin`](/reference/resources/environment_application_admin) adds it as a System Administrator application user.

::: warning Service principal limitations
The upstream documentation marks some types as not supported with service principal authentication: the Developer-environment preview of [`powerplatform_environment`](/reference/resources/environment), [`powerplatform_environment_wave`](/reference/resources/environment_wave), [`powerplatform_analytics_data_exports`](/reference/data-sources/analytics_data_exports) and [`powerplatform_tenant`](/reference/data-sources/tenant).
:::

## Clouds

Set `cloud` (or `POWER_PLATFORM_CLOUD`) when you are not in the public cloud. The provider swaps every endpoint and token scope for that cloud.

| `cloud` | BAPI endpoint | Sign-in authority |
| --- | --- | --- |
| `public` (default) | `api.bap.microsoft.com` | `login.microsoftonline.com` |
| `gcc` | `gov.api.bap.microsoft.us` | `login.microsoftonline.com` |
| `gcchigh` | `high.api.bap.microsoft.us` | `login.microsoftonline.us` |
| `dod` | `api.bap.appsplatform.us` | `login.microsoftonline.us` |
| `china` | `api.bap.partner.microsoftonline.cn` | `login.chinacloudapi.cn` |
| `ex` | `api.bap.eaglex.ic.gov` | `login.microsoftonline.eaglex.ic.gov` |
| `rx` | `api.bap.microsoft.scloud` | `login.microsoftonline.microsoft.scloud` |

Endpoints from `internal/constants/constants.go`. Sovereign clouds do not offer every feature of the public cloud, so check feature parity before relying on a resource there.

## Telemetry and attribution

Requests carry a `User-Agent`, an `x-ms-useragent` header and session / correlation ids so failures can be traced. `telemetry_optout = true` removes the user agent and session headers. `partner_id` adds your Customer Usage Attribution GUID; without one the provider sends a default Terraform partner id unless `disable_terraform_partner_id = true`.
