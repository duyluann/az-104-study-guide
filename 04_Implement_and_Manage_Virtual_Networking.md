# Domain 4: Implement and Manage Virtual Networking (15-20%)

## Overview
This domain covers Azure virtual networking, including VNets, subnets, routing, network security, DNS, and load balancing.

---

## 1. Configure and Manage Virtual Networks

### 1.1 Create and Configure Virtual Networks (VNets)

#### VNet Characteristics
- Private network in Azure
- Logically isolated from other VNets
- Can be divided into subnets
- Regional resource (cannot span regions)
- Can peer with other VNets

```bash
# Create virtual network
az network vnet create \
  --resource-group myResourceGroup \
  --name myVNet \
  --address-prefix 10.0.0.0/16 \
  --location eastus

# Add address prefix to existing VNet
az network vnet update \
  --resource-group myResourceGroup \
  --name myVNet \
  --address-prefixes 10.0.0.0/16 192.168.0.0/16
```

#### Address Space Planning
- Use private IP ranges (RFC 1918):
  - 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
  - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  - 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
- Avoid overlapping address spaces for peered VNets
- Plan for future growth

### 1.2 Create and Configure Subnets

#### Subnet Considerations
- Minimum size: /29 (8 IPs, 3 usable)
- Maximum size: Same as VNet address space
- Azure reserves 5 IPs per subnet (first 4 and last 1)

**Reserved IPs** (example: 10.0.0.0/24):
- 10.0.0.0: Network address
- 10.0.0.1: Azure gateway (default)
- 10.0.0.2: Azure DNS
- 10.0.0.3: Azure DNS
- 10.0.0.255: Broadcast

```bash
# Create subnet
az network vnet subnet create \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name mySubnet \
  --address-prefixes 10.0.1.0/24

# Create subnet with service endpoints
az network vnet subnet create \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name appSubnet \
  --address-prefixes 10.0.2.0/24 \
  --service-endpoints Microsoft.Storage Microsoft.Sql

# Delegate subnet to service (e.g., Azure SQL Managed Instance)
az network vnet subnet update \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name dbSubnet \
  --delegations Microsoft.Sql/managedInstances
```

#### Special Subnets
- **GatewaySubnet**: For VPN/ExpressRoute gateways (must be named exactly)
- **AzureBastionSubnet**: For Azure Bastion (must be named exactly, minimum /26)
- **AzureFirewallSubnet**: For Azure Firewall (must be named exactly, minimum /26)

### 1.3 Create and Configure VNet Peering

#### VNet Peering Types
1. **Regional Peering**: VNets in same region
2. **Global Peering**: VNets in different regions

#### Peering Characteristics
- Non-transitive (A↔B and B↔C doesn't mean A↔C)
- Low latency, high bandwidth
- Traffic stays on Microsoft backbone
- No downtime required

```bash
# Create peering from VNet1 to VNet2
az network vnet peering create \
  --resource-group myResourceGroup \
  --name VNet1-to-VNet2 \
  --vnet-name VNet1 \
  --remote-vnet VNet2 \
  --allow-vnet-access \
  --allow-forwarded-traffic

# Create reverse peering from VNet2 to VNet1
az network vnet peering create \
  --resource-group myResourceGroup \
  --name VNet2-to-VNet1 \
  --vnet-name VNet2 \
  --remote-vnet VNet1 \
  --allow-vnet-access \
  --allow-forwarded-traffic

# Enable gateway transit (hub-spoke topology)
az network vnet peering update \
  --resource-group myResourceGroup \
  --name Hub-to-Spoke \
  --vnet-name HubVNet \
  --set allowGatewayTransit=true

az network vnet peering update \
  --resource-group myResourceGroup \
  --name Spoke-to-Hub \
  --vnet-name SpokeVNet \
  --set useRemoteGateways=true
```

#### Peering Options
- **Allow Virtual Network Access**: Enable communication between VNets
- **Allow Forwarded Traffic**: Allow traffic forwarded by NVA
- **Allow Gateway Transit**: Share VPN/ExpressRoute gateway
- **Use Remote Gateways**: Use peer's gateway

### 1.4 Configure Public IP Addresses

#### Public IP SKUs
| Feature | Basic | Standard |
|---------|-------|----------|
| **Assignment** | Dynamic or Static | Static only |
| **Security** | Open by default | Closed by default (needs NSG) |
| **Availability Zones** | Not supported | Zone-redundant or zonal |
| **Load Balancer** | Basic LB | Standard LB |
| **Routing** | Regional | Global (any region) |

```bash
# Create basic public IP (dynamic)
az network public-ip create \
  --resource-group myResourceGroup \
  --name myPublicIP-Basic \
  --sku Basic \
  --allocation-method Dynamic

# Create standard public IP (static)
az network public-ip create \
  --resource-group myResourceGroup \
  --name myPublicIP-Standard \
  --sku Standard \
  --allocation-method Static

# Create zone-redundant public IP
az network public-ip create \
  --resource-group myResourceGroup \
  --name myPublicIP-ZoneRedundant \
  --sku Standard \
  --zone 1 2 3

# Associate with VM NIC
az network nic ip-config update \
  --resource-group myResourceGroup \
  --nic-name myNIC \
  --name ipconfig1 \
  --public-ip-address myPublicIP-Standard
```

#### Public IP Prefix
- Reserve contiguous block of public IPs
- Useful for firewall rules (allow entire range)
- Minimum /28 (16 addresses)

```bash
# Create public IP prefix
az network public-ip prefix create \
  --resource-group myResourceGroup \
  --name myIPPrefix \
  --length 28

# Create public IP from prefix
az network public-ip create \
  --resource-group myResourceGroup \
  --name myPublicIP \
  --public-ip-prefix myIPPrefix
```

### 1.5 Configure User-Defined Routes (UDR)

#### Route Types
1. **System Routes**: Automatic, default routes
2. **User-Defined Routes**: Custom routes you create
3. **Border Gateway Protocol (BGP)**: Routes from on-premises

#### Common Routing Scenarios
- Force traffic through firewall/NVA
- Route traffic to on-premises
- Override default internet route

```bash
# Create route table
az network route-table create \
  --resource-group myResourceGroup \
  --name myRouteTable

# Add route to NVA (Network Virtual Appliance)
az network route-table route create \
  --resource-group myResourceGroup \
  --route-table-name myRouteTable \
  --name RouteToNVA \
  --address-prefix 10.1.0.0/16 \
  --next-hop-type VirtualAppliance \
  --next-hop-ip-address 10.0.1.4

# Add route to force internet traffic through NVA
az network route-table route create \
  --resource-group myResourceGroup \
  --route-table-name myRouteTable \
  --name ForceInternetThroughNVA \
  --address-prefix 0.0.0.0/0 \
  --next-hop-type VirtualAppliance \
  --next-hop-ip-address 10.0.1.4

# Associate route table with subnet
az network vnet subnet update \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name mySubnet \
  --route-table myRouteTable
```

#### Next Hop Types
- **VirtualAppliance**: Traffic to NVA (firewall, router)
- **VirtualNetworkGateway**: Traffic to VPN gateway
- **VirtualNetwork**: Within VNet
- **Internet**: Direct to internet
- **None**: Drop traffic (blackhole)

### 1.6 Configure Private Endpoints

#### Private Endpoint Features
- Private IP address in your VNet
- Connect to Azure PaaS services privately
- No public endpoint needed
- Traffic stays on Microsoft backbone

**Supported Services**:
- Storage, SQL Database, Cosmos DB
- Key Vault, App Service, Container Registry
- Event Hubs, Service Bus
- And many more...

```bash
# Disable public network access on storage account
az storage account update \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --public-network-access Disabled

# Create private endpoint
az network private-endpoint create \
  --resource-group myResourceGroup \
  --name myPrivateEndpoint \
  --vnet-name myVNet \
  --subnet mySubnet \
  --private-connection-resource-id /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/mystorageaccount \
  --group-id blob \
  --connection-name myConnection

# Create private DNS zone
az network private-dns zone create \
  --resource-group myResourceGroup \
  --name privatelink.blob.core.windows.net

# Link DNS zone to VNet
az network private-dns link vnet create \
  --resource-group myResourceGroup \
  --zone-name privatelink.blob.core.windows.net \
  --name myDNSLink \
  --virtual-network myVNet \
  --registration-enabled false

# Create DNS zone group (automatic DNS records)
az network private-endpoint dns-zone-group create \
  --resource-group myResourceGroup \
  --endpoint-name myPrivateEndpoint \
  --name myZoneGroup \
  --private-dns-zone privatelink.blob.core.windows.net \
  --zone-name blob
```

### 1.7 Configure Service Endpoints

#### Service Endpoints vs. Private Endpoints
| Feature | Service Endpoint | Private Endpoint |
|---------|------------------|------------------|
| **IP Address** | Public (Microsoft-owned) | Private (your VNet) |
| **DNS** | Public DNS | Private DNS zone |
| **Cost** | Free | Charges per hour + data |
| **Configuration** | Subnet level | Resource level |
| **Network** | Still uses public IP backbone | Fully private |

```bash
# Enable service endpoint on subnet
az network vnet subnet update \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name mySubnet \
  --service-endpoints Microsoft.Storage Microsoft.Sql

# Configure storage firewall to allow subnet
az storage account network-rule add \
  --resource-group myResourceGroup \
  --account-name mystorageaccount \
  --vnet-name myVNet \
  --subnet mySubnet
```

### 1.8 Troubleshoot Network Connectivity

#### Network Watcher Tools
- **IP Flow Verify**: Check if packet allowed/denied
- **Next Hop**: Determine routing
- **Connection Troubleshoot**: Check connectivity between resources
- **Packet Capture**: Capture network traffic
- **NSG Flow Logs**: Log traffic through NSGs

```bash
# Enable Network Watcher (automatic in most regions)
az network watcher configure \
  --resource-group NetworkWatcherRG \
  --locations eastus \
  --enabled true

# IP flow verify (check if traffic is allowed)
az network watcher test-ip-flow \
  --resource-group myResourceGroup \
  --vm myVM \
  --direction Inbound \
  --protocol TCP \
  --local 10.0.0.4:80 \
  --remote 203.0.113.1:80

# Next hop (check routing)
az network watcher show-next-hop \
  --resource-group myResourceGroup \
  --vm myVM \
  --source-ip 10.0.0.4 \
  --dest-ip 10.1.0.4

# Connection troubleshoot
az network watcher test-connectivity \
  --resource-group myResourceGroup \
  --source-resource myVM \
  --dest-resource myOtherVM \
  --protocol TCP \
  --dest-port 80

# Effective routes (see all routes affecting a NIC)
az network nic show-effective-route-table \
  --resource-group myResourceGroup \
  --name myNIC

# Effective NSG rules
az network nic list-effective-nsg \
  --resource-group myResourceGroup \
  --name myNIC
```

---

## 2. Configure Secure Access to Virtual Networks

### 2.1 Create and Configure Network Security Groups (NSG)

#### NSG Concepts
- Filter traffic to/from Azure resources
- Can associate with subnet or NIC
- Rules evaluated by priority (100-4096)
- Lower number = higher priority
- Default rules (priority 65000+) cannot be deleted

```bash
# Create NSG
az network nsg create \
  --resource-group myResourceGroup \
  --name myNSG

# Create inbound rule (allow HTTP)
az network nsg rule create \
  --resource-group myResourceGroup \
  --nsg-name myNSG \
  --name AllowHTTP \
  --priority 100 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 \
  --protocol TCP \
  --access Allow \
  --direction Inbound

# Create rule with service tag
az network nsg rule create \
  --resource-group myResourceGroup \
  --nsg-name myNSG \
  --name AllowAzureLoadBalancer \
  --priority 110 \
  --source-address-prefixes AzureLoadBalancer \
  --destination-port-ranges '*' \
  --protocol '*' \
  --access Allow \
  --direction Inbound

# Associate NSG with subnet
az network vnet subnet update \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name mySubnet \
  --network-security-group myNSG

# Associate NSG with NIC
az network nic update \
  --resource-group myResourceGroup \
  --name myNIC \
  --network-security-group myNSG
```

#### Default NSG Rules (Inbound)
1. AllowVNetInBound (65000): Allow VNet traffic
2. AllowAzureLoadBalancerInBound (65001): Allow health probes
3. DenyAllInBound (65500): Deny all other traffic

#### Default NSG Rules (Outbound)
1. AllowVNetOutBound (65000): Allow to VNet
2. AllowInternetOutBound (65001): Allow to internet
3. DenyAllOutBound (65500): Deny all other traffic

#### Service Tags
- **Internet**: Internet addresses
- **VirtualNetwork**: VNet address space
- **AzureLoadBalancer**: Azure health probes
- **AzureCloud**: All Azure public IPs
- **Storage**: Storage service IPs
- **Sql**: SQL Database IPs
- **AzureActiveDirectory**: Azure AD IPs

#### Application Security Groups (ASG)
- Logical grouping of VMs
- Simplify NSG rules
- Group by role/tier (web, app, db)

```bash
# Create ASGs
az network asg create \
  --resource-group myResourceGroup \
  --name webASG

az network asg create \
  --resource-group myResourceGroup \
  --name appASG

# Associate NIC with ASG
az network nic ip-config update \
  --resource-group myResourceGroup \
  --nic-name myWebNIC \
  --name ipconfig1 \
  --application-security-groups webASG

# Create NSG rule using ASG
az network nsg rule create \
  --resource-group myResourceGroup \
  --nsg-name myNSG \
  --name AllowWebToApp \
  --priority 200 \
  --source-asgs webASG \
  --destination-asgs appASG \
  --destination-port-ranges 443 \
  --protocol TCP \
  --access Allow \
  --direction Inbound
```

### 2.2 Configure Azure Bastion

#### Azure Bastion Features
- Managed PaaS service
- RDP/SSH without public IP on VMs
- No NSG rules needed on Bastion subnet
- Protection against port scanning
- SSL/TLS connection to Azure portal

```bash
# Create Bastion subnet (must be named AzureBastionSubnet, minimum /26)
az network vnet subnet create \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name AzureBastionSubnet \
  --address-prefixes 10.0.255.0/26

# Create public IP for Bastion
az network public-ip create \
  --resource-group myResourceGroup \
  --name BastionPublicIP \
  --sku Standard \
  --allocation-method Static

# Create Bastion host
az network bastion create \
  --resource-group myResourceGroup \
  --name myBastion \
  --public-ip-address BastionPublicIP \
  --vnet-name myVNet \
  --location eastus

# Connect to VM via Bastion (through Azure Portal)
# Portal > Virtual Machine > Connect > Bastion
```

#### Bastion SKUs
- **Basic**: Standard features, 25 concurrent sessions
- **Standard**: File upload/download, more concurrent sessions, shareable links

### 2.3 Configure Service Endpoints for Azure Services

#### Commonly Used Service Endpoints
- Microsoft.Storage
- Microsoft.Sql
- Microsoft.KeyVault
- Microsoft.EventHub
- Microsoft.ServiceBus
- Microsoft.ContainerRegistry
- Microsoft.CognitiveServices

```bash
# Enable multiple service endpoints
az network vnet subnet update \
  --resource-group myResourceGroup \
  --vnet-name myVNet \
  --name mySubnet \
  --service-endpoints \
    Microsoft.Storage \
    Microsoft.Sql \
    Microsoft.KeyVault

# Configure SQL Server to allow VNet
az sql server vnet-rule create \
  --resource-group myResourceGroup \
  --server myserver \
  --name AllowSubnet \
  --vnet-name myVNet \
  --subnet mySubnet
```

---

## 3. Configure Name Resolution and Load Balancing

### 3.1 Configure Azure DNS

#### Azure DNS Features
- Host DNS domains in Azure
- Use Azure infrastructure for name resolution
- Supports A, AAAA, CNAME, MX, TXT, SRV, etc.
- Private DNS zones for internal resolution

```bash
# Create public DNS zone
az network dns zone create \
  --resource-group myResourceGroup \
  --name contoso.com

# Add A record
az network dns record-set a add-record \
  --resource-group myResourceGroup \
  --zone-name contoso.com \
  --record-set-name www \
  --ipv4-address 203.0.113.10

# Add CNAME record
az network dns record-set cname set-record \
  --resource-group myResourceGroup \
  --zone-name contoso.com \
  --record-set-name blog \
  --cname www.contoso.com

# List name servers (update domain registrar)
az network dns zone show \
  --resource-group myResourceGroup \
  --name contoso.com \
  --query nameServers
```

### 3.2 Configure Private DNS Zones

#### Private DNS Features
- Name resolution within VNets
- No need for custom DNS solution
- Automatic VM registration (optional)
- Split-brain DNS (different internal/external names)

```bash
# Create private DNS zone
az network private-dns zone create \
  --resource-group myResourceGroup \
  --name contoso.internal

# Link to VNet with auto-registration
az network private-dns link vnet create \
  --resource-group myResourceGroup \
  --zone-name contoso.internal \
  --name myDNSLink \
  --virtual-network myVNet \
  --registration-enabled true

# Add A record manually
az network private-dns record-set a add-record \
  --resource-group myResourceGroup \
  --zone-name contoso.internal \
  --record-set-name db \
  --ipv4-address 10.0.2.10

# Query from VM in VNet
# nslookup db.contoso.internal
# Returns: 10.0.2.10
```

### 3.3 Configure Azure Load Balancer

#### Load Balancer SKUs
| Feature | Basic | Standard |
|---------|-------|----------|
| **Backend Pool** | Up to 300 VMs | Up to 1000 VMs |
| **Health Probes** | HTTP, TCP | HTTP, HTTPS, TCP |
| **Availability Zones** | Not supported | Zone-redundant, zonal |
| **SLA** | None | 99.99% |
| **Secure by Default** | No | Yes (requires NSG) |
| **Cost** | Free | Charges apply |

#### Load Balancer Types
- **Public**: Distribute internet traffic to VMs
- **Internal**: Distribute traffic within VNet

```bash
# Create public load balancer
az network lb create \
  --resource-group myResourceGroup \
  --name myLoadBalancer \
  --sku Standard \
  --public-ip-address myPublicIP \
  --frontend-ip-name myFrontEnd \
  --backend-pool-name myBackEndPool

# Create health probe
az network lb probe create \
  --resource-group myResourceGroup \
  --lb-name myLoadBalancer \
  --name myHealthProbe \
  --protocol HTTP \
  --port 80 \
  --path /

# Create load balancing rule
az network lb rule create \
  --resource-group myResourceGroup \
  --lb-name myLoadBalancer \
  --name myLBRule \
  --protocol TCP \
  --frontend-port 80 \
  --backend-port 80 \
  --frontend-ip-name myFrontEnd \
  --backend-pool-name myBackEndPool \
  --probe-name myHealthProbe

# Add VMs to backend pool
az network nic ip-config address-pool add \
  --resource-group myResourceGroup \
  --nic-name myNIC \
  --ip-config-name ipconfig1 \
  --lb-name myLoadBalancer \
  --address-pool myBackEndPool
```

#### Load Balancer Rules
- **Load Balancing Rule**: Distribute traffic across backend pool
- **Inbound NAT Rule**: Forward traffic to specific VM
- **Outbound Rule**: Configure outbound connectivity

#### Distribution Modes
- **5-tuple hash** (default): Source IP, source port, destination IP, destination port, protocol
- **Source IP affinity (2-tuple)**: Source IP, destination IP
- **Source IP affinity (3-tuple)**: Source IP, destination IP, protocol

```bash
# Create inbound NAT rule (RDP to specific VM)
az network lb inbound-nat-rule create \
  --resource-group myResourceGroup \
  --lb-name myLoadBalancer \
  --name myNATRule-VM1 \
  --protocol TCP \
  --frontend-port 3389 \
  --backend-port 3389 \
  --frontend-ip-name myFrontEnd

# Associate NAT rule with NIC
az network nic ip-config inbound-nat-rule add \
  --resource-group myResourceGroup \
  --nic-name myNIC1 \
  --ip-config-name ipconfig1 \
  --inbound-nat-rule myNATRule-VM1 \
  --lb-name myLoadBalancer
```

### 3.4 Troubleshoot Load Balancing

#### Common Issues
- Health probe failures
- NSG blocking traffic
- Incorrect backend pool configuration
- Asymmetric routing

```bash
# Check backend health
az network lb show \
  --resource-group myResourceGroup \
  --name myLoadBalancer

# View effective NSG rules on backend VMs
az network nic list-effective-nsg \
  --resource-group myResourceGroup \
  --name myNIC

# Test connectivity from load balancer
az network watcher test-connectivity \
  --resource-group myResourceGroup \
  --source-resource myVM \
  --dest-address <backend-vm-ip> \
  --dest-port 80
```

#### Health Probe Troubleshooting
- Verify probe path returns HTTP 200
- Check probe interval and unhealthy threshold
- Ensure NSG allows health probe traffic (AzureLoadBalancer service tag)
- Verify application is listening on probe port

---

## Key Exam Tips

1. **VNet Peering**: Non-transitive, requires bi-directional configuration
2. **NSG Priority**: Lower number = higher priority (100 is evaluated before 200)
3. **Azure Bastion**: Requires /26 subnet named "AzureBastionSubnet"
4. **Service Endpoints**: Free, uses public IP backbone
5. **Private Endpoints**: Paid, uses private IP in VNet
6. **UDR Next Hop**: VirtualAppliance requires IP address
7. **Public IP SKUs**: Basic = dynamic/static, Standard = static only
8. **Load Balancer**: Standard SKU required for availability zones
9. **Azure DNS**: Authority for domain, not registrar
10. **Reserved IPs**: First 4 and last 1 in each subnet

---

## Practice Scenarios

### Scenario 1: Hub-Spoke Network
**Question**: Connect 3 spoke VNets to hub VNet with shared VPN gateway.

**Answer**:
1. Create peering: Hub ↔ Spoke1, Hub ↔ Spoke2, Hub ↔ Spoke3
2. Hub peering: Enable "Allow Gateway Transit"
3. Spoke peering: Enable "Use Remote Gateways"
4. Configure UDR in spokes for cross-spoke communication (through NVA in hub)

### Scenario 2: Secure Storage Access
**Question**: Allow VMs in VNet to access storage, block internet access to storage.

**Answer**:
1. Enable Microsoft.Storage service endpoint on subnet
2. Configure storage firewall to allow VNet subnet
3. Set storage default action to Deny
4. Optionally use private endpoint for fully private access

### Scenario 3: Load Balanced Web App
**Question**: Deploy highly available web app across 3 VMs in different zones.

**Answer**:
1. Create Standard Load Balancer (zone-redundant frontend)
2. Create 3 VMs in zones 1, 2, 3
3. Add VMs to backend pool
4. Configure HTTP health probe on port 80, path /
5. Create load balancing rule: port 80 → backend pool
6. Create NSG to allow port 80 from Internet, health probe from AzureLoadBalancer

---

## Additional Resources

- [Virtual Network Documentation](https://learn.microsoft.com/en-us/azure/virtual-network/)
- [Network Security Groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
- [Azure Load Balancer Documentation](https://learn.microsoft.com/en-us/azure/load-balancer/)
- [Azure DNS Documentation](https://learn.microsoft.com/en-us/azure/dns/)
- [Network Watcher Documentation](https://learn.microsoft.com/en-us/azure/network-watcher/)
