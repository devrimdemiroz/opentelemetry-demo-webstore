import React, {PureComponent} from 'react';
import {PanelProps} from '@grafana/data';
import {FetchResponse, getBackendSrv} from '@grafana/runtime';
import './style.css';
import cytoscape from "cytoscape";
import layoutUtilities from 'cytoscape-layout-utilities';
import fcose from 'cytoscape-fcose';
import BubbleSets from 'cytoscape-bubblesets';
import cola from 'cytoscape-cola';
import automove from 'cytoscape-automove';

import {addHallignConstraint, colaOptions, layoutOptions, resetConstraints} from "./layout";
import {cyStyle} from "./style";


// @ts-ignore
import complexityManagement from "cytoscape-complexity-management";
import {Edge, Operation, Service} from "./Schema";

cytoscape.use( automove );
cytoscape.use(BubbleSets);
cytoscape.use(fcose);
cytoscape.use(layoutUtilities);
cytoscape.use(complexityManagement);
cytoscape.use(cola);


interface PanelState {
    cy?: cytoscape.Core | undefined;
    cyVisible?: cytoscape.Core | undefined;
    cyInvisible?: cytoscape.Core | undefined;
    instance?: complexityManagement | undefined;
}


export function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100
}


export class SimplePanel extends PureComponent<PanelProps, PanelState> {
    ref: any;
    cy: any | undefined;
    cyVisible: cytoscape.Core | undefined;
    cyInvisible: cytoscape.Core | undefined;
    instance: any | undefined;


    constructor(props: PanelProps) {
        super(props);
        this.ref = React.createRef();

    }

    render() {
        if (this.cy !== undefined) {
            this.updateGraph();
        }
        return (
            <div className="cy-canvas">
                <div className="cy-container">
                    <div id="cy"></div>
                </div>
                <div className="cy-container-header">
                    <h1>Visible Graph</h1>
                    <h1>Invisible Graph</h1>
                </div>
                <div className="cy-extension-container">
                    <div id="cyVisible"></div>
                    <div id="cyInvisible"></div>
                </div>
            </div>
        );
    }


    private initListeners() {
        this.cy.on('click', 'node', (event: any) => {
            const node = event.target;
            console.log("node.data()", node.data());
        });

        this.cy.on('click', 'edge', (event: any) => {
            const edge = event.target;
            console.log("edge.data()", edge.data());
        });

        this.cy.on('dblclick', 'node', (event: any) => {
            const node = event.target;
            console.log("node.data()", node.data(), node);
            this.setOperationEdges(node.data());
        });
    }

    setOperationEdges(operationStatusNode: any) {
        console.log("operationStatusNode", operationStatusNode);

        let service = operationStatusNode.service;
        let operation = operationStatusNode.operation;
        let statusCode = operationStatusNode.httpStatusCode;
        let error = operationStatusNode.spanStatus === "ERROR";
        const {from, to} = this.props.data.timeRange;

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
                // Extract the trace ID from the response
                const traceId = response.data.data[0].traceID;

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
                        return this.processTrace(response);
                    });
            });
    }

    private processTrace(response: FetchResponse<any>) {
        lastValueFrom(response).then((response) => {


            let trace = response.data.data[0];
            // Process the trace data
            console.log("trace", trace);
            const spans = trace.spans;
            // extract edges  from spans like loadgenerator_HTTP_POST_CLIENT_POST_ERROR_500 --> "frontend_HTTP_POST_SERVER_POST_ERROR_500
            const edges = spans.map(span => {
                // use parentid child reference spanid to create edges
                span.serviceName = trace.processes[span.processID].serviceName;

                // type Edge
                let edge: Edge;

                if (span.references.length > 0) {
                    const parentSpan = spans.find(s => s.spanID === span.references[0].spanID);
                    console.log("parentSpan", parentSpan);
                    edge = new Edge();
                    edge.source = nameSpanEdgeId(parentSpan);
                    edge.target = nameSpanEdgeId(span);
                    edge.id = `${edge.source}-${edge.target}`;
                    edge.type = "span";
                    this.addSpanEdge(edge);
                    return edge;
                }
            });
            console.log("span edges added = ", edges);
            return spans;
        });
    }

    componentDidMount() {

        this.cyVisible = cytoscape({
            container: document.getElementById('cyVisible'),
        } as any);

        this.cyInvisible = cytoscape({
            container: document.getElementById('cyInvisible'),
        } as any);

        this.cy = cytoscape({
            container: document.getElementById('cy'),

        });
        this.cy.style(cyStyle);
        this.cy.layoutUtilities({
            desiredAspectRatio: this.props.width / this.props.height,
        });
        this.instance = this.cy.complexityManagement();


        this.setState({
            cy: this.cy,
            cyVisible: this.cyVisible,
            cyInvisible: this.cyInvisible,
            instance: this.instance,
        });
        this.cy.ready(() => {
            this.initGraph();
        });

        console.log("instance", this.instance);
        this.initListeners();


    }


    private initGraph() {
        this.setServiceNodes();

        this.setServiceEdges();
        // resetConstraints();
        this.setOperationNodes();
        // this.correlateOperations();
        // this.calculateConstraints();
        //
        this.instance.collapseNodes(this.cy.nodes('[id="featureflagservice-compound"]'));
        this.instance.collapseNodes(this.cy.nodes('[id="frontend-proxy-compound"]'));

        // this.cy.fit();
        console.log("this.cy", this.cy);
        let layout = this.cy.layout({
            ...layoutOptions,
            stop: () => {
                //this.initializer(this.cy);
            }
        });

        layout.run();


    }

    private updateGraph() {
        console.log("updateGraph");

        this.calculateConstraints();
        this.cy.resize();
        layoutOptions.randomize = false;
        layoutOptions.quality = "default";
        let layout = this.cy.layout({...layoutOptions});
        layout.run();


    }

    private setServiceNodes() {
        const {data} = this.props;
        console.log("data", data);
        // get series with refId ServiceGraphEdges
        data.series.filter((services: any) => services.refId === "service_calls_total").forEach((serie: any) => {

            let service: Service;
            service = new Service(serie);
            this.addServiceCompound(service);
            this.addServiceNode(service);
            this.addConnectorNodes(service);


        });


        // TODO: listen to changes in the Services variable combobox and update the graph accordingly
    }


    private setServiceEdges() {
        const {data} = this.props;
        console.log("data", data);
        // get series with refId ServiceGraphEdges
        data.series.filter((series: any) => series.refId === "service_graph_request_total").forEach((serie: any) => {
            // if serie is undefined return
            if (serie === undefined) {
                return;
            }
            console.log("edges", serie);

            const edgesLength = serie.fields.length;
            for (let i = 1; i < edgesLength; i++) {
                // use Edge class to create an edge
                let edge: Edge;
                edge = Edge.create(serie.fields[i]);
                edge.id = 'service-' + edge.source + '-' + edge.target;
                edge.type = 'service';
                edge.failed_weight = 0;
                // if edge is undefined create it
                if (this.cy.getElementById(edge.id).length === 0) {
                    this.addServiceEdge(edge);

                } else {
                    // if edge exists update the weight and label
                    this.cy.getElementById(edge.id).data('weight', edge.weight);
                    this.cy.getElementById(edge.id).data('label', edge.getLabel());

                }

            }

            data.series.filter((series: any) => series.refId === "traces_service_graph_request_failed_total").forEach((serie: any) => {
                // if serie is undefined return
                if (serie === undefined) {
                    return;
                }
                console.log("edges", serie);

                const edgesLength = serie.fields.length;
                for (let i = 1; i < edgesLength; i++) {
                    // use Edge class to create an edge
                    let edge: Edge;
                    edge = Edge.create(serie.fields[i]);
                    edge.id = 'service-' + edge.source + '-' + edge.target;
                    edge.type = 'service';
                    edge.failed_weight = edge.weight;
                    edge.weight = 0;//this one is failed

                    // if edge is undefined create it
                    if (this.cy.getElementById(edge.id).length === 0) {
                        this.addServiceEdge(edge);

                    } else {
                        // if edge exists update the weight and label
                        this.cy.getElementById(edge.id).data('failed_weight', edge.failed_weight);
                        this.cy.getElementById(edge.id).data('label', edge.getLabel());
                        console.log("edge", edge);

                    }

                }
                // TODO: query is instant for the moment, needs to be average on selected time range
                // TODO: traces_service_graph_request_failed_total is not available yet


            });
        });
    }

    private addServiceEdge(edge: Edge) {
        this.cy.add({
            data: {
                id: edge.id,
                label: edge.label,
                edgeType: edge.type,
                source: edge.source,
                target: edge.target,
                weight: edge.weight,
                failed_weight: edge.failed_weight,
            }

        });

    }

    private addSpanEdge(edge: Edge) {
        this.cy.add({
            data: {
                id: edge.id,
                label: "",
                edgeType: edge.type,
                source: edge.source,
                target: edge.target,
                weight: 0,//will get set later by metrics
            }

        });
    }

    private setOperationNodes() {
        const {data} = this.props;
        // TODO: A hash map to store the operation nodes would be better, parenting(compound) can be then used
        // for now sticking with hierarchical approach
        data.series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total").forEach((serie: any) => {
            let operation: Operation;
            operation = new Operation(serie);

            // TODO: hash node id in case length is too long or similar restrictions in cytoscape

            // if serie node does not exist create it
            if (this.cy.getElementById(operation.id).length === 0) {
                this.addOperationCompound(operation);
                this.addOperationNode(operation);
                this.addOperationStatusNode(operation);
            } else {
                // if serie node exists but if the status node does not exist create it
                if (this.cy.getElementById(operation.statusId).length === 0) {
                    this.addOperationStatusNode(operation);
                } else {
                    // if serie node exists and status node exists update the weight
                    this.cy.getElementById(operation.statusId).data('weight', operation.weight);
                }
            }
            // once finished , itreate status nodes and sum up the weight into serie node
            const operationStatusNodes = this.cy.nodes().filter("node[nodeType = 'operationStatus'][parent = '" + operation.id + "-compound" + "']");
            let operationWeight = 0;
            operationStatusNodes.forEach((operationStatusNode: any) => {
                operationWeight += operationStatusNode.data('weight');
            });
            this.cy.getElementById(operation.id).data('weight', operationWeight);

        });



    }


    private addServiceNode(service: Service) {
        this.cy.add({
            data: {
                id: service.id,
                label: service.weight.toString(),
                nodeType: "service",
                parent: service.id + "-compound",
                weight: service.weight
            }
        });
    }
    private addConnectorNodes(service: Service) {
        this.addConnectorNode(service, "in");
        this.addConnectorNode(service, "out");
        this.addConnectorNode(service, "internal");

    }

    private addConnectorNode(service: Service, direction: string) {

        // find the related serie in this.props.data.series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind") if exists and get value as weight
        // if not exists set weight to 0 {service_name="frontend", span_kind="SPAN_KIND_INTERNAL"}
        let span_kind;
        if (direction === "in") {
            span_kind = "SPAN_KIND_SERVER";
        } else if (direction === "out") {
            span_kind = "SPAN_KIND_CLIENT";
        } else {
            span_kind = "SPAN_KIND_INTERNAL";
        }// skips SPAN_KIND_INTERNAL
        let weight = 0;
        this.props.data.series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind")
            .filter((serie: any) => serie.fields[1].labels.service_name ===  service.name && serie.fields[1].labels.span_kind === span_kind)
            .forEach((serie: any) => {
            console.log("service_name=",service.name,",span_kind=",span_kind, ",serie=", serie);
            if (serie.length === 1) {
                console.log(serie.fields[1].values);
                weight = round2(serie.fields[1].values.buffer[0]);
                console.log("service_name=",service.name,",-",direction,  ",weight=", weight);
                return;
            } else {
                console.log("spanmetrics_calls_total_span_kind query returned more than one result",serie);
            }

        });
        if (weight === 0) {
        //return;// no need to create
        }





        this.cy.add({
            data: {
                id: service.id + "-" + direction,
                label: direction,
                nodeType: "connector-" + direction,
                parent: service.id + "-compound",
                weight: weight
            }
        });
        if (span_kind === "SPAN_KIND_INTERNAL") {
           // return;// no need to create edge
        }
        this.cy.add({
            data: {
                id: service.id+"-"+direction+"-edge",
                label: "",
                edgeType: "connector-"+direction,
                source: service.id,
                target: service.id+"-"+direction,


            }
        }) ;
    }

    private addServiceCompound(service: Service) {
        this.cy.add({
            data: {
                id: service.id + "-compound",
                label: service.name,
                nodeType: "serviceCompound",
                weight: service.weight
            }
        });

    }

    private addOperationStatusNode(operation: Operation) {
        this.cy.add({
            data: {
                id: operation.statusId,
                label: operation.status, // ERROR_500 or UNSET or similar
                nodeType: "operationStatus",
                spanStatus: operation.spanStatus,
                httpStatusCode: operation.httpStatusCode,
                weight: operation.weight,
                parent: operation.id + "-compound",
                service: operation.service,
            }
        });
        let target;
        let source;
        if (operation.spanKind === "SERVER") {
            source = operation.id;
            target = operation.statusId;
        } else if (operation.spanKind === "CLIENT") {
            source = operation.statusId;
            target = operation.id;
        } else {
            source = operation.id;
            target = operation.statusId;
        }
        this.cy.add({
            data: {
                id: "edge-" + operation.statusId,
                label: "",
                edgeType: "span",
                spanStatus: operation.spanStatus,
                source: source,
                target: target,
                weight: 0,//will get set later by metrics
            }

        });
    }

    private addOperationCompound(operation: Operation) {
        this.cy.add({
            data: {
                id: operation.id + "-compound",
                label: operation.name,
                nodeType: "operation-compound",
                service: operation.service,
                parent: operation.service +"-compound",
                spanKind: operation.spanKind,
            }
        });
    }

    private addOperationNode(operation: Operation) {
        this.cy.add({
            data: {
                id: operation.id,
                label: operation.name,
                name: operation.name,
                nodeType: "operation",
                spanKind: operation.spanKind,
                httpMethod: operation.httpMethod,
                service: operation.service,
                parent: operation.id + "-compound",
                weight: 0,
            }
        });
        let source;
        let target;
        if (operation.spanKind === "CLIENT") {
            source = operation.id;
            target = operation.service+"-out";
        } else if (operation.spanKind === "SERVER") {
            source = operation.service+"-in";
            target = operation.id;
        } else {
            // still create edge , but do not connect to in/out
            source = operation.service+"-internal";
            target = operation.id;
        }
        this.cy.add({
            data: {
                id: "edge-" + operation.id,
                label: "",
                edgeType: "operation",
                source: source,
                target: target,
                weight: 0,//will get set later by metrics
            }

        });
    }

    initializer(cy: any) {
        if (this.cyVisible === undefined || this.cyInvisible === undefined) {
            console.log("cy stuff is undefined");
            return;
        }
        this.cyVisible.remove(this.cyVisible.elements());

        this.cyInvisible.remove(this.cyInvisible.elements());
        // iterate over this.instance.getCompMgrInstance().visibleGraphManager.nodesMap.values()
        for (const nodeItem of this.instance.getCompMgrInstance().visibleGraphManager.nodesMap.values()) {
            this.cyVisible.add({
                data: {
                    id: nodeItem.ID,
                    parent: this.instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID
                }, position: cy.getElementById(nodeItem.ID).position()
            });
        }
        // iterate over this.instance.getCompMgrInstance().visibleGraphManager.edgesMap.values()
        for (const edgeItem of this.instance.getCompMgrInstance().visibleGraphManager.edgesMap.values()) {
            this.cyVisible.add({data: {id: edgeItem.ID, source: edgeItem.source.ID, target: edgeItem.target.ID}});
        }
        // iterate over this.instance.getCompMgrInstance().invisibleGraphManager.nodesMap.values()
        for (const nodeItem of this.instance.getCompMgrInstance().invisibleGraphManager.nodesMap.values()) {
            this.cyInvisible.add({
                data: {
                    id: nodeItem.ID,
                    label: nodeItem.ID + (nodeItem.isFiltered ? "(f)" : "") + (nodeItem.isHidden ? "(h)" : "") + (nodeItem.isCollapsed ? "(c)" : "") + (nodeItem.isVisible ? "" : "(i)"),
                    parent: this.instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID
                }, position: cy.getElementById(nodeItem.ID).position()
            });
        }
        // iterate over this.instance.getCompMgrInstance().invisibleGraphManager.edgesMap.values()
        for (const edgeItem of this.instance.getCompMgrInstance().invisibleGraphManager.edgesMap.values()) {
            this.cyInvisible.add({
                data: {
                    id: edgeItem.ID,
                    label: edgeItem.ID + (edgeItem.isFiltered ? "(f)" : "") + (edgeItem.isHidden ? "(h)" : "") + (edgeItem.isVisible ? "" : "(i)"),
                    source: edgeItem.source.ID,
                    target: edgeItem.target.ID
                }
            });
        }


    }

    private calculateConstraints() {
        resetConstraints();
        this.vAllignOperations();
        //this.hAllignOperations();

    }

    //
    // private relativeAllignSpanKinds() {
    //     // relative allignment for spanKind group compounds: SERVER left and CLIENT right
    //     // find services containing both spanKind SERVER and CLIENT
    //     const services = this.cy.nodes().filter("node[nodeType = 'service']");
    //     services.forEach((service: any) => {
    //         const spanKindGroups = service.children();
    //         const serverGroup = spanKindGroups.filter("node[label = 'SERVER']");
    //         const clientGroup = spanKindGroups.filter("node[label = 'CLIENT']");
    //         if (serverGroup.length === 1 && clientGroup.length === 1) {
    //             addRelativeConstraint(serverGroup.data('id'), clientGroup.data('id'));
    //             let vallign = [];
    //             vallign.push(serverGroup.data('id'));
    //             vallign.push(clientGroup.data('id'));
    //             addVallignConstraint(vallign);
    //         }
    //     });
    // }

    private vAllignOperations() {
        //


    }

    private hAllignOperations() {
        // horizintally allign operations that have same service and spanKind
        // get all operation nodes
        const operations = this.cy.nodes().filter("node[nodeType = 'operation']");
        // iterate over the operations
        operations.forEach((operation: any) => {
            // find the matching operation in other services
            const matchingOperations = operations.filter("node[parent = '" + operation.data('parent') + "'][spanKind = '" + operation.data('spanKind') + "'][id != '" + operation.data('id') + "']");
            // if there are matching operations
            if (matchingOperations.length > 0) {
                // iterate over the matching operations
                let hallign = [];

                matchingOperations.forEach((matchingOperation: any) => {
                    hallign.push(matchingOperation.data('id'));
                });
                addHallignConstraint(hallign);
            }
        });
    }
}


function nameSpanEdgeId(span: span) {
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
    console.log("operationId", operationId);
    return operationId;
}

