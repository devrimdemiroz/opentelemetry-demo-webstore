const dotlib = require('graphlib-dot');
let domain_name = "localhost";
try{
    domain_name = window.location.hostname;
} catch (e) {
    console.log("window.location.hostname not defined. Using localhost");
}

// Set the URL for the Prometheus API endpoint
// example: http<://devrimdemiroz-orange-garbanzo-vr44gqppw953wvpx-9090.preview.app.github.dev/graph?g0.expr=&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h

// change port number  3000 to 9090 inside domain_name
domain_name = domain_name.replace("3000","9090");
// also if domainname is localhost , add :9090 to the end of the domain name
// also if domain name does not exist (e.g. when running locally), use localhost:9090
if (domain_name === "") {
    domain_name = "localhost:9090";
}
if (domain_name === "localhost") {
    domain_name = domain_name + ":9090";
}

// Set the query string for the trace metrics data
let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
queryTraceMetrics=`query?query=${queryTraceMetrics}`;
let apiUrl = `http://${domain_name}/api/v1/`;

// Run the query for the trace metrics data and process the results
console.log( "apiUrl+queryTraceMetrics = " , apiUrl+queryTraceMetrics);

function createServiceOperationMap(result) {
    // The data is now available in the "data" variable
    console.log("queryTraceMetrics result=", result);
    // Create a map of service names to operations
    let serviceOperationMap = new Map();
    result.data.result.forEach(function (d) {
        if (!serviceOperationMap.has(d.metric.service_name)) {
            serviceOperationMap.set(d.metric.service_name, []);
        }
        // construct operation with replacing / and " "(space) with _
        let operationID = d.metric.service_name + "_" + d.metric.operation + "_" + d.metric.span_kind;
        operationID = operationID.replace(/(\/| |\.)/g, "_");
        d.metric.operation_id = operationID;
        console.log("operationID=", operationID);
        serviceOperationMap.get(d.metric.service_name).push(d);
    });
    console.log("queryTraceMetrics serviceOperationMap=", serviceOperationMap);
    return serviceOperationMap;
}

function addServiceAndOperataions(graph, service, serviceOperationMap) {
    // create cluster as subgraph
    // if target or source already exists, do not create a new subgraph
    if (!graph.hasNode(service)) {
        // add subgraph to graph object subgraph cluster_" + source
        let cluster_service = "cluster_"+service;
        graph.setNode(cluster_service, {label: service});
        serviceOperationMap.get(service).forEach(function (d) {
            let cluster_service_spankind = cluster_service+"_"+d.metric.span_kind;
            // order spankind server subgraphs on left, client on right and internal to be between them
            let order = 0;
            if (d.metric.span_kind === "server") {
                order = 1;
            }
            graph.setNode(cluster_service_spankind, {label: d.metric.span_kind, cluster: cluster_service , style: "filled", color: "lightgrey", order: order});
            graph.setParent(cluster_service_spankind, cluster_service);
            // layout
            graph.setNode(d.metric.operation_id, {label: d.metric.operation, cluster: cluster_service_spankind, style: "filled", color: "white"});
            graph.setParent(d.metric.operation_id, cluster_service_spankind);
        });


    }
}

fetch(apiUrl + queryTraceMetrics)
    .then(response => response.json())
    .then(function(result) {
        let serviceOperationMap = createServiceOperationMap(result);
        // Set the query string for the cluster data
        let queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";
        queryCluster=`query?query=${queryCluster}`;

        // Run the query for the cluster data and process the results
        fetch(apiUrl + queryCluster)
            .then(response => response.json())
            .then(function(result) {
                // The data is now available in the "data" variable
                console.log("queryCluster result=", result);



                // Create a new graph

                let graph = new dotlib.graphlib.Graph({compound:true, directed:true, multigraph:true});
                //compound=true allows subgraphs
                graph.setGraph({compound:true});

                // Set the graph's layout to 'fdp'
                graph.setGraph({ layout: 'fdp' });
                // peripheries




                // Add the edges (connections) between the clusters, along with their corresponding weights
                result.data.result.forEach(function(d) {
                    var source = d.metric.client;
                    var target = d.metric.server;
                    console.log("source, target, d.value[1]=", source, target, d.value[1]);
                    var weight = d.value[1];
                    weight = Number(weight).toFixed(2);
                    addServiceAndOperataions(graph, source, serviceOperationMap);
                    addServiceAndOperataions(graph, target, serviceOperationMap);

                    // put these lines in a sepatate variable which will be added at the end of the graphvizCode
                    //edges += " cluster_" + source + " -> cluster_" + target + " [label=\"" + weight + "\"]\n";
                    graph.setEdge("cluster_" +source, "cluster_"+target, {label: weight});

                    // find if there are matching operations under different cluster between spankind client and server. then print them.
                    // if there are matching operations, then add edges between them
                    serviceOperationMap.get(source).forEach(function (d1) {
                        serviceOperationMap.get(target).forEach(function (d2) {
                            // not exact match, but contains
                            if (d1.metric.operation.includes(d2.metric.operation) || d2.metric.operation.includes(d1.metric.operation)) {
                                console.log("matching operation=", d1.metric.operation);
                                graph.setEdge(d1.metric.operation_id, d2.metric.operation_id, {label: weight});
                            }
                        });

                    } );



                });

                // Print the Graphviz output
                console.log(dotlib.write(graph));
                // save to a file
                var fs = require('fs');
                fs.writeFile("graphvizCode.dot", dotlib.write(graph), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                } );
            })
            .catch(error => {
                console.log("Error: " + error);
            });
    })
    .catch(error => {
        console.log("Error: " + error);
    });
