

Notes --> [Shamaran](https://medium.com/@devrim.demiroz/shahmaran-20a9f1678)


Here I explore the topological capabilities and limitations of the spanmetrics and servicegraph processors available in the opentelemetry contrib library. 
I will examine their usefulness in visualizing the shape of our system and consider what additional features and functionality we might desire in the future.


* Webstore: http://localhost:8080/
* Grafana: http://localhost:8080/grafana/
* Feature Flags UI: http://localhost:8080/feature/
* Load Generator UI: http://localhost:8080/loadgen/
* Jaeger UI: http://localhost:8080/jaeger/ui/

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
// TODO place the weblinks in documentation into boxes as clikable links

```shell
docker build -t shahmaran .
```

```shell
docker run -it --rm -p 8181:80 shahmaran
```
http://localhost:8181/index.html

```shell
# compose docker-compose-min.yml
cd ../../
docker-compose -f docker-compose-min.yml up --force-recreate --build web 
```
    
```shell
docker-compose up --force-recreate --build web image
```

```shell

