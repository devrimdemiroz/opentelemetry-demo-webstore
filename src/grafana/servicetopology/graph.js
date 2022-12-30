

// Function to render the graph
function renderGraph(graph) {

// Set up the links
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.sqrt(d.value);
        });

// Set up the nodes
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
            return d3.schemeCategory10[d.id % 10];
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

// Set up the node labels
    var label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .text(function (d) {
            return d.name;
        });

// Set the initial positions of the nodes and links
    var nodes = graph.nodes.map(function (d, i) {
        return {
            id: d.id,
            index: i,
            name: d.name,
            x: Math.random() * width,
            y: Math.random() * height
        };
    });

    var links = graph.links.map(function (d) {
        return {
            source: nodes.find(function (n) {
                return n.id === d.source;
            }),
            target: nodes.find(function (n) {
                return n.id === d.target;
            }),
            value: d.value
        };
    });

// Set up the tick function to update the positions of the nodes and links
    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });

        label
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y - 10;
            });

    }

// Set the simulation's nodes and links
    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

}

// Set up the drag behavior
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

// Set the URL for the Prometheus API endpoint
var apiUrl = "http://localhost:9090/api/v1/query";
// Set the query string for the data we want to retrieve
var queryCluster = "sum by(client, server) (rate(traces_service_graph_request_total[1m0s]))";
var queryTraceMetrics = "sum by(service_name,operation) (rate(calls_total[1m0s]))";
d3.json(apiUrl + "?query=" + queryTraceMetrics, function(error, data) {
    // Check for errors


    // Select the element you want to append the results to
    var queryResultsDiv = d3.select("#queryresults");

    // Append the results to the element as a list
    queryResultsDiv.append("ul")
        .selectAll("li")
        .data(data.data.result)
        .enter()
        .append("li")
        .text(function(d) {
            return d.metric.service_name + " - " + d.metric.operation + ": " + d.value[1];
        });
});


// Set the dimensions of the SVG element
let width = 2000,
let height = 2000;

// Set up the graph layout
var svg = d3.select("#dataviz")
    .attr("width", width)
    .attr("height", height);


// Send a GET request to the API endpoint and retrieve the data
d3.json(apiUrl + "?query=" + queryCluster, function(error, data) {
    if (error) throw error;
// The data is now available in the "data" variable
    console.log("query result=" , data);
// Parse the data into a format that can be used by D3.js
    var graph = {
        nodes: [],
        links: []
    };
    data.data.result.forEach(function(d, i) {
// Create a node for each unique client and server
        graph.nodes.push({ id: d.metric.client,
            name: d.metric.client});
        graph.nodes.push({ id: d.metric.server, name: d.metric.client });
// Create a link between the client and server
        graph.links.push({
            id: d.metric.client+"_"+d.metric.server,
            source: d.metric.client,
            target: d.metric.server,
            value: d.value[1]
        });
    });
// Remove duplicates from the nodes array
    graph.nodes = d3.map(graph.nodes, function(d) {
        return d.id;
    }).keys();
    console.log("graph=" , graph);

// Pass the parsed data to the renderGraph function in graph.js
    renderGraph(graph);
});
