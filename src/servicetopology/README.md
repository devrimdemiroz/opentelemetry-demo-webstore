

Notes --> [Shamaran](https://medium.com/@devrim.demiroz/shahmaran-20a9f1678)


Here I explore the topological capabilities and limitations of the spanmetrics and servicegraph processors available in the opentelemetry contrib library. 
I will examine their usefulness in visualizing the shape of our system and consider what additional features and functionality we might desire in the future.


* Webstore: http://localhost:8080/
* Grafana: http://localhost:8080/grafana/
* Feature Flags UI: http://localhost:8080/feature/
* Load Generator UI: http://localhost:8080/loadgen/
* Jaeger UI: http://localhost:8080/jaeger/ui/



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
docker-compose -f docker-compose-min.yml up --force-recreate --no-build --remove-orphans &
```
    
```shell
docker-compose -f docker-compose-min.yml up --force-recreate  otelcol &
docker-compose -f docker-compose-min.yml up --force-recreate  grafana &
docker-compose up --force-recreate  --no-build cartservice &

```

```shell

