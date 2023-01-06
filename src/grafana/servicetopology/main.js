// get the http domain name
// example https://devrimdemiroz-orange-garbanzo-vr44gqppw953wvpx-3000.preview.app.github.dev/src/grafana/servicetopology/
// catch window is not defined referenceerrpr exception if ran through local ide terminal
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
if (domain_name == "localhost" || domain_name == "") {
    domain_name = "localhost:9090";
}
if (domain_name === "localhost") {
    domain_name = domain_name + ":9090";
}


// Set the query string for the trace metrics data
let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
queryTraceMetrics=`query?query=${queryTraceMetrics}`;
let apiUrl = `http://${domain_name}/api/v1/`;

// sum by(service_name%2Coperation%2Cspan_kind%2Cstatus_code) (rate(calls_total[1m0s])
// Run the query for the trace metrics data and process the results
console.log( "apiUrl+queryTraceMetrics = " , apiUrl+queryTraceMetrics);
d3.json(apiUrl+queryTraceMetrics)
    .then(function(result) {
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
    queryCluster=`query?query=${queryCluster}`;
    console.log("queryCluster=", queryCluster);
    // Run the query for the cluster data and process the results
        d3.json(apiUrl+queryCluster)
            .then(function(result) {
        // The data is now available in the "data" variable
        console.log("queryCluster result=", result);

        // Define the Graphviz code as a string variable
        var graphvizCode = "digraph {\n";

        // Set the default node shape and edge style
        graphvizCode += " rankdir=\"LR\"\n";
        graphvizCode += " node [shape=box]\n";

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



