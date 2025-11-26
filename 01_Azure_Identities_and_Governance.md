# Domain 1: Manage Azure Identities and Governance (20-25%)

## Overview
This domain covers identity management, role-based access control (RBAC), and governance features in Azure including subscriptions, resource groups, policies, and cost management.

---

## 1. Microsoft Entra ID Users and Groups

### 1.1 Create Users and Groups

#### User Types
- **Cloud Identity**: Users created directly in Microsoft Entra ID
- **Directory-Synchronized Identity**: Users synced from on-premises AD
- **Guest User (B2B)**: External users invited to collaborate

#### Creating Users
```powershell
# PowerShell
New-AzADUser -DisplayName "John Doe" -UserPrincipalName "john.doe@contoso.com" -Password $password -MailNickname "johndoe"
```

```bash
# Azure CLI
az ad user create --display-name "John Doe" --password <password> --user-principal-name john.doe@contoso.com
```

#### Creating Groups
- **Security Groups**: Used for resource access management
- **Microsoft 365 Groups**: Used for collaboration (email, calendar, files)

**Assignment Types**:
- **Assigned**: Manually add members
- **Dynamic User**: Automatically add users based on rules
- **Dynamic Device**: Automatically add devices based on rules

```bash
# Create a security group
az ad group create --display-name "IT Admins" --mail-nickname "itadmins"

# Create dynamic group with membership rule
az ad group create --display-name "Marketing Users" --mail-nickname "marketing" --membership-rule "user.department -eq 'Marketing'"
```

### 1.2 Manage User and Group Properties

#### User Properties
- Display name, user principal name (UPN)
- Job title, department, manager
- Contact information
- Usage location (required for license assignment)

#### Managing Licenses
- Assign licenses directly to users or groups
- Group-based licensing automatically assigns licenses to group members

```powershell
# Assign license to user
Set-AzureADUserLicense -ObjectId <user-id> -AssignedLicenses <license-sku>
```

### 1.3 Manage External Users

#### Azure AD B2B Collaboration
- Invite external users as guests
- External users authenticate with their home organization
- Control guest access with external collaboration settings

```bash
# Invite guest user
az ad user create --display-name "External User" --user-principal-name externaluser@partner.com --user-type Guest
```

#### External Identities Settings
- Configure who can invite guests (admins, users, guests)
- Collaboration restrictions (allowed/blocked domains)
- Guest user permissions (restricted or same as members)

### 1.4 Configure Self-Service Password Reset (SSPR)

#### Requirements
- Azure AD Premium P1 or P2 license (for on-premises writeback)
- Configure authentication methods (2 methods required)

#### Authentication Methods
- Mobile app notification
- Mobile app code
- Email
- Mobile phone (SMS)
- Office phone
- Security questions

#### Configuration Steps
1. Enable SSPR for selected or all users
2. Configure authentication methods
3. Set registration requirements
4. Configure password writeback (for hybrid)
5. Customize notifications

```bash
# Users register at: https://aka.ms/ssprsetup
# Users reset password at: https://aka.ms/sspr
```

---

## 2. Manage Access to Azure Resources

### 2.1 Built-in Azure Roles

#### Key Built-in Roles
| Role | Description | Scope |
|------|-------------|-------|
| **Owner** | Full access including the right to delegate access | All resources |
| **Contributor** | Full access to resources but cannot grant access | All resources |
| **Reader** | View all resources but cannot make changes | All resources |
| **User Access Administrator** | Manage user access to Azure resources | All resources |

#### Resource-Specific Roles
- **Virtual Machine Contributor**: Manage VMs but not their network/storage
- **Network Contributor**: Manage networks
- **Storage Account Contributor**: Manage storage accounts
- **SQL DB Contributor**: Manage SQL databases
- **Website Contributor**: Manage websites

### 2.2 Assign Roles at Different Scopes

#### RBAC Scope Hierarchy
1. **Management Group**: Highest level, applies to multiple subscriptions
2. **Subscription**: Applies to all resource groups and resources
3. **Resource Group**: Applies to all resources in the group
4. **Resource**: Applies to a specific resource only

**Inheritance**: Permissions assigned at a parent scope are inherited by child scopes.

```bash
# Assign role at subscription scope
az role assignment create --assignee user@contoso.com --role "Contributor" --scope /subscriptions/<subscription-id>

# Assign role at resource group scope
az role assignment create --assignee user@contoso.com --role "Virtual Machine Contributor" --resource-group myResourceGroup

# Assign role at resource scope
az role assignment create --assignee user@contoso.com --role "Reader" --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<storage-account>
```

### 2.3 Interpret Access Assignments

#### Role Assignments Tab
- View effective permissions for users/groups
- Check deny assignments (Azure Blueprints, managed apps)
- Understand inheritance from parent scopes

#### Access Control (IAM)
- **Check Access**: See what permissions a user has
- **Role Assignments**: View all role assignments
- **Deny Assignments**: View deny rules (override allow)

---

## 3. Manage Azure Subscriptions and Governance

### 3.1 Configure Azure Policy

#### Azure Policy Concepts
- **Policy Definition**: The rule to enforce (JSON)
- **Policy Assignment**: Apply policy to a scope
- **Initiative**: Group of policy definitions
- **Compliance**: Track resource compliance status

#### Common Built-in Policies
- Allowed virtual machine SKUs
- Require tag on resources
- Allowed locations
- Require SQL Server 12.0
- Audit VMs without managed disks

```bash
# Assign a built-in policy
az policy assignment create --name 'audit-vm-managed-disks' --policy "audit-vm-manageddisks" --scope /subscriptions/<subscription-id>

# Create custom policy definition
az policy definition create --name 'require-tag' --rules policy-rules.json --params policy-params.json
```

#### Policy Effects
- **Deny**: Block resource creation/update
- **Audit**: Log non-compliant resources
- **Append**: Add properties to resources
- **Modify**: Add, update, or remove tags
- **DeployIfNotExists**: Deploy resources if they don't exist
- **AuditIfNotExists**: Audit if related resources don't exist

### 3.2 Configure Resource Locks

#### Lock Types
- **CanNotDelete**: Can read and modify, but cannot delete
- **ReadOnly**: Can only read, cannot modify or delete

```bash
# Add delete lock to resource group
az lock create --name LockGroup --lock-type CanNotDelete --resource-group myResourceGroup

# Add read-only lock to resource
az lock create --name LockVM --lock-type ReadOnly --resource-group myResourceGroup --resource-name myVM --resource-type Microsoft.Compute/virtualMachines
```

**Important**: Locks apply to all users regardless of RBAC permissions. Owner can still add/remove locks.

### 3.3 Apply and Manage Tags

#### Tag Use Cases
- Cost tracking and allocation
- Environment identification (dev, test, prod)
- Department/owner identification
- Automation and deployment

```bash
# Apply tags to resource group
az group update --name myResourceGroup --set tags.Environment=Production tags.CostCenter=IT

# Apply tags to resource
az resource tag --tags Environment=Production Owner=DevOps --ids /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/<vm>
```

#### Tag Policies
- Require specific tags on resources
- Inherit tags from resource group or subscription
- Append tags automatically

```json
{
  "if": {
    "field": "tags.Environment",
    "exists": "false"
  },
  "then": {
    "effect": "deny"
  }
}
```

### 3.4 Manage Resource Groups

#### Resource Group Characteristics
- Logical container for resources
- All resources must be in a resource group
- Resources can only be in one resource group
- Resource groups cannot be nested
- Deleting a resource group deletes all resources

```bash
# Create resource group
az group create --name myResourceGroup --location eastus

# Move resources between groups
az resource move --destination-group targetResourceGroup --ids <resource-id-1> <resource-id-2>

# Delete resource group
az group delete --name myResourceGroup --yes
```

### 3.5 Manage Subscriptions

#### Subscription Purposes
- Billing boundary
- Access control boundary
- Separate environments (dev, prod)
- Organizational units (departments, projects)

#### Subscription Limits
- Default limits per subscription (e.g., 25,000 VMs per region)
- Can request increases for many limits
- Some limits are hard limits

```bash
# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription <subscription-id>

# Transfer subscription (via Azure Portal or API)
```

### 3.6 Manage Management Groups

#### Management Group Hierarchy
- Root management group (automatic)
- Up to 6 levels of depth
- Each subscription can have one parent management group
- Each management group can have multiple children

```bash
# Create management group
az account management-group create --name "IT-Department" --display-name "IT Department"

# Add subscription to management group
az account management-group subscription add --name "IT-Department" --subscription <subscription-id>
```

#### Benefits
- Apply policies across multiple subscriptions
- Organize subscriptions by department, environment, geography
- Azure RBAC applies across management group hierarchy

### 3.7 Manage Costs

#### Azure Cost Management Tools
- **Cost Analysis**: View and analyze costs
- **Budgets**: Set spending budgets with alerts
- **Cost Alerts**: Automated notifications
- **Azure Advisor**: Cost optimization recommendations

```bash
# Create budget
az consumption budget create --budget-name MyBudget --amount 1000 --category Cost --time-grain Monthly --start-date 2025-01-01 --end-date 2025-12-31
```

#### Cost Optimization Strategies
- Right-size VMs based on utilization
- Use Azure Hybrid Benefit for Windows/SQL
- Reserve instances for predictable workloads
- Use Azure Spot VMs for interruptible workloads
- Delete unused resources
- Use auto-shutdown for dev/test VMs

#### Azure Advisor Cost Recommendations
- Underutilized virtual machines
- Unprovisioned ExpressRoute circuits
- Idle virtual network gateways
- Optimize costs with reserved instances

---

## Key Exam Tips

1. **RBAC Scope**: Understand the hierarchy and inheritance model
2. **Policy vs. RBAC**: Policies govern resource properties, RBAC governs who can do what
3. **Locks**: Apply at parent scope to protect multiple resources
4. **Tags**: Not inherited by default; use policies to enforce inheritance
5. **SSPR**: Requires Azure AD Premium for password writeback
6. **Dynamic Groups**: Require Azure AD Premium P1
7. **Management Groups**: Maximum 6 levels of depth (excluding root)
8. **Guest Users**: External identities for B2B collaboration

---

## Practice Scenarios

### Scenario 1: Role Assignment
**Question**: A user needs to create VMs in ResourceGroupA but should not be able to delete them. What should you configure?

**Answer**:
1. Assign "Virtual Machine Contributor" role at ResourceGroupA scope
2. Apply a "CanNotDelete" lock to ResourceGroupA

### Scenario 2: Policy Enforcement
**Question**: Ensure all resources in a subscription are created only in East US or West US regions.

**Answer**:
1. Create or assign the "Allowed locations" policy
2. Scope: Subscription level
3. Configure parameters: ["East US", "West US"]
4. Effect: Deny

### Scenario 3: Cost Management
**Question**: Department heads need to view costs for their department's resources but cannot modify them.

**Answer**:
1. Tag all resources with Department tag
2. Assign "Reader" role at subscription scope
3. Use Cost Analysis with Department tag filter
4. Create budgets filtered by Department tag

---

## Additional Resources

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [Azure RBAC Documentation](https://learn.microsoft.com/en-us/azure/role-based-access-control/)
- [Azure Policy Documentation](https://learn.microsoft.com/en-us/azure/governance/policy/)
- [Azure Cost Management Documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/)
