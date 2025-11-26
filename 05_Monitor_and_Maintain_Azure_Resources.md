# Domain 5: Monitor and Maintain Azure Resources (10-15%)

## Overview
This domain covers Azure Monitor, backup and recovery services, and maintaining resource health and availability.

---

## 1. Monitor Resources Using Azure Monitor

### 1.1 Configure and Interpret Metrics

#### Azure Monitor Metrics
- Time-series data collected automatically
- Near real-time (1-minute granularity)
- Retained for 93 days
- Dimensional metrics (filter by instance, disk, etc.)

**Common Metrics**:
- VM: CPU percentage, disk IOPS, network bytes
- Storage: Transactions, ingress, egress
- App Service: HTTP requests, response time
- SQL Database: DTU percentage, deadlocks

```bash
# List available metrics for a resource
az monitor metrics list-definitions \
  --resource /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/myVM

# Get metric values
az monitor metrics list \
  --resource /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/myVM \
  --metric "Percentage CPU" \
  --start-time 2025-11-26T00:00:00Z \
  --end-time 2025-11-26T23:59:59Z \
  --interval PT1M
```

#### Metrics Explorer (Portal)
- Visualize metrics with charts
- Multiple resources on same chart
- Split by dimension (e.g., per disk)
- Pin charts to dashboards
- Share charts

### 1.2 Configure Logs

#### Azure Monitor Logs
- Log data stored in Log Analytics workspace
- Query with Kusto Query Language (KQL)
- Data retention: 30-730 days (configurable)
- Collect from VMs, containers, applications, Azure resources

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group myResourceGroup \
  --workspace-name myWorkspace \
  --location eastus

# Enable VM insights (install agents)
az vm extension set \
  --resource-group myResourceGroup \
  --vm-name myVM \
  --name AzureMonitorLinuxAgent \
  --publisher Microsoft.Azure.Monitor \
  --enable-auto-upgrade true

# Configure data collection for Windows VM
az vm extension set \
  --resource-group myResourceGroup \
  --vm-name myWindowsVM \
  --name AzureMonitorWindowsAgent \
  --publisher Microsoft.Azure.Monitor
```

#### Common Log Tables
- **Event**: Windows event logs
- **Syslog**: Linux syslog
- **Perf**: Performance counters
- **Heartbeat**: VM availability
- **AzureActivity**: Azure activity log
- **AzureMetrics**: Platform metrics
- **ContainerLog**: Container logs

### 1.3 Query and Analyze Logs

#### Kusto Query Language (KQL) Examples

```kql
// Get all events from last 24 hours
Event
| where TimeGenerated > ago(24h)
| summarize count() by EventLevelName

// CPU usage by computer
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where TimeGenerated > ago(1h)
| summarize avg(CounterValue) by Computer
| render timechart

// VM heartbeats (availability)
Heartbeat
| where TimeGenerated > ago(24h)
| summarize count() by Computer
| where count_ < 1440  // Less than expected heartbeats

// Failed sign-ins
SigninLogs
| where TimeGenerated > ago(7d)
| where ResultType != "0"
| summarize FailedSignins=count() by UserPrincipalName
| order by FailedSignins desc

// Storage account transactions
StorageBlobLogs
| where TimeGenerated > ago(1h)
| where StatusCode >= 400
| summarize count() by StatusCode, OperationName

// Application exceptions
AppExceptions
| where TimeGenerated > ago(24h)
| summarize count() by ProblemId
| order by count_ desc
```

#### KQL Operators
- **where**: Filter rows
- **summarize**: Aggregate data
- **project**: Select columns
- **extend**: Add calculated columns
- **join**: Combine tables
- **render**: Visualize results (timechart, piechart, barchart)

### 1.4 Set Up Alerts and Actions

#### Alert Types
1. **Metric Alerts**: Based on metric values (CPU > 80%)
2. **Log Alerts**: Based on log query results
3. **Activity Log Alerts**: Based on Azure activity (VM deleted)
4. **Smart Detection Alerts**: Application Insights anomalies

```bash
# Create action group (email notification)
az monitor action-group create \
  --resource-group myResourceGroup \
  --name myActionGroup \
  --short-name myAG \
  --email-receiver name=AdminEmail address=admin@contoso.com

# Create metric alert (CPU > 80%)
az monitor metrics alert create \
  --resource-group myResourceGroup \
  --name HighCPUAlert \
  --scopes /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/myVM \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action myActionGroup \
  --description "Alert when CPU exceeds 80%"

# Create log query alert
az monitor scheduled-query create \
  --resource-group myResourceGroup \
  --name FailedSignInAlert \
  --scopes /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \
  --condition "count > 5" \
  --condition-query "SigninLogs | where ResultType != '0' | summarize count()" \
  --evaluation-frequency 5m \
  --window-size 15m \
  --action myActionGroup

# Create activity log alert (VM deletion)
az monitor activity-log alert create \
  --resource-group myResourceGroup \
  --name VMDeletionAlert \
  --scopes /subscriptions/<sub-id> \
  --condition category=Administrative and operationName=Microsoft.Compute/virtualMachines/delete \
  --action myActionGroup
```

#### Action Groups
- **Email**: Send email notification
- **SMS**: Send text message
- **Push**: Azure mobile app notification
- **Voice**: Phone call
- **Webhook**: HTTP POST to URL
- **Logic App**: Trigger Logic App workflow
- **Automation Runbook**: Run automation script
- **Azure Function**: Execute function
- **ITSM**: Create ITSM ticket

### 1.5 Configure Application Insights

#### Application Insights Features
- Application performance monitoring (APM)
- Request rates, response times, failure rates
- Dependency tracking (SQL, HTTP calls)
- Exception tracking
- Custom events and metrics
- Live metrics stream

```bash
# Create Application Insights
az monitor app-insights component create \
  --resource-group myResourceGroup \
  --app myAppInsights \
  --location eastus \
  --workspace /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/myWorkspace

# Get instrumentation key
az monitor app-insights component show \
  --resource-group myResourceGroup \
  --app myAppInsights \
  --query instrumentationKey

# Configure App Service to use Application Insights
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myWebApp \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<instrumentation-key>
```

#### Application Insights Telemetry
- **Requests**: HTTP requests
- **Dependencies**: External calls (SQL, Redis, HTTP)
- **Exceptions**: Unhandled exceptions
- **Page Views**: Client-side page loads
- **Custom Events**: Your custom telemetry
- **Traces**: Diagnostic logs

### 1.6 Configure Monitoring for VMs

#### VM Insights
- Performance monitoring
- Process and dependency mapping
- Standardized monitoring
- Automatic agent installation

```bash
# Enable VM Insights
az vm extension set \
  --resource-group myResourceGroup \
  --vm-name myVM \
  --name AzureMonitorLinuxAgent \
  --publisher Microsoft.Azure.Monitor

# Create data collection rule
az monitor data-collection rule create \
  --resource-group myResourceGroup \
  --name myDCR \
  --location eastus \
  --rule-file dcr.json

# Associate DCR with VM
az monitor data-collection rule association create \
  --name myDCR-association \
  --rule-id /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Insights/dataCollectionRules/myDCR \
  --resource /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/myVM
```

#### Guest OS Diagnostics
- Windows: Performance counters, event logs, IIS logs
- Linux: Syslog, performance counters

### 1.7 Configure Monitoring for Storage Accounts

#### Storage Insights
- Capacity trends
- Transaction analysis
- Availability monitoring
- Latency metrics

```bash
# Enable Storage Analytics logging
az storage logging update \
  --account-name mystorageaccount \
  --services b \
  --log rwd \
  --retention 7

# Enable metrics
az storage metrics update \
  --account-name mystorageaccount \
  --services b \
  --hour true \
  --minute true \
  --retention 7

# Create diagnostic setting (send logs to Log Analytics)
az monitor diagnostic-settings create \
  --resource /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/mystorageaccount \
  --name myDiagnostics \
  --workspace /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \
  --logs '[{"category": "StorageRead", "enabled": true}, {"category": "StorageWrite", "enabled": true}, {"category": "StorageDelete", "enabled": true}]' \
  --metrics '[{"category": "Transaction", "enabled": true}]'
```

### 1.8 Configure Monitoring for Networks

#### Network Watcher
- Connection monitor
- Packet capture
- IP flow verify
- NSG flow logs
- Traffic analytics

```bash
# Enable NSG flow logs
az network watcher flow-log create \
  --location eastus \
  --name myFlowLog \
  --nsg /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/networkSecurityGroups/myNSG \
  --storage-account /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/flowlogsstorage \
  --workspace /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \
  --enabled true \
  --format JSON \
  --log-version 2 \
  --retention 7 \
  --traffic-analytics true

# Create connection monitor
az network watcher connection-monitor create \
  --resource-group myResourceGroup \
  --name myConnectionMonitor \
  --location eastus \
  --endpoints \
    source-vm='{"name":"source","resourceId":"/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/sourceVM"}' \
    destination-vm='{"name":"destination","resourceId":"/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/destVM"}'
```

#### Traffic Analytics
- Network traffic patterns
- Top talkers
- Geo-location mapping
- Security threat detection
- Requires NSG flow logs

---

## 2. Implement Backup and Recovery

### 2.1 Create Recovery Services Vault

#### Recovery Services Vault
- Store backup data
- Store Site Recovery configuration
- Geo-redundant storage (GRS) by default
- Supports soft delete (14-day retention)

```bash
# Create Recovery Services vault
az backup vault create \
  --resource-group myResourceGroup \
  --name myRecoveryServicesVault \
  --location eastus

# Configure vault backup properties
az backup vault backup-properties set \
  --resource-group myResourceGroup \
  --name myRecoveryServicesVault \
  --soft-delete-feature-state Enable

# Change storage redundancy (must be done before any backups)
az backup vault backup-properties set \
  --resource-group myResourceGroup \
  --name myRecoveryServicesVault \
  --backup-storage-redundancy GeoRedundant
```

#### Storage Redundancy Options
- **Locally Redundant Storage (LRS)**: 3 copies in same datacenter
- **Geo-Redundant Storage (GRS)**: 6 copies across two regions
- **Zone-Redundant Storage (ZRS)**: 3 copies across availability zones

### 2.2 Create Azure Backup Vault

#### Backup Vault vs. Recovery Services Vault
- **Recovery Services Vault**: VMs, SQL, SAP HANA, Azure Files
- **Backup Vault**: Newer workloads (PostgreSQL, Blobs, Disks)

```bash
# Create Backup vault
az dataprotection backup-vault create \
  --resource-group myResourceGroup \
  --vault-name myBackupVault \
  --location eastus \
  --storage-settings datastore-type=VaultStore type=GeoRedundant
```

### 2.3 Create and Configure Backup Policy

#### Backup Policies
- Define backup schedule
- Define retention rules
- Different policies for different workloads

```bash
# Create VM backup policy
az backup policy create \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --name DailyBackupPolicy \
  --backup-management-type AzureIaasVM \
  --policy '{
    "schedulePolicy": {
      "schedulePolicyType": "SimpleSchedulePolicy",
      "scheduleRunFrequency": "Daily",
      "scheduleRunTimes": ["2025-11-26T02:00:00Z"]
    },
    "retentionPolicy": {
      "retentionPolicyType": "LongTermRetentionPolicy",
      "dailySchedule": {
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 30,
          "durationType": "Days"
        }
      },
      "weeklySchedule": {
        "daysOfTheWeek": ["Sunday"],
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 12,
          "durationType": "Weeks"
        }
      },
      "monthlySchedule": {
        "retentionScheduleFormatType": "Weekly",
        "retentionScheduleWeekly": {
          "daysOfTheWeek": ["Sunday"],
          "weeksOfTheMonth": ["First"]
        },
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 12,
          "durationType": "Months"
        }
      }
    }
  }'

# List backup policies
az backup policy list \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault
```

### 2.4 Configure VM Backups

```bash
# Enable backup for VM
az backup protection enable-for-vm \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --vm myVM \
  --policy-name DailyBackupPolicy

# Trigger immediate backup
az backup protection backup-now \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name myVM \
  --item-name myVM \
  --retain-until 31-12-2025

# List backup jobs
az backup job list \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --output table

# Check backup status
az backup protection check-vm \
  --resource-group myResourceGroup \
  --vm-id /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/myVM
```

#### VM Backup Features
- Application-consistent snapshots (VSS/FSFreeze)
- Incremental backups (only changed blocks)
- Instant restore (from snapshots, 2-5 days)
- Cross-region restore (with GRS)
- Selective disk backup

### 2.5 Configure Azure Files and Blob Backups

#### Azure Files Backup
```bash
# Enable backup for file share
az backup protection enable-for-azurefileshare \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --storage-account mystorageaccount \
  --azure-file-share myfileshare \
  --policy-name DefaultPolicy

# Restore file share
az backup restore restore-azurefileshare \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name mystorageaccount \
  --item-name myfileshare \
  --rp-name <recovery-point-name> \
  --restore-mode AlternateLocation \
  --target-storage-account targetstorageaccount \
  --target-file-share targetshare
```

#### Blob Backup (Operational Backup)
- Continuous backup (not scheduled)
- Point-in-time restore
- Protects against accidental deletion or corruption
- Data never leaves source storage account

```bash
# Configure blob backup policy
az dataprotection backup-policy create \
  --resource-group myResourceGroup \
  --vault-name myBackupVault \
  --name BlobBackupPolicy \
  --policy blob-policy.json

# Enable blob backup
az dataprotection backup-instance create \
  --resource-group myResourceGroup \
  --vault-name myBackupVault \
  --backup-instance blob-backup-instance.json
```

### 2.6 Perform Restore Operations

#### VM Restore Options
1. **Create new VM**: New VM from recovery point
2. **Replace existing disk**: Replace VM's disks
3. **Restore disk**: Restore disk only (create VM manually)
4. **File recovery**: Mount recovery point, copy specific files

```bash
# Restore VM (create new)
az backup restore restore-disks \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name myVM \
  --item-name myVM \
  --rp-name <recovery-point-name> \
  --storage-account mystorageaccount \
  --restore-to-staging-storage-account

# After disks are restored, create VM from disk
# Use Portal or PowerShell to create VM from restored VHD
```

#### File-Level Recovery
```bash
# Download script to mount recovery point
az backup restore files mount-rp \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name myVM \
  --item-name myVM \
  --rp-name <recovery-point-name>

# Run the downloaded script on a recovery VM
# Copy files as needed
# Unmount when done
az backup restore files unmount-rp \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name myVM \
  --item-name myVM \
  --rp-name <recovery-point-name>
```

### 2.7 Configure Azure Site Recovery

#### Site Recovery Scenarios
- **Azure to Azure**: Replicate Azure VMs to another region
- **On-premises to Azure**: VMware, Hyper-V, physical servers
- **Azure to on-premises**: Not supported (use backup)

```bash
# Create Recovery Services vault for Site Recovery
az backup vault create \
  --resource-group myResourceGroup \
  --name mySiteRecoveryVault \
  --location eastus

# Enable replication for Azure VM (typically done via Portal)
# Portal > Recovery Services Vault > Site Recovery > Enable Replication

# Perform test failover
az site-recovery test-failover \
  --resource-group myResourceGroup \
  --vault-name mySiteRecoveryVault \
  --name myVM

# Perform actual failover
az site-recovery failover \
  --resource-group myResourceGroup \
  --vault-name mySiteRecoveryVault \
  --name myVM
```

#### Site Recovery Components
- **Protection Policy**: RPO, retention, crash-consistent/app-consistent snapshots
- **Recovery Plan**: Group VMs, define failover order, add scripts
- **Replication Policy**: Snapshot frequency, recovery points
- **Test Failover**: Validate DR without affecting production

#### Failover Process
1. **Test Failover**: Validate DR configuration (isolated network)
2. **Planned Failover**: Graceful shutdown, replicate final changes
3. **Unplanned Failover**: Emergency failover (data loss possible)
4. **Commit**: Accept failover, delete source VM
5. **Reprotect**: Reverse replication direction
6. **Failback**: Return to original location

### 2.8 Monitor Backup and Site Recovery

```bash
# View backup reports
az backup protection check-vm \
  --resource-group myResourceGroup \
  --vm-id <vm-resource-id>

# List recovery points
az backup recoverypoint list \
  --resource-group myResourceGroup \
  --vault-name myRecoveryServicesVault \
  --container-name myVM \
  --item-name myVM \
  --output table

# Configure backup alerts
az monitor metrics alert create \
  --resource-group myResourceGroup \
  --name BackupFailureAlert \
  --scopes /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.RecoveryServices/vaults/myRecoveryServicesVault \
  --condition "count BackupHealthEvent > 0" \
  --window-size 1h \
  --evaluation-frequency 30m \
  --action myActionGroup
```

#### Backup Reports
- Built-in Power BI reports
- Backup health
- Job success/failure rates
- Storage consumption trends
- Policy compliance

---

## Key Exam Tips

1. **Metrics vs. Logs**: Metrics are time-series (93 days), logs are in Log Analytics (30-730 days)
2. **Alert Types**: Metric (real-time), Log (query-based), Activity (Azure operations)
3. **Application Insights**: APM solution, tracks requests/dependencies/exceptions
4. **VM Backup**: Application-consistent, incremental, instant restore
5. **Site Recovery RPO**: Recovery Point Objective, how much data loss acceptable
6. **Backup Vault Types**: Recovery Services (VMs, files) vs. Backup Vault (PostgreSQL, blobs)
7. **Soft Delete**: 14-day retention for deleted backups
8. **Storage Redundancy**: LRS (local), GRS (geo), ZRS (zonal)
9. **NSG Flow Logs**: Require Network Watcher and storage account
10. **KQL**: Query language for Log Analytics

---

## Practice Scenarios

### Scenario 1: Alert on High CPU
**Question**: Alert when VM CPU exceeds 85% for 10 minutes, send email to admin.

**Answer**:
1. Create action group with email receiver
2. Create metric alert on "Percentage CPU" metric
3. Condition: Average > 85%
4. Window size: 10 minutes
5. Evaluation frequency: 1 minute
6. Associate action group

### Scenario 2: VM Disaster Recovery
**Question**: Replicate production VMs to secondary region with 1-hour RPO.

**Answer**:
1. Create Recovery Services vault in primary region
2. Enable Site Recovery replication for VMs
3. Configure replication policy with 1-hour RPO
4. Create recovery plan grouping VMs by tier
5. Perform test failover to validate
6. Schedule regular test failovers

### Scenario 3: Monitor Storage Errors
**Question**: Track and alert on storage account errors (HTTP 5xx).

**Answer**:
1. Enable diagnostic settings on storage account
2. Send logs to Log Analytics workspace
3. Create log query alert:
   ```kql
   StorageBlobLogs
   | where StatusCode >= 500 and StatusCode < 600
   | summarize count() by bin(TimeGenerated, 5m)
   | where count_ > 10
   ```
4. Configure action group for notifications

---

## Additional Resources

- [Azure Monitor Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/)
- [Azure Backup Documentation](https://learn.microsoft.com/en-us/azure/backup/)
- [Azure Site Recovery Documentation](https://learn.microsoft.com/en-us/azure/site-recovery/)
- [KQL Quick Reference](https://learn.microsoft.com/en-us/azure/data-explorer/kql-quick-reference)
- [Application Insights Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
