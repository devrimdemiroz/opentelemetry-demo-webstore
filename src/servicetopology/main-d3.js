
// Set the query string for the trace metrics data
let queryTraceMetrics = "sum by(service_name,operation,span_kind,status_code) (rate(calls_total[1m0s]))";
queryTraceMetrics = `query?query=${queryTraceMetrics}`;
let apiUrl = `http://localhost:8181/api/v1/`;

// Run the query for the trace metrics data and process the results
console.log("apiUrl+queryTraceMetrics = ", apiUrl + queryTraceMetrics);
let serviceOperationMap;
var width = window.innerWidth;
var height = window.innerHeight;

// select the svg element on index.html
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

let nodes;
let services;
let serviceLinks;

d3.json(apiUrl + queryTraceMetrics)
    .then(function(data) {
        // just log the data
        console.log("queryTraceMetrics data=", data);
        // create a map of service names to operations

        // process the data
        serviceOperationMap = createServiceOperationMap(data);

        // Set the query string for the cluster data
        queryServiceGraph();
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

function createConnections(result) {
    // Add the edges (connections) between the clusters, along with their corresponding weights
    result.data.result.forEach(function (d) {
        var source = d.metric.client;
        var target = d.metric.server;
        var weight = d.value[1];
        weight = Number(weight).toFixed(2);
        addServiceAndOperataions( source, serviceOperationMap);
        addServiceAndOperataions( target, serviceOperationMap);


        //graph.setEdge("cluster_" + source, "cluster_" + target, {label: weight, len: len});

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




function getDistinctServices(services, result) {
    services = new Set();
    result.data.result.forEach(function (d) {
        services.add(d.metric.client);
        services.add(d.metric.server);
    });
    return services;
}

function graphServices() {
    let simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().strength(0.5).radius(50))
        .force("link", d3.forceLink(serviceLinks).id(d => d.id));

// Create a marker element and add it to the defs element
    let marker = svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");


    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(serviceLinks)
        .join("line")
        .style("marker-end", "url(#arrow)");

    console.log("link " ,link," marker " ,marker)

    let node = svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => -25)
        .attr("y", d => -15)
        .attr("width", 50)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "#fff");
    // add service name above the rect with red color
    let text = svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - 15)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .text(d => d.id)
        .style("fill", "red");

    console.log(text, "text");




    console.log("nodes=", nodes);
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .attr("marker-end", "url(#arrow)")
            .style("stroke-width", 1)
            .style("stroke", "black")
            .style("fill", "none");
        node
            .attr("x", d => d.x - 25)
            .attr("y", d => d.y - 15);

        text
            .attr("x", d => d.x)
            .attr("y", d => d.y - 15);
    });

}

function graphServices_Tree() {
    let width = 960, height = 500;
    let svg_tree = d3.select("#svg_tree")
        .attr("width", width)
        .attr("height", height);

    let g = svg_tree.append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // Convert input data into hierarchical tree structure
    let root = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.parent)(serviceLinks);

    let tree = d3.tree()
        .size([2 * Math.PI, height/2 - 50])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    let nodes = tree(root).descendants();
    let links = tree(root).links();

    let link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .selectAll("path")
        .data(links)
        .join("path")
        .style("marker-end", "url(#arrow)")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));

    let node = g.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => -10)
        .attr("y", d => -5)
        .attr("width", 20)
        .attr("height", 10)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "#fff")
        .attr("transform", d => `translate(${d.y * Math.sin(d.x)}, ${-d.y * Math.cos(d.x)})`);

    let text = g.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.y * Math.sin(d.x))
        .attr("y", d => -d.y * Math.cos(d.x))
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .text(d => d.id)
        .style("fill", "red")
        .attr("transform", d => `translate(${d.y * Math.sin(d.x)}, ${-d.y * Math.cos(d.x)})rotate(${d.x * 180 / Math.PI - 90})`);
}


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
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

            services = getDistinctServices(services, result);
            nodes = Array.from(services).map(function (service) {
                return {id: service, label: service};
            });

            // extract links

            serviceLinks = result.data.result.map(function (d) {
                let source = d.metric.client;
                let target = d.metric.server;
                return {source: source, target: target};
            });

            console.log("nodes=", nodes , "links=", serviceLinks);


            graphServices();
            graphServices_Tree();


        })
        .catch(error => {
            console.log("Error: " + error);
        });
}


