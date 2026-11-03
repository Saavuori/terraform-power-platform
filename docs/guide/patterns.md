---
title: Architecture patterns
description: Reference layouts for the Power Platform Terraform provider — ALM, governance, pay-as-you-go billing, private networking with customer-managed keys, and Copilot Studio agents.
---

# Architecture patterns

Each pattern below is a builder template: the drawing, the dependency order and the Terraform all come from the same design. Switch a figure to **Apply order** to see which resources Terraform can create in parallel, or open it in the builder to change it.

## Dev / Test / Prod with ALM

The classic three-stage setup. All three environments are managed and live in one environment group, so the group's rule set enforces solution checker, sharing limits and backup retention everywhere at once. Test and Prod receive the same managed solution; a deployment identity gets an application user with System Administrator rights in each.

<PatternFigure template="alm" />

- The publisher lives in Dev, where the unmanaged solution is built. Managed solutions in Test and Prod carry the publisher with them.
- `application_id` of the deployment identity becomes a variable — create the app registration with `azuread`, or pass the client id in.
- Grouping removes the need to tune each `powerplatform_managed_environment`: the provider warns that its settings do not apply inside a group.

## Governance baseline

Tenant-wide guardrails that every tenant should have before makers arrive: tenant settings that stop non-admins creating environments, a DLP policy that keeps business data in Microsoft 365 connectors, tenant isolation, and default environment routing that sends new makers to their own developer environment inside a governed group.

<PatternFigure template="governance" />

- `environment_routing_target_environment_group_id` in tenant settings points at the group; makers' new developer environments land there with the group's rules applied.
- The RBAC role assignment grants a reader role on the whole group. The RBAC API is in preview.
- A DLP policy needs every connector it mentions classified. The [upstream example](https://github.com/microsoft/terraform-provider-power-platform/tree/main/examples/resources/powerplatform_data_loss_prevention_policy) shows how to derive the non-business and blocked lists from `data.powerplatform_connectors`.

## Pay-as-you-go billing

A billing policy links Power Platform usage to an Azure subscription. One policy can pay for many environments, attached either through the environments' `billing_policy_id` or — as here — through one `powerplatform_billing_policy_environment` that lists them.

<PatternFigure template="payg" />

- The subscription id and resource group become variables; keep the billing policy and its environments in the same location.
- Do not set `billing_policy_id` on an environment that a billing policy environments resource already lists.

## Private network and customer-managed key

A production environment wired to two Azure enterprise policies: network injection into delegated subnets of your virtual networks, and encryption with a key in your Key Vault. Both need a Managed Environment first, and IP firewall rules in environment settings do too.

<PatternFigure template="secure" />

- `system_id` comes from the `properties.systemId` of a `Microsoft.PowerPlatform/enterprisePolicies` Azure resource, usually created with `azapi_resource`. The [upstream examples](https://github.com/microsoft/terraform-provider-power-platform/tree/main/examples/resources/powerplatform_enterprise_policy) build all of the Azure side.
- The builder adds `depends_on = [powerplatform_managed_environment.prod]` to the policies and settings because no attribute expresses that requirement.

## Copilot Studio agent workspace

An environment for building agents: conversation telemetry streams to Application Insights, a shared Azure OpenAI connection is available to makers, and environment settings switch on AI prompts and transcript recording.

<PatternFigure template="copilot" />

- `bot_id` identifies an agent that already exists in the environment; agents themselves are not managed by this provider.
- `powerplatform_copilot_studio_application_insights` is a preview resource.

## Start small

A single sandbox with Dataverse and audit settings — the shortest path to something real.

<PatternFigure template="starter" />
