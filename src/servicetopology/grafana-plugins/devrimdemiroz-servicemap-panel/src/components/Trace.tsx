import {FetchResponse, getBackendSrv} from "@grafana/runtime";
import {Edge} from "./Schema";

export function getTraceOnNode(operationSpanStatusNode: any, props: any) {
    let service = operationSpanStatusNode.service;
    let operation = operationSpanStatusNode.spanName;
    let statusCode = operationSpanStatusNode.httpStatusCode;
    let error = operationSpanStatusNode.spanStatus === "ERROR";
    const {from, to} = props.data.timeRange;

    const start = from.valueOf() * 1000;
    const end = to.valueOf() * 1000;
    // Construct the Jaeger query URL
    const jaegerUrl = `api/datasources/proxy/2/api/traces?service=${service}&operation=${operation}&tags={"http.status_code":"${statusCode}","error":"${error}"}&limit=1&start=${start}&end=${end}&lookback=custom`;
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
                    return processTrace(response);
                });
        });
}

export function processTrace(response: FetchResponse<any>) {
    console.log("processTrace", response);
    let trace = response.data.data[0];
    // Process the trace data
    console.log("trace", trace);
    const spans = trace.spans;

    // reverse iteration to find parent span
    for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i];
        // use parentid child reference spanid to create edges
        console.log(trace.processes[span.processID].serviceName);
        span.serviceName = trace.processes[span.processID].serviceName;
        // type Edge
        let edge: Edge;
        if (span.references.length > 0) {
            const parentSpan = spans.find(s => s.spanID === span.references[0].spanID);
            parentSpan.serviceName = trace.processes[parentSpan.processID].serviceName;
            console.log("parentSpan", parentSpan);
            edge = new Edge();
            edge.source = nameSpanEdgeId(parentSpan);
            edge.target = nameSpanEdgeId(span);
            edge.id = `${edge.source}-${edge.target}`;
            edge.type = "span";
            console.log(edge.source, "-->", edge.target);
            // find the path from source to target by visiting parent nodes
            // highlight the path nodes and edges
            console.log("edge=", edge);
            // get  operation node for the statusspan node
            let span_Name = span.operationName.replace(/(\/|\s|\.)/g, "_");
            console.log("span_Name=", span_Name);
            //         let operationId = "";
            //         this.cy.nodes().filter((node: any) => {
            //             return node.data().nodeType === "operation"
            //                 && node.data().name === span_Name
            //                 && node.data().service === span.serviceName;
            //         }).forEach((operationNode: any) => {
            //             operationId = operationNode.id();
            //             console.log("--> operationNode=", operationNode.data());
            //         });
            //         let dijkstra = this.cy.elements().dijkstra({
            //             root: `#${operationId}`,
            //             weight: function (edge) {
            //                 return 1;
            //             }
            //         });
            //         let path = dijkstra.pathTo(`#${edge.target}`);
            //         console.log("...... path=", path.data());
            //         // shift first node  to end inside path, initiator would be operation not statusspan
            //         path.nodes().shift();
            //         path.nodes().push(path.nodes().shift());
            //         console.log("shifted path=", path.data());
            //
            //
            //         // draw path by adding edges over existing edges as sidelanes
            //         let pathCount = 0;
            //         path.nodes().forEach((node: any) => {
            //             pathCount++;
            //             if (node.isNode()) {
            //                 console.log(pathCount + " countdown, node=", node.data());
            //                 // if the element is create edge to next node
            //                 if (pathCount === path.length) {
            //                     return;
            //                 }
            //                 let targetId = path.nodes()[pathCount + 1].id();
            //                 console.log("target=", targetId)
            //                 if (targetId === undefined) {
            //                     console.log("target is undefined")
            //                     return;
            //                 }
            //                 try {
            //                     this.cy.add({
            //                         group: "edges",
            //                         data: {
            //                             id: `${node.data().id}-span-${targetId}`,
            //                             source: node.data().id,
            //                             label: node.data().id,
            //                             target: targetId,
            //                             type: "tracePath"
            //
            //                         }
            //                     }).addClass("tracePath");
            //                 } catch (e) {
            //                     console.log("error", e);
            //                 }
            //
            //             }
            //         });
            //
            //
            //         //this.addSpanEdge(edge);
            //         console.log("Added edge=", edge);
            //     } else {
            //         console.log("Root? No parent span found for span=", span);
            //     }
            // }

            // return a text output of the trace

            return trace;
        }
    }
}

function nameSpanEdgeId(span: any) {
    // find service name with process id reference processes in trace

    let spanKind = (span.tags.find(t => t.key === 'span.kind').value).toUpperCase();
    let operationId = `${span.serviceName}_${span.operationName.replace(/(\/|\s|\.)/g, "_")}_${spanKind}`;
    if (span.tags.find(t => t.key === 'http.method')) {
        operationId = `${operationId}_${span.tags.find(t => t.key === 'http.method').value}`;
    }
    let error = span.tags.find(t => t.key === 'otel.status_code');
    operationId = error ? `${operationId}_${error.value}` : operationId;
    if (span.tags.find(t => t.key === 'http.status_code')) {
        operationId = `${operationId}_${span.tags.find(t => t.key === 'http.status_code').value}`;
    }
    span.operationId = operationId;
    return operationId;
}
