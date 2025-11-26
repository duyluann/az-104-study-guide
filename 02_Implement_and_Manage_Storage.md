# Domain 2: Implement and Manage Storage (15-20%)

## Overview
This domain covers Azure Storage services including storage accounts, blob storage, Azure Files, and storage security features.

---

## 1. Configure Access to Storage

### 1.1 Configure Storage Firewalls and Virtual Networks

#### Network Security Options
- **Public Endpoint**: Accessible from any network (default)
- **Selected Networks**: Restrict to specific VNets/IP ranges
- **Private Endpoint**: Accessible only through private IP in VNet

#### Firewall Configuration
```bash
# Allow specific IP address
az storage account network-rule add --account-name mystorageaccount --ip-address 40.50.60.70

# Allow virtual network subnet
az storage account network-rule add --account-name mystorageaccount --vnet-name myVNet --subnet mySubnet

# Deny all traffic (allow only exceptions)
az storage account update --name mystorageaccount --default-action Deny
```

#### Service Endpoints vs. Private Endpoints
| Feature | Service Endpoint | Private Endpoint |
|---------|------------------|------------------|
| **Traffic** | Uses Azure backbone but keeps public IP | Fully private IP address |
| **DNS** | Uses public DNS | Requires private DNS zone |
| **Cost** | Free | Charges apply |
| **Configuration** | Configured on subnet | Configured as separate resource |

### 1.2 Create and Use Shared Access Signature (SAS) Tokens

#### SAS Token Types
1. **Account SAS**: Access to multiple services (Blob, File, Queue, Table)
2. **Service SAS**: Access to specific service
3. **User Delegation SAS**: Secured with Azure AD credentials (most secure)

#### SAS Components
- **Permissions**: r (read), w (write), d (delete), l (list), a (add), c (create)
- **Start/Expiry Time**: When the SAS is valid
- **IP Range**: Restrict to specific IPs
- **Protocol**: HTTPS only (recommended)

```bash
# Generate account SAS token
az storage account generate-sas \
  --account-name mystorageaccount \
  --services bfqt \
  --resource-types sco \
  --permissions rwdlacup \
  --expiry 2025-12-31T23:59:59Z \
  --https-only

# Generate blob SAS token
az storage blob generate-sas \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myblob.txt \
  --permissions r \
  --expiry 2025-12-31 \
  --https-only
```

#### Stored Access Policy
- Define access policy separately from SAS
- Can revoke SAS by modifying/deleting the policy
- Only available for Service SAS (not Account SAS)

```bash
# Create stored access policy
az storage container policy create \
  --container-name mycontainer \
  --name mypolicy \
  --permissions rwdl \
  --expiry 2025-12-31

# Generate SAS using stored access policy
az storage blob generate-sas \
  --container-name mycontainer \
  --name myblob.txt \
  --policy-name mypolicy
```

### 1.3 Configure Stored Access Policies

#### Benefits
- Centralized control over SAS tokens
- Ability to revoke access without regenerating keys
- Modify permissions after SAS is distributed

#### Limitations
- Maximum 5 policies per container/share/queue/table
- Cannot be used with Account SAS
- Must be configured before generating SAS token

### 1.4 Manage Access Keys

#### Storage Account Keys
- Two access keys (key1 and key2) for rotation
- Provide full access to storage account
- Regenerate periodically for security

```bash
# List access keys
az storage account keys list --account-name mystorageaccount

# Regenerate key
az storage account keys renew --account-name mystorageaccount --key primary

# Rotate keys process:
# 1. Regenerate key2
# 2. Update applications to use key2
# 3. Regenerate key1
# 4. Update remaining applications to use key1
```

#### Best Practices
- Use Azure Key Vault to store keys
- Rotate keys regularly (every 90 days)
- Use managed identities instead of keys when possible
- Monitor key usage with Azure Monitor

### 1.5 Configure Identity-Based Access

#### Azure AD Integration
- Use Azure AD identities to access storage
- No need to store access keys in code
- Supports managed identities

#### Azure RBAC Roles for Storage
| Role | Permissions |
|------|-------------|
| **Storage Blob Data Owner** | Full access to blob containers and data |
| **Storage Blob Data Contributor** | Read, write, delete blobs and containers |
| **Storage Blob Data Reader** | Read blob containers and data |
| **Storage Queue Data Contributor** | Read, write, delete queue messages |
| **Storage File Data SMB Share Contributor** | Read, write, delete on file shares via SMB |

```bash
# Assign blob data contributor role
az role assignment create \
  --assignee user@contoso.com \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>

# Access blob with Azure AD authentication
az storage blob list \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --auth-mode login
```

#### Managed Identity Access
```bash
# Enable system-assigned managed identity on VM
az vm identity assign --name myVM --resource-group myResourceGroup

# Assign storage role to VM's managed identity
az role assignment create \
  --assignee <vm-managed-identity-principal-id> \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>
```

---

## 2. Configure and Manage Storage Accounts

### 2.1 Create and Configure Storage Accounts

#### Storage Account Types
| Type | Services | Use Case | Performance |
|------|----------|----------|-------------|
| **Standard General-purpose v2** | Blob, File, Queue, Table | General use, most scenarios | Standard |
| **Premium Block Blobs** | Block blobs and append blobs | High transaction rates, low latency | Premium |
| **Premium File Shares** | Files only | High-performance file shares | Premium |
| **Premium Page Blobs** | Page blobs only | Azure VM disks | Premium |

#### Performance Tiers
- **Standard**: HDD-based, lower cost
- **Premium**: SSD-based, low latency, high throughput

#### Access Tiers (for Blob Storage)
- **Hot**: Frequent access, higher storage cost, lower access cost
- **Cool**: Infrequent access (30+ days), lower storage cost, higher access cost
- **Cold**: Rare access (90+ days), optimized for backup scenarios
- **Archive**: Offline storage (180+ days), lowest cost, requires rehydration

```bash
# Create storage account
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# Change access tier
az storage account update \
  --name mystorageaccount \
  --access-tier Cool
```

### 2.2 Configure Redundancy

#### Redundancy Options
| Option | Copies | Scope | Use Case | Cost |
|--------|--------|-------|----------|------|
| **LRS** (Locally Redundant) | 3 | Single datacenter | Development, test | Lowest |
| **ZRS** (Zone Redundant) | 3 | Multiple availability zones in region | Production, high availability | Low |
| **GRS** (Geo-Redundant) | 6 | Two regions (paired) | Disaster recovery | Medium |
| **GZRS** (Geo-Zone Redundant) | 6 | Multiple zones + secondary region | Maximum durability | Highest |
| **RA-GRS** (Read-Access GRS) | 6 | Two regions with read access to secondary | DR with read access | Medium |
| **RA-GZRS** | 6 | Zones + secondary region with read access | Maximum availability | Highest |

```bash
# Change redundancy
az storage account update \
  --name mystorageaccount \
  --sku Standard_GRS

# Failover to secondary region (for GRS/GZRS)
az storage account failover \
  --name mystorageaccount \
  --resource-group myResourceGroup
```

#### RPO (Recovery Point Objective)
- LRS/ZRS: Immediate
- GRS/GZRS: Typically < 15 minutes (not guaranteed)

### 2.3 Configure Object Replication

#### Object Replication Features
- Asynchronously copy blobs between storage accounts
- Can be in different regions (cross-region)
- Can be in same region
- Requires versioning enabled on source and destination

```bash
# Prerequisites
# 1. Enable versioning on both accounts
az storage account blob-service-properties update \
  --account-name mystorageaccount \
  --enable-versioning true

# 2. Create replication policy (typically via Portal or ARM template)
```

#### Use Cases
- Minimize latency (copy data closer to users)
- Increase efficiency for compute workloads
- Cost optimization (move data to lower-cost regions)
- Data distribution

#### Requirements
- Both accounts must be GPv2 or Premium Block Blob
- Versioning enabled on both accounts
- Change feed enabled on source account

### 2.4 Configure Storage Account Encryption

#### Encryption at Rest
- **Default**: Microsoft-managed keys (automatic, no configuration)
- **Customer-managed keys**: Keys stored in Azure Key Vault
- **Customer-provided keys**: Client provides key with each request

```bash
# Configure customer-managed key
az storage account update \
  --name mystorageaccount \
  --encryption-key-source Microsoft.Keyvault \
  --encryption-key-vault https://mykeyvault.vault.azure.net \
  --encryption-key-name mykey \
  --encryption-key-version <version>
```

#### Infrastructure Encryption
- Double encryption (both hardware and software layers)
- Enable at account creation (cannot be changed later)

```bash
# Create account with infrastructure encryption
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --require-infrastructure-encryption
```

#### Encryption in Transit
- **HTTPS**: Enforced by default
- **Secure Transfer Required**: Reject HTTP requests

```bash
# Require secure transfer
az storage account update \
  --name mystorageaccount \
  --https-only true
```

### 2.5 Manage Data with Azure Storage Explorer and AzCopy

#### Azure Storage Explorer
- GUI tool for managing storage accounts
- Cross-platform (Windows, Mac, Linux)
- Supports blob, file, queue, table storage
- Can use SAS, access keys, or Azure AD authentication

**Key Features**:
- Upload/download files
- Manage containers and file shares
- Generate SAS tokens
- Search and filter blobs
- Set metadata and properties

#### AzCopy
- Command-line tool for high-performance data transfer
- Supports blob and file storage
- Optimized for large-scale transfers

```bash
# Copy file to blob storage
azcopy copy "C:\local\path\file.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/file.txt?<SAS-token>"

# Copy directory to blob storage (recursive)
azcopy copy "C:\local\path\*" "https://mystorageaccount.blob.core.windows.net/mycontainer?<SAS-token>" --recursive

# Sync local directory with blob container
azcopy sync "C:\local\path" "https://mystorageaccount.blob.core.windows.net/mycontainer?<SAS-token>" --recursive

# Copy between storage accounts
azcopy copy "https://source.blob.core.windows.net/container?<SAS>" "https://dest.blob.core.windows.net/container?<SAS>" --recursive

# Use Azure AD authentication
azcopy login
azcopy copy "C:\local\path\*" "https://mystorageaccount.blob.core.windows.net/mycontainer" --recursive
```

**AzCopy Best Practices**:
- Use `--cap-mbps` to limit bandwidth
- Use `--block-size-mb` for large files
- Use `--log-level` for detailed logging
- Use `sync` instead of `copy` for incremental updates

---

## 3. Configure Azure Files and Azure Blob Storage

### 3.1 Create and Configure File Shares

#### Azure Files Features
- SMB and NFS protocol support
- Can be mounted on Windows, Linux, macOS
- Fully managed file shares
- Can be cached with Azure File Sync

#### Performance Tiers
- **Standard**: HDD-based (transaction optimized, hot, cool)
- **Premium**: SSD-based, consistent low latency

```bash
# Create file share
az storage share create \
  --account-name mystorageaccount \
  --name myfileshare \
  --quota 100

# Create large file share (up to 100 TiB)
az storage account update \
  --name mystorageaccount \
  --enable-large-file-share

# Mount file share on Windows
net use Z: \\mystorageaccount.file.core.windows.net\myfileshare /u:AZURE\mystorageaccount <storage-key>

# Mount on Linux
sudo mount -t cifs //mystorageaccount.file.core.windows.net/myfileshare /mnt/myfileshare -o vers=3.0,username=mystorageaccount,password=<storage-key>,dir_mode=0777,file_mode=0777
```

#### SMB Protocol Versions
- SMB 2.1: Windows 7, Windows Server 2008 R2
- SMB 3.0: Windows 8, Windows Server 2012
- SMB 3.1.1: Windows 10, Windows Server 2016+ (most secure)

### 3.2 Create and Configure Blob Containers

#### Blob Types
1. **Block Blobs**: Text and binary data (up to 190.7 TiB)
2. **Append Blobs**: Optimized for append operations (logs)
3. **Page Blobs**: Random access files (VM disks, up to 8 TiB)

#### Public Access Levels
- **Private**: No anonymous access (default)
- **Blob**: Anonymous read access to blobs only
- **Container**: Anonymous read access to container and blobs

```bash
# Create container
az storage container create \
  --account-name mystorageaccount \
  --name mycontainer \
  --public-access blob

# Upload blob
az storage blob upload \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --file /path/to/file.txt \
  --name file.txt

# List blobs
az storage blob list \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --output table

# Download blob
az storage blob download \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name file.txt \
  --file /path/to/download/file.txt
```

### 3.3 Configure Storage Tiers

#### Blob-Level Tiering
- Set tier on individual blobs
- Can move between Hot, Cool, Cold, Archive
- Rehydration required for Archive tier (hours to retrieve)

```bash
# Set blob tier
az storage blob set-tier \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name file.txt \
  --tier Cool

# Rehydrate from Archive
az storage blob set-tier \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name file.txt \
  --tier Hot \
  --rehydrate-priority High
```

#### Rehydration Options
- **Standard Priority**: Up to 15 hours
- **High Priority**: Less than 1 hour (higher cost)

### 3.4 Configure Snapshots and Soft Delete

#### Blob Snapshots
- Read-only point-in-time copy of blob
- Incremental (only changed blocks are stored)
- Manual creation

```bash
# Create snapshot
az storage blob snapshot \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name file.txt

# List snapshots
az storage blob list \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --include snapshots

# Restore from snapshot
az storage blob copy start \
  --source-container mycontainer \
  --source-blob file.txt \
  --source-snapshot <snapshot-datetime> \
  --destination-container mycontainer \
  --destination-blob file.txt
```

#### Soft Delete
- Recover deleted blobs and snapshots
- Retention period: 1-365 days
- Applies to entire storage account

```bash
# Enable soft delete for blobs
az storage account blob-service-properties update \
  --account-name mystorageaccount \
  --enable-delete-retention true \
  --delete-retention-days 7

# Enable soft delete for containers
az storage account blob-service-properties update \
  --account-name mystorageaccount \
  --enable-container-delete-retention true \
  --container-delete-retention-days 7

# List deleted blobs
az storage blob list \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --include deleted

# Undelete blob
az storage blob undelete \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name file.txt
```

### 3.5 Configure Blob Versioning

#### Versioning Features
- Automatically maintain previous versions of blob
- Different from snapshots (automatic vs. manual)
- Each write creates a new version
- Can restore previous versions

```bash
# Enable versioning
az storage account blob-service-properties update \
  --account-name mystorageaccount \
  --enable-versioning true

# List versions
az storage blob list \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --include versions

# Copy specific version
az storage blob copy start \
  --source-container mycontainer \
  --source-blob file.txt \
  --source-version-id <version-id> \
  --destination-container mycontainer \
  --destination-blob file-restored.txt
```

#### Versioning vs. Snapshots vs. Soft Delete
| Feature | Versioning | Snapshots | Soft Delete |
|---------|-----------|-----------|-------------|
| **Automatic** | Yes | No | Yes (for deletes) |
| **Retention** | Manual deletion | Manual deletion | Time-based |
| **Granularity** | Every write | On-demand | Deletion only |
| **Recovery** | Any version | Snapshot point | Deleted items only |

### 3.6 Configure Blob Lifecycle Management

#### Lifecycle Policy Actions
- **tierToCool**: Move to Cool tier
- **tierToCold**: Move to Cold tier
- **tierToArchive**: Move to Archive tier
- **delete**: Delete blob
- **enableAutoTierToHotFromCool**: Move back to Hot on access

```json
{
  "rules": [
    {
      "name": "rule1",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/"]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            },
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 90
            },
            "delete": {
              "daysAfterModificationGreaterThan": 365
            }
          },
          "snapshot": {
            "delete": {
              "daysAfterCreationGreaterThan": 90
            }
          }
        }
      }
    }
  ]
}
```

```bash
# Create lifecycle policy
az storage account management-policy create \
  --account-name mystorageaccount \
  --policy @policy.json
```

#### Use Cases
- Archive old logs automatically
- Delete temporary data after certain period
- Move infrequently accessed data to Cool tier
- Optimize storage costs automatically

---

## Key Exam Tips

1. **SAS Tokens**: User delegation SAS is most secure (uses Azure AD)
2. **Redundancy**: GZRS offers highest availability and durability
3. **Object Replication**: Requires versioning on both source and destination
4. **Archive Tier**: Requires rehydration (not instant access)
5. **Soft Delete**: Different retention periods for blobs and containers
6. **Lifecycle Policies**: Can only move to lower tiers or delete (not to higher tiers, except auto-tier on access)
7. **Private Endpoints**: Require private DNS zone configuration
8. **AzCopy**: Command-line tool; Storage Explorer is GUI
9. **File Share Protocols**: SMB for Windows/Linux, NFS for Linux (Premium only)
10. **Customer-Managed Keys**: Stored in Azure Key Vault

---

## Practice Scenarios

### Scenario 1: Secure Storage Access
**Question**: You need to provide a partner company temporary read access to specific blobs for 7 days without sharing storage account keys.

**Answer**:
1. Generate Service SAS token for the specific blobs
2. Set permissions to "r" (read only)
3. Set expiry to 7 days from now
4. Use HTTPS-only protocol
5. Optionally restrict to partner's IP range

### Scenario 2: Cost Optimization
**Question**: You have 500 GB of log data that is accessed frequently for 30 days, occasionally for 90 days, and rarely after that.

**Answer**:
1. Configure lifecycle management policy
2. Rule: Keep in Hot tier for 30 days
3. Rule: Move to Cool tier after 30 days
4. Rule: Move to Archive tier after 90 days
5. Rule: Delete after 365 days (if not needed)

### Scenario 3: Disaster Recovery
**Question**: Design storage solution for critical business data requiring maximum availability and ability to read from secondary region.

**Answer**:
1. Use RA-GZRS redundancy
2. Provides zone redundancy in primary region
3. Geo-replication to secondary region
4. Read access to secondary region
5. Enable blob versioning for point-in-time recovery
6. Enable soft delete with 14-day retention

---

## Additional Resources

- [Azure Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/)
- [Storage Account Overview](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)
- [Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [Azure Files Documentation](https://learn.microsoft.com/en-us/azure/storage/files/)
- [AzCopy Documentation](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10)
