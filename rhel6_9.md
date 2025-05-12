Here is a **sample RHEL 9 provisioning script** that could be auto-generated from the inventory produced by the `generate_rhel6_inventory.sh` script. It sets up:

* Required packages and runtimes
* Service accounts (NPIDs)
* File structure and permissions
* Sample systemd units for apps
* Placeholder commands for config restoration

This script is safe to start with and can be customized based on your specific inventory.

---

## **Script: `provision_rhel9_from_inventory.sh`**

```bash
#!/bin/bash
set -e

echo "==[ Phase 1: System Update and Base Utilities ]=="
dnf update -y
dnf install -y epel-release
dnf install -y vim curl wget unzip git net-tools bash-completion firewalld chrony \
               htop lsof rsync tar policycoreutils-python-utils sudo

systemctl enable --now firewalld chronyd

echo "==[ Phase 2: Create Service Users (NPIDs) ]=="
# Replace with output from npid_candidates.txt
useradd -m -s /bin/bash sparkuser
useradd -m -s /bin/bash appuser
useradd -m -s /sbin/nologin cassandra
useradd -m -s /bin/bash postgres

echo "==[ Phase 3: Install Runtimes ]=="
# Java for Spring Boot
dnf install -y java-17-openjdk java-17-openjdk-devel

# Python for apps
dnf install -y python3 python3-pip
pip3 install --upgrade pip virtualenv

# Node.js + Angular
dnf module enable -y nodejs:18
dnf install -y nodejs npm
npm install -g @angular/cli

echo "==[ Phase 4: App Directory Structure ]=="
mkdir -p /app/springboot /app/angular /data /logs
chown -R appuser:appuser /app /data /logs

echo "==[ Phase 5: Install Spark and Hadoop Clients ]=="
mkdir -p /opt/spark /opt/hadoop

curl -LO https://downloads.apache.org/hadoop/common/hadoop-3.2.2/hadoop-3.2.2.tar.gz
tar -xzf hadoop-3.2.2.tar.gz -C /opt/hadoop --strip-components=1

curl -LO https://downloads.apache.org/spark/spark-3.3.2/spark-3.3.2-bin-hadoop3.tgz
tar -xzf spark-3.3.2-bin-hadoop3.tgz -C /opt/spark --strip-components=1

cat <<EOF >> /etc/profile.d/bigdata.sh
export HADOOP_HOME=/opt/hadoop
export SPARK_HOME=/opt/spark
export PATH=\$PATH:\$HADOOP_HOME/bin:\$SPARK_HOME/bin
EOF

echo "==[ Phase 6: PostgreSQL and Cassandra Clients ]=="
dnf install -y postgresql postgresql-server
postgresql-setup --initdb
systemctl enable --now postgresql

# Cassandra example from community repo
cat <<EOF > /etc/yum.repos.d/cassandra.repo
[cassandra]
name=Apache Cassandra
baseurl=https://downloads.apache.org/cassandra/redhat/311x/
gpgcheck=0
enabled=1
EOF

dnf install -y cassandra
systemctl enable --now cassandra

echo "==[ Phase 7: Sample systemd Unit for Spring Boot ]=="
cat <<EOF > /etc/systemd/system/springboot.service
[Unit]
Description=Spring Boot App
After=network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /app/springboot/myapp.jar
SuccessExitStatus=143
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable springboot

echo "==[ Phase 8: Placeholder for Config Restoration ]=="
echo ">> Please manually restore config files to:"
echo "- /etc/ssh/sshd_config"
echo "- /etc/sysconfig/network"
echo "- /etc/selinux/config"
echo "- /etc/hosts, resolv.conf, fstab"

echo "==[ Phase 9: Firewall Rules ]=="
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --permanent --add-port=9042/tcp   # Cassandra
firewall-cmd --reload

echo "==[ Setup Complete. Validate all services and apps. ]=="
```

---

### **What’s Next**

* Feed in real user/group mappings and port requirements from inventory.
* Adjust URLs and versions if you're using local repo mirrors or air-gapped setups.
* Add cron jobs and `systemd` timers based on inventory cron findings.

---

Would you like:

* An **Ansible version** of this provisioning script?
* Or a tool to **diff the RHEL 6 inventory and this script for drift detection**?



Absolutely! Here's a detailed **task list for onboarding engineers** covering two phases:

1. **RHEL 6 Inventory Development** – capture everything required to recreate the environment
2. **RHEL 9 Provisioning** – rebuild environment based on the inventory

This can be used in **Jira**, **Excel**, or **Confluence task tables**, and is designed to support automation where possible.

---

## **Task List – Phase 1: RHEL 6 Inventory Development**

| ID   | Task                                | Owner    | Tool/Command                              | Output                         | Notes                                  |
| ---- | ----------------------------------- | -------- | ----------------------------------------- | ------------------------------ | -------------------------------------- |
| 1.1  | Capture hostname, OS, kernel info   | Engineer | `hostnamectl`, `uname -a`                 | `system_info.txt`              |                                        |
| 1.2  | List all installed RPMs             | Engineer | `rpm -qa`                                 | `installed_rpms.txt`           | Required for `dnf install` replication |
| 1.3  | List enabled services               | Engineer | `chkconfig --list`                        | `enabled_services_initd.txt`   | Must be mapped to `systemd`            |
| 1.4  | List running processes and PIDs     | Engineer | `ps aux`                                  | `running_processes.txt`        | Identify active app processes          |
| 1.5  | Identify open network ports         | Engineer | `netstat -tulnp`                          | `network_ports.txt`            | Validate firewall rules on RHEL 9      |
| 1.6  | Capture user and group list         | Engineer | `getent passwd`, `getent group`           | `passwd_entries.txt`           | NPIDs must be re-created               |
| 1.7  | Identify NPIDs                      | Engineer | `awk`, naming patterns                    | `npid_candidates.txt`          | Used to generate `useradd`             |
| 1.8  | Collect crontabs                    | Engineer | `crontab -l`, copy `/var/spool/cron`      | `crontabs/`                    | Recreate with `systemd` timers         |
| 1.9  | Capture configuration files         | Engineer | `cp /etc/...`                             | `config_samples/`              | SSH, fstab, network, etc.              |
| 1.10 | Collect runtime versions            | Engineer | `java -version`, `python`, `spark-submit` | `runtime_versions.csv`         | Required for provisioning logic        |
| 1.11 | Search config files for credentials | Engineer | `grep -ri`                                | `possible_credential_refs.txt` | Review for migration or vaulting       |
| 1.12 | Archive and compress inventory      | Engineer | `tar -czf`                                | `.tar.gz` file                 | Delivered to provisioning team         |

---

## **Task List – Phase 2: RHEL 9 Provisioning & Setup**

| ID   | Task                                     | Owner    | Tool/Command                                 | Output                        | Notes                              |
| ---- | ---------------------------------------- | -------- | -------------------------------------------- | ----------------------------- | ---------------------------------- |
| 2.1  | Update OS and install base tools         | Engineer | `dnf install ...`                            | System ready                  | `firewalld`, `vim`, etc.           |
| 2.2  | Create NPIDs                             | Engineer | `useradd`, from inventory                    | Users created                 | Use consistent UIDs if needed      |
| 2.3  | Install Java 17                          | Engineer | `dnf install java-17-openjdk`                | Java runtime                  | Validate with version check        |
| 2.4  | Install Python 3.11 + pip                | Engineer | `dnf install python3`                        | Python env ready              | Create venv if needed              |
| 2.5  | Install Node.js + Angular CLI            | Engineer | `dnf module enable nodejs:18`, `npm install` | Angular ready                 |                                    |
| 2.6  | Create directories `/app`, `/logs`, etc. | Engineer | `mkdir`, `chown`                             | Folder structure              | Permissions must match apps        |
| 2.7  | Download and extract Spark & Hadoop      | Engineer | `curl`, `tar`                                | `/opt/spark`, `/opt/hadoop`   | Add to `PATH`                      |
| 2.8  | Install PostgreSQL                       | Engineer | `dnf install postgresql-server`              | DB installed                  | Initialize and start service       |
| 2.9  | Install Cassandra                        | Engineer | Add repo, `dnf install cassandra`            | DB installed                  | Validate service and ports         |
| 2.10 | Restore or create systemd units          | Engineer | `vi /etc/systemd/system/*.service`           | App services enabled          | e.g., Spring Boot                  |
| 2.11 | Restore config files (manual or script)  | Engineer | `cp config_samples/* /etc/`                  | Verified config               | May require custom templating      |
| 2.12 | Set firewall rules                       | Engineer | `firewall-cmd`                               | Open ports (e.g., 8080, 9042) | Use inventory ports                |
| 2.13 | Validate services                        | Engineer | `curl`, `systemctl`, `ss`                    | Smoke tests pass              | Ensure Angular UI, API, DB work    |
| 2.14 | Register CI/CD runner or agent           | DevOps   | GitLab/Jenkins UI                            | Runner active                 | Check permissions                  |
| 2.15 | Document server readiness                | Engineer | `/opt/server-readiness.md`                   | Document complete             | Include user, services, app checks |
| 2.16 | Get sign-off from platform lead          | Engineer | Checklist signed                             |                               | Required for SIT/QA entry          |

---

Would you like this exported as:

* An **Excel spreadsheet**?
* A **Jira importable CSV**?
* Or a **Confluence task list template**?
