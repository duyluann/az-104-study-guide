# Domain 3: Deploy and Manage Azure Compute Resources (20-25%)

## Overview
This domain covers Azure compute services including virtual machines, containers, and App Services, as well as infrastructure-as-code using ARM templates and Bicep.

---

## 1. Automate Deployment Using ARM Templates and Bicep

### 1.1 Interpret ARM Templates

#### ARM Template Structure
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vmName": {
      "type": "string",
      "defaultValue": "myVM"
    }
  },
  "variables": {
    "location": "[resourceGroup().location]"
  },
  "resources": [
    {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2023-03-01",
      "name": "[parameters('vmName')]",
      "location": "[variables('location')]",
      "properties": { }
    }
  ],
  "outputs": {
    "vmId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
    }
  }
}
```

#### Key Sections
- **$schema**: Defines template language version
- **contentVersion**: Template version (for tracking)
- **parameters**: Input values for deployment
- **variables**: Values computed during deployment
- **resources**: Azure resources to deploy
- **outputs**: Values returned after deployment

#### Common Functions
- `resourceGroup()`: Get resource group properties
- `subscription()`: Get subscription properties
- `concat()`: Concatenate strings
- `uniqueString()`: Create unique string (for resource names)
- `reference()`: Get runtime state of resource

### 1.2 Modify ARM Templates

#### Adding Parameters
```json
"parameters": {
  "vmSize": {
    "type": "string",
    "defaultValue": "Standard_B2s",
    "allowedValues": [
      "Standard_B2s",
      "Standard_D2s_v3",
      "Standard_D4s_v3"
    ],
    "metadata": {
      "description": "Size of the virtual machine"
    }
  }
}
```

#### Using Conditional Deployment
```json
"resources": [
  {
    "condition": "[equals(parameters('environment'), 'production')]",
    "type": "Microsoft.Compute/virtualMachines",
    "name": "prodVM"
  }
]
```

#### Dependency Management
```json
"resources": [
  {
    "type": "Microsoft.Network/networkInterfaces",
    "name": "myNIC",
    "dependsOn": [
      "[resourceId('Microsoft.Network/virtualNetworks', 'myVNet')]"
    ]
  }
]
```

### 1.3 Deploy ARM Templates

```bash
# Deploy to resource group
az deployment group create \
  --resource-group myResourceGroup \
  --template-file template.json \
  --parameters @parameters.json

# Deploy with inline parameters
az deployment group create \
  --resource-group myResourceGroup \
  --template-file template.json \
  --parameters vmName=myVM vmSize=Standard_D2s_v3

# What-if deployment (preview changes)
az deployment group what-if \
  --resource-group myResourceGroup \
  --template-file template.json \
  --parameters @parameters.json

# Deploy to subscription level
az deployment sub create \
  --location eastus \
  --template-file template.json
```

#### Deployment Modes
- **Incremental** (default): Adds resources, keeps existing resources
- **Complete**: Deletes resources not in template (use with caution)

### 1.4 Export Deployment as ARM Template

```bash
# Export resource group as template
az group export \
  --name myResourceGroup \
  --output-file exported-template.json

# Download deployment template
az deployment group export \
  --name myDeployment \
  --resource-group myResourceGroup

# Export specific resource
az resource show \
  --resource-group myResourceGroup \
  --name myVM \
  --resource-type Microsoft.Compute/virtualMachines \
  --query properties
```

### 1.5 Interpret Bicep Files

#### Bicep Syntax
```bicep
// Parameters
param vmName string = 'myVM'
param location string = resourceGroup().location
param vmSize string = 'Standard_B2s'

// Variables
var nicName = '${vmName}-nic'
var vnetName = '${vmName}-vnet'

// Resources
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: '10.0.0.0/24'
        }
      }
    ]
  }
}

// Outputs
output vnetId string = vnet.id
```

#### Bicep Advantages
- Simpler syntax than JSON
- Better IntelliSense support
- Automatic dependency management
- Modular design with modules

### 1.6 Modify Bicep Files

#### Using Modules
```bicep
// main.bicep
module storage './storage.bicep' = {
  name: 'storageDeploy'
  params: {
    storageAccountName: 'mystorageaccount'
    location: location
  }
}

// storage.bicep
param storageAccountName string
param location string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

output storageAccountId string = storageAccount.id
```

#### Conditional Resources
```bicep
param deployPublicIP bool = true

resource publicIP 'Microsoft.Network/publicIPAddresses@2023-04-01' = if (deployPublicIP) {
  name: 'myPublicIP'
  location: location
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}
```

### 1.7 Deploy Bicep Files

```bash
# Deploy Bicep file
az deployment group create \
  --resource-group myResourceGroup \
  --template-file main.bicep \
  --parameters vmName=myVM

# Build Bicep to ARM template
az bicep build --file main.bicep

# Decompile ARM to Bicep
az bicep decompile --file template.json
```

---

## 2. Create and Configure Virtual Machines

### 2.1 Create Virtual Machines

#### VM Creation Options
- Azure Portal
- Azure CLI
- PowerShell
- ARM templates / Bicep
- Terraform

```bash
# Create VM with Azure CLI
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --vnet-name myVNet \
  --subnet mySubnet

# Create Windows VM
az vm create \
  --resource-group myResourceGroup \
  --name myWindowsVM \
  --image Win2022Datacenter \
  --size Standard_D2s_v3 \
  --admin-username azureuser \
  --admin-password <password>
```

#### VM Images
- **Marketplace Images**: Pre-configured by Microsoft/partners
- **Custom Images**: Your own generalized VMs
- **Shared Image Gallery**: Centralized image management
- **Azure Compute Gallery**: Version management, replication

### 2.2 Configure Azure Disk Encryption

#### Encryption Options
1. **Server-Side Encryption (SSE)**: Default, automatic
2. **Azure Disk Encryption (ADE)**: BitLocker (Windows) / dm-crypt (Linux)
3. **Encryption at Host**: Encryption on VM host

#### Azure Disk Encryption (ADE)
```bash
# Prerequisites: Azure Key Vault

# Enable ADE on Linux VM
az vm encryption enable \
  --resource-group myResourceGroup \
  --name myVM \
  --disk-encryption-keyvault myKeyVault \
  --volume-type All

# Enable ADE on Windows VM
az vm encryption enable \
  --resource-group myResourceGroup \
  --name myWindowsVM \
  --disk-encryption-keyvault myKeyVault \
  --volume-type All

# Check encryption status
az vm encryption show \
  --resource-group myResourceGroup \
  --name myVM
```

#### Encryption at Host
- Encrypts temp disk and OS/data disk caches
- Enabled at VM creation (cannot be changed later)

```bash
# Create VM with encryption at host
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --encryption-at-host true
```

### 2.3 Move VMs Between Resource Groups

```bash
# Move VM and associated resources
az resource move \
  --destination-group targetResourceGroup \
  --ids $(az resource show --resource-group sourceRG --name myVM --resource-type Microsoft.Compute/virtualMachines --query id --output tsv)

# Note: Must move associated resources (NICs, disks, etc.) together
```

**Important Considerations**:
- VM must be stopped (deallocated)
- Source and destination subscriptions must be in same tenant
- Some resource types cannot be moved
- Validate move operation first

### 2.4 Manage VM Sizes

#### VM Size Families
| Family | Description | Use Case |
|--------|-------------|----------|
| **B-series** | Burstable | Development, test, small workloads |
| **D-series** | General purpose | Web servers, databases |
| **E-series** | Memory optimized | Large databases, in-memory analytics |
| **F-series** | Compute optimized | Gaming, analytics, batch processing |
| **L-series** | Storage optimized | Big data, SQL, NoSQL databases |
| **N-series** | GPU enabled | ML, rendering, video processing |

```bash
# List available sizes in a region
az vm list-sizes --location eastus --output table

# Resize VM (VM must be stopped)
az vm deallocate --resource-group myResourceGroup --name myVM
az vm resize --resource-group myResourceGroup --name myVM --size Standard_D4s_v3
az vm start --resource-group myResourceGroup --name myVM

# Resize without downtime (if size is available in current cluster)
az vm resize --resource-group myResourceGroup --name myVM --size Standard_D4s_v3
```

### 2.5 Deploy VMs to Availability Zones

#### Availability Zones
- Physically separate datacenters within a region
- Protects from datacenter failures
- 3 zones per supported region
- 99.99% SLA (vs. 99.95% for single VM with Premium SSD)

```bash
# Create VM in availability zone
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --zone 1 \
  --size Standard_D2s_v3

# Create VMs in multiple zones
for zone in 1 2 3; do
  az vm create \
    --resource-group myResourceGroup \
    --name myVM-zone$zone \
    --zone $zone \
    --image Ubuntu2204
done
```

**Important**:
- Cannot change zones after VM creation
- Must use Standard SKU public IP and load balancer
- Managed disks are automatically zone-redundant

### 2.6 Deploy VMs to Availability Sets

#### Availability Sets
- Logical grouping within a datacenter
- Protects from hardware failures and updates
- 99.95% SLA (for 2+ VMs in availability set)

**Fault Domains (FD)**: Separate power/network (max 3)
**Update Domains (UD)**: Separate update groups (max 20)

```bash
# Create availability set
az vm availability-set create \
  --resource-group myResourceGroup \
  --name myAvailabilitySet \
  --platform-fault-domain-count 2 \
  --platform-update-domain-count 5

# Create VM in availability set
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --availability-set myAvailabilitySet \
  --image Ubuntu2204
```

**Limitations**:
- Cannot combine with availability zones
- Must specify at VM creation (cannot add later)
- All VMs must be in same availability set

### 2.7 Configure Virtual Machine Scale Sets (VMSS)

#### VMSS Features
- Auto-scaling (metric-based or schedule-based)
- Load balanced across instances
- Automatic OS updates
- Instance repair policies

```bash
# Create VMSS
az vmss create \
  --resource-group myResourceGroup \
  --name myVMSS \
  --image Ubuntu2204 \
  --instance-count 2 \
  --vm-sku Standard_D2s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --load-balancer myLoadBalancer

# Scale manually
az vmss scale \
  --resource-group myResourceGroup \
  --name myVMSS \
  --new-capacity 5

# Configure autoscale
az monitor autoscale create \
  --resource-group myResourceGroup \
  --resource myVMSS \
  --resource-type Microsoft.Compute/virtualMachineScaleSets \
  --name autoscale \
  --min-count 2 \
  --max-count 10 \
  --count 2

# Add scale-out rule (CPU > 75%)
az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name autoscale \
  --condition "Percentage CPU > 75 avg 5m" \
  --scale out 1

# Add scale-in rule (CPU < 25%)
az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name autoscale \
  --condition "Percentage CPU < 25 avg 5m" \
  --scale in 1
```

#### VMSS Orchestration Modes
- **Uniform**: Identical VMs, better for large-scale stateless workloads
- **Flexible**: Mix of VM sizes and types, better control

#### VMSS Update Policy
- **Automatic**: Instances updated immediately
- **Rolling**: Instances updated in batches
- **Manual**: You control when instances are updated

---

## 3. Provision and Manage Containers

### 3.1 Manage Azure Container Registry (ACR)

#### ACR Features
- Private container registry
- Integrated with Azure services
- Geo-replication for multi-region deployments
- Security scanning and vulnerability assessment

#### ACR SKUs
| SKU | Storage | Throughput | Use Case |
|-----|---------|------------|----------|
| **Basic** | 10 GB | Low | Development |
| **Standard** | 100 GB | Medium | Production |
| **Premium** | 500 GB | High | Geo-replication, VNet integration |

```bash
# Create container registry
az acr create \
  --resource-group myResourceGroup \
  --name myContainerRegistry \
  --sku Standard \
  --admin-enabled true

# Log in to ACR
az acr login --name myContainerRegistry

# Build and push image
az acr build \
  --registry myContainerRegistry \
  --image myapp:v1 \
  --file Dockerfile .

# List images
az acr repository list --name myContainerRegistry --output table

# List tags
az acr repository show-tags \
  --name myContainerRegistry \
  --repository myapp \
  --output table

# Pull image
docker pull mycontainerregistry.azurecr.io/myapp:v1
```

#### ACR Tasks
- Build images in cloud
- Multi-step tasks
- Triggered builds (code commit, base image update)

```bash
# Quick build
az acr build --registry myContainerRegistry --image myapp:v2 .

# Create task for automatic builds
az acr task create \
  --registry myContainerRegistry \
  --name buildtask \
  --image myapp:{{.Run.ID}} \
  --context https://github.com/user/repo.git \
  --file Dockerfile \
  --git-access-token <PAT>
```

### 3.2 Create and Configure Azure Container Instances (ACI)

#### ACI Features
- Fastest way to run containers
- No orchestration needed
- Per-second billing
- Both Windows and Linux containers

```bash
# Create container instance
az container create \
  --resource-group myResourceGroup \
  --name mycontainer \
  --image mcr.microsoft.com/azuredocs/aci-helloworld \
  --dns-name-label myapp-unique \
  --ports 80

# Create with private registry
az container create \
  --resource-group myResourceGroup \
  --name mycontainer \
  --image mycontainerregistry.azurecr.io/myapp:v1 \
  --registry-login-server mycontainerregistry.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --dns-name-label myapp

# View logs
az container logs \
  --resource-group myResourceGroup \
  --name mycontainer

# Execute command in container
az container exec \
  --resource-group myResourceGroup \
  --name mycontainer \
  --exec-command /bin/bash
```

#### Container Groups
- Deploy multiple containers together
- Share network, storage, lifecycle
- Similar to Kubernetes pod

```yaml
# YAML definition for container group
apiVersion: '2021-09-01'
location: eastus
name: mycontainergroup
properties:
  containers:
  - name: web
    properties:
      image: nginx
      ports:
      - port: 80
      resources:
        requests:
          cpu: 1
          memoryInGb: 1.5
  - name: sidecar
    properties:
      image: alpine
      command: ["/bin/sh", "-c", "while true; do sleep 30; done"]
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 0.5
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 80
```

```bash
# Deploy container group
az container create \
  --resource-group myResourceGroup \
  --file containergroup.yaml
```

### 3.3 Create and Configure Azure Container Apps

#### Container Apps Features
- Built on Kubernetes (abstracted away)
- Auto-scaling (scale to zero)
- HTTPS ingress
- Traffic splitting (A/B testing, blue-green)
- Managed revisions

```bash
# Create Container Apps environment
az containerapp env create \
  --name myEnvironment \
  --resource-group myResourceGroup \
  --location eastus

# Create container app
az containerapp create \
  --name myapp \
  --resource-group myResourceGroup \
  --environment myEnvironment \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 10

# Update container app
az containerapp update \
  --name myapp \
  --resource-group myResourceGroup \
  --image mycontainerregistry.azurecr.io/myapp:v2

# View revisions
az containerapp revision list \
  --name myapp \
  --resource-group myResourceGroup \
  --output table

# Configure traffic splitting
az containerapp ingress traffic set \
  --name myapp \
  --resource-group myResourceGroup \
  --revision-weight latest=80 previous=20
```

#### Scaling Configuration
```bash
# Configure autoscaling
az containerapp update \
  --name myapp \
  --resource-group myResourceGroup \
  --min-replicas 1 \
  --max-replicas 10 \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-metadata concurrentRequests=50
```

---

## 4. Create and Configure Azure App Service

### 4.1 Provision App Service Plans

#### App Service Plan Tiers
| Tier | Features | Use Case |
|------|----------|----------|
| **Free (F1)** | Shared compute, 60 min/day | Learning, testing |
| **Shared (D1)** | Shared compute, 240 min/day | Small apps |
| **Basic (B1-B3)** | Dedicated compute, manual scale | Development |
| **Standard (S1-S3)** | Auto-scale, staging slots, backups | Production |
| **Premium (P1v3-P3v3)** | Enhanced performance, VNet integration | High-performance production |
| **Isolated (I1v2-I3v2)** | App Service Environment, network isolation | Enterprise, compliance |

```bash
# Create App Service plan
az appservice plan create \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux

# Scale up (change tier)
az appservice plan update \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku S1

# Scale out (add instances)
az appservice plan update \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --number-of-workers 3
```

### 4.2 Configure Scaling for App Service Plans

#### Manual Scaling
```bash
# Scale to specific instance count
az appservice plan update \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --number-of-workers 5
```

#### Auto-scaling (Standard tier and above)
```bash
# Create autoscale setting
az monitor autoscale create \
  --resource-group myResourceGroup \
  --resource myAppServicePlan \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale \
  --min-count 2 \
  --max-count 10 \
  --count 2

# Add scale-out rule
az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name autoscale \
  --condition "CpuPercentage > 70 avg 5m" \
  --scale out 2

# Add scale-in rule
az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name autoscale \
  --condition "CpuPercentage < 30 avg 5m" \
  --scale in 1
```

### 4.3 Create App Service Web Apps

```bash
# Create web app
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name myWebApp \
  --runtime "NODE:18-lts"

# Create web app with deployment
az webapp up \
  --resource-group myResourceGroup \
  --name myWebApp \
  --runtime "PYTHON:3.11" \
  --sku B1

# Deploy from local Git
az webapp deployment source config-local-git \
  --name myWebApp \
  --resource-group myResourceGroup

# Deploy from GitHub
az webapp deployment source config \
  --name myWebApp \
  --resource-group myResourceGroup \
  --repo-url https://github.com/user/repo \
  --branch main \
  --manual-integration
```

### 4.4 Configure Certificates and Custom Domains

#### Custom Domain
```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name myWebApp \
  --resource-group myResourceGroup \
  --hostname www.contoso.com

# Note: Must configure DNS CNAME or A record first
# CNAME: www.contoso.com -> mywebapp.azurewebsites.net
# OR
# A record: www.contoso.com -> <app-ip>
# TXT record: asuid.www.contoso.com -> <verification-id>
```

#### SSL/TLS Certificates
```bash
# Create managed certificate (free, requires custom domain)
az webapp config ssl create \
  --resource-group myResourceGroup \
  --name myWebApp \
  --hostname www.contoso.com

# Upload certificate
az webapp config ssl upload \
  --resource-group myResourceGroup \
  --name myWebApp \
  --certificate-file certificate.pfx \
  --certificate-password <password>

# Bind certificate
az webapp config ssl bind \
  --resource-group myResourceGroup \
  --name myWebApp \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI

# Enforce HTTPS
az webapp update \
  --resource-group myResourceGroup \
  --name myWebApp \
  --https-only true
```

### 4.5 Configure Application Settings

```bash
# Set app settings (environment variables)
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myWebApp \
  --settings \
    DB_HOST=mydbserver.database.windows.net \
    DB_NAME=mydb \
    API_KEY=@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/apikey/)

# List app settings
az webapp config appsettings list \
  --resource-group myResourceGroup \
  --name myWebApp

# Configure connection strings
az webapp config connection-string set \
  --resource-group myResourceGroup \
  --name myWebApp \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=tcp:myserver.database.windows.net;Database=mydb"
```

### 4.6 Configure Backup for App Service

```bash
# Create storage account for backups
az storage account create \
  --name mybackupstorage \
  --resource-group myResourceGroup

# Create storage container
az storage container create \
  --name backups \
  --account-name mybackupstorage

# Generate SAS token
sasToken=$(az storage container generate-sas \
  --account-name mybackupstorage \
  --name backups \
  --permissions rwdl \
  --expiry 2026-01-01 \
  --output tsv)

# Configure backup
az webapp config backup create \
  --resource-group myResourceGroup \
  --webapp-name myWebApp \
  --container-url "https://mybackupstorage.blob.core.windows.net/backups?$sasToken" \
  --backup-name mybackup

# Configure scheduled backup
az webapp config backup update \
  --resource-group myResourceGroup \
  --webapp-name myWebApp \
  --container-url "https://mybackupstorage.blob.core.windows.net/backups?$sasToken" \
  --frequency 1d \
  --retain-one true \
  --retention 30
```

**Backup includes**:
- App configuration
- File content
- Connected database (if configured)

**Requirements**:
- Standard tier or higher
- Storage account in same subscription

### 4.7 Configure Networking for App Service

#### VNet Integration (Outbound)
```bash
# Integrate with VNet (for outbound traffic)
az webapp vnet-integration add \
  --resource-group myResourceGroup \
  --name myWebApp \
  --vnet myVNet \
  --subnet appSubnet
```

#### Access Restrictions (Inbound)
```bash
# Add IP restriction
az webapp config access-restriction add \
  --resource-group myResourceGroup \
  --name myWebApp \
  --rule-name AllowOffice \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100

# Add VNet restriction
az webapp config access-restriction add \
  --resource-group myResourceGroup \
  --name myWebApp \
  --rule-name AllowVNet \
  --action Allow \
  --vnet-name myVNet \
  --subnet mySubnet \
  --priority 200
```

### 4.8 Configure Deployment Slots

#### Deployment Slots Features
- Swap slots with zero downtime
- Warm up before swap
- Auto-swap (for CI/CD)
- Slot-specific settings

```bash
# Create deployment slot
az webapp deployment slot create \
  --resource-group myResourceGroup \
  --name myWebApp \
  --slot staging

# Deploy to staging slot
az webapp deployment source config \
  --resource-group myResourceGroup \
  --name myWebApp \
  --slot staging \
  --repo-url https://github.com/user/repo \
  --branch develop

# Swap slots (staging -> production)
az webapp deployment slot swap \
  --resource-group myResourceGroup \
  --name myWebApp \
  --slot staging \
  --target-slot production

# Configure slot-specific setting (won't swap)
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myWebApp \
  --slot staging \
  --settings ENVIRONMENT=Staging \
  --slot-settings ENVIRONMENT
```

**Slot Settings**:
- Sticky (slot-specific): Stay with slot during swap
- Non-sticky: Move with content during swap

---

## Key Exam Tips

1. **ARM vs. Bicep**: Bicep is simpler, compiles to ARM
2. **Availability Zones vs. Sets**: Zones protect from datacenter failure, Sets protect from rack failure
3. **VMSS Autoscale**: Based on metrics (CPU, memory) or schedule
4. **ACI vs. ACA vs. AKS**: ACI for simple containers, ACA for microservices, AKS for full Kubernetes
5. **App Service Tiers**: Free/Shared use shared compute, Basic+ use dedicated
6. **Deployment Slots**: Require Standard tier or higher
7. **Disk Encryption**: ADE requires Key Vault, SSE is automatic
8. **Container Registry**: Premium tier required for geo-replication
9. **App Service Backup**: Standard tier or higher, includes databases
10. **Custom Domains**: Free managed certificates available

---

## Practice Scenarios

### Scenario 1: High Availability VM
**Question**: Deploy a web application across 3 VMs with 99.99% SLA.

**Answer**:
1. Create VMs in 3 different availability zones
2. Use Standard SKU load balancer
3. Use Premium SSD or Standard SSD for OS disks
4. Configure health probes on load balancer

### Scenario 2: Auto-scaling Web App
**Question**: Web app needs to scale from 2 to 10 instances based on CPU usage.

**Answer**:
1. Use Standard S1 or higher App Service plan
2. Configure autoscale with min=2, max=10
3. Add rule: Scale out when CPU > 70% for 5 minutes
4. Add rule: Scale in when CPU < 30% for 5 minutes

### Scenario 3: Blue-Green Deployment
**Question**: Deploy new version with zero downtime and quick rollback capability.

**Answer**:
1. Create staging deployment slot
2. Deploy new version to staging
3. Test staging slot
4. Swap staging and production slots
5. If issues, swap back immediately

---

## Additional Resources

- [Azure Virtual Machines Documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/)
- [ARM Templates Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure Container Instances Documentation](https://learn.microsoft.com/en-us/azure/container-instances/)
- [App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
