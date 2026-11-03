// Builder knowledge per resource type, layered over the generated schema:
// defaults that produce a working configuration, which attributes reference
// other resources, which point at Azure / Entra objects, and how each one is
// placed and labelled in the diagram.
import {
  LOCATIONS,
  MACRO_REGIONS,
  AZURE_REGIONS,
  LANGUAGES,
  CURRENCIES,
  CONNECTORS,
  SOLUTION_CHECKER_RULES,
  SECURITY_ROLE_NAMES,
  NON_DATAVERSE_ROLES,
  SERVICE_TAGS,
} from './lists.js'

const ENV = 'powerplatform_environment'
const GROUP = 'powerplatform_environment_group'
const conn = (name) => CONNECTORS.find((c) => c.name === name).id

const envFields = {
  environment_type: { input: 'select' },
  location: { input: 'combo', options: LOCATIONS, help: 'Query `powerplatform_locations` for every location your tenant can use.' },
  macro_region: { input: 'combo', options: MACRO_REGIONS, help: 'Use instead of `location` on tenants that provision by macro region.' },
  azure_region: { input: 'combo', options: (inst) => (AZURE_REGIONS[inst.values.location] || []).map((r) => [r, r]), help: 'Only set this when the environment must sit next to Azure resources.' },
  'dataverse.language_code': { input: 'select', options: LANGUAGES },
  'dataverse.currency_code': { input: 'combo', options: CURRENCIES },
  'dataverse.security_group_id': { placeholder: 'Entra security group object id (optional)' },
  'dataverse.domain': { placeholder: 'contoso-dev' },
  owner_id: { placeholder: 'Entra user object id (Developer environments)' },
  description: { input: 'textarea', rows: 2 },
}

export const SPECS = {
  // ------------------------------------------------------------ environments
  [ENV]: {
    prefix: 'env',
    order: ['display_name', 'description', 'environment_type', 'location', 'macro_region', 'azure_region', 'environment_group_id', 'billing_policy_id', 'dataverse', 'cadence', 'release_cycle', 'owner_id'],
    defaults: {
      display_name: 'Contoso Dev',
      environment_type: 'Sandbox',
      location: 'europe',
      dataverse: { language_code: 1033, currency_code: 'EUR' },
    },
    fields: envFields,
    refs: {
      environment_group_id: { to: GROUP, label: 'Environment group' },
      billing_policy_id: { to: 'powerplatform_billing_policy', label: 'Billing policy' },
    },
    external: {
      'dataverse.security_group_id': { key: 'entra.group' },
      owner_id: { key: 'entra.user' },
    },
    title: (i) => i.values.display_name || i.name,
  },

  powerplatform_environment_settings: {
    prefix: 'settings',
    parent: 'environment_id',
    singleton: 'parent',
    defaults: {
      audit_and_logs: {
        plugin_trace_log_setting: 'Exception',
        audit_settings: { is_audit_enabled: true, is_user_access_audit_enabled: true, log_retention_period_in_days: 365 },
      },
    },
    fields: {
      'product.security.allowed_service_tags_for_firewall': { input: 'tags', options: SERVICE_TAGS },
      'audit_and_logs.audit_settings.log_retention_period_in_days': { help: '31–24855 days, or -1 to keep forever.' },
    },
  },

  powerplatform_managed_environment: {
    prefix: 'managed',
    parent: 'environment_id',
    singleton: 'parent',
    order: ['environment_id', 'solution_checker_mode', 'is_usage_insights_disabled', 'is_group_sharing_disabled', 'limit_sharing_mode', 'max_limit_user_sharing', 'suppress_validation_emails'],
    defaults: {
      is_usage_insights_disabled: false,
      is_group_sharing_disabled: true,
      limit_sharing_mode: 'ExcludeSharingToSecurityGroups',
      max_limit_user_sharing: 10,
      solution_checker_mode: 'Warn',
      suppress_validation_emails: true,
    },
    fields: {
      solution_checker_rule_overrides: { input: 'tags', options: SOLUTION_CHECKER_RULES, help: 'Rule ids from `powerplatform_solution_checker_rules`.' },
      max_limit_user_sharing: { help: 'Use -1 when group sharing is allowed.' },
    },
  },

  powerplatform_environment_disaster_recovery: {
    prefix: 'dr',
    parent: 'environment_id',
    singleton: 'parent',
    defaults: { enabled: true },
  },

  powerplatform_environment_wave: {
    prefix: 'wave',
    parent: 'environment_id',
    defaults: { feature_name: 'April2025Update' },
    title: (i) => `Wave · ${i.values.feature_name || '?'}`,
  },

  [GROUP]: {
    prefix: 'group',
    order: ['display_name', 'description'],
    defaults: { display_name: 'Business apps', description: 'Managed environments for business-critical apps' },
    fields: { description: { input: 'textarea', rows: 2 } },
    title: (i) => i.values.display_name || i.name,
  },

  powerplatform_environment_group_rule_set: {
    prefix: 'rules',
    parent: 'environment_group_id',
    singleton: 'parent',
    defaults: {
      rules: {
        sharing_controls: { share_mode: 'exclude sharing with security groups', share_max_limit: 20 },
        solution_checker_enforcement: { solution_checker_mode: 'block', send_emails_enabled: true },
        backup_retention: { period_in_days: 28 },
        usage_insights: { insights_enabled: true },
      },
    },
    fields: {
      'rules.maker_welcome_content.maker_onboarding_markdown': { input: 'textarea', rows: 3 },
      'rules.backup_retention.period_in_days': { input: 'select' },
    },
  },

  // ------------------------------------------------------------ governance
  powerplatform_data_loss_prevention_policy: {
    prefix: 'dlp',
    order: ['display_name', 'default_connectors_classification', 'environment_type', 'environments', 'business_connectors', 'non_business_connectors', 'blocked_connectors', 'custom_connectors_patterns'],
    defaults: {
      display_name: 'Business data stays in Microsoft 365',
      default_connectors_classification: 'Blocked',
      environment_type: 'AllEnvironments',
      business_connectors: ['shared_commondataserviceforapps', 'shared_sharepointonline', 'shared_office365', 'shared_office365users', 'shared_teams', 'shared_onedriveforbusiness', 'shared_approvals'].map(conn),
      non_business_connectors: [],
      blocked_connectors: ['shared_twitter', 'shared_dropbox', 'shared_gmail'].map(conn),
      custom_connectors_patterns: [{ order: 1, host_url_pattern: '*', data_group: 'Ignore' }],
    },
    fields: {
      business_connectors: { input: 'connectors' },
      non_business_connectors: { input: 'connectors' },
      blocked_connectors: { input: 'connectors' },
      'custom_connectors_patterns.data_group': { input: 'select', options: [['Business', 'Business'], ['NonBusiness', 'NonBusiness'], ['Blocked', 'Blocked'], ['Ignore', 'Ignore']] },
    },
    refs: { environments: { to: ENV, many: true, label: 'Environments' } },
    title: (i) => i.values.display_name || 'DLP policy',
  },

  powerplatform_tenant_settings: {
    prefix: 'tenant',
    singleton: 'tenant',
    defaults: {
      disable_trial_environment_creation_by_non_admin_users: true,
      disable_environment_creation_by_non_admin_users: true,
      power_platform: {
        governance: { enable_default_environment_routing: true, environment_routing_all_makers: true },
      },
    },
    refs: {
      'power_platform.governance.environment_routing_target_environment_group_id': { to: GROUP, label: 'Route new makers to group' },
    },
    external: {
      'power_platform.governance.environment_routing_target_security_group_id': { key: 'entra.group' },
    },
  },

  powerplatform_tenant_isolation_policy: {
    prefix: 'isolation',
    singleton: 'tenant',
    defaults: {
      is_disabled: false,
      allowed_tenants: [{ tenant_id: '00000000-0000-0000-0000-000000000000', inbound: true, outbound: false }],
    },
    external: { 'allowed_tenants.tenant_id': { key: 'entra.tenant' } },
  },

  powerplatform_enterprise_policy: {
    prefix: 'policy',
    parent: 'environment_id',
    singleton: 'parent',
    singletonKey: (i) => i.values.policy_type || '',
    defaults: { policy_type: 'NetworkInjection' },
    external: {
      system_id: { key: 'azure.enterprise_policy', variable: 'system_id', description: 'properties.systemId of the Microsoft.PowerPlatform/enterprisePolicies resource' },
    },
    title: (i) => `${i.values.policy_type || 'Enterprise'} policy`,
  },

  powerplatform_rbac_role_assignment: {
    prefix: 'role',
    order: ['scope_type', 'environment_id', 'environment_group_id', 'principal_type', 'principal_id', 'role_definition_name', 'role_definition_id'],
    defaults: { scope_type: 'environment_group', principal_type: 'Group', role_definition_name: 'Power Platform Reader' },
    refs: {
      environment_id: { to: ENV, label: 'Environment scope' },
      environment_group_id: { to: GROUP, label: 'Environment group scope' },
    },
    external: {
      principal_id: { key: 'entra.principal', variable: 'principal_id', description: 'Object id of the Entra user, group or service principal' },
    },
    fields: { role_definition_name: { help: 'Names come from `powerplatform_role_definitions`.' } },
    title: (i) => i.values.role_definition_name || 'Role assignment',
  },

  powerplatform_admin_management_application: {
    prefix: 'admin_app',
    external: { id: { key: 'entra.app', variable: 'client_id', description: 'Client id of the Entra app registration to register as a management app' } },
  },

  // ------------------------------------------------------------ billing
  powerplatform_billing_policy: {
    prefix: 'billing',
    defaults: { name: 'payg-europe', location: 'europe', status: 'Enabled', billing_instrument: {} },
    fields: { location: { input: 'combo', options: LOCATIONS } },
    external: {
      'billing_instrument.subscription_id': { key: 'azure.subscription', variable: 'subscription_id', description: 'Azure subscription that pays for usage' },
      'billing_instrument.resource_group': { key: 'azure.resource_group', variable: 'resource_group', description: 'Resource group that holds the billing account resource' },
    },
    title: (i) => i.values.name || 'Billing policy',
  },

  powerplatform_billing_policy_environment: {
    prefix: 'billing_envs',
    refs: {
      billing_policy_id: { to: 'powerplatform_billing_policy', label: 'Billing policy' },
      environments: { to: ENV, many: true, label: 'Environments' },
    },
  },

  // ------------------------------------------------------------ ALM
  powerplatform_solution: {
    prefix: 'solution',
    parent: 'environment_id',
    defaults: { solution_file: '${path.module}/solutions/ContosoCore_1_0_0_0.zip' },
    title: (i) => fileName(i.values.solution_file) || 'Solution',
  },

  powerplatform_managed_solution: {
    prefix: 'solution',
    parent: 'environment_id',
    order: ['environment_id', 'unique_name', 'version', 'source', 'connection_references'],
    defaults: { unique_name: 'ContosoCore', version: '1.0.0.0', source: { path: '${path.module}/solutions/ContosoCore_managed.zip' } },
    refs: { connection_references: { to: 'powerplatform_connection', map: true, label: 'Connection references' } },
    title: (i) => `${i.values.unique_name || 'Solution'} ${i.values.version || ''}`.trim(),
  },

  powerplatform_publisher: {
    prefix: 'publisher',
    parent: 'environment_id',
    defaults: { uniquename: 'contoso', friendly_name: 'Contoso', customization_prefix: 'cts' },
    title: (i) => i.values.friendly_name || 'Publisher',
  },

  powerplatform_environment_variable_value: {
    prefix: 'var',
    parent: 'environment_id',
    defaults: { schema_name: 'cts_ApiBaseUrl', value: 'https://api.contoso.com' },
    title: (i) => i.values.schema_name || 'Variable value',
  },

  powerplatform_environment_application_package_install: {
    prefix: 'app_package',
    parent: 'environment_id',
    defaults: { unique_name: 'msdyn_FlowApprovals' },
    fields: { unique_name: { help: 'Package names come from `powerplatform_environment_application_packages`.' } },
    title: (i) => i.values.unique_name || 'Application package',
  },

  // ------------------------------------------------------------ access
  powerplatform_user: {
    prefix: 'user',
    parent: 'environment_id',
    defaults: { security_roles: [] },
    fields: { security_roles: { input: 'tags', options: NON_DATAVERSE_ROLES, help: 'Dataverse role ids from `powerplatform_security_roles`; without Dataverse only Environment Admin / Environment Maker.' } },
    external: { aad_id: { key: 'entra.user', variable: 'aad_id', description: 'Entra object id of the user' } },
  },

  powerplatform_application_user: {
    prefix: 'app_user',
    parent: 'environment_id',
    refs: { business_unit_id: { to: 'powerplatform_data_record', label: 'Business unit (data record)' } },
    external: { application_id: { key: 'entra.app', variable: 'application_id', description: 'Client id of the Entra app registration' } },
  },

  powerplatform_security_role_assignment: {
    prefix: 'role_assignment',
    parent: 'environment_id',
    defaults: { security_role_name: 'System Administrator' },
    fields: { security_role_name: { input: 'combo', options: SECURITY_ROLE_NAMES.map((r) => [r, r]) } },
    refs: {
      system_user_id: { to: 'powerplatform_application_user', toAttr: 'system_user_id', label: 'Application user' },
      team_id: { to: 'powerplatform_data_record', label: 'Team (data record)' },
      business_unit_id: { to: 'powerplatform_data_record', label: 'Business unit (data record)' },
    },
    title: (i) => i.values.security_role_name || 'Role assignment',
  },

  powerplatform_environment_application_admin: {
    prefix: 'app_admin',
    parent: 'environment_id',
    external: { application_id: { key: 'entra.app', variable: 'application_id', description: 'Client id of the service principal to make System Administrator' } },
  },

  // ------------------------------------------------------------ data
  powerplatform_data_record: {
    prefix: 'record',
    parent: 'environment_id',
    defaults: { table_logical_name: 'team', columns: '{\n  name = "Contoso makers"\n}' },
    fields: { columns: { input: 'code', rows: 5, help: 'An HCL object of column values, e.g. `{ name = "Contoso" }`.' } },
    title: (i) => `${i.values.table_logical_name || 'Record'} record`,
  },

  powerplatform_rest: {
    prefix: 'webapi',
    parent: '@environment',
    hidden: ['id'],
    defaults: { create: { method: 'POST', url: '/api/data/v9.2/accounts', body: '{"name":"Contoso"}' } },
    fields: {
      'create.body': { input: 'code', rows: 3 },
      'read.body': { input: 'code', rows: 3 },
      'update.body': { input: 'code', rows: 3 },
      'destroy.body': { input: 'code', rows: 3 },
      'create.scope': { placeholder: 'left empty: the environment Dataverse URL' },
    },
  },

  // ------------------------------------------------------------ connectivity
  powerplatform_connection: {
    prefix: 'connection',
    parent: 'environment_id',
    defaults: { name: 'shared_sql', display_name: 'SQL Server (shared)' },
    fields: {
      name: { input: 'combo', options: CONNECTORS.map((c) => [c.name, c.label]), help: 'Connector name from `powerplatform_connectors`.' },
      connection_parameters: { input: 'code', rows: 4, help: 'jsonencode({...}) of the connector parameters.' },
      connection_parameters_set: { input: 'code', rows: 4 },
    },
    title: (i) => i.values.display_name || 'Connection',
  },

  powerplatform_connection_share: {
    prefix: 'share',
    parent: 'environment_id',
    defaults: { role_name: 'CanView' },
    refs: {
      connection_id: { to: 'powerplatform_connection', label: 'Connection' },
      connector_name: { to: 'powerplatform_connection', toAttr: 'name', follows: 'connection_id', label: 'Connector (from the connection)' },
    },
    external: { 'principal.entra_object_id': { key: 'entra.principal', variable: 'principal_object_id', description: 'Entra object id of the user or group to share with' } },
    title: (i) => `Share · ${i.values.role_name || ''}`,
  },

  // ------------------------------------------------------------ copilot
  powerplatform_copilot_studio_application_insights: {
    prefix: 'agent_insights',
    parent: 'environment_id',
    defaults: { include_activities: true, include_actions: true, include_sensitive_information: false },
    external: {
      bot_id: { key: 'copilot.agent', variable: 'bot_id', description: 'Id of the Copilot Studio agent' },
      application_insights_connection_string: { key: 'azure.app_insights', variable: 'app_insights_connection_string', description: 'Application Insights connection string', sensitive: true },
    },
  },
}

function fileName(p) {
  if (!p) return ''
  return String(p).split('/').pop().replace(/\.zip$/i, '')
}

export function specFor(type) {
  return SPECS[type] || { prefix: type.replace('powerplatform_', '') }
}

export function scopeOf(type) {
  const s = specFor(type)
  if (s.parent === 'environment_id' || s.parent === '@environment') return 'environment'
  if (s.parent === 'environment_group_id') return 'group'
  return 'tenant'
}

export const BUILDER_ENV = ENV
export const BUILDER_GROUP = GROUP
