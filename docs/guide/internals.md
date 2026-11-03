---
title: Provider internals
description: How the Power Platform Terraform provider is built — repository layout, the path of a resource call, the API client's retries and polling, authentication, and which service calls which API.
---

<script setup>
import { types } from '../.vitepress/theme/lib/graph.js'
const services = new Set(types.map((t) => t.service).filter(Boolean)).size
</script>

# Provider internals

The provider is a Go program built on HashiCorp's [terraform-plugin-framework](https://developer.hashicorp.com/terraform/plugin/framework). Knowing its shape helps when a plan does something surprising, when you read a debug log, or when you want to contribute.

## Repository layout

```text
terraform-provider-power-platform/
├── main.go                     providerserver.Serve(…) — the plugin entry point
├── internal/
│   ├── provider/               provider schema, configuration, resource & data source registry
│   ├── api/                    shared HTTP client: auth, retries, lifecycle polling
│   ├── config/                 provider config model, cloud selection
│   ├── constants/              endpoints per cloud, header names, retry limits
│   ├── services/<name>/        one package per feature: resources, data sources, DTOs, API calls
│   ├── validators/ modifiers/  custom attribute validators and plan modifiers
│   ├── customtypes/ helpers/   shared types (e.g. UUID) and utilities
│   └── mocks/                  HTTP mock helpers for unit tests
├── docs/                       generated registry docs (tfplugindocs)
├── examples/                   example configurations used by the docs
└── templates/                  doc templates
```

There are {{ services }} service packages. Each one usually holds `resource_<name>.go`, `datasource_<name>.go`, `api_<name>.go` (the HTTP calls), `dto.go` (wire format) and `models.go` (Terraform state), plus tests.

## The path of a resource call

<FlowFigure name="request">
A <code>terraform apply</code> reaches the provider over gRPC, becomes a typed CRUD call on a resource, and ends as authenticated HTTPS requests to one or more Power Platform APIs.
</FlowFigure>

1. **Terraform core** calls the provider over the plugin protocol.
2. **The provider server** (plugin framework) validates configuration against the resource schema, runs validators such as `ExactlyOneOf(location, macro_region)` and plan modifiers, and dispatches to the resource.
3. **The resource** implements `Schema`, `Create`, `Read`, `Update`, `Delete` and usually `ImportState`. Several also implement `ValidateConfig` and `ModifyPlan` for checks that span attributes.
4. **The service client** in `api_<name>.go` turns the plan into DTOs and requests.
5. **The API client** in `internal/api` adds the bearer token and telemetry headers, retries transient failures and polls long-running operations.

## The API client

| Behaviour | Detail |
| --- | --- |
| Retries | Transient HTTP statuses are retried up to `MAX_RETRY_COUNT` (10); a rejected token is replayed at most `MAX_UNAUTHORIZED_RETRIES` (2) times, so permanent failures surface instead of spinning until the timeout. |
| Back-off | Honours the `Retry-After` header. |
| Long-running operations | Environment lifecycle calls return a `Location` header; the client polls it until the operation completes. |
| Timeouts | Most resources accept a `timeouts` block; the default operation timeout is 20 minutes. Data sources enforce `timeouts.read`. |
| Dataverse metadata | BAPI can report an environment as created before its Dataverse metadata is readable, so the client polls for it separately, up to 30 times. |
| Telemetry | `User-Agent`, `x-ms-useragent`, `X-Correlation-Id` and `X-Ms-Client-Session-Id` headers, removable with `telemetry_optout`. |

Child resources (settings, connections, users, billing links and others) remove themselves from state when their parent environment no longer exists, instead of failing every refresh.

## Authentication

`internal/api/auth.go` creates one [azidentity](https://pkg.go.dev/github.com/Azure/azure-sdk-for-go/sdk/azidentity) credential per configured method — Azure CLI, Azure Developer CLI, client secret, client certificate, client assertion (OIDC), Azure DevOps workload identity federation, or system / user-assigned managed identity — and requests a token per API scope. Credentials are reused for the whole run. See [Authentication](/guide/authentication) for configuration.

## Which service calls which API

Power Platform is not one API. The provider talks to several, and the same resource can span more than one — an environment is created through BAPI, but its settings are written to Dataverse.

<ApiMatrix />

| API | Host (public cloud) | Used for |
| --- | --- | --- |
| BAPI | `api.bap.microsoft.com` | Environment lifecycle, DLP, tenant settings, Managed Environments, enterprise policies |
| Power Platform API | `api.powerplatform.com` | Environment groups and rule sets, licensing and billing, RBAC, connections, analytics |
| Dataverse Web API | `<org>.crm*.dynamics.com/api/data/v9.2` | Records, solutions, users and roles, publishers, environment variables, settings |
| Power Apps API | `api.powerapps.com` | Connectors and apps |
| Admin API | `api.admin.powerplatform.microsoft.com` | Environment waves |
| Advisor API | `api.advisor.powerapps.com` | Solution checker rules |

## Tests

The repository has two layers of tests:

- **Unit tests** replace HTTP with [httpmock](https://github.com/jarcoal/httpmock) responders and run the real resource code against recorded responses. Most packages have them.
- **Acceptance tests** (`TF_ACC=1`) apply real configurations against a tenant.

Docs are generated with `tfplugindocs` from the schemas and the files in `examples/`, which is also where this site reads them from.
