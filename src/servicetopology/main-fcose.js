// Set the query string for the trace metrics data
let apiUrl = `http://localhost:8181/api/v1/`;

let serviceOperationMap;
let services;
let serviceLinks;


queryServiceGraph();
queryTraceMetrics();

function getColorSpanKind(spankind) {
    color = "white";
    if (spankind === "SPAN_KIND_SERVER") {
        color = "#ccd5ae";
    }
    if (spankind === "SPAN_KIND_CLIENT") {
        color = "#faedcd";
    }
    if (spankind === "SPAN_KIND_INTERNAL") {
        color = "#fefae0";
    }
    return color;
}




function setDistinctServices(result) {
    let serviceSet = new Set();
    result.data.result.forEach(function (d) {
        serviceSet.add(d.metric.client);
        serviceSet.add(d.metric.server);
    });
    services=Array.from(serviceSet).map(function (service) {
        return {id: service, label: service};
    });
    return services;
}

function queryTraceMetrics() {
    let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
    queryTraceMetrics = `query?query=${queryTraceMetrics}`;
    console.log("apiUrl+queryTraceMetrics = ", apiUrl + queryTraceMetrics);
    // Run the query  and process the results

    fetch(apiUrl + queryTraceMetrics)
        .then(response => response.json())
        .then(function (result) {
// The data is now available in the "data" variable
            console.log("result=", result);
            // add each data point as a node under corresponding service node in services array
            result.data.result.map(function (d) {
                let service = d.metric.service_name;
                let operation = d.metric.operation;
                let spankind = d.metric.span_kind;
                let statuscode = d.metric.status_code;
                let count = d.value[1];
                let color = getColorSpanKind(spankind);
                let serviceNode = services.find(function (node) {
                    return node.id === service;
                });
                if (serviceNode) {
                    if (!serviceNode.children) {
                        serviceNode.children = [];
                    }
                    serviceNode.children.push({
                        id: operation,
                        label: operation,
                        color: color,
                        statuscode: statuscode,
                        count: count
                    });
                }
            } );

        }  )
    console.log("services=", services);
}

function queryServiceGraph() {
    let queryServiceGraph = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";
    queryServiceGraph = `query?query=${queryServiceGraph}`;
    // Run the query for the cluster data and process the results
    fetch(apiUrl + queryServiceGraph)
        .then(response => response.json())
        .then(function (result) {
            // The data is now available in the "data" variable
            console.log("traces_service_graph_request_total result=", result);

            // services
            setDistinctServices(result);

            // extract links

            serviceLinks = result.data.result.map(function (d) {
                let source = d.metric.client;
                let target = d.metric.server;
                return {source: source, target: target};
            });

            console.log("services=", services , "links=", serviceLinks);




        })
        .catch(error => {
            console.log("Error: " + error);
        });
}


function serviceLevelGraph() {

    cy.add(services.map(function (node) {
        return {
            data: {
                id: node.id,
                label: node.label
            },
            position: {
                x: Math.random() * 100,
                y: Math.random() * 100
            }
        };
    }));

    cy.add(serviceLinks.map(function (link) {
        return {
            data: {
                source: link.source,
                target: link.target
            }
        };
    }));
}
