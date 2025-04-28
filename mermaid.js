%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1e1e1e', 'edgeLabelBackground':'#2d2d30'}}}%%
graph TB
    %% External Network
    Internet[fa:fa-globe Internet]
    OOB[fa:fa-lock OOB Management Network]

    %% Prod Environment
    subgraph Prod[Production Environment]
        direction TB
        P_FW[fa:fa-fire Firewall] -->|VLAN 10: 10.10.5.0/24<br>Allow TCP/8020,50010| P_CoreSwitch[Core Switch<br>Cisco Nexus 93180YC-FX]
        P_CoreSwitch --> P_Hadoop[fa:fa-database Hadoop Cluster]
        P_CoreSwitch --> P_Cassandra[fa:fa-cube Cassandra Cluster]
        P_CoreSwitch --> P_Hypervisor[ESXi Hosts]
        P_CoreSwitch --> P_LB[HAProxy Load Balancer]
        P_LB -->|VIP: 10.10.5.100:80| P_Hadoop
        P_Hypervisor -->|VM Network| P_Hadoop
        P_Hypervisor -->|VM Network| P_Cassandra
        P_Hypervisor --> P_Physical[Physical Servers<br>HPE ProLiant DL380]
    end

    %% DR Environment
    subgraph DR[Disaster Recovery]
        DR_CoreSwitch[Core Switch]
        DR_Cassandra[fa:fa-cube Cassandra DR]
        DR_CoreSwitch -->|VLAN 20: 10.20.6.0/24| DR_Cassandra
    end

    %% Dev/SIT/PAT
    subgraph NonProd[Non-Production]
        direction LR
        Dev[Dev Env<br>Single-Node Hadoop]
        SIT[SIT Env<br>3-Node Cluster]
        PAT[PAT Env<br>Prod Clone]
    end

    %% Connections
    Internet -->|HTTPS/8443| P_FW
    P_Cassandra -->|Cassandra Replication<br>TCP/7000-7001| DR_Cassandra
    P_CoreSwitch -->|Dark Fiber<br>DWDM Channel 32| DR_CoreSwitch
    OOB -->|SSH/22 Restricted| P_CoreSwitch
    OOB -->|SSH/22 Restricted| DR_CoreSwitch

    %% Monitoring
    Monitor[fa:fa-heartbeat Monitoring Stack<br>Nagios + Prometheus] --> P_Hadoop
    Monitor --> P_Cassandra
    Monitor --> DR_Cassandra
    Monitor --> NonProd

    %% Legend
    classDef prod fill:#004d40,stroke:#00796b
    classDef dr fill:#311b92,stroke:#673ab7
    classDef nonprod fill:#1b5e20,stroke:#2e7d32
    class Prod prod
    class DR dr
    class NonProd nonprod
