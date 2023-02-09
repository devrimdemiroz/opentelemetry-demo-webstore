// Set the query string for the trace metrics data
let apiUrl = `http://localhost:8181/api/v1/`;

var services;
let serviceLinks;


let cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    layout: {
        name: 'fcose',
        animate: true,
        stop: () => {}
    }

});

queryServiceGraph();











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
            services=setDistinctServices(result);

            // extract links

            serviceLinks = result.data.result.map(function (d) {
                let source = d.metric.client;
                let target = d.metric.server;
                return {source: source, target: target};
            });



        })
        .catch(error => {
            console.log("Error: " + error);
        });
     queryTraceMetrics();
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
                    let operationID = operation.replace(/(\/| |\.)/g, "_");
                    serviceNode.children.push({
                        id: operationID,
                        label: operation,
                        color: color,
                        spankind: spankind,
                        statuscode: statuscode,
                        count: count
                    });
                }
            } );

        }  )
    console.log("services=", services);
    // convert services to cytoscape json
    serviceLevelGraph();

}
function serviceLevelGraph() {

    // wait services to be populated
    if (!services) {
        setTimeout(serviceLevelGraph, 1000);
        return;
    }
    services.map(function (node) {
        cy.add({

            data: {
                id: node.id,
                label: node.label,
                nodeType: "service"

            },
            position: {
                x: Math.random() * 100,
                y: Math.random() * 100
            }
        } );

        // add children to each service node
        if (node.children) {
            let valignArray = [];
            node.children.forEach(function (child) {
                // create a compound for spankind if not already created
                let spankind = child.spankind.replace(/SPAN_KIND_(.*)/g, "$1");
                let spankindID = node.id+"_"+spankind;
                let spankindNode = cy.getElementById(spankindID);
                if (spankindNode.length === 0) {
                    cy.add({
                        data: {
                            id: spankindID,
                            parent: node.id,
                            label: spankind,
                            nodeType: "spankind"
                        },
                        position: {
                            x: Math.random() * 100,
                            y: Math.random() * 100
                        }
                    } );
                }
                let operationId = spankindID+"_"+child.statuscode+"_"+child.id;
                cy.add({
                    data: {
                        id: operationId,
                        parent: spankindID,
                        label: child.label,
                        statuscode: child.statuscode,
                        count: child.count,
                        nodeType: "operation"
                    },
                    position: {
                        x: Math.random() * 100,
                        y: Math.random() * 100

                    }
                } );
                valignArray.push(operationId);

            } );
        }
    } );


    cy.add(serviceLinks.map(function (link) {
        return {
            data: {
                source: link.source,
                target: link.target
            }
        };
    }));
    exportJson();
}


function exportJson() {
    const json = cy.json();
    const elements = json.elements;
    if (!elements.nodes) {
        return;
    }
    str2file(JSON.stringify(elements, undefined, 4), 'service-graph.json');
}
function str2file(str, fileName) {
    const blob = new Blob([str], { type: 'text/plain' });
    const anchor = document.createElement('a');

    anchor.download = fileName;
    anchor.href = (window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl =
        ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
}







