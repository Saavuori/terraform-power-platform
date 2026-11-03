// Suggested values for builder inputs. They are suggestions only: every list
// input also accepts a custom value, and the matching data source returns the
// authoritative list for a tenant.

export const LOCATIONS = [
  ['europe', 'Europe'],
  ['unitedstates', 'United States'],
  ['unitedkingdom', 'United Kingdom'],
  ['asia', 'Asia'],
  ['australia', 'Australia'],
  ['canada', 'Canada'],
  ['india', 'India'],
  ['japan', 'Japan'],
  ['france', 'France'],
  ['germany', 'Germany'],
  ['switzerland', 'Switzerland'],
  ['norway', 'Norway'],
  ['southamerica', 'South America'],
  ['unitedarabemirates', 'United Arab Emirates'],
  ['korea', 'Korea'],
  ['southafrica', 'South Africa'],
]

export const MACRO_REGIONS = [
  ['eu-efta', 'EU / EFTA'],
  ['north-america', 'North America'],
]

export const AZURE_REGIONS = {
  europe: ['northeurope', 'westeurope'],
  unitedstates: ['eastus', 'westus'],
  unitedkingdom: ['uksouth', 'ukwest'],
}

export const LANGUAGES = [
  [1033, 'English (United States)'],
  [1035, 'Finnish'],
  [1053, 'Swedish'],
  [1044, 'Norwegian (Bokmål)'],
  [1030, 'Danish'],
  [1031, 'German'],
  [1036, 'French'],
  [1043, 'Dutch'],
  [3082, 'Spanish'],
  [1040, 'Italian'],
  [1045, 'Polish'],
  [1046, 'Portuguese (Brazil)'],
  [1041, 'Japanese'],
  [1042, 'Korean'],
  [2052, 'Chinese (Simplified)'],
]

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'SEK', 'NOK', 'DKK', 'CHF', 'PLN', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'ZAR', 'AED', 'SGD'].map((c) => [c, c])

const api = (id) => `/providers/Microsoft.PowerApps/apis/${id}`
export const CONNECTORS = [
  ['shared_commondataserviceforapps', 'Microsoft Dataverse'],
  ['shared_sharepointonline', 'SharePoint'],
  ['shared_office365', 'Office 365 Outlook'],
  ['shared_office365users', 'Office 365 Users'],
  ['shared_teams', 'Microsoft Teams'],
  ['shared_onedriveforbusiness', 'OneDrive for Business'],
  ['shared_excelonlinebusiness', 'Excel Online (Business)'],
  ['shared_approvals', 'Approvals'],
  ['shared_planner', 'Planner'],
  ['shared_sql', 'SQL Server'],
  ['shared_azureblob', 'Azure Blob Storage'],
  ['shared_azureopenai', 'Azure OpenAI'],
  ['shared_salesforce', 'Salesforce'],
  ['shared_slack', 'Slack'],
  ['shared_dropbox', 'Dropbox'],
  ['shared_gmail', 'Gmail'],
  ['shared_twitter', 'X (Twitter)'],
].map(([id, label]) => ({ id: api(id), name: id, label }))

export const connectorLabel = (id) => (CONNECTORS.find((c) => c.id === id || c.name === id) || {}).label || String(id).split('/').pop()

export const SOLUTION_CHECKER_RULES = ['meta-avoid-reg-no-attribute', 'meta-avoid-reg-retrieve', 'meta-remove-dup-reg', 'app-use-delayoutput-text-input']

export const SECURITY_ROLE_NAMES = ['System Administrator', 'System Customizer', 'Basic User', 'Environment Maker']

export const NON_DATAVERSE_ROLES = ['Environment Admin', 'Environment Maker']

export const SERVICE_TAGS = ['ApiManagement', 'AppService', 'AzureCloud', 'AzureMonitor', 'PowerPlatformInfra']

export const AUTH_METHODS = [
  { id: 'cli', label: 'Azure CLI', note: 'Local development. Uses your `az login` session.' },
  { id: 'oidc', label: 'OIDC (workload identity)', note: 'GitHub Actions / Azure DevOps federated credentials. Recommended for CI.' },
  { id: 'secret', label: 'Client secret', note: 'Service principal with a secret. Keep it in a sensitive variable.' },
  { id: 'certificate', label: 'Client certificate', note: 'Service principal with a certificate file.' },
  { id: 'msi', label: 'Managed identity', note: 'Runs on Azure compute with a managed identity.' },
  { id: 'dev_cli', label: 'Azure Developer CLI', note: 'Uses your `azd auth login` session.' },
]

export const CLOUDS = ['public', 'gcc', 'gcchigh', 'dod', 'china', 'ex', 'rx']
