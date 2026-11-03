---
title: Getting started
description: Install the Power Platform provider, authenticate, create a first environment and bring existing ones under Terraform.
---

# Getting started

## What you need

- **Terraform** 1.5 or newer if you want to use `import` blocks (the provider itself works with any current Terraform).
- An identity that can administer Power Platform: a user with the **Power Platform Administrator** role for local work, or a service principal for pipelines. A service principal has to be registered with Power Platform once, by an administrator — it cannot register itself. The provider can do that with [`powerplatform_admin_management_application`](/reference/resources/admin_management_application).
- The **Azure CLI**, signed in with `az login`, for the quickest local setup.

## Declare the provider

```hcl
terraform {
  required_providers {
    powerplatform = {
      source  = "microsoft/power-platform"
      version = "~> 4.2"
    }
  }
}

provider "powerplatform" {
  use_cli = true
}
```

`use_cli = true` reuses your Azure CLI session. For pipelines, switch to OIDC or a client secret — [Authentication](/guide/authentication) shows every option.

## Create an environment

An environment with a Dataverse database is the starting point for almost everything else:

```hcl
resource "powerplatform_environment" "dev" {
  display_name     = "Contoso Dev"
  environment_type = "Sandbox"
  location         = "europe"

  dataverse = {
    language_code     = 1033
    currency_code     = "EUR"
    security_group_id = var.dev_security_group_id # optional: who can sign in
  }
}

output "dev_dataverse_url" {
  value = powerplatform_environment.dev.dataverse.url
}
```

```bash
terraform init
terraform plan
terraform apply
```

Creating an environment with Dataverse usually takes a few minutes; the provider polls the long-running operation until it finishes.

::: warning Choose location or macro_region
Set exactly one of `location` and `macro_region`. Tenants that provision by macro region reject `location`; the [`powerplatform_macro_regions`](/reference/data-sources/macro_regions) data source lists what yours accepts. Changing either after creation replaces the environment — add `lifecycle { prevent_destroy = true }` to production environments.
:::

## Add governance

Turning the environment into a Managed Environment unlocks sharing limits, solution checker enforcement, IP firewall and more:

```hcl
resource "powerplatform_managed_environment" "dev" {
  environment_id             = powerplatform_environment.dev.id
  is_usage_insights_disabled = false
  is_group_sharing_disabled  = true
  limit_sharing_mode         = "ExcludeSharingToSecurityGroups"
  max_limit_user_sharing     = 10
  solution_checker_mode      = "Warn"
  suppress_validation_emails = true
}
```

<OpenInBuilder template="starter" label="Continue this example in the builder" />

## Bring existing environments under Terraform

Most resources can be imported. With Terraform 1.5+ an `import` block is the easiest route:

```hcl
import {
  to = powerplatform_environment.prod
  id = "00000000-0000-0000-0000-000000000000" # the environment id
}
```

Run `terraform plan -generate-config-out=generated.tf` to have Terraform write the matching resource block, then tidy it up. Each reference page lists the import id format of its resource.

## Where next

- [How resources relate](/guide/resource-model) — the rules that decide what can go where.
- [Architecture patterns](/guide/patterns) — complete layouts to start from.
- [Reference](/reference/) — every resource and data source.
