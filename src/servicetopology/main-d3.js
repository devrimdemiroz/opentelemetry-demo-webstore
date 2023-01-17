let domain_name;


// Set the query string for the trace metrics data
let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
queryTraceMetrics = `query?query=${queryTraceMetrics}`;
let apiUrl = `http://localhost:8181/prometheus/api/v1/`;

// Run the query for the trace metrics data and process the results
console.log("apiUrl+queryTraceMetrics = ", apiUrl + queryTraceMetrics);
let serviceOperationMap;

d3.json(apiUrl + queryTraceMetrics)
    .then(function(data) {
        // just log the data
        console.log("queryTraceMetrics data=", data);

        // process the data
//        serviceOperationMap = createServiceOperationMap(data);

        // Set the query string for the cluster data
//        queryCluster();
    })
    .catch(error => {
        console.log("Error: " + error);
    });



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

function addServiceAndOperataions(graph, service, serviceOperationMap) {
    // create cluster as subgraph
    // if target or source already exists, do not create a new subgraph
    if (!graph.hasNode(service)) {
        // add subgraph to graph object subgraph cluster_" + source
        let cluster_service = "cluster_" + service;
        graph.setNode(cluster_service, {label: service});
        serviceOperationMap.get(service).forEach(function (d) {
            let cluster_service_spankind = cluster_service + "_" + d.metric.span_kind;

            // set  each span kind cluster different and very light color from a well known color palette
            let collor = getColorSpanKind(d.metric.span_kind);
            graph.setNode(cluster_service_spankind, {
                label: d.metric.span_kind,
                cluster: cluster_service,
                color: color,
                style: "filled",
                fontcolor: "black"
            });
            graph.setParent(cluster_service_spankind, cluster_service);

            // set operation nodes equal fixed size, labels shorter add tool tip
            let operationID = d.metric.operation_id;
            let operation = d.metric.operation;
            let operationLabel = operation;
            // append new line after  / or . or space
            operationLabel = operationLabel.replace(/(\/|\.| )/g, "$&\n");


// fit height to the number of lines and width to the length of the longest line
            graph.setNode(operationID, {
                label: operationLabel,
                cluster: cluster_service_spankind, tooltip: operation,
                width: 1, height: 1, fixedsize: true, shape: "box", color: "white", style: "filled", fontcolor: "black"
            });
            // possible shapes: "box", "ellipse", "oval", "circle", "triangle", "diamond", "trapezium", "parallelogram", "house", "pentagon", "hexagon", "septagon", "octagon", "doublecircle", "doubleoctagon", "tripleoctagon", "invtriangle", "invtrapezium", "invhouse", "Mdiamond", "Msquare", "Mcircle", "rect", "rectangle", "square", "star", "none", "underline", "cylinder", "note", "tab", "folder", "box3d", "component", "promoter", "cds", "terminator", "utr", "primersite", "restrictionsite", "fivepoverhang", "threepoverhang", "noverhang", "assembly", "signature", "insulator", "ribosite", "rnastab", "proteasesite", "proteinstab", "rpromoter", "rarrow", "larrow", "lpromoter"
            graph.setParent(d.metric.operation_id, cluster_service_spankind);

        });


    }
}

function createConnections(result, graph) {
    // Add the edges (connections) between the clusters, along with their corresponding weights
    result.data.result.forEach(function (d) {
        var source = d.metric.client;
        var target = d.metric.server;
        var weight = d.value[1];
        weight = Number(weight).toFixed(2);
        addServiceAndOperataions(graph, source, serviceOperationMap);
        addServiceAndOperataions(graph, target, serviceOperationMap);

        // set service level edges longer enoough so label is readable
        let len = 20;
        if (source === target) {
            len = 30;
        }

        graph.setEdge("cluster_" + source, "cluster_" + target, {label: weight, len: len});

        // find if there are matching operations under different cluster between spankind client and server. then print them.
        // if there are matching operations, then add edges between them
        serviceOperationMap.get(source).forEach(function (d1) {
            serviceOperationMap.get(target).forEach(function (d2) {
                // not exact match, but contains
                if (d1.metric.operation.includes(d2.metric.operation) || d2.metric.operation.includes(d1.metric.operation)) {
                    console.log("matching operation=", d1.metric.operation);
                    graph.setEdge(d1.metric.operation_id, d2.metric.operation_id, {label: weight });
                }
            });

        });


    });
}

function writeFile(graph) {
    var fs = require('fs');
    fs.writeFile("graphvizCode.dot", dotlib.write(graph), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function showGraph(graph) {
    /*
    <head>
        <title>Prometheus Query Example</title>
        <script src="https://d3js.org/d3.v7.js"></script>
        <script src="https://unpkg.com/@hpcc-js/wasm@0.3.11/dist/index.min.js"></script>
        <script src="https://unpkg.com/d3-graphviz@3.0.5/build/d3-graphviz.js"></script>


    </head>
    <body>

    <div id="dataviz" style="width: 2100px; height: 2100px;" >
        <h1>Hello, dataviz world!</h1>
    </div>

    <script src="main.js">
     */


    //  TODO: show graph in browser index.html

}

function queryCluster() {
    let queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";
    queryCluster = `query?query=${queryCluster}`;
    // Run the query for the cluster data and process the results
    fetch(apiUrl + queryCluster)
        .then(response => response.json())
        .then(function (result) {
            // The data is now available in the "data" variable
            console.log("queryCluster result=", result);


            // Create a new graph
            let graph = new dotlib.graphlib.Graph({compound: true, directed: true, multigraph: true});
            //compound=true allows subgraphs
            graph.setGraph({compound: true});
            graph.setGraph({layout: 'fdp'});





            createConnections(result, graph);

            // Print the Graphviz output
            console.log(dotlib.write(graph));
            // save to a file
            writeFile(graph);
            // show graph in the browser d3 svg
            showGraph(graph);


        })
        .catch(error => {
            console.log("Error: " + error);
        });
}


