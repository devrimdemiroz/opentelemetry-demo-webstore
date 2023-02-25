# Shahmaran branch

This branch is reflection of the [Shahmaran](https://tractatus.one/shahmaran-20a9f1678) blog post. Mainly prototyping the ideas and concepts described in the blog post.

## Topological Capabilities and Limitations of Spanmetrics and Servicegraph Processors

explore the topological capabilities and limitations of the spanmetrics and servicegraph processors available in the opentelemetry contrib library. I will examine their usefulness in visualizing the shape of our system and consider what additional features and functionality we might desire in the future.

### Cytoscape on Grafana Preview 
##### 18 Feb 2023
![ucm based topology - cytoscape footprint](preview1.png)

#### Gallery of images from the
[Shahmaran](https://tractatus.one/shahmaran-20a9f1678) blog post.

![OctopusMultiBrainIOCircilationSys](src/servicetopology/footsteps/OctopusMultiBrainIOCircilationSys 2023-02-25.png)

[footstep snapshots here here](src/servicetopology/footsteps/)
##### A quick look behind the curtain
```mermaid
flowchart LR
    
    subgraph "Webstore"
    W["http://localhost:8080/"]
    click W "http://localhost:8080/"
    end
    
    subgraph "Load Generator UI"
    L["http://localhost:8080/loadgen/"]
    click L href "http://localhost:8080/loadgen/" "http://localhost:8080/loadgen/" _blank
    end
    
    subgraph "Grafana"
    G["http://localhost:8080/grafana/"]
    click G "http://localhost:8080/grafana/"
    end
    
   
       
    subgraph "Feature Flags UI"
    F["http://localhost:8080/feature/"]
    click F "http://localhost:8080/feature/"
    end
    
    
    subgraph "Jaeger UI"
    J["http://localhost:8080/jaeger/ui/"]
    click J "http://localhost:8080/jaeger/ui/"
    end
    
    subgraph "Prometheus"
    P["http://localhost:9090/"]
    click P "http://localhost:9090/"
    end
    
    subgraph "OpenTelemetry Collector"
    I["http://localhost:4317/"]
    click I href "http://localhost:4317/" _blank
    end
    
    

    L --> W 
    W --> I
    J -->  P
    I -->  J 
    I -->  P
    G -->  P & J
    
        
```
