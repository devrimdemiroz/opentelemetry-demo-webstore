import React, {PureComponent} from 'react';
import {PanelProps} from '@grafana/data';
import './style.css';
import cytoscape from "cytoscape";
import layoutUtilities from 'cytoscape-layout-utilities';
import fcose from 'cytoscape-fcose';
import BubbleSets from 'cytoscape-bubblesets';
import cola from 'cytoscape-cola';
import 'tippy.js/dist/tippy.css';
import popper from 'cytoscape-popper';

import {colaOptions, layoutOptions, resetConstraints} from "./layout";
import {cyStyle} from "./style";


// @ts-ignore
import complexityManagement from "cytoscape-complexity-management";
import {Edge, Operation, Service} from "./Schema";
import {Tippies} from "./Tippies";
import {getTraceOnNode} from "./Trace";
import cxtmenu from 'cytoscape-cxtmenu';
import cxtmenu_defaults from "./cxtmenu";
import automove from 'cytoscape-automove';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';

cytoscape.use(klay);
cytoscape.use(dagre);
cytoscape.use(automove);

cytoscape.use(cxtmenu);

cytoscape.use(popper);
cytoscape.use(fcose);
cytoscape.use(layoutUtilities);
cytoscape.use(complexityManagement);
cytoscape.use(cola);
cytoscape.use(BubbleSets);


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
    tippies: any | undefined;
    cxtmenu: any;


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
            console.log("node.classes()", node.classes());

            let tip = this.tippies.makeNodeTippy(node, this.props);
            tip.show();

        });

        this.cy.on('click', 'edge', (event: any) => {
            const edge = event.target;
            console.log("edge.data()", edge.data());
            let tip = this.tippies.makeEdgeTippy(edge, this.props);
            tip.show();
        });

        this.cy.on('dblclick', 'node', (event: any) => {
            const node = event.target;
            console.log("dblclick node.data()", node.data(), node);
            getTraceOnNode(node.data(), this.props);
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

        this.tippies = new Tippies(this);

        console.log("instance", this.instance);
        this.initListeners();

        this.cxtmenu = this.cy.cxtmenu(cxtmenu_defaults);

    }


    private initGraph() {

        this.setServiceNodes();
        this.setService2ServiceEdges();
        this.setOperationNodes();

        let layout = this.cy.layout({
            ...layoutOptions,
            stop: () => {


                //this.instance.collapseNodes(this.cy.nodes('[id="cartservice-compound"]'));
                //this.instance.collapseNodes(this.cy.nodes('[id="featureflagservice-compound"]'));
//                this.instance.collapseNodes(this.cy.nodes('[id="frontend-proxy-compound"]'));

            }
        });
        resetConstraints();

        layout.run();


    }


    private updateGraph() {
        console.log("updateGraph");
        this.cy.resize();
        this.cy.fit();
        let layout = this.cy.layout({...colaOptions});
        //layout.run();
        layoutOptions.randomize = false;
        layout = this.cy.layout({...layoutOptions});
        layout.run();


    }

    private setServiceNodes() {
        const {data} = this.props;
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


    private setService2ServiceEdges() {
        const {data} = this.props;
        // get series with refId ServiceGraphEdges
        data.series.filter((series: any) => series.refId === "service_graph_request_total").forEach((serie: any) => {
            // if serie is undefined return
            if (serie === undefined) {
                return;
            }

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
                        // also add a failed edge


                    } else {
                        // if edge exists update the weight and label
                        this.cy.getElementById(edge.id).data('failed_weight', edge.failed_weight);
                        this.cy.getElementById(edge.id).data('label', edge.getLabel());

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
                source: edge.source + "-out",
                target: edge.target + "-in",
                weight: edge.weight,
                failed_weight: edge.failed_weight,
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
                this.addOperationSpanNode(operation);
            } else {
                // if serie node exists but if the status node does not exist create it
                if (this.cy.getElementById(operation.spanStatusId).length === 0) {
                    // if operation value is 0 do not add it
                    if (operation.weight > 0) {
                        this.addOperationSpanNode(operation);
                    }
                } else {
                    // if serie node exists and status node exists update the weight
                    this.cy.getElementById(operation.spanStatusId).data('weight', operation.weight);
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
        // and add a service label node attached to the service node connected just to show service name
        this.cy.add({
            data: {
                id: service.id + "-label",
                label: service.name,
                type: "label-node",
                parent: service.id + "-compound",
                service: service.id,
                weight: service.weight
            }
        }).addClass("label-node");
        // connect to service node
        let connectedNodes=this.cy.add({
            data: {
                id: service.id + "-label-edge",
                label: "",
                source: service.id + "-label",
                target: service.id,
                service: service.id,
                parent: service.id + "-compound",
                weight: service.weight
            }
        }).addClass("label-edge").connectedNodes();

        // add automove to connected nodes
        console.log("auto-move=",connectedNodes);
        this.cy.automove({
            nodesMatching: connectedNodes,
            reposition: 'drag',
            dragWith: connectedNodes
        });
    }

    private addServiceCompound(service: Service) {
        this.cy.add({
            data: {
                id: service.id + "-compound",
                label: service.name,
                nodeType: "service-compound",
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
        }
        let weight = 0;
        this.props.data.series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind")
            .filter((serie: any) => serie.fields[1].labels.service_name === service.name && serie.fields[1].labels.span_kind === span_kind)
            .forEach((serie: any) => {
                //console.log("service_name=",service.name,",span_kind=",span_kind, ",serie=", serie);
                if (serie.length === 1) {
                    weight = round2(serie.fields[1].values.buffer[0]);
                    return;
                } else {
                    console.log("spanmetrics_calls_total_span_kind query returned more than one result", serie);
                }

            });

        this.cy.add({
            data: {
                id: service.id + "-" + direction,
                label: direction,
                nodeType: "connector-" + direction,
                parent: service.id + "-compound",
                weight: weight,
                service: service.id,
            }
        });
// connect to service node
        this.cy.add({
            data: {
                id: service.id + "-" + direction + "-edge",
                label: "",
                source: service.id + "-" + direction,
                target: service.id,
                service: service.id,
                parent: service.id + "-compound",

            }
        }).addClass("service2hubs_edges").connectedNodes();
        //
        // if (direction === "in") {
        //     addRelativeConstraint(hub.id,service.id);// left right
        // } else if (direction === "out") {
        //     addRelativeConstraint(service.id,hub.id);// left right
        // }

    }


    private addOperationSpanNode(operation: Operation) {
        this.cy.add({
            data: {
                id: operation.spanStatusId,
                label: operation.weight, // ERROR_500 or UNSET or similar
                nodeType: "operationStatus",
                spanStatus: operation.spanStatus,
                httpStatusCode: operation.httpStatusCode,
                weight: operation.weight,
                parent: operation.id + "-compound",
                service: operation.service,
                spanName: operation.spanName,
            }
        });


        this.addOperationEdge(operation);// a.k.a. operation-span edge

    }

    private addOperationEdge(operation: Operation) {
        let target;
        let source;
        if (operation.spanKind === "SERVER") {
            source = operation.id;
            target = operation.spanStatusId;
        } else if (operation.spanKind === "CLIENT") {
            source = operation.spanStatusId;
            target = operation.id;
        } else {
            source = operation.id;
            target = operation.spanStatusId;
        }


        this.cy.add({
            data: {
                id: "edge-" + operation.spanStatusId,
                label: operation.status,
                edgeType: "operation-span",
                spanStatus: operation.spanStatus,
                source: source,
                target: target,
                // get span node weight and assign it to edge

                weight: operation.weight,
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
                parent: operation.service + "-compound",
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
            target = operation.service + "-out";
        } else if (operation.spanKind === "SERVER") {
            source = operation.service + "-in";
            target = operation.id;
        } else {
            // still create edge , but do not connect to in/out
            source = operation.service + "-internal";
            target = operation.id;
        }
        this.cy.add({
            data: {
                id: "edge-" + operation.id,
                label: "",
                edgeType: "operation",
                source: source,
                target: target,
                weight: operation.weight,
            }

        });
    }







}


