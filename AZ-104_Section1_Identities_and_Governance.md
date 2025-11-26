# AZ-104 Section 1: Manage Azure Identities and Governance (20-25%)

## Table of Contents
- [1.1 Manage Microsoft Entra Users and Groups](#11-manage-microsoft-entra-users-and-groups)
- [1.2 Manage Access to Azure Resources](#12-manage-access-to-azure-resources)
- [1.3 Manage Azure Subscriptions and Governance](#13-manage-azure-subscriptions-and-governance)

---

## 1.1 Manage Microsoft Entra Users and Groups

### Create Users and Groups

#### User Identity Types

**Cloud Identity**
- Created and managed entirely in Microsoft Entra ID
- No on-premises presence required
- Best for cloud-only organizations

**Synchronized Identity**
- Synced from on-premises Active Directory
- Uses Azure AD Connect or Azure AD Connect Cloud Sync
- Maintains single identity across cloud and on-premises
- Password hash sync, pass-through authentication, or federation

**Guest User (B2B)**
- External users from other organizations
- Can be invited via email
- Access specific resources without full tenant membership
- Support for various identity providers (Microsoft accounts, Google, Facebook, etc.)

#### Creating Users - Portal
1. Navigate to Microsoft Entra ID
2. Select Users > New user
3. Choose "Create user" or "Invite external user"
4. Fill in required fields:
   - User principal name
   - Display name
   - Password (auto-generated or manual)
   - Usage location (required for licenses)
5. Assign groups, roles, and licenses as needed

#### Creating Users - PowerShell
```powershell
# Install Azure AD module if needed
Install-Module -Name Az -AllowClobber -Force

# Connect to Azure
Connect-AzAccount

# Create a new user
$PasswordProfile = New-Object -TypeName Microsoft.Open.AzureAD.Model.PasswordProfile
$PasswordProfile.Password = "TempPassword123!"
$PasswordProfile.ForceChangePasswordNextLogin = $true

New-AzADUser -DisplayName "Jane Smith" `
    -UserPrincipalName "jane.smith@contoso.com" `
    -Password $PasswordProfile.Password `
    -MailNickname "janesmith" `
    -AccountEnabled $true

# Bulk create users from CSV
$users = Import-Csv -Path "C:\users.csv"
foreach ($user in $users) {
    New-AzADUser -DisplayName $user.DisplayName `
        -UserPrincipalName $user.UPN `
        -Password $user.Password `
        -MailNickname $user.MailNickname
}
```

#### Creating Users - Azure CLI
```bash
# Login to Azure
az login

# Create a new user
az ad user create \
    --display-name "Jane Smith" \
    --user-principal-name "jane.smith@contoso.com" \
    --password "TempPassword123!" \
    --force-change-password-next-sign-in true

# Bulk create from JSON file
az ad user create --json @users.json
```

#### Group Types

**Security Groups**
- Manage access to Azure resources
- Can contain users, devices, service principals
- Used with Azure RBAC
- Can be assigned licenses

**Microsoft 365 Groups**
- Collaboration groups with shared resources
- Shared mailbox, calendar, files, SharePoint site
- Can have owners and members
- Automatically creates associated resources

#### Group Membership Types

**Assigned (Static)**
- Members manually added/removed
- Full control over membership
- No automatic updates

**Dynamic User**
- Membership based on user attribute rules
- Automatically adds/removes users
- Requires Azure AD Premium P1 or P2
- Example rule: `user.department -eq "Sales"`

**Dynamic Device**
- Membership based on device attributes
- Automatic device grouping
- Example rule: `device.deviceOSType -eq "Windows"`

#### Creating Groups - Portal
1. Navigate to Microsoft Entra ID > Groups
2. Select "New group"
3. Choose group type (Security or Microsoft 365)
4. Enter group name and description
5. Select membership type (Assigned or Dynamic)
6. For dynamic groups, create membership rules
7. Add owners and members
8. Create group

#### Creating Groups - PowerShell
```powershell
# Create a security group
New-AzADGroup -DisplayName "Marketing Team" `
    -MailNickname "marketingteam" `
    -SecurityEnabled $true `
    -Description "Marketing department security group"

# Create a dynamic group (requires Premium)
New-AzADGroup -DisplayName "Sales Team Dynamic" `
    -MailNickname "salesteamdynamic" `
    -SecurityEnabled $true `
    -Description "Dynamic group for sales department" `
    -MembershipRule "(user.department -eq ""Sales"")" `
    -MembershipRuleProcessingState "On"

# Add member to group
$group = Get-AzADGroup -DisplayName "Marketing Team"
$user = Get-AzADUser -UserPrincipalName "jane.smith@contoso.com"
Add-AzADGroupMember -TargetGroupObjectId $group.Id -MemberObjectId $user.Id
```

#### Creating Groups - Azure CLI
```bash
# Create a security group
az ad group create \
    --display-name "Marketing Team" \
    --mail-nickname "marketingteam" \
    --description "Marketing department security group"

# Add member to group
az ad group member add \
    --group "Marketing Team" \
    --member-id <user-object-id>

# List group members
az ad group member list --group "Marketing Team"
```

### Manage User and Group Properties

#### Key User Properties

**Identity Properties**
- User Principal Name (UPN): Primary identifier (email format)
- Object ID: Unique GUID
- Display Name: Full name shown in applications
- Mail Nickname: Email alias

**Organization Properties**
- Department
- Job Title
- Office Location
- Manager
- Company Name

**Contact Information**
- Business Phones
- Mobile Phone
- Email Address
- Street Address
- City, State, Postal Code, Country

**Settings**
- Usage Location: Required for license assignment (ISO country code)
- Account Enabled: Enable/disable user account
- Sign-in Blocking: Block user from signing in

#### Modifying User Properties - Portal
1. Navigate to Microsoft Entra ID > Users
2. Select the user
3. Select "Properties" or specific section
4. Edit required fields
5. Save changes

#### Modifying User Properties - PowerShell
```powershell
# Update user properties
Update-AzADUser -UserPrincipalName "jane.smith@contoso.com" `
    -Department "Sales" `
    -JobTitle "Sales Manager" `
    -City "Seattle" `
    -UsageLocation "US"

# Enable/disable user account
Update-AzADUser -UserPrincipalName "jane.smith@contoso.com" -AccountEnabled $false

# Update multiple users from CSV
$users = Import-Csv -Path "C:\userupdates.csv"
foreach ($user in $users) {
    Update-AzADUser -UserPrincipalName $user.UPN -Department $user.Department
}
```

#### Modifying User Properties - Azure CLI
```bash
# Update user properties
az ad user update \
    --id "jane.smith@contoso.com" \
    --department "Sales" \
    --job-title "Sales Manager"

# Disable user account
az ad user update \
    --id "jane.smith@contoso.com" \
    --account-enabled false
```

#### Managing Group Properties

**Key Group Properties**
- Display Name
- Description
- Group Type (Security or Microsoft 365)
- Membership Type (Assigned or Dynamic)
- Owners: Can manage group settings
- Members: Users/devices in the group

#### Modifying Groups - PowerShell
```powershell
# Update group properties
Update-AzADGroup -ObjectId <group-object-id> -Description "Updated description"

# Add/remove group owners
Add-AzADGroupOwner -GroupObjectId <group-id> -OwnerObjectId <user-id>
Remove-AzADGroupOwner -GroupObjectId <group-id> -OwnerObjectId <user-id>

# Add/remove group members
Add-AzADGroupMember -TargetGroupObjectId <group-id> -MemberObjectId <user-id>
Remove-AzADGroupMember -GroupObjectId <group-id> -MemberObjectId <user-id>
```

### Manage Licenses in Microsoft Entra ID

#### License Types
- Microsoft 365 (Office 365)
- Enterprise Mobility + Security (EMS)
- Azure AD Premium P1/P2
- Dynamics 365
- Power Platform

#### License Assignment Methods

**Direct Assignment**
- License assigned directly to individual users
- Manual management
- Good for small numbers

**Group-Based Licensing**
- Assign licenses to groups
- Automatic assignment/removal based on membership
- Requires Azure AD Premium P1 or P2
- Supports inherited licenses
- Handles license conflicts automatically

#### Assigning Licenses - Portal
1. Navigate to Microsoft Entra ID > Users > Select user
2. Go to "Licenses" section
3. Select "Assignments"
4. Choose license(s) to assign
5. Configure service plans (enable/disable specific services)
6. Save assignment

#### Group-Based Licensing - Portal
1. Navigate to Microsoft Entra ID > Groups > Select group
2. Go to "Licenses" section
3. Select "Assignments"
4. Choose license(s) to assign
5. Configure service plans
6. Save assignment
7. All group members automatically receive licenses

#### Assigning Licenses - PowerShell
```powershell
# Get available licenses
Get-AzureADSubscribedSku | Select-Object SkuPartNumber, ConsumedUnits -ExpandProperty PrepaidUnits

# Assign license to user
$user = Get-AzADUser -UserPrincipalName "jane.smith@contoso.com"
$license = New-Object -TypeName Microsoft.Open.AzureAD.Model.AssignedLicense
$license.SkuId = "sku-id-here"
$licenses = New-Object -TypeName Microsoft.Open.AzureAD.Model.AssignedLicenses
$licenses.AddLicenses = $license
Set-AzureADUserLicense -ObjectId $user.Id -AssignedLicenses $licenses

# Assign license to group (group-based licensing)
$group = Get-AzADGroup -DisplayName "Sales Team"
Set-AzureADGroup -ObjectId $group.Id -AssignedLicenses $licenses
```

#### License Requirements
- Usage Location must be set for user (ISO country code)
- Sufficient available licenses in tenant
- No conflicting service plans
- User account must be enabled

#### Managing License Conflicts
- Occurs when multiple licenses have conflicting service plans
- View conflicts in user's license details
- Resolve by disabling conflicting services in one license
- Group-based licensing shows inheritance errors

### Manage External Users

#### Azure AD B2B (Business-to-Business)

**Guest User Access**
- External users can access your resources
- Users maintain their own credentials
- No need to manage external identities
- Can be from any identity provider

**Invitation Process**
1. Send invitation email
2. Guest user accepts invitation
3. Guest user added to directory as guest type
4. Assign permissions/groups as needed

#### Inviting Guest Users - Portal
1. Navigate to Microsoft Entra ID > Users
2. Select "New guest user"
3. Enter email address
4. Add personal message (optional)
5. Assign to groups (optional)
6. Send invitation

#### Inviting Guest Users - PowerShell
```powershell
# Invite a guest user
New-AzureADMSInvitation `
    -InvitedUserEmailAddress "external.user@partner.com" `
    -InvitedUserDisplayName "External User" `
    -InviteRedirectUrl "https://myapps.microsoft.com" `
    -SendInvitationMessage $true `
    -InvitedUserMessageInfo @{CustomizedMessageBody = "Welcome to our organization"}
```

#### Inviting Guest Users - Azure CLI
```bash
# Invite a guest user
az ad user create \
    --user-principal-name "external.user_partner.com#EXT#@contoso.onmicrosoft.com" \
    --display-name "External User" \
    --mail-nickname "externaluser" \
    --user-type "Guest"
```

#### External Collaboration Settings

**Configure in Portal:**
1. Microsoft Entra ID > External Identities > External collaboration settings
2. Guest user access: Restricted, Limited, or Same as members
3. Guest invite settings: Who can invite guests
4. Collaboration restrictions: Allowed/denied domains
5. External user leave settings: Can guests leave the organization

**Guest User Permissions (Default)**
- Limited directory access
- Cannot enumerate users/groups
- Cannot read most directory properties
- Can see only their own profile

#### Managing Guest Users
```powershell
# List all guest users
Get-AzADUser -Filter "userType eq 'Guest'"

# Remove guest user
Remove-AzADUser -UserPrincipalName "external.user_partner.com#EXT#@contoso.onmicrosoft.com"

# Update guest user properties
Update-AzADUser -UserPrincipalName "external.user_partner.com#EXT#@contoso.onmicrosoft.com" `
    -DisplayName "Updated Name"
```

#### B2B Best Practices
- Use conditional access policies for guest users
- Regular access reviews for guest accounts
- Set expiration policies for guest invitations
- Limit guest access to specific resources
- Use allowlist/denylist for domains
- Enable MFA for guest users

### Configure Self-Service Password Reset (SSPR)

#### SSPR Overview
- Allows users to reset their own passwords
- Reduces helpdesk calls
- Requires Azure AD Premium P1 or P2 (for on-premises writeback)
- Can writeback to on-premises AD

#### SSPR Scope Options
- **None**: SSPR disabled
- **Selected**: SSPR for specific security group
- **All**: SSPR for all users in tenant

#### Authentication Methods

**Available Methods:**
- Email notification
- SMS text message
- Office phone call
- Mobile phone call
- Security questions
- Mobile app notification (Microsoft Authenticator)
- Mobile app code (TOTP)

**Configuration:**
- Require 1 or 2 methods to reset
- Users must register methods before use
- Can enforce registration at sign-in

#### Configuring SSPR - Portal
1. Navigate to Microsoft Entra ID > Password reset
2. **Properties**: Enable for None, Selected, or All users
3. **Authentication methods**: Choose available methods and number required
4. **Registration**: Enforce registration, days before re-confirmation
5. **Notifications**: Notify users and admins on password reset
6. **Customization**: Add helpdesk link and custom text
7. **On-premises integration**: Enable password writeback

#### SSPR Configuration Example
```powershell
# Note: SSPR is primarily configured via portal
# PowerShell can be used for bulk user registration

# Register authentication methods for users
$users = Get-AzADUser -All $true
foreach ($user in $users) {
    # Set authentication phone
    Set-AzureADUser -ObjectId $user.Id -Mobile "+1234567890"
    # Set authentication email
    Set-AzureADUser -ObjectId $user.Id -OtherMails @("backup@email.com")
}
```

#### Security Questions

**Requirements:**
- Must configure 3-5 pre-defined questions
- Users must answer 3-5 questions to register
- Users must answer 3-5 questions to reset

**Pre-defined Question Types:**
- Localized questions in multiple languages
- Custom questions (admin-defined)

**Limitations:**
- Less secure than other methods
- Not recommended as sole method
- Cannot be used for admin accounts

#### Password Writeback

**Requirements:**
- Azure AD Connect with writeback enabled
- Azure AD Premium P1 or P2
- On-premises AD permissions configured

**Benefits:**
- Single password for cloud and on-premises
- Real-time password reset to on-premises
- Enforces on-premises password policies

**Configuration in Azure AD Connect:**
1. Run Azure AD Connect wizard
2. Select "Customize synchronization options"
3. Enable "Password writeback"
4. Complete wizard

#### SSPR Best Practices
- Require at least 2 authentication methods
- Use mobile app for better security
- Avoid security questions for sensitive accounts
- Enable registration enforcement
- Enable password writeback for hybrid environments
- Monitor SSPR usage via audit logs
- Exclude admin accounts from SSPR (use alternate process)

#### SSPR User Experience
1. User goes to https://passwordreset.microsoftonline.com
2. Enters User ID
3. Completes CAPTCHA
4. Verifies identity using registered methods
5. Enters new password
6. Password reset confirmation

#### Monitoring SSPR
```powershell
# View password reset audit logs
Get-AzureADAuditSignInLogs | Where-Object {$_.AppDisplayName -eq "Self-service Password Reset"}

# View password registration activity
Get-AzureADAuditDirectoryLogs | Where-Object {$_.Category -eq "UserManagement" -and $_.ActivityDisplayName -like "*password*"}
```

---

## 1.2 Manage Access to Azure Resources

### Manage Built-in Azure Roles

#### Azure RBAC Overview
- Role-Based Access Control for Azure resources
- Assigns permissions to security principals
- Scoped to: Management Group, Subscription, Resource Group, or Resource
- Uses additive model (permissions accumulate)
- Deny assignments override allow permissions

#### Key RBAC Concepts

**Security Principal**
- User: Individual identity
- Group: Collection of users
- Service Principal: Application or service identity
- Managed Identity: Auto-managed identity for Azure resources

**Role Definition**
- Collection of permissions
- Defines allowed actions (Actions)
- Defines denied actions (NotActions)
- Defines data actions (DataActions)
- Defines data not actions (NotDataActions)

**Scope**
- Level at which access applies
- Hierarchy: Management Group > Subscription > Resource Group > Resource
- Inheritance: Child scopes inherit permissions from parent

**Assignment**
- Links security principal + role definition + scope
- Can have multiple assignments per principal

#### Built-in Roles - General

**Owner**
- Full access to all resources
- Can manage access (assign roles)
- Highest level of access

**Contributor**
- Can create and manage all resources
- Cannot grant access to others
- Cannot modify access control

**Reader**
- View all resources
- Cannot make any changes
- Read-only access

**User Access Administrator**
- Manage user access to Azure resources
- Cannot manage resources themselves
- Only manages RBAC assignments

#### Built-in Roles - Compute

**Virtual Machine Contributor**
- Manage VMs (not including access)
- Cannot manage virtual network or storage account
- Cannot assign roles

**Virtual Machine Administrator Login**
- Login to VMs with administrator privileges
- Requires VM is AAD-joined or hybrid-joined

**Virtual Machine User Login**
- Login to VMs with regular user privileges

#### Built-in Roles - Networking

**Network Contributor**
- Manage networks
- Cannot manage access

**DNS Zone Contributor**
- Manage DNS zones and record sets

#### Built-in Roles - Storage

**Storage Account Contributor**
- Manage storage accounts
- Cannot access data using account keys

**Storage Blob Data Owner**
- Full access to blob containers and data
- Including assign POSIX access control

**Storage Blob Data Contributor**
- Read, write, delete blob containers and blobs

**Storage Blob Data Reader**
- Read blob containers and blobs

**Storage Queue Data Contributor**
- Read, write, delete queues and messages

**Storage Queue Data Reader**
- Read queues and messages

#### Built-in Roles - Databases

**SQL DB Contributor**
- Manage SQL databases
- Cannot manage security policies
- Cannot access data

**SQL Server Contributor**
- Manage SQL servers and databases
- Cannot manage security policies

**Cosmos DB Account Reader**
- Read Cosmos DB account data
- Cannot manage accounts

#### Built-in Roles - Identity

**Managed Identity Contributor**
- Create, read, update, delete user-assigned identities

**Managed Identity Operator**
- Read and assign user-assigned identities

#### Viewing Role Definitions - Portal
1. Navigate to Subscriptions or Resource Group
2. Select "Access control (IAM)"
3. Go to "Roles" tab
4. Search and select a role
5. View permissions, JSON definition

#### Viewing Role Definitions - PowerShell
```powershell
# List all role definitions
Get-AzRoleDefinition

# Get specific role
Get-AzRoleDefinition -Name "Contributor"

# Get role by ID
Get-AzRoleDefinition -Id "b24988ac-6180-42a0-ab88-20f7382dd24c"

# View permissions
$role = Get-AzRoleDefinition -Name "Virtual Machine Contributor"
$role.Actions
$role.NotActions

# List roles that can be assigned at a scope
Get-AzRoleDefinition | Where-Object {$_.IsCustom -eq $false} | Select-Object Name, Description
```

#### Viewing Role Definitions - Azure CLI
```bash
# List all role definitions
az role definition list

# Get specific role
az role definition list --name "Contributor"

# View role in detail
az role definition list --name "Contributor" --output json
```

### Assign Roles at Different Scopes

#### Scope Levels

**Management Group**
- Highest level scope
- Applies to multiple subscriptions
- Useful for enterprise-wide policies

**Subscription**
- Applies to entire subscription
- All resource groups inherit permissions
- Common scope for environment-wide access

**Resource Group**
- Applies to all resources in group
- Most common scope for team-based access
- Inherits from subscription

**Resource**
- Applies to single resource only
- Most granular scope
- Use sparingly (management overhead)

#### Assigning Roles - Portal

**At Subscription Scope:**
1. Navigate to Subscriptions > Select subscription
2. Select "Access control (IAM)"
3. Click "Add" > "Add role assignment"
4. Select role (e.g., "Contributor")
5. In "Members" tab, select security principal
6. Review and assign

**At Resource Group Scope:**
1. Navigate to Resource Groups > Select group
2. Select "Access control (IAM)"
3. Click "Add" > "Add role assignment"
4. Select role
5. Select members
6. Review and assign

**At Resource Scope:**
1. Navigate to specific resource
2. Select "Access control (IAM)"
3. Follow same process as above

#### Assigning Roles - PowerShell
```powershell
# Assign role at subscription scope
New-AzRoleAssignment `
    -SignInName "jane.smith@contoso.com" `
    -RoleDefinitionName "Contributor" `
    -Scope "/subscriptions/<subscription-id>"

# Assign role at resource group scope
New-AzRoleAssignment `
    -ObjectId <user-object-id> `
    -RoleDefinitionName "Virtual Machine Contributor" `
    -ResourceGroupName "Production-RG"

# Assign role at resource scope
New-AzRoleAssignment `
    -SignInName "jane.smith@contoso.com" `
    -RoleDefinitionName "Storage Blob Data Contributor" `
    -Scope "/subscriptions/<sub-id>/resourceGroups/<rg-name>/providers/Microsoft.Storage/storageAccounts/<storage-account>"

# Assign role to group
$group = Get-AzADGroup -DisplayName "IT Admins"
New-AzRoleAssignment `
    -ObjectId $group.Id `
    -RoleDefinitionName "Reader" `
    -ResourceGroupName "Production-RG"

# Assign role to service principal
$sp = Get-AzADServicePrincipal -DisplayName "MyApp"
New-AzRoleAssignment `
    -ObjectId $sp.Id `
    -RoleDefinitionName "Contributor" `
    -ResourceGroupName "App-RG"
```

#### Assigning Roles - Azure CLI
```bash
# Assign role at subscription scope
az role assignment create \
    --assignee "jane.smith@contoso.com" \
    --role "Contributor" \
    --subscription "<subscription-id>"

# Assign role at resource group scope
az role assignment create \
    --assignee "jane.smith@contoso.com" \
    --role "Virtual Machine Contributor" \
    --resource-group "Production-RG"

# Assign role at resource scope
az role assignment create \
    --assignee "jane.smith@contoso.com" \
    --role "Storage Blob Data Contributor" \
    --scope "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>"

# Assign role to group
az role assignment create \
    --assignee-object-id <group-object-id> \
    --assignee-principal-type "Group" \
    --role "Reader" \
    --resource-group "Production-RG"
```

#### Best Practices for Role Assignment
- Use least privilege principle
- Assign roles to groups, not individual users
- Use resource group scope when possible
- Avoid role assignments at resource level
- Document role assignments
- Regular access reviews
- Use custom roles when built-in don't fit
- Monitor role assignment changes

### Interpret Access Assignments

#### Checking Access - Portal
1. Navigate to resource/resource group/subscription
2. Select "Access control (IAM)"
3. Go to "Check access" tab
4. Search for user, group, or service principal
5. View current role assignments and scope

**Role Assignments View:**
- Shows all assignments at current scope
- Includes inherited assignments
- Shows role, principal, scope, and type

**Access Control Tab Views:**
- Role assignments: All current assignments
- Deny assignments: Explicitly denied access
- Classic administrators: Legacy assignments

#### Checking Access - PowerShell
```powershell
# Get all role assignments for a user
Get-AzRoleAssignment -SignInName "jane.smith@contoso.com"

# Get role assignments at resource group scope
Get-AzRoleAssignment -ResourceGroupName "Production-RG"

# Get role assignments for specific scope
Get-AzRoleAssignment -Scope "/subscriptions/<subscription-id>"

# Get role assignments for a specific principal
$user = Get-AzADUser -UserPrincipalName "jane.smith@contoso.com"
Get-AzRoleAssignment -ObjectId $user.Id

# Get inherited role assignments
Get-AzRoleAssignment -ResourceGroupName "Production-RG" -IncludeInherited

# Check if user has specific role
$assignments = Get-AzRoleAssignment -SignInName "jane.smith@contoso.com"
$assignments | Where-Object {$_.RoleDefinitionName -eq "Contributor"}
```

#### Checking Access - Azure CLI
```bash
# Get all role assignments for a user
az role assignment list --assignee "jane.smith@contoso.com"

# Get role assignments at resource group
az role assignment list --resource-group "Production-RG"

# Get role assignments including inherited
az role assignment list --resource-group "Production-RG" --include-inherited

# Get role assignments in table format
az role assignment list --assignee "jane.smith@contoso.com" --output table
```

#### Understanding Effective Permissions

**Additive Model:**
- User has combination of all assigned roles
- Group memberships add permissions
- Multiple role assignments accumulate

**Example:**
- User assigned "Reader" at subscription
- User in group with "Contributor" at resource group
- Effective permission: Contributor (more permissive wins)

**Deny Assignments:**
- Override allow permissions
- Cannot be directly assigned (system-managed)
- Used by Azure Blueprints and managed apps
- Take precedence over all allow assignments

#### Viewing Effective Permissions
```powershell
# Comprehensive access check
$user = Get-AzADUser -UserPrincipalName "jane.smith@contoso.com"
$assignments = Get-AzRoleAssignment -ObjectId $user.Id -IncludeInherited

# Group by scope
$assignments | Group-Object Scope | Format-Table Count, Name

# Show unique roles
$assignments | Select-Object RoleDefinitionName -Unique

# Check group memberships
$groups = Get-AzADGroup | Where-Object {(Get-AzADGroupMember -ObjectId $_.Id).Id -contains $user.Id}
foreach ($group in $groups) {
    Get-AzRoleAssignment -ObjectId $group.Id
}
```

#### Troubleshooting Access Issues

**Common Issues:**
1. **Permission denied errors**
   - Check role assignments at all scopes
   - Verify group memberships
   - Check for deny assignments
   - Wait for replication (up to 30 minutes)

2. **Cannot assign roles**
   - Need "User Access Administrator" or "Owner" role
   - Check if you have required scope access

3. **Inherited permissions not working**
   - Verify subscription/resource group hierarchy
   - Check if resources moved between groups

**Verification Steps:**
```powershell
# Check current context
Get-AzContext

# Test access to resource
Get-AzResource -ResourceGroupName "Production-RG"

# View activity log for access denied
Get-AzLog -ResourceGroupName "Production-RG" | Where-Object {$_.Status -eq "Failed"}
```

#### Access Review
- Regular audits of role assignments
- Remove unnecessary permissions
- Use Azure AD Access Reviews
- Document privileged access
- Monitor role assignment changes via Azure Activity Log

---

## 1.3 Manage Azure Subscriptions and Governance

### Implement and Manage Azure Policy

#### Azure Policy Overview
- Enforce organizational standards and compliance
- Assess resources for non-compliance
- Can remediate non-compliant resources
- Built-in and custom policies available
- Organized in initiatives (policy sets)

#### Policy Components

**Policy Definition:**
- JSON document describing compliance conditions
- Contains if-then logic
- Effects: Deny, Audit, Append, Modify, DeployIfNotExists, AuditIfNotExists

**Policy Assignment:**
- Links policy definition to scope
- Scope: Management Group, Subscription, or Resource Group
- Can have exclusions

**Initiative Definition (Policy Set):**
- Group of related policies
- Simplifies management
- Example: Enable all monitoring policies

**Initiative Assignment:**
- Assigns multiple policies at once
- Same scoping rules as policy assignments

#### Policy Effects

**Deny:**
- Prevents resource creation/update
- Resource request fails
- Used for hard requirements

**Audit:**
- Creates warning in activity log
- Doesn't prevent resource creation
- Used for compliance reporting

**Append:**
- Adds additional fields to resource
- Example: Add required tags

**Modify:**
- Adds, updates, or removes tags
- More flexible than Append

**DeployIfNotExists:**
- Deploys additional resources if condition met
- Example: Deploy diagnostic settings

**AuditIfNotExists:**
- Checks if related resource exists
- Audits if not found

**Disabled:**
- Policy not evaluated

#### Creating Policy Assignment - Portal
1. Navigate to "Policy" in Azure Portal
2. Select "Assignments" > "Assign policy"
3. Select scope (subscription/resource group)
4. Choose policy definition or initiative
5. Configure parameters (if any)
6. Set assignment name and description
7. Configure remediation (if needed)
8. Create assignment

#### Common Built-in Policies

**Tagging:**
- Require a tag on resources
- Require a tag and its value on resources
- Inherit a tag from the resource group
- Append a tag and its value from the resource group

**Security:**
- Secure transfer to storage accounts should be enabled
- Network Security Groups should be enabled
- Audit VMs that do not use managed disks

**Compute:**
- Allowed virtual machine size SKUs
- Audit VMs without disaster recovery configured

**Networking:**
- Allowed locations
- Network interfaces should not have public IPs

#### Assigning Policies - PowerShell
```powershell
# Get built-in policy definition
$policy = Get-AzPolicyDefinition | Where-Object {$_.Properties.DisplayName -eq "Require a tag on resources"}

# Assign policy to subscription
New-AzPolicyAssignment `
    -Name "enforce-costcenter-tag" `
    -DisplayName "Enforce CostCenter Tag" `
    -Scope "/subscriptions/<subscription-id>" `
    -PolicyDefinition $policy `
    -PolicyParameterObject @{tagName='CostCenter'}

# Assign policy to resource group
New-AzPolicyAssignment `
    -Name "enforce-tag-rg" `
    -DisplayName "Enforce Tags" `
    -Scope "/subscriptions/<sub-id>/resourceGroups/Production-RG" `
    -PolicyDefinition $policy `
    -PolicyParameterObject @{tagName='Environment'; tagValue='Production'}

# Assign initiative
$initiative = Get-AzPolicySetDefinition -Name "security-center-initiative"
New-AzPolicyAssignment `
    -Name "security-compliance" `
    -DisplayName "Security Compliance" `
    -PolicySetDefinition $initiative `
    -Scope "/subscriptions/<subscription-id>"

# Remove policy assignment
Remove-AzPolicyAssignment -Name "enforce-costcenter-tag" -Scope "/subscriptions/<subscription-id>"
```

#### Assigning Policies - Azure CLI
```bash
# List built-in policy definitions
az policy definition list

# Get specific policy
az policy definition show --name "policy-definition-id"

# Assign policy to subscription
az policy assignment create \
    --name "enforce-costcenter-tag" \
    --display-name "Enforce CostCenter Tag" \
    --scope "/subscriptions/<subscription-id>" \
    --policy "policy-definition-id" \
    --params '{"tagName":{"value":"CostCenter"}}'

# Assign policy to resource group
az policy assignment create \
    --name "enforce-tag-rg" \
    --display-name "Enforce Tags" \
    --resource-group "Production-RG" \
    --policy "policy-definition-id"

# Delete policy assignment
az policy assignment delete --name "enforce-costcenter-tag"
```

#### Creating Custom Policy Definitions
```json
{
  "properties": {
    "displayName": "Require specific VM SKUs",
    "policyType": "Custom",
    "mode": "Indexed",
    "description": "This policy restricts VM SKUs to approved list",
    "metadata": {
      "category": "Compute"
    },
    "parameters": {
      "allowedSKUs": {
        "type": "Array",
        "metadata": {
          "displayName": "Allowed SKUs",
          "description": "The list of allowed VM SKUs"
        },
        "defaultValue": ["Standard_B2s", "Standard_D2s_v3"]
      }
    },
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Compute/virtualMachines"
          },
          {
            "not": {
              "field": "Microsoft.Compute/virtualMachines/sku.name",
              "in": "[parameters('allowedSKUs')]"
            }
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

```powershell
# Create custom policy definition
New-AzPolicyDefinition `
    -Name "allowed-vm-skus" `
    -DisplayName "Allowed VM SKUs" `
    -Description "Restrict VM SKUs" `
    -Policy "C:\policies\vm-sku-policy.json" `
    -Parameter "C:\policies\vm-sku-parameters.json"
```

#### Policy Compliance

**Viewing Compliance:**
1. Navigate to "Policy" in Azure Portal
2. Select "Compliance"
3. View overall compliance percentage
4. Drill down into specific policies
5. View non-compliant resources

**Compliance States:**
- Compliant: Resource meets policy
- Non-compliant: Resource violates policy
- Conflict: Multiple policies conflict
- Not started: Policy not yet evaluated
- Exempt: Resource excluded from policy

```powershell
# Get compliance state
Get-AzPolicyState -ResourceGroupName "Production-RG"

# Get non-compliant resources
Get-AzPolicyState | Where-Object {$_.ComplianceState -eq "NonCompliant"}

# Get summary of compliance
Get-AzPolicyStateSummary -SubscriptionId "<subscription-id>"
```

#### Policy Remediation

**Remediation Tasks:**
- Fixes non-compliant resources
- Only for DeployIfNotExists and Modify effects
- Can be automatic or manual
- Creates managed identity for deployment

**Creating Remediation Task:**
1. Navigate to "Policy" > "Remediation"
2. Select policy to remediate
3. Choose scope
4. Select resources to remediate
5. Create remediation task

```powershell
# Create remediation task
Start-AzPolicyRemediation `
    -Name "remediate-diagnostics" `
    -PolicyAssignmentId "/subscriptions/<sub-id>/providers/Microsoft.Authorization/policyAssignments/<assignment-id>" `
    -ResourceGroupName "Production-RG"

# Get remediation status
Get-AzPolicyRemediation -Name "remediate-diagnostics" -ResourceGroupName "Production-RG"
```

### Configure Resource Locks

#### Resource Lock Types

**CanNotDelete (Delete Lock):**
- Authorized users can read and modify
- Cannot delete resource
- Prevents accidental deletion

**ReadOnly:**
- Authorized users can read
- Cannot modify or delete
- Prevents any changes
- Most restrictive

#### Lock Behavior

**Lock Inheritance:**
- Locks apply to all resources in scope
- Child resources inherit locks
- Most restrictive lock applies

**Lock Precedence:**
- ReadOnly more restrictive than CanNotDelete
- Locks override RBAC permissions
- Even Owner role cannot delete locked resource

**Scope Levels:**
- Subscription
- Resource Group
- Resource

#### Creating Locks - Portal
1. Navigate to subscription/resource group/resource
2. Select "Locks" from settings
3. Click "Add"
4. Enter lock name
5. Select lock type (Delete or Read-only)
6. Add notes (optional)
7. OK to create

#### Creating Locks - PowerShell
```powershell
# Create delete lock on resource group
New-AzResourceLock `
    -LockName "prevent-delete" `
    -LockLevel CanNotDelete `
    -ResourceGroupName "Production-RG" `
    -LockNotes "Prevent accidental deletion"

# Create read-only lock on resource
New-AzResourceLock `
    -LockName "read-only-lock" `
    -LockLevel ReadOnly `
    -ResourceType "Microsoft.Storage/storageAccounts" `
    -ResourceName "mystorageaccount" `
    -ResourceGroupName "Production-RG"

# Create lock at subscription level
New-AzResourceLock `
    -LockName "subscription-lock" `
    -LockLevel CanNotDelete `
    -Scope "/subscriptions/<subscription-id>"

# List all locks in resource group
Get-AzResourceLock -ResourceGroupName "Production-RG"

# Remove lock
Remove-AzResourceLock `
    -LockName "prevent-delete" `
    -ResourceGroupName "Production-RG" `
    -Force
```

#### Creating Locks - Azure CLI
```bash
# Create delete lock on resource group
az lock create \
    --name "prevent-delete" \
    --lock-type CanNotDelete \
    --resource-group "Production-RG" \
    --notes "Prevent accidental deletion"

# Create read-only lock on resource
az lock create \
    --name "read-only-lock" \
    --lock-type ReadOnly \
    --resource-group "Production-RG" \
    --resource-name "mystorageaccount" \
    --resource-type "Microsoft.Storage/storageAccounts"

# List locks
az lock list --resource-group "Production-RG"

# Delete lock
az lock delete \
    --name "prevent-delete" \
    --resource-group "Production-RG"
```

#### Lock Best Practices
- Use descriptive lock names
- Always add notes explaining purpose
- Use CanNotDelete for critical resources
- Use ReadOnly sparingly (breaks many operations)
- Document lock management procedures
- Regular lock reviews
- Consider lock automation via IaC

#### Lock Limitations

**ReadOnly Lock Effects:**
- Storage: Cannot upload/modify blobs (uses POST/PUT)
- VMs: Cannot start/restart (POST operation)
- App Service: Cannot upload files or modify config
- DNS: Cannot create/update records
- Essentially blocks all write operations

**CanNotDelete Lock Effects:**
- Can still modify resources
- Can still start/stop VMs
- Only prevents deletion

**Operations Not Blocked:**
- Reading resource properties
- Listing resources
- Querying data (for data plane operations)

### Apply and Manage Tags on Resources

#### Tag Overview
- Metadata as key-value pairs
- Organize and categorize resources
- Track costs and ownership
- Enable automation and management
- Up to 50 tags per resource
- Tag name: 512 characters (128 for storage accounts)
- Tag value: 256 characters

#### Common Tag Strategies

**Cost Tracking:**
- CostCenter: Accounting code
- Project: Project name
- Department: Owning department
- Budget: Budget allocation

**Operations:**
- Environment: Dev, Test, Prod
- Criticality: High, Medium, Low
- Owner: Responsible person/team
- MaintenanceWindow: Allowed downtime

**Automation:**
- AutoShutdown: True/False
- BackupPolicy: Daily, Weekly
- MonitoringEnabled: True/False

**Compliance:**
- ComplianceLevel: PCI, HIPAA, etc.
- DataClassification: Public, Confidential
- RetentionPeriod: Days to retain

#### Applying Tags - Portal
1. Navigate to resource/resource group
2. Select "Tags"
3. Enter Name and Value
4. Click "Apply"

**Bulk Tag Application:**
1. Navigate to "All resources"
2. Select multiple resources (checkbox)
3. Click "Assign tags"
4. Enter tags
5. Apply to selected resources

#### Applying Tags - PowerShell
```powershell
# Tag a resource
$tags = @{
    Environment = "Production"
    CostCenter = "IT-001"
    Owner = "john.smith@contoso.com"
}
$resource = Get-AzResource -ResourceName "myvm" -ResourceGroupName "Production-RG"
Update-AzTag -ResourceId $resource.Id -Tag $tags -Operation Merge

# Tag a resource group
$rgTags = @{
    Department = "Finance"
    Project = "WebApp"
}
Update-AzTag -ResourceId "/subscriptions/<sub-id>/resourceGroups/Production-RG" -Tag $rgTags -Operation Merge

# Replace all tags (removes existing)
Update-AzTag -ResourceId $resource.Id -Tag $tags -Operation Replace

# Add a single tag
$newTag = @{Application = "WebServer"}
Update-AzTag -ResourceId $resource.Id -Tag $newTag -Operation Merge

# Remove specific tag
Update-AzTag -ResourceId $resource.Id -Tag @{Environment = $null} -Operation Delete

# Remove all tags
Update-AzTag -ResourceId $resource.Id -Tag @{} -Operation Replace

# Bulk tag resources in resource group
$resources = Get-AzResource -ResourceGroupName "Production-RG"
foreach ($resource in $resources) {
    Update-AzTag -ResourceId $resource.Id -Tag @{BillingCode = "12345"} -Operation Merge
}
```

#### Applying Tags - Azure CLI
```bash
# Tag a resource
az resource tag \
    --tags Environment=Production CostCenter=IT-001 \
    --resource-group "Production-RG" \
    --name "myvm" \
    --resource-type "Microsoft.Compute/virtualMachines"

# Tag a resource group
az group update \
    --name "Production-RG" \
    --tags Department=Finance Project=WebApp

# List tags on resource
az resource show \
    --resource-group "Production-RG" \
    --name "myvm" \
    --resource-type "Microsoft.Compute/virtualMachines" \
    --query tags

# Remove all tags
az resource tag \
    --tags "" \
    --resource-group "Production-RG" \
    --name "myvm" \
    --resource-type "Microsoft.Compute/virtualMachines"
```

#### Tag Inheritance via Policy

**Policy to Inherit Tags:**
```json
{
  "if": {
    "field": "[concat('tags[', parameters('tagName'), ']')]",
    "exists": "false"
  },
  "then": {
    "effect": "modify",
    "details": {
      "roleDefinitionIds": [
        "/providers/microsoft.authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
      ],
      "operations": [
        {
          "operation": "addOrReplace",
          "field": "[concat('tags[', parameters('tagName'), ']')]",
          "value": "[resourceGroup().tags[parameters('tagName')]]"
        }
      ]
    }
  }
}
```

**Assign Inheritance Policy:**
```powershell
# Get the built-in inherit tag policy
$policy = Get-AzPolicyDefinition | Where-Object {$_.Properties.DisplayName -like "*Inherit a tag*"}

# Assign to subscription
New-AzPolicyAssignment `
    -Name "inherit-costcenter" `
    -PolicyDefinition $policy `
    -Scope "/subscriptions/<subscription-id>" `
    -PolicyParameterObject @{tagName='CostCenter'}
```

#### Querying Resources by Tags
```powershell
# Find resources with specific tag
Get-AzResource -Tag @{Environment="Production"}

# Find resources with tag name (any value)
Get-AzResource -TagName "CostCenter"

# Find resources by tag and resource type
Get-AzResource -Tag @{Environment="Production"} -ResourceType "Microsoft.Compute/virtualMachines"

# Find resource groups by tag
Get-AzResourceGroup -Tag @{Department="Finance"}

# Complex tag query
$resources = Get-AzResource | Where-Object {
    $_.Tags.Environment -eq "Production" -and
    $_.Tags.CostCenter -like "IT-*"
}
```

```bash
# Query resources by tag
az resource list --tag Environment=Production

# Query with JMESPath
az resource list --query "[?tags.Environment=='Production']"

# Count resources by tag
az resource list --tag Environment=Production --query "length(@)"
```

#### Cost Analysis with Tags
1. Navigate to "Cost Management + Billing"
2. Select "Cost analysis"
3. Add filter for tag
4. Group by tag value
5. View cost breakdown by tag

#### Tag Automation
```powershell
# Script to enforce tagging standards
$requiredTags = @("Environment", "CostCenter", "Owner")
$resources = Get-AzResource

foreach ($resource in $resources) {
    $missingTags = @()
    foreach ($tag in $requiredTags) {
        if (-not $resource.Tags.ContainsKey($tag)) {
            $missingTags += $tag
        }
    }
    
    if ($missingTags.Count -gt 0) {
        Write-Host "Resource $($resource.Name) missing tags: $($missingTags -join ', ')"
        # Optionally apply default tags
        $defaultTags = @{
            Environment = "Unknown"
            CostCenter = "Unassigned"
            Owner = "unassigned@contoso.com"
        }
        Update-AzTag -ResourceId $resource.Id -Tag $defaultTags -Operation Merge
    }
}
```

### Manage Resource Groups

#### Resource Group Overview
- Logical container for Azure resources
- Resources can only exist in one resource group
- Resources can be in different regions than group
- Resource group has metadata location
- Control access via RBAC at RG level
- Can move resources between groups

#### Creating Resource Groups - Portal
1. Navigate to "Resource groups"
2. Click "Create"
3. Select subscription
4. Enter resource group name
5. Select region (metadata location)
6. Add tags (optional)
7. Review + Create

#### Creating Resource Groups - PowerShell
```powershell
# Create resource group
New-AzResourceGroup `
    -Name "Production-RG" `
    -Location "East US" `
    -Tag @{
        Environment = "Production"
        Department = "IT"
    }

# Create multiple resource groups
$locations = @("East US", "West US", "Central US")
foreach ($location in $locations) {
    New-AzResourceGroup `
        -Name "App-RG-$($location -replace ' ', '')" `
        -Location $location
}

# List resource groups
Get-AzResourceGroup

# Get specific resource group
Get-AzResourceGroup -Name "Production-RG"

# Get resources in resource group
Get-AzResource -ResourceGroupName "Production-RG"
```

#### Creating Resource Groups - Azure CLI
```bash
# Create resource group
az group create \
    --name "Production-RG" \
    --location "eastus" \
    --tags Environment=Production Department=IT

# List resource groups
az group list

# List in table format
az group list --output table

# Show resource group details
az group show --name "Production-RG"
```

#### Moving Resources Between Groups

**Portal:**
1. Navigate to source resource group
2. Select resources to move (checkbox)
3. Click "Move" > "Move to another resource group"
4. Select destination resource group
5. Validate move
6. Complete move

**PowerShell:**
```powershell
# Move single resource
$resource = Get-AzResource -Name "myvm" -ResourceGroupName "Source-RG"
Move-AzResource `
    -DestinationResourceGroupName "Destination-RG" `
    -ResourceId $resource.ResourceId

# Move multiple resources
$resources = Get-AzResource -ResourceGroupName "Source-RG" | Where-Object {$_.ResourceType -eq "Microsoft.Compute/virtualMachines"}
$resourceIds = $resources.ResourceId
Move-AzResource `
    -DestinationResourceGroupName "Destination-RG" `
    -ResourceId $resourceIds

# Move to different subscription
Move-AzResource `
    -DestinationSubscriptionId "<target-subscription-id>" `
    -DestinationResourceGroupName "Destination-RG" `
    -ResourceId $resource.ResourceId
```

**Azure CLI:**
```bash
# Move resources
az resource move \
    --destination-group "Destination-RG" \
    --ids <resource-id-1> <resource-id-2>

# Move to different subscription
az resource move \
    --destination-group "Destination-RG" \
    --destination-subscription-id "<target-sub-id>" \
    --ids <resource-id>
```

#### Move Limitations

**Resources That Cannot Be Moved:**
- Some resources have move restrictions
- Check documentation for specific resource type
- Locks prevent moves
- Some networking resources tied to VNet

**Validation:**
- Azure validates move before executing
- Check dependencies
- Target RG must be in same subscription (unless moving subscription)
- Source and destination can't be locked

#### Deleting Resource Groups

**Portal:**
1. Navigate to resource group
2. Click "Delete resource group"
3. Type resource group name to confirm
4. Click "Delete"

**PowerShell:**
```powershell
# Delete resource group (prompts for confirmation)
Remove-AzResourceGroup -Name "Test-RG"

# Delete without confirmation
Remove-AzResourceGroup -Name "Test-RG" -Force

# Delete asynchronously (background job)
Remove-AzResourceGroup -Name "Test-RG" -AsJob -Force
```

**Azure CLI:**
```bash
# Delete resource group
az group delete --name "Test-RG"

# Delete without confirmation
az group delete --name "Test-RG" --yes

# Delete with no wait
az group delete --name "Test-RG" --yes --no-wait
```

#### Resource Group Best Practices
- Use consistent naming convention
- Group resources by lifecycle
- Group resources by application/project
- Apply RBAC at resource group level
- Use tags for organization
- Apply resource locks to critical groups
- Regular cleanup of unused resource groups
- Document resource group purpose

### Manage Subscriptions

#### Subscription Overview
- Billing and management boundary
- Contains resource groups and resources
- Associated with single Azure AD tenant
- RBAC applies at subscription level
- Cost limits and quotas per subscription
- Multiple subscriptions for:
  - Cost separation
  - Department isolation
  - Environment separation
  - Subscription limits

#### Subscription Types
- Free Trial
- Pay-As-You-Go
- Enterprise Agreement (EA)
- Microsoft Customer Agreement (MCA)
- Cloud Solution Provider (CSP)
- Azure for Students

#### Viewing Subscriptions - Portal
1. Navigate to "Subscriptions"
2. View list of subscriptions
3. Select subscription for details
4. View overview, cost, resources

#### Viewing Subscriptions - PowerShell
```powershell
# List all subscriptions
Get-AzSubscription

# Get current subscription context
Get-AzContext

# Set active subscription
Set-AzContext -SubscriptionId "<subscription-id>"

# Get subscription details
Get-AzSubscription -SubscriptionId "<subscription-id>"

# List subscriptions in table format
Get-AzSubscription | Select-Object Name, Id, State, TenantId | Format-Table
```

#### Viewing Subscriptions - Azure CLI
```bash
# List all subscriptions
az account list

# Show current subscription
az account show

# Set active subscription
az account set --subscription "<subscription-id>"

# List subscriptions in table format
az account list --output table
```

#### Transferring Subscriptions

**Transfer Billing Ownership:**
- Transfer subscription between billing accounts
- Requires appropriate permissions
- Can change Azure AD tenant association

**Steps (Portal):**
1. Navigate to "Cost Management + Billing"
2. Select billing account
3. Choose "Transfer billing ownership"
4. Enter recipient email
5. Recipient accepts transfer

#### Canceling Subscriptions

**Free Trial:**
- Automatically expires after 30 days
- Can cancel anytime

**Pay-As-You-Go:**
1. Navigate to subscription
2. Select "Overview"
3. Click "Cancel subscription"
4. Confirm cancellation
5. Resources deleted after grace period

**Important:**
- Data retained for 90 days
- Can reactivate within 90 days
- After 90 days, all data deleted

```powershell
# Disable subscription (requires Owner role)
# Note: Use Azure Portal for subscription cancellation
# PowerShell used mainly for viewing subscription state
Get-AzSubscription -SubscriptionId "<subscription-id>" | Select-Object State
```

#### Managing Subscription Access

**Owner Role:**
- Full access to subscription
- Can assign access to others
- Manage all resources

**Contributor Role:**
- Manage all resources
- Cannot assign access

**Reader Role:**
- View all resources
- Cannot make changes

```powershell
# Assign subscription-level access
New-AzRoleAssignment `
    -SignInName "jane.smith@contoso.com" `
    -RoleDefinitionName "Contributor" `
    -Scope "/subscriptions/<subscription-id>"

# List subscription owners
Get-AzRoleAssignment -Scope "/subscriptions/<subscription-id>" | Where-Object {$_.RoleDefinitionName -eq "Owner"}
```

### Manage Costs

#### Azure Cost Management Overview
- Track and analyze Azure spending
- Set budgets and alerts
- View cost trends and forecasts
- Allocate costs by resource/tags
- Export cost data

#### Viewing Costs - Portal
1. Navigate to "Cost Management + Billing"
2. Select "Cost Management"
3. Choose "Cost analysis"
4. Select subscription/resource group scope
5. View daily, monthly, accumulated costs
6. Filter by service, location, tags
7. Group by various dimensions

#### Cost Analysis Features

**Views:**
- Accumulated costs
- Daily costs
- Costs by service
- Costs by location
- Forecast

**Filters:**
- Date range
- Resource group
- Resource
- Tags
- Service name
- Meter category

**Group By:**
- Resource group
- Resource
- Service
- Location
- Tag

#### Creating Budgets

**Portal Steps:**
1. Navigate to "Cost Management + Billing"
2. Select "Budgets"
3. Click "Add"
4. Enter budget details:
   - Name
   - Reset period (Monthly, Quarterly, Annual)
   - Amount
   - Start/end date
5. Set alert conditions (% of budget)
6. Configure action groups (email notifications)
7. Create budget

**PowerShell:**
```powershell
# Install Cost Management module
Install-Module -Name Az.CostManagement

# Create budget
$startDate = (Get-Date).ToString("yyyy-MM-01")
$endDate = (Get-Date).AddYears(1).ToString("yyyy-MM-01")

New-AzConsumptionBudget `
    -Name "Monthly-Budget" `
    -Category "Cost" `
    -Amount 1000 `
    -TimeGrain "Monthly" `
    -TimePeriod @{
        StartDate = $startDate
        EndDate = $endDate
    } `
    -Notification @{
        Threshold = 80
        Operator = "GreaterThan"
        ContactEmails = @("admin@contoso.com")
    }

# List budgets
Get-AzConsumptionBudget

# Remove budget
Remove-AzConsumptionBudget -Name "Monthly-Budget"
```

#### Budget Alerts

**Alert Thresholds:**
- Set multiple thresholds per budget
- Common thresholds: 50%, 75%, 90%, 100%
- Email notifications to specified recipients
- Can trigger action groups
- Can trigger Azure Automation runbooks

**Action Groups:**
- Email notifications
- SMS notifications
- Webhooks
- Azure Function
- Logic App
- Azure Automation Runbook

#### Cost Alerts

**Types:**
1. **Budget Alerts**: Triggered when spend reaches threshold
2. **Credit Alerts**: EA customers, credit balance alerts
3. **Department Spending Quota Alerts**: EA departments

**Configuring Alerts:**
1. Navigate to "Cost Management + Billing"
2. Select "Cost alerts"
3. View active alerts
4. Configure alert recipients
5. Set alert conditions

#### Azure Advisor Cost Recommendations

**Recommendation Categories:**
1. **Shutdown underutilized VMs**
   - Low CPU usage (<5%)
   - Low network usage
   - Potential savings shown

2. **Right-size underutilized VMs**
   - Resize to smaller SKU
   - Based on usage patterns
   - Estimated savings

3. **Reserved Instances**
   - Purchase RIs for predictable workloads
   - Up to 72% savings vs pay-as-you-go
   - 1-year or 3-year term

4. **Remove unprovisioned ExpressRoute circuits**
   - Provider status not provisioned
   - Paying for unused circuit

5. **Eliminate unattached disks**
   - Managed disks not attached to VMs
   - Still incurring costs

**Viewing Advisor Recommendations:**
```powershell
# Get cost recommendations
Get-AzAdvisorRecommendation -Category Cost

# Get recommendations for subscription
Get-AzAdvisorRecommendation -Category Cost | Where-Object {$_.ResourceId -like "*subscriptions/<sub-id>*"}

# View recommendation details
$recommendation = Get-AzAdvisorRecommendation -Category Cost | Select-Object -First 1
$recommendation | Select-Object ShortDescriptionProblem, ShortDescriptionSolution, PotentialBenefit
```

**Implementing Advisor Recommendations:**
1. Navigate to "Advisor"
2. Select "Cost" tab
3. Review recommendations
4. Click recommendation for details
5. Click "Implement" or take action manually
6. Postpone or dismiss if not applicable

#### Cost Optimization Strategies

**Right-sizing:**
- Monitor VM utilization
- Resize or deallocate underused VMs
- Use autoscaling for variable workloads

**Reserved Instances:**
- Purchase for predictable workloads
- 1-year or 3-year commitment
- Up to 72% savings

**Spot VMs:**
- Use for interruptible workloads
- Up to 90% savings
- Eviction possible when capacity needed

**Azure Hybrid Benefit:**
- Use existing Windows Server licenses
- Use existing SQL Server licenses
- Significant cost savings

**Storage Optimization:**
- Use appropriate access tiers (Hot, Cool, Archive)
- Implement lifecycle management
- Delete unused snapshots and disks

**Dev/Test Pricing:**
- Reduced rates for dev/test subscriptions
- Requires MSDN or Visual Studio subscription

#### Exporting Cost Data

**Portal:**
1. Navigate to "Cost Management + Billing"
2. Select "Exports"
3. Click "Add"
4. Configure export:
   - Name
   - Export type (Daily, Monthly)
   - Date range
   - Storage account
   - Container and path
5. Create export

**PowerShell:**
```powershell
# Create cost export
New-AzCostManagementExport `
    -Name "monthly-export" `
    -Scope "/subscriptions/<subscription-id>" `
    -Schedule @{
        Status = "Active"
        Recurrence = "Monthly"
        RecurrencePeriod = @{
            From = (Get-Date)
            To = (Get-Date).AddYears(1)
        }
    } `
    -Destination @{
        StorageAccountId = "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>"
        Container = "exports"
        RootFolderPath = "costs"
    }
```

### Configure Management Groups

#### Management Group Overview
- Organize multiple subscriptions
- Hierarchical structure
- Apply governance at scale
- Inherit RBAC and policies
- Up to 6 levels of depth
- Root management group per tenant
- All subscriptions in tenant belong to root

#### Management Group Hierarchy

**Structure:**
```
Root Management Group
├── Production Management Group
│   ├── Production-Subscription-1
│   └── Production-Subscription-2
├── Development Management Group
│   ├── Dev-Subscription-1
│   └── Dev-Subscription-2
└── Shared Services Management Group
    └── SharedServices-Subscription
```

**Key Concepts:**
- Root cannot be deleted or moved
- Each directory has one root group
- All subscriptions initially in root
- Policies and RBAC cascade down
- 10,000 management groups per directory
- Management group tree up to 6 levels

#### Creating Management Groups - Portal
1. Navigate to "Management groups"
2. Click "Add management group"
3. Enter Management group ID (immutable)
4. Enter Display name
5. Select parent group
6. Create

#### Creating Management Groups - PowerShell
```powershell
# Create root-level management group
New-AzManagementGroup -GroupName "Production" -DisplayName "Production Environment"

# Create child management group
New-AzManagementGroup `
    -GroupName "Production-US" `
    -DisplayName "Production US Region" `
    -ParentId "/providers/Microsoft.Management/managementGroups/Production"

# List management groups
Get-AzManagementGroup

# Get management group hierarchy
Get-AzManagementGroup -GroupName "Production" -Expand -Recurse

# Get details of specific management group
Get-AzManagementGroup -GroupName "Production"
```

#### Creating Management Groups - Azure CLI
```bash
# Create management group
az account management-group create \
    --name "Production" \
    --display-name "Production Environment"

# Create child management group
az account management-group create \
    --name "Production-US" \
    --display-name "Production US Region" \
    --parent "Production"

# List management groups
az account management-group list

# Show management group
az account management-group show --name "Production"
```

#### Moving Subscriptions to Management Groups

**Portal:**
1. Navigate to "Management groups"
2. Select target management group
3. Click "Add subscription"
4. Select subscription to add
5. Save

**PowerShell:**
```powershell
# Move subscription to management group
New-AzManagementGroupSubscription `
    -GroupName "Production" `
    -SubscriptionId "<subscription-id>"

# Remove subscription from management group (moves to root)
Remove-AzManagementGroupSubscription `
    -GroupName "Production" `
    -SubscriptionId "<subscription-id>"

# List subscriptions in management group
Get-AzManagementGroup -GroupName "Production" -Expand
```

**Azure CLI:**
```bash
# Add subscription to management group
az account management-group subscription add \
    --name "Production" \
    --subscription "<subscription-id>"

# Remove subscription from management group
az account management-group subscription remove \
    --name "Production" \
    --subscription "<subscription-id>"
```

#### Applying Policies to Management Groups

**Benefits:**
- Apply policy once at management group
- All subscriptions inherit policy
- Consistent governance across organization
- Manage thousands of subscriptions efficiently

**Example:**
```powershell
# Assign policy to management group
$mgScope = "/providers/Microsoft.Management/managementGroups/Production"
$policy = Get-AzPolicyDefinition | Where-Object {$_.Properties.DisplayName -eq "Allowed locations"}

New-AzPolicyAssignment `
    -Name "restrict-locations" `
    -DisplayName "Restrict Resource Locations" `
    -PolicyDefinition $policy `
    -Scope $mgScope `
    -PolicyParameterObject @{
        listOfAllowedLocations = @("eastus", "westus", "centralus")
    }
```

#### Applying RBAC to Management Groups

**Benefits:**
- Grant access to multiple subscriptions at once
- Inheritance applies to all child subscriptions
- Centralized access management

**Example:**
```powershell
# Assign Reader role at management group
$mgScope = "/providers/Microsoft.Management/managementGroups/Production"

New-AzRoleAssignment `
    -SignInName "security-team@contoso.com" `
    -RoleDefinitionName "Reader" `
    -Scope $mgScope

# This grants Reader access to all subscriptions in Production management group
```

#### Management Group Best Practices

**Organizational Structure:**
- Mirror organizational hierarchy
- Separate by environment (Production, Development, Test)
- Separate by department
- Use descriptive naming
- Document structure and purpose

**Governance:**
- Apply policies at appropriate level
- Use principle of least privilege for RBAC
- Regular review of assignments
- Consistent tagging strategy
- Budget controls per management group

**Common Patterns:**

**By Environment:**
```
Root
├── Production
├── Development
└── Test
```

**By Business Unit:**
```
Root
├── Sales
├── Marketing
├── IT
└── HR
```

**By Geography:**
```
Root
├── North America
│   ├── US
│   └── Canada
├── Europe
│   ├── UK
│   └── Germany
└── Asia
    └── Japan
```

**Hybrid:**
```
Root
├── Production
│   ├── Application-A
│   └── Application-B
├── Non-Production
│   ├── Development
│   └── Test
└── Shared Services
    ├── Networking
    └── Security
```

#### Deleting Management Groups

**Requirements:**
- No child management groups
- No subscriptions assigned
- Remove all policy assignments
- Remove all role assignments

**Portal:**
1. Move or delete child groups
2. Move subscriptions to different group
3. Remove policy assignments
4. Navigate to management group
5. Click "Delete"
6. Confirm deletion

**PowerShell:**
```powershell
# Remove all policy assignments first
$mgScope = "/providers/Microsoft.Management/managementGroups/OldGroup"
Get-AzPolicyAssignment -Scope $mgScope | Remove-AzPolicyAssignment

# Move subscriptions
$subs = Get-AzManagementGroup -GroupName "OldGroup" -Expand | Select-Object -ExpandProperty Children
foreach ($sub in $subs) {
    Remove-AzManagementGroupSubscription -GroupName "OldGroup" -SubscriptionId $sub.Name
}

# Delete management group
Remove-AzManagementGroup -GroupName "OldGroup"
```

---

## Study Tips for Section 1

### Key Concepts to Master
1. **Identity Management**
   - User and group creation methods
   - License assignment strategies
   - Guest user scenarios
   - SSPR configuration and methods

2. **RBAC**
   - Built-in roles and their permissions
   - Scope hierarchy and inheritance
   - Custom role creation
   - Troubleshooting access issues

3. **Governance**
   - Policy effects and when to use each
   - Resource lock types and limitations
   - Tag strategies and automation
   - Management group hierarchies

### Hands-On Practice Areas
- Create users via Portal, PowerShell, and CLI
- Configure group-based licensing
- Assign RBAC roles at different scopes
- Create and assign Azure Policies
- Implement tagging strategies
- Set up management group hierarchies
- Configure budgets and alerts

### Common Exam Scenarios
- User reports cannot access a resource (RBAC troubleshooting)
- Need to enforce tagging on all resources (Azure Policy)
- Prevent deletion of critical resources (Resource Locks)
- Organize 50+ subscriptions efficiently (Management Groups)
- Control costs for department (Budgets, Tags, Subscriptions)
- External partner needs access (Guest Users, B2B)
- Users forget passwords frequently (SSPR)

### PowerShell Commands to Memorize
```powershell
# Users and Groups
New-AzADUser, Update-AzADUser, Remove-AzADUser
New-AzADGroup, Add-AzADGroupMember

# RBAC
Get-AzRoleDefinition, New-AzRoleAssignment, Get-AzRoleAssignment

# Policy
Get-AzPolicyDefinition, New-AzPolicyAssignment, Get-AzPolicyState

# Tags
Update-AzTag, Get-AzResource -Tag

# Resource Groups
New-AzResourceGroup, Move-AzResource, Remove-AzResourceGroup

# Management Groups
New-AzManagementGroup, New-AzManagementGroupSubscription
```

### Azure CLI Commands to Memorize
```bash
# Users and Groups
az ad user create, az ad group create, az ad group member add

# RBAC
az role definition list, az role assignment create

# Policy
az policy definition list, az policy assignment create

# Resource Groups
az group create, az resource move, az group delete

# Management Groups
az account management-group create
az account management-group subscription add
```

---

## Practice Questions

1. **You need to ensure users in the Marketing department automatically get access to the Marketing resource group. What should you do?**
   - A. Create a dynamic user group based on department, assign RBAC role to the group
   - B. Assign RBAC roles directly to each user
   - C. Use Azure Policy to grant access
   - D. Create a security group and manually add users

2. **A user reports they cannot delete a storage account despite having Owner role. What should you check?**
   - A. Check for resource locks on the storage account or resource group
   - B. Check Azure Policy assignments
   - C. Verify subscription state
   - D. Check network security group rules

3. **You need to ensure all resources created in a subscription are tagged with a CostCenter tag. What should you implement?**
   - A. Azure Policy with Modify or Append effect
   - B. Resource locks
   - C. RBAC role assignment
   - D. Management group

4. **You need to grant read-only access to all resources in 20 subscriptions. What provides the most efficient solution?**
   - A. Create a management group, move subscriptions to it, assign Reader role at management group
   - B. Assign Reader role at each subscription
   - C. Assign Reader role at each resource group
   - D. Use Azure Policy

5. **Users need to reset their passwords without contacting helpdesk. The solution must work for on-premises accounts. What should you configure?**
   - A. Self-Service Password Reset with password writeback enabled
   - B. Self-Service Password Reset without writeback
   - C. Azure AD Connect password sync only
   - D. Azure AD B2B

**Answers:** 1-A, 2-A, 3-A, 4-A, 5-A

---

## Additional Resources

### Microsoft Learn Paths
- [Manage identities and governance in Azure](https://learn.microsoft.com/training/paths/azure-administrator-manage-identities-governance/)
- [Configure Azure Policy](https://learn.microsoft.com/training/modules/configure-azure-policy/)
- [Configure role-based access control](https://learn.microsoft.com/training/modules/configure-role-based-access-control/)

### Documentation Links
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/azure/active-directory/)
- [Azure RBAC Documentation](https://learn.microsoft.com/azure/role-based-access-control/)
- [Azure Policy Documentation](https://learn.microsoft.com/azure/governance/policy/)
- [Management Groups Documentation](https://learn.microsoft.com/azure/governance/management-groups/)

### Tips for Success
- Practice creating users and groups using all three methods (Portal, PowerShell, CLI)
- Understand the difference between Azure AD roles and Azure RBAC roles
- Know when to use each policy effect
- Understand lock inheritance and precedence
- Be familiar with tag limitations and best practices
- Practice navigating management group hierarchies
