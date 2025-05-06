# 🛠️ Job Aid: VMC2 Migration & Red Hat 9 Server Setup for DEV Environment

**Audience:** Platform Engineers
**Use Case:** Prepare DEV infrastructure using new RHEL9 servers and VMC2 platform
**Start Date:** May 20 (Server Arrival)
**Version:** 1.0

---

## 🔰 Objective

Set up the new development environment by:

* Deploying new RHEL9 physical servers
* Migrating from VMC1 to VMC2 (due to EOL of VMC1)
* Establishing baseline configuration, networking, and automation

---

## ✅ Prerequisites

| Task                                          | Responsible       | Notes                       |
| --------------------------------------------- | ----------------- | --------------------------- |
| Confirm VMC2 installation media/license       | Platform Lead     | Download from VMware portal |
| Get IP addresses, VLAN IDs from network team  | NetOps            | For DEV, MGMT, Storage      |
| Server delivery confirmation (12 RHEL9 boxes) | Data Center Admin | ETA: May 20                 |
| Confirm SSH access to mgmt switch, DHCP, PXE  | NetOps            | Required for provisioning   |
| Access to internal Git/Ansible repo           | DevOps            | For playbooks/scripts       |

---

## 📦 Phase 1: Red Hat 9 Physical Server Setup

### 1. Rack and Stack

* Confirm power, cabling, and labeling
* Boot to BIOS → Enable VT-x, disable secure boot if needed
* Apply firmware updates

### 2. OS Installation

* Boot via PXE or USB → Install RHEL 9
* Partitioning:

  ```
  /boot → 1 GB  
  /     → 50 GB  
  /var  → 100 GB  
  swap  → 8 GB
  ```
* Configure static IP, hostname, timezone

### 3. Post-Install Baseline

* Create standard admin user (e.g., `platformadmin`)

* Add SSH keys, disable password login

* Install base packages:

  ```bash
  dnf install -y vim git net-tools curl wget firewalld
  ```

* Set up NTP, DNS, and firewall rules

* Run hardening script or Ansible playbook

---

## 🖥️ Phase 2: VMC2 Virtual Environment Setup

### 1. Install VMC2 Platform

* Deploy vCenter/vSphere
* Confirm host registration and datastores
* Create VM templates for RHEL9

### 2. Network Configuration

* Define:

  * DEV VLAN
  * MGMT VLAN
  * Storage VLAN (optional)
* Create vSwitches/port groups accordingly
* Reserve IPs in IPAM (manual or NetBox)

### 3. VM Provisioning

* Deploy 1-2 test VMs from template
* Validate:

  * Network reachability
  * Template customization (hostname, IP, user)

---

## ⚙️ Phase 3: Automation & Monitoring

### 1. Ansible Setup

* Create inventory of physical + virtual nodes
* Define roles for:

  * SSH config
  * System tuning (sysctl, limits)
  * Monitoring agent install

### 2. Monitoring Integration

* Install:

  * `node_exporter` (Prometheus)
  * Log agent (e.g., Filebeat or journald-forwarder)
* Confirm metrics and logs visible in monitoring system

---

## 📋 Final Checklist Before Go-Live

| Item                                            | Status | Notes |
| ----------------------------------------------- | ------ | ----- |
| ✅ All physical RHEL9 servers installed & online |        |       |
| ✅ VMC2 deployed and functional                  |        |       |
| ✅ Network VLANs and firewall configured         |        |       |
| ✅ Admin users and SSH keys in place             |        |       |
| ✅ Templates created and tested                  |        |       |
| ✅ Automation bootstrapped                       |        |       |
| ✅ Monitoring connected                          |        |       |
| ✅ Documentation updated                         |        |       |

---

## 🗺️ Appendices

### A. Network Diagram

*(Use Draw\.io or Visio; shows physical and virtual node layout, VLANs, firewalls)*

### B. Example Hostname Scheme

| Server Role  | Hostname Prefix | Example    |
| ------------ | --------------- | ---------- |
| Physical DEV | `dev-phy-##`    | dev-phy-01 |
| Virtual DEV  | `dev-vm-##`     | dev-vm-01  |

### C. References

* VMware VMC2 Installation Guide
* RHEL 9 Installation Checklist
* Internal Ansible Repo Docs


### ✅ **1. Migration Context Summary**

* **Current stack:** VMC1 (EOL), RHEL 7/8
* **Target stack:** VMC2 (new), RHEL 9 on bare metal (12 DEV servers)
* **Upgrade constraint:** No in-place upgrade — re-deploy from scratch
* **Purpose:** Prepare DEV environment, migrate workloads cleanly, and standardize on new platform

---

### 📋 **2. Key Planning Tasks Before May 20**

#### ✅ **Infra & Provisioning**

* [ ] Finalize rack/hostnames and IP allocation
* [ ] Review and define BIOS/RAID/DHCP/iLO setup process
* [ ] Install RHEL9 base OS with required partitioning scheme
* [ ] Validate firmware, kernel, and driver compatibility

#### ✅ **VMware VMC2 Setup**

* [ ] Install and configure VMC2 appliance on-prem
* [ ] Define VM templates (RHEL9, standard users, SSH, baseline packages)
* [ ] Network bridging/vSwitches: define subnets and zones (DEV/QA separation if applicable)
* [ ] Confirm vCenter, vSphere, vSAN (if used) compatibility
* [ ] Set up VM tagging/naming convention for migration clarity

#### ✅ **Networking**

* [ ] Design network diagram (IPAM + VLANs for DEV, Management, Storage)
* [ ] Define firewall rules and zones (inter-server, internet access, monitoring tools)
* [ ] Identify DNS/NTP/DHCP dependencies

#### ✅ **Automation & Config Management**

* [ ] Define Ansible playbooks or scripts to install standard packages and users
* [ ] Automate hardening and system tuning (via CIS or internal baseline)
* [ ] Pre-define monitoring/telemetry agent install (e.g., Prometheus node\_exporter)

#### ✅ **Post-Bootstrap Testing**

* [ ] Test connectivity (ping/SSH/nfs/smb)
* [ ] Test service auto-start and logging
* [ ] Validate OS and hypervisor metrics in your monitoring tool

---

### 🧭 **3. Deliverables Before Arrival of Servers**

* 📌 *Network Diagram (Visio / Draw\.io)*: VLAN layout, firewall zones, IP blocks
* 📌 *Migration Plan Document*: Steps to deploy VMC2 and rebuild VMs
* 📌 *RedHat 9 Bootstrap Script/Ansible*: OS configuration baseline
* 📌 *Dependency Matrix*: Mapping of services/ports/users per server


