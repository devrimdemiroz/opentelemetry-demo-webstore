# OpenTelemetry Demo Application Clone Branch 

## Unlocking Tempo APM Dashboard Without Tempo

Prototype of OpenTelemetry Demo application that can be used to demonstrate the capabilities of Tempo without having to deploy Tempo.

Further details can be found in the [Unlocking Tempo APM Dashboard Without Tempo](https://medium.com/@devrim.demiroz/unlocking-tempo-apm-dashboard-without-tempo-fcbb0f433998).

```shell
docker-compose -f docker-compose-tempoapm.yml up --no-build
```
Click on the link below to open Grafana Explore page.
[http://localhost:8080/grafana/explore?orgId=1](http://localhost:8080/grafana/explore?orgId=1)

Select "Fake Tempo" datasource. Click on service graph tab and refresh the page to see the service graph. 
You might need to wait for a few seconds to see all services.

### OOTB Explore with datasource Fake Tempo

![Tempo Apm Dashboard](TempoApmDashboard.png)


### Custom Dashboard

![Spanmetrics and servicegraph processor independend Service Dashboard](./SpanmetricsDashboard.png "Service Dashboard")


```shell
docker-compose -f docker-compose-min.yml up --no-build
```
