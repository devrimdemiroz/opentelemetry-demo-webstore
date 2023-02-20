import React, {PureComponent} from 'react';
import {PanelProps} from '@grafana/data';
import {getTemplateSrv} from '@grafana/runtime';
import './style.css';
import cytoscape,{NodeSingular} from "cytoscape";
import layoutUtilities from 'cytoscape-layout-utilities';
import fcose from 'cytoscape-fcose';
import BubbleSets from 'cytoscape-bubblesets';
import cola from 'cytoscape-cola';

import {
    addHallignConstraint,
    addRelativeConstraint,
    addVallignConstraint, colaOptions,
    layoutOptions,
    resetConstraints
} from "./layout";
import {cyStyle} from "./style";


// @ts-ignore
import complexityManagement from "cytoscape-complexity-management";

cytoscape.use(BubbleSets);
cytoscape.use(fcose);
cytoscape.use(layoutUtilities);
cytoscape.use(complexityManagement);
cytoscape.use( cola );


interface PanelState {
    cy?: cytoscape.Core | undefined;
    cyVisible?: cytoscape.Core | undefined;
    cyInvisible?: cytoscape.Core | undefined;
    instance?: complexityManagement | undefined;
}


function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

class Operation {
    name: any;
    spanStatus: any;
    spanKind: any;
    id: string;
    constructor(serie: any) {
        this.service = serie.fields[1].labels.service_name;
        this.name = serie.fields[1].labels.span_name.replace(/(\/|\s|\.)/g, "_");
        this.spanKind = serie.fields[1].labels.span_kind.replace(/SPAN_KIND_(.*)/g, "$1");
        this.spanStatus = serie.fields[1].labels.status_code.replace(/STATUS_CODE_(.*)/g, "$1");
        this.id = this.service + "_" + this.name + "_" + this.spanKind;

        // if exists add to operationId
        this.httpMethod = serie.fields[1].labels.http_method;
        if (this.httpMethod !== undefined) {
            this.id +=  "_" + this.httpMethod;
        }

        this.httpStatusCode = serie.fields[1].labels.http_status_code;
        // if exists add to operationId
        this.status=this.spanStatus;
        if (this.httpStatusCode !== undefined) {
            this.status +=
                "_" + this.httpStatusCode;
        }

        this.statusId = this.id + "_" + this.status;

        let value = serie.fields[1].values.get(0);
        // round the value to 2 decimals after the dot
        this.value = round2(value);
    }
    value: number;
    statusId: string;
    status: string;
    httpMethod: string;
    httpStatusCode: any;
    service: any;

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
            console.log("node.data()", node.data(),node);
            //this.instance.collapseNodes(this.cy.nodes(':selected'));
            this.instance.collapseAllNodes();
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
            // elements: {
            //     nodes: [
            //         {
            //             data: { id: 'a' }
            //         },
            //
            //         {
            //             data: { id: 'b' }
            //         }
            //     ],
            //     edges: [
            //         {
            //             data: { id: 'ab', source: 'a', target: 'b' }
            //         }
            //     ]
            // },



        });
        this.cy.style(cyStyle);
        this.cy.layoutUtilities({
            desiredAspectRatio: this.props.width/this.props.height,
        });
        console.log("desiredAspectRatio", this.props.width/this.props.height);
        this.instance = this.cy.complexityManagement();


        this.setState({
            cy: this.cy,
            cyVisible: this.cyVisible,
            cyInvisible: this.cyInvisible,
            instance: this.instance,
        });
        this.cy.ready(() => {
            this.initGraph(); });

        console.log("instance", this.instance);
        this.initListeners();



    }



    private initGraph() {
        this.setServiceNodes();

        this.setServiceEdges();
        resetConstraints();
        this.setOperationNodes();
        this.correlateOperations();
        this.calculateConstraints();

        this.instance.collapseNodes(this.cy.nodes('[id="featureflagservice-compound"]'));
        this.instance.collapseNodes(this.cy.nodes('[id="frontend-proxy-compound"]'));

       // this.cy.fit();
        console.log("this.cy", this.cy);
        let layout = this.cy.layout({...layoutOptions,
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

        let layout = this.cy.layout({...layoutOptions});
        layout.run();


    }

    private setServiceNodes() {
        const variables = getTemplateSrv().getVariables();
        console.log("variables", variables);
        // find the Services variable combobox and get the selected value(s)
        const services = variables.find((v: any) => v.name === "Services");
        console.log("services", services);

         // get all services except value "All"
        // These are the services observed  of all time for now. labelValues from Prometheus
        // @ts-ignore
        console.log("services.options", services.options);
        // iterate over options and get the text value except "All"
        // @ts-ignore
        const servicesObserved = services.options.filter((o: any) => o.text !== "All").map((o: any) => o.text);
        console.log("servicesObserved", servicesObserved);
        // add to cy servicesObserved as nodes
        this.cy.add(servicesObserved.map((s: any) => ({
            data: {
                id: s+"-compound",
                label: s,
                nodeType: "serviceCompound"
            }
        })));
        this.cy.add(servicesObserved.map((s: any) => ({
            data: {
                id: s,
                label: s,
                nodeType: "service",
                parent: s+"-compound"
            }
        })));

        // TODO: listen to changes in the Services variable combobox and update the graph accordingly
    }


    private setServiceEdges() {
        const {data} = this.props;
        console.log("data", data);
        // get series with refId ServiceGraphEdges
        data.series.filter((edges: any) => edges.refId === "ServiceGraphEdges").forEach((edges: any) => {


            // const edges = data.series.find((s: any) => s.refId === "ServiceGraphEdges");
            console.log("ServiceGraphEdges", edges);
            // if edges is undefined return
            if (edges === undefined) {
                return;
            }

            const edgesLength = edges.fields.length;
            for (let i = 1; i < edgesLength; i++) {
                const edge = edges.fields[i];
                // get the source and target
                const source = edge.labels.client;
                const target = edge.labels.server;
                let value = edge.values.get(0);
                // round the value to 2 decimals after the dot
                value = Math.round(value * 100) / 100;
                // if edge is undefined create it
                if (this.cy.getElementById('service-' + source + '-' + target).length === 0) {
                    this.cy.add({
                        data: {
                            id: 'service-' + source + '-' + target,
                            label: value,
                            edgeType: "service",
                            source: source+"-compound",
                            target: target+"-compound",
                            value
                        }

                    });
                    // Move styling to style.js
                    // show value and direction of the edge
                    this.cy.style().selector("edge").style({
                        "label": "data(label)",
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "text-rotation": "autorotate",
                        "text-margin-y": -5,
                        "text-margin-x": 5,
                        "font-size": 10,
                    });


                } else {
                    // if edge exists update the value and label
                    this.cy.getElementById('service-' + source + '-' + target).data('label', value);
                    this.cy.getElementById('service-' + source + '-' + target).data('value', value);
                }
                // TODO: query is instant for the moment, needs to be average on selected time range
                // TODO: traces_service_graph_request_failed_total is not available yet


            }


        } );
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
                    // if serie node exists and status node exists update the value
                    this.cy.getElementById(operation.statusId).data('value', operation.value);
                }
            }
            // once finished , itreate status nodes and sum up the values into serie node
            const operationStatusNodes = this.cy.nodes().filter("node[nodeType = 'operationStatus'][parent = '" + operation.id+"-compound" + "']" );
            let operationValue=0;
            operationStatusNodes.forEach((operationStatusNode: any) => {
                operationValue+=operationStatusNode.data('value');
            } );
            this.cy.getElementById(operation.id).data('value', operationValue);

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
                value: operation.value,
                parent: operation.id + "-compound",
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
                value: 0,
            }
        });
    }

    private correlateOperations() {
        // correlate operations in different services with same name ,spanStatus and if exist http status code
        // where one operation has spanKind client other as server. create edge from client one to server.

        const clientOperations = this.cy.nodes().filter("node[nodeType = 'operation'][spanKind = 'CLIENT']");
        console.log("clientOperations", clientOperations);
        // iterate over the collections of client operations
        clientOperations.forEach((clientOperation: any) => {
            //console.log("clientOperation", clientOperation.data());
            // get the matching server operations
            const serverOperations = this.cy.nodes().filter("node[nodeType = 'operation'][spanKind = 'SERVER'][name = '" + clientOperation.data('name') + "']" );
           // console.log("serverOperations", serverOperations.length," list=", serverOperations);
            // if there are matching operations
            if (serverOperations.length === 1) {
                let clientOperationValue = round2(clientOperation.data('value'));
                // create an edge from client to server
                let serverOperationsValue = round2(serverOperations[0].data('value'));
                this.cy.add({
                    data: {
                        id: clientOperation.data('id') + "_" + serverOperations[0].data('id'),
                        source: clientOperation.data('id'),
                        target: serverOperations[0].data('id'),
                        edgeType: "operation",
                        label: clientOperationValue + " / " + serverOperationsValue.toFixed(2),
                        value: (clientOperationValue + serverOperationsValue) / 2
                    }
                });
                // values to be decimal 2
                addHallignConstraint([clientOperation.data('id'), serverOperations[0].data('id')]) ;

            } else if (serverOperations.length > 1) {
                console.log("More than one Match! ...serverOperations", serverOperations.length," list=", serverOperations);
            }
        } );



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
        } );
    }
}
