# AZ-104: Microsoft Azure Administrator Study Guide

## Interactive Study Web App

This repository includes an interactive web application that makes studying easier with progress tracking, notes, and a modern interface.

### Features

- **Progress Tracking**: Mark sections and topics as completed
- **Topic-Level Progress**: Track individual topics within each section
- **Progress Dashboard**: Visual dashboard showing completion percentage and statistics
- **Study Notes**: Add and save personal notes for each topic
- **Modern Interface**: Clean, responsive design that works on all devices
- **Local Storage**: All progress and notes are saved automatically in your browser

### Quick Start

#### Option 1: GitHub Pages (Recommended)
The app is deployed at: `https://YOUR-USERNAME.github.io/az-104-study-guide/`

To enable GitHub Pages:
1. Go to your repository Settings
2. Navigate to Pages section
3. Under "Build and deployment", select "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Click Save
6. Your site will be available in a few minutes

#### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/az-104-study-guide.git
cd az-104-study-guide

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js
npx http-server

# Open your browser to http://localhost:8000
```

### How to Use the Study App

1. **Navigate Sections**: Click on any of the 5 sections in the sidebar to expand topics
2. **Study Topics**: Click on individual topics to view the content
3. **Mark Complete**: Use the checkbox at the bottom to mark topics as completed
4. **Add Notes**: Click the notes icon to open the notes panel and add personal notes
5. **Track Progress**: Monitor your overall progress in the circular progress indicator

---

## About the AZ-104 Exam

The **AZ-104: Microsoft Azure Administrator** certification validates your skills in implementing, managing, and monitoring an organization's Azure environment. This intermediate-level certification is ideal for professionals who want to demonstrate their expertise in Azure administration.

### Exam Details

- **Exam Code**: AZ-104
- **Duration**: 100 minutes
- **Passing Score**: 700 or greater (out of 1000)
- **Question Types**: Multiple choice, case studies, drag-and-drop, hot area, build lists
- **Cost**: Varies by region
- **Languages**: Available in 9 languages
- **Renewal**: Required every 12 months (free online renewal assessment)
- **Level**: Intermediate

### Skills Measured

The exam measures your ability to accomplish the following technical tasks:

1. **Manage Azure Identities and Governance** (20-25%)
2. **Implement and Manage Storage** (15-20%)
3. **Deploy and Manage Azure Compute Resources** (20-25%)
4. **Implement and Manage Virtual Networking** (15-20%)
5. **Monitor and Maintain Azure Resources** (10-15%)

---

## Study Guide Structure

This study guide is organized into five comprehensive notebooks, one for each exam domain:

### 📘 [01_Azure_Identities_and_Governance.md](01_Azure_Identities_and_Governance.md)
**Weight: 20-25%**

Topics covered:
- Microsoft Entra ID (Azure AD) users and groups
- Role-Based Access Control (RBAC)
- Azure subscriptions and management groups
- Azure Policy and resource locks
- Tags and cost management
- Self-service password reset (SSPR)

### 💾 [02_Implement_and_Manage_Storage.md](02_Implement_and_Manage_Storage.md)
**Weight: 15-20%**

Topics covered:
- Storage accounts and redundancy options
- Blob storage and access tiers
- Azure Files and file shares
- Storage security (SAS, access keys, firewalls)
- Blob lifecycle management
- AzCopy and Storage Explorer
- Object replication and versioning

### 🖥️ [03_Deploy_and_Manage_Compute_Resources.md](03_Deploy_and_Manage_Compute_Resources.md)
**Weight: 20-25%**

Topics covered:
- ARM templates and Bicep
- Virtual machines and availability
- Availability zones and sets
- Virtual Machine Scale Sets (VMSS)
- Azure Container Registry (ACR)
- Container Instances (ACI) and Container Apps
- App Service and deployment slots

### 🌐 [04_Implement_and_Manage_Virtual_Networking.md](04_Implement_and_Manage_Virtual_Networking.md)
**Weight: 15-20%**

Topics covered:
- Virtual networks (VNets) and subnets
- VNet peering
- Network Security Groups (NSGs)
- User-defined routes (UDR)
- Azure Bastion
- Private endpoints and service endpoints
- Azure Load Balancer
- Azure DNS and name resolution

### 📊 [05_Monitor_and_Maintain_Azure_Resources.md](05_Monitor_and_Maintain_Azure_Resources.md)
**Weight: 10-15%**

Topics covered:
- Azure Monitor metrics and logs
- Log Analytics and KQL queries
- Alerts and action groups
- Application Insights
- Azure Backup and Recovery Services
- Site Recovery and disaster recovery
- Network Watcher and diagnostics

---

## Prerequisites

Before taking the AZ-104 exam, you should have:

### Technical Knowledge
- Understanding of operating systems (Windows, Linux)
- Basic networking concepts (IP addressing, DNS, routing)
- Virtualization fundamentals
- Cloud computing concepts
- Basic scripting knowledge

### Azure Experience
- Hands-on experience with Azure Portal
- Familiarity with Azure CLI and PowerShell
- Experience with ARM templates or Bicep
- Understanding of Microsoft Entra ID (formerly Azure AD)

### Recommended Experience
- At least 6 months of hands-on experience administering Azure
- Experience implementing, managing, and monitoring Azure environments

---

## Study Strategy

### 1. Follow the Study Plan

Work through each domain notebook in order:
1. Read and understand concepts
2. Practice commands and examples
3. Complete practice scenarios
4. Create hands-on labs in Azure

### 2. Get Hands-On Experience

**Azure Free Tier**:
- Sign up for Azure free account (12 months free services)
- Use $200 credit for first 30 days
- Practice with free-tier services

**Learning Environments**:
- Microsoft Learn sandbox environments
- Azure Pass (for training courses)
- Personal Azure subscription (be mindful of costs)

### 3. Use Multiple Resources

**Official Microsoft Resources**:
- [Microsoft Learn AZ-104 Learning Path](https://learn.microsoft.com/en-us/training/courses/az-104t00)
- [AZ-104 Exam Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
- [Microsoft Learn Documentation](https://learn.microsoft.com/en-us/azure/)

**Practice Tests**:
- Microsoft Official Practice Test
- MeasureUp practice exams
- Whizlabs practice tests
- ExamTopics (community discussions)

**Video Courses**:
- Microsoft Learn videos
- Pluralsight
- A Cloud Guru
- Udemy courses

### 4. Practice, Practice, Practice

**Command-Line Tools**:
- Master Azure CLI commands
- Learn PowerShell Az module
- Practice both Windows and Linux

**Scenarios**:
- Complete practice scenarios in each notebook
- Create your own scenarios
- Deploy real-world solutions

### 5. Join Study Groups

- Microsoft Tech Community
- Reddit r/AzureCertification
- LinkedIn Azure groups
- Discord study servers

---

## Exam Tips

### Before the Exam

1. **Review all domains** - Don't skip any section
2. **Focus on weak areas** - Use practice tests to identify gaps
3. **Hands-on labs** - Theory isn't enough; practice in Azure Portal
4. **Memorize key facts** - IP ranges, limits, SKU features
5. **Understand scenarios** - Exam tests application, not just memorization

### During the Exam

1. **Read carefully** - Questions can be tricky with subtle differences
2. **Manage time** - 100 minutes for ~50 questions, pace yourself
3. **Mark for review** - Flag uncertain questions, return later
4. **Case studies first** - Some prefer tackling case studies early
5. **Eliminate wrong answers** - Narrow down choices
6. **Trust your knowledge** - Don't second-guess too much

### Question Types

- **Multiple choice**: Single or multiple correct answers
- **Case studies**: Scenario-based questions (multiple questions per scenario)
- **Drag and drop**: Order steps or match items
- **Hot area**: Select correct area on diagram/screenshot
- **Build list**: Order items correctly

### Common Exam Topics

Based on exam feedback, these topics appear frequently:

**High-Priority Topics**:
- RBAC and role assignments
- NSG rules and priority
- VM availability (zones vs. sets)
- Storage redundancy options
- VNet peering configuration
- Load balancer configuration
- Backup and restore operations
- ARM template interpretation

**Know the Differences**:
- Availability Zones vs. Availability Sets
- Service Endpoints vs. Private Endpoints
- Basic vs. Standard SKUs (Load Balancer, Public IP)
- LRS vs. GRS vs. ZRS storage
- Metric alerts vs. Log alerts
- Recovery Services Vault vs. Backup Vault

**Memorize These**:
- Reserved IPs in subnet (first 4, last 1)
- NSG default rules (65000+ priority)
- Azure Bastion subnet name (AzureBastionSubnet, /26)
- Gateway subnet name (GatewaySubnet)
- Metric retention (93 days)
- Soft delete retention (14 days)
- Management group depth (6 levels)

---

## Quick Reference: Azure CLI Commands

### Identity and Governance
```bash
# RBAC
az role assignment create --assignee <user> --role <role> --scope <scope>

# Policy
az policy assignment create --name <name> --policy <policy> --scope <scope>

# Locks
az lock create --name <name> --lock-type CanNotDelete --resource-group <rg>
```

### Storage
```bash
# Storage account
az storage account create --name <name> --resource-group <rg> --sku Standard_LRS

# Blob container
az storage container create --name <name> --account-name <account>

# SAS token
az storage container generate-sas --name <name> --account-name <account> --permissions rwdl --expiry <date>
```

### Compute
```bash
# VM
az vm create --resource-group <rg> --name <name> --image UbuntuLTS

# VMSS
az vmss create --resource-group <rg> --name <name> --image UbuntuLTS --instance-count 2

# App Service
az webapp create --resource-group <rg> --plan <plan> --name <name>
```

### Networking
```bash
# VNet
az network vnet create --resource-group <rg> --name <name> --address-prefix 10.0.0.0/16

# NSG
az network nsg rule create --resource-group <rg> --nsg-name <nsg> --name <name> --priority 100

# Load Balancer
az network lb create --resource-group <rg> --name <name> --sku Standard
```

### Monitoring
```bash
# Metric alert
az monitor metrics alert create --name <name> --resource-group <rg> --condition "avg CPU > 80"

# Backup
az backup protection enable-for-vm --resource-group <rg> --vault-name <vault> --vm <vm>
```

---

## Important Azure Limits and Quotas

| Resource | Default Limit |
|----------|--------------|
| VMs per subscription (per region) | 25,000 |
| VNets per subscription | 1,000 |
| Subnets per VNet | 3,000 |
| VNet peerings per VNet | 500 |
| NSG rules per NSG | 1,000 |
| Route table routes | 400 |
| Public IPs per subscription | 1,000 |
| Storage accounts per subscription per region | 250 |
| Management group levels | 6 (excluding root) |
| Resource groups per subscription | 980 |

*Most limits can be increased via support request*

---

## Renewal Process

The AZ-104 certification requires renewal every 12 months:

1. **Notification**: Microsoft sends email 6 months before expiration
2. **Renewal Assessment**: Free online assessment on Microsoft Learn
3. **Study Materials**: Review updated materials for new features
4. **Complete Assessment**: Pass the renewal assessment
5. **Certification Extended**: Valid for another 12 months

**Benefits of Renewal**:
- Keep certification active
- Stay current with Azure updates
- No exam fee
- Can be completed at your convenience

---

## Additional Resources

### Official Microsoft Resources
- [AZ-104 Certification Page](https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator)
- [AZ-104 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
- [Microsoft Learn Training](https://learn.microsoft.com/en-us/training/courses/az-104t00)
- [Azure Documentation](https://learn.microsoft.com/en-us/azure/)
- [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)

### Tools
- [Azure Portal](https://portal.azure.com)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/)
- [Azure PowerShell](https://learn.microsoft.com/en-us/powershell/azure/)
- [Azure Mobile App](https://azure.microsoft.com/en-us/get-started/azure-portal/mobile-app/)
- [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/)

### Community
- [Microsoft Tech Community - Azure](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)
- [Reddit - r/AzureCertification](https://www.reddit.com/r/AzureCertification/)
- [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/products/)

---

## Study Checklist

### Pre-Study Setup
- [ ] Create Azure free account
- [ ] Install Azure CLI
- [ ] Install Azure PowerShell
- [ ] Set up code editor (VS Code recommended)
- [ ] Join study communities

### Domain 1: Identities and Governance (20-25%)
- [ ] Create users and groups in Entra ID
- [ ] Configure RBAC at different scopes
- [ ] Implement Azure Policy
- [ ] Configure resource locks and tags
- [ ] Set up SSPR
- [ ] Manage costs and budgets

### Domain 2: Storage (15-20%)
- [ ] Create storage accounts with different redundancy
- [ ] Configure blob storage and access tiers
- [ ] Set up SAS tokens and access policies
- [ ] Use AzCopy and Storage Explorer
- [ ] Configure lifecycle management
- [ ] Set up Azure Files share

### Domain 3: Compute (20-25%)
- [ ] Deploy VMs with availability zones
- [ ] Create and modify ARM templates
- [ ] Write and deploy Bicep files
- [ ] Configure VMSS with autoscaling
- [ ] Deploy containers with ACI and ACA
- [ ] Create App Service with deployment slots

### Domain 4: Networking (15-20%)
- [ ] Create VNets and configure peering
- [ ] Configure NSG rules
- [ ] Set up Azure Bastion
- [ ] Configure load balancer
- [ ] Implement private endpoints
- [ ] Configure Azure DNS

### Domain 5: Monitoring (10-15%)
- [ ] Configure Azure Monitor alerts
- [ ] Write KQL queries in Log Analytics
- [ ] Set up Application Insights
- [ ] Configure VM backups
- [ ] Perform restore operations
- [ ] Set up Site Recovery

### Final Preparation
- [ ] Complete all practice scenarios
- [ ] Take practice exams (aim for 85%+)
- [ ] Review weak areas
- [ ] Schedule exam
- [ ] Review exam policies and procedures

---

## Good Luck!

Remember, the key to passing AZ-104 is **hands-on practice**. Don't just read the material—actually implement everything in Azure. The exam tests your ability to apply knowledge in real-world scenarios.

**"Success is where preparation and opportunity meet."**

For questions or feedback about this study guide, please refer to the official Microsoft resources or community forums.

Last updated: November 2025
