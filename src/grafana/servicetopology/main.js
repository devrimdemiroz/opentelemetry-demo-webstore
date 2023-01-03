// get the http domain name 
// example https://devrimdemiroz-orange-garbanzo-vr44gqppw953wvpx-3000.preview.app.github.dev/src/grafana/servicetopology/
var domain_name = window.location.hostname;
// Set the URL for the Prometheus API endpoint
// example: https://devrimdemiroz-orange-garbanzo-vr44gqppw953wvpx-9090.preview.app.github.dev/graph?g0.expr=&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h
// change port number  3000 to 9090 inside domain_name
domain_name = domain_name.replace("3000","9090");



// Set the query string for the trace metrics data
let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
let encodedQuery = encodeURIComponent(queryTraceMetrics);
let apiUrl = `https://${domain_name}/api/v1/query?query=${encodedQuery})`;
// sum by(service_name%2Coperation%2Cspan_kind%2Cstatus_code) (rate(calls_total[1m0s])
// (Reason: header ‘access-control-allow-credentials’ is not allowed according to header ‘Access-Control-Allow-Headers’ from CORS preflight response).
// Run the query for the trace metrics data and process the results
fetch(apiUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, locale',
        'Access-Control-Allow-Methods': 'GET, POST',
    },
}).then((response) => {
    console.log("response=", response);
    return response.json();
}).then((result) => {
    // The data is now available in the "data" variable
    console.log("queryTraceMetrics result=", result);
    // Create a map of service names to operations
    var serviceOperationMap = new Map();
    result.data.result.forEach(function (d) {
        if (!serviceOperationMap.has(d.metric.service_name)) {
            serviceOperationMap.set(d.metric.service_name, []);
        }
        serviceOperationMap.get(d.metric.service_name).push(d.metric.service_name + "_" + d.metric.operation + "_" + d.metric.span_kind);
    });
    console.log("queryTraceMetrics serviceOperationMap=", serviceOperationMap);
    // Set the query string for the cluster data
    let queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";

    // Run the query for the cluster data and process the results
    fetch(apiUrl + "?query=" + queryCluster, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, locale',
            'Access-Control-Allow-Methods': 'GET, POST',
        },
    }).then((response) => {
        console.log("response=", response);
        return response.json();
    }).then((result) => {
        // The data is now available in the "data" variable
        console.log("queryCluster result=", result);

        // Define the Graphviz code as a string variable
        var graphvizCode = "digraph {\n";

        // Set the default node shape and edge style
        graphvizCode += " rankdir=\"LR\"\n";
        graphvizCode
fetch(apiUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, locale',
        'Access-Control-Allow-Methods': 'GET, POST',
    },
}).then((response) => {
    console.log("response=", response);
    return response.json();
}).then((result) => {
    // The data is now available in the "data" variable
    console.log("queryTraceMetrics result=", result);
    // Create a map of service names to operations
    var serviceOperationMap = new Map();
    result.data.result.forEach(function (d) {
        if (!serviceOperationMap.has(d.metric.service_name)) {
            serviceOperationMap.set(d.metric.service_name, []);
        }
        serviceOperationMap.get(d.metric.service_name).push(d.metric.service_name + "_" + d.metric.operation + "_" + d.metric.span_kind);
    });
    console.log("queryTraceMetrics serviceOperationMap=", serviceOperationMap);
    // Set the query string for the cluster data
    let queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";

    // Run the query for the cluster data and process the results
    fetch(apiUrl + "?query=" + queryCluster, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, locale',
            'Access-Control-Allow-Methods': 'GET, POST',
        },
    }).then((response) => {
        console.log("response=", response);
        return response.json();
    }).then((result) => {
        // The data is now available in the "data" variable
        console.log("queryCluster result=", result);

        // Define the Graphviz code as a string variable
        var graphvizCode = "digraph {\n";

        // Set the default node shape and edge style
        graphvizCode += " rankdir=\"LR\"\n";
        graphvizCode
d3.json(apiUrl)//add header
    .header({'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, locale',
    'Access-Control-Allow-Methods': 'GET, POST',})
    .then(function(result) {
        // The data is now available in the "data" variable
        console.log("queryTraceMetrics result=", result);
                // Create a map of service names to operations
        var serviceOperationMap = new Map();
        result.data.result.forEach(function(d) {
            if (!serviceOperationMap.has(d.metric.service_name)) {
                serviceOperationMap.set(d.metric.service_name, []);
            }
            serviceOperationMap.get(d.metric.service_name).push(d.metric.service_name+"_"+d.metric.operation+"_"+d.metric.span_kind);
        });
        console.log("queryTraceMetrics serviceOperationMap=", serviceOperationMap);
        // Set the query string for the cluster data
        let queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";

        // Run the query for the cluster data and process the results
        d3.json(apiUrl + "?query=" + queryCluster)
            .then(function(result) {
                // The data is now available in the "data" variable
                console.log("queryCluster result=", result);

                // Define the Graphviz code as a string variable
                var graphvizCode = "digraph {\n";

                // Set the default node shape and edge style
                graphvizCode += " rankdir=\"LR\"\n";
                graphvizCode += " compound=true\n";
                graphvizCode += " ordering=out\n";
                graphvizCode += " layout=fdp\n";
                graphvizCode += "  node [shape=circle]\n";
                graphvizCode += "  edge [style=solid]\n";

                // Create a new Set to store the cluster names
                var clusterSet = new Set();

                // Iterate over the query result data
                result.data.result.forEach(function (d) {
                    // Add the client and server names to the Set
                    clusterSet.add(d.metric.client);
                    clusterSet.add(d.metric.server);
                });

                // Set up the subgraphs for each cluster
                clusterSet.forEach(function (clusterName) {
                    graphvizCode += " subgraph cluster_" + clusterName + " {\n";
                    graphvizCode += " label = \"" + clusterName + "\"\n";
                    graphvizCode += " labeljust = l\n";
                    graphvizCode += " shape = circle\n";
                    console.log("clusterName=",clusterName);
                    console.log("serviceOperationMap=",serviceOperationMap);
                    // Check if the cluster name matches any of the service names in the trace metrics data
                    serviceOperationMap.get(clusterName).forEach(function(operation) {
                        operation = operation.replace(/[\.\-\/]/g, "");
                        graphvizCode += " \"" + operation + "\"\n";
                        console.log("operation=",operation);
                    });

                    graphvizCode += "  }\n";

                });

// Add the edges (connections) between the clusters, along with their corresponding weights
                result.data.result.forEach(function (d) {
                    var source = d.metric.client;
                    var target = d.metric.server;
                    var weight = d.value[1];
                    weight = Number(weight).toFixed(2);
                    graphvizCode += " cluster_" + source + " -> cluster_" + target + " [label=\"" + weight + "\"]\n";
                });

// Close the Graphviz code string
                graphvizCode += "}";

// You can then use this graphvizCode variable to generate the diagram

// Print the Graphviz output
                console.log(graphvizCode);
                // Render the graph
                var container = d3.select("#dataviz");
                container.graphviz()
                    .dot(graphvizCode)
                    .render();

            })});
        })
        .catch(function(error) {
            console.log("error=", error);
        }
    );

    // Set up the subgraphs for each cluster
    clusterSet.forEach(function(clusterName) {
        graphvizCode += " subgraph cluster_" + clusterName + " {\n";
        graphvizCode += " label = \"" + clusterName + "\"\n";
        graphvizCode += " labeljust = l\n";
        graphvizCode += " shape = circle\n";
        console.log("clusterName=", clusterName);
        console.log("serviceOperationMap=", serviceOperationMap);
        // Check if the cluster name matches any of the service names in the trace metrics data
        serviceOperationMap.get(clusterName).forEach(function(operation) {
            operation = operation.replace(/[\.\-\/]/g, "");
            graphvizCode += " \"" + operation + "\"\n";
            console.log("operation=", operation);
        });

        graphvizCode += "  }\n";

    });

    // Add the edges (connections) between the clusters, along with their corresponding weights
    result.data.result.forEach(function(d) {
        var source = d.metric.client;
        var target = d.metric.server;
        var weight = d.value[1];
        weight = Number(weight).toFixed(2);
        graphvizCode += " cluster_" + source + " -> cluster_" + target + " [label=\"" + weight + "\"]\n";
    });

    // Close the Graphviz code string
    graphvizCode += "}";

    // You can then use this graphvizCode variable to generate the diagram

    // Print the Graphviz output
    console.log(graphvizCode);
    // Render the graph
    var container = d3.select("#dataviz");
    container.graphviz()
        .dot(graphvizCode)
        .render();

    }) }); 
    })