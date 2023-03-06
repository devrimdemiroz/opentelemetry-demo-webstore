import {FetchResponse, getBackendSrv} from "@grafana/runtime";
import {Edge} from "./Schema";
import {colaOptions} from "./layout";

export function getTraceOnNode(operationSpanStatusNode: any, panel: any) {
    let service = operationSpanStatusNode.service;
    let operation = operationSpanStatusNode.spanName;
    let statusCode = operationSpanStatusNode.httpStatusCode;
    //let error = operationSpanStatusNode.spanStatus === "ERROR"; // TODO spans do not have status when there is no error, take a second look
    const {from, to} = panel.props.data.timeRange;

    const start = from.valueOf() * 1000;
    const end = to.valueOf() * 1000;
    // Construct the Jaeger query URL
    //const jaegerUrl = `api/datasources/proxy/2/api/traces?service=${service}&operation=${operation}&tags={"http.status_code":"${statusCode}","error":"${error}"}&limit=1&start=${start}&end=${end}&lookback=custom`;
    const jaegerUrl = `api/datasources/proxy/2/api/traces?service=${service}&operation=${operation}&tags={"http.status_code":"${statusCode}"}&limit=1&start=${start}&end=${end}&lookback=custom`;
    console.log("jaegerUrl", jaegerUrl);
    // Make the Jaeger query request to the data source
    return getBackendSrv()
        .datasourceRequest({
            url: jaegerUrl,
            method: 'GET',
            requestId: 'my-request-id',
        })
        .then((response) => {
            console.log("response", response);
            // Extract the trace ID from the response
            const traceId = response.data.data[0].traceID;
            console.log("traceId", traceId);
            // Construct the Jaeger trace URL
            const traceUrl = `api/datasources/proxy/2/api/traces/${traceId}`;

            // Make the Jaeger trace request to the data source
            return getBackendSrv()
                .datasourceRequest({
                    url: traceUrl,
                    method: 'GET',
                    requestId: 'my-request-id',
                })
                .then((response) => {
                    return Trace.processTrace(response, panel.cy);

                });
        });
}

export class Trace {
    rawData: string;
    traceID: any;
    spans;
    processes;
    warnings: any;
    cy: any;
    edges: any | [Edge] = [];

    constructor(traceJson: any, cy: any) {
        this.rawData = traceJson;
        this.traceID = traceJson.traceID;
        this.spans = traceJson.spans;
        this.processes = traceJson.processes;
        this.warnings = traceJson.warnings;
        this.cy = cy;

        this.parse();
    }

    toString() {
        let traceCard = "<b>" + "Total #spans" + ": " + this.spans.length + "</b><br/>";
        traceCard += "<b>" + "Total #edges" + ": " + this.edges.length + "</b><br/>";
        return traceCard;
    }

    // @ts-ignore
    parse() {

        const spans = this.spans;

        // reverse iteration to find parent span
        for (let i = spans.length - 1; i >= 0; i--) {
            const span = spans[i];
            // use parentid child reference spanid to create edges
            span.serviceName = this.processes[span.processID].serviceName;
            // type Edge
            let edge: Edge;
            if (span.references.length > 0) {
                const parentSpan = spans.find(s => s.spanID === span.references[0].spanID);
                parentSpan.serviceName = this.processes[parentSpan.processID].serviceName;
                edge = new Edge();
                edge.source = nameSpanEdgeId(parentSpan);
                edge.source_operationId = this.findOperationId(parentSpan);
                edge.target = nameSpanEdgeId(span);
                edge.target_operationId = this.findOperationId(span);
                edge.id = `${edge.source}-${edge.target}`;
                edge.type = "span";
                edge.label = span.duration;
                console.log(edge.source, "-->", edge.target);
                this.edges.push(edge);

            } else {
                console.log("Root? No parent span found for span=", span);
            }

        }


    }

    private findOperationId(span) {
        let operationId = "";
        this.cy.nodes().filter((node: any) => {
            return node.data().nodeType === "operation"
                && node.data().name === span.operationName.replace(/(\/|\s|\.)/g, "_")
                && node.data().service === span.serviceName;
        }).forEach((operationNode: any) => {
            operationId = operationNode.id();
            console.log("--> operationNode=", operationNode.data());
        });
        return operationId;
    }

    static processTrace(response: FetchResponse<any>, cy: any) {

        let trace = new Trace(response.data.data[0], cy);
        // Process the trace data
        console.log("trace", trace);
        return trace;
    }

    appendTraditional() {
        console.log("Appending edges", this.edges);
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].join(this.cy).addClass('traditionalPath');
        }
        this.cy.layout({...colaOptions}).run();

    }

    appendUcm() {
        // get first edge
        let edge = this.edges[0];
        // get source operation node by source edge id
        this.cy.getElementById(edge.source_operationId).addClass("ucmNode");
        this.cy.getElementById(edge.target_operationId).addClass("ucmNode");


        // remove edge between source and source operation node
        this.cy.getElementById(edge.source).connectedEdges().remove();
        // add edge between start and end node
        this.cy.add({
            group: "edges",
            data: {
                id: `${edge.source_operationId}-span-${edge.target_operationId}`,
                source: edge.source_operationId,
                label: "1",
                target: edge.target_operationId,
                type: "ucmPath"

            }
        }).addClass("ucmPath");
        this.cy.getElementById(edge.target).connectedEdges().remove();
        this.cy.add({
            group: "edges",
            data: {
                id: `${edge.target_operationId}-span-${edge.target}`,
                source: edge.target_operationId,
                label: "2",
                target: edge.target,
                type: "ucmPath"

            }
        }).addClass("ucmPath");
        this.cy.add({
            group: "edges",
            data: {
                id: `${edge.target}-span-${edge.source}`,
                source: edge.target,
                label: "3",
                target: edge.source,
                type: "ucmPath"

            }
        }).addClass("ucmPath");
    }

    appendUcmFull() {
// get first edge
        let edge = this.edges[0];
        // get source operation node by source edge id
        this.cy.getElementById(edge.source_operationId).addClass("ucmNode");
        this.cy.getElementById(edge.target_operationId).addClass("ucmNode");
        this.cy.getElementById(edge.source).connectedEdges().remove();

        // find the path from source to target by visiting parent nodes
        let dijkstra = this.cy.elements().dijkstra({
            root: `#${edge.source_operationId}`,
            weight: function (edge) {
                return 1;
            }
        });
        let path = dijkstra.pathTo(`#${edge.target}`);
        // walk the path and add the edges, add ucmNode class to visited nodes
        console.log("path", path);
        let prevNode = null;
        path.forEach((ele: any) => {
            if (ele.isEdge()) {
                //   ele.addClass("ucmPath");
                return;
            }
            let node = ele;
            if (prevNode) {
                console.log("prevNode", prevNode.id(), "node", node.id());
                this.cy.add({
                    data: {
                        id: `${prevNode.id()}-span-${node.id()}`,
                        source: prevNode.id(),
                        target: node.id(),
                        type: "ucmPath"

                    }
                }).addClass("ucmPath");

            } else {
                // first node
                node.addClass("ucmFirstNode");
            }
            node.addClass("ucmNode");
            prevNode = node;
        });

        this.cy.add({
            group: "edges",
            data: {
                id: `${edge.target}-span-${edge.source}`,
                source: edge.target,
                label: "3",
                target: edge.source,
                type: "ucmPath"

            }
        }).addClass("ucmPath").addClass("ucmLastEdge");


    }
} // end of Trace class


// @ts-ignore


export function nameSpanEdgeId(span: any) {
    // find service name with process id reference processes in trace

    let spanKind = (span.tags.find(t => t.key === 'span.kind').value).toUpperCase();
    let operationId = `${span.serviceName}_${span.operationName.replace(/(\/|\s|\.)/g, "_")}_${spanKind}`;
    if (span.tags.find(t => t.key === 'http.method')) {
        operationId = `${operationId}_${span.tags.find(t => t.key === 'http.method').value}`;
    }
    let error = span.tags.find(t => t.key === 'otel.status_code');
    operationId = error ? `${operationId}_${error.value}` : `${operationId}_UNSET`;
    if (span.tags.find(t => t.key === 'http.status_code')) {
        operationId = `${operationId}_${span.tags.find(t => t.key === 'http.status_code').value}`;
    }
    span.operationId = operationId;
    return operationId;
}
