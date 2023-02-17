import React, {PureComponent} from 'react';
import {PanelProps} from '@grafana/data';
import {getTemplateSrv} from '@grafana/runtime';
import './style.css';
import cytoscape from "cytoscape";
import layoutUtilities from 'cytoscape-layout-utilities';
import fcose from 'cytoscape-fcose';
import BubbleSets from 'cytoscape-bubblesets';

import {
    addHallignConstraint,
    addRelativeConstraint,
    addVallignConstraint,
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

interface PanelState {
    cy?: cytoscape.Core | undefined;
    cyVisible?: cytoscape.Core | undefined;
    cyInvisible?: cytoscape.Core | undefined;
    instance?: complexityManagement | undefined;
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
        this.cy.on('click', 'node', (event: any) => {
            const node = event.target;
            console.log("node.data()", node.data(),node);
            const nodeType = node.data("nodeType");
            if (nodeType === "service") {

            }


        });
        // double click to expand
        this.cy.on('dblclick', 'node', (event: any) => {
            this.instance.collapseNodes(this.cy.nodes(':selected'));
        });


    }

    private initGraph() {
        this.setServiceNodes();

        this.setServiceEdges();
        resetConstraints();
        this.setOperationNodes();
        this.groupNodes("spanKind");
        this.correlateOperations();
        //this.calculateConstraints();
        //this.styleNodes();

        this.cy.fit();
        console.log("this.cy", this.cy);
        let layout = this.cy.layout({...layoutOptions,
        stop: () => {
        this.initializer(this.cy);
        }
        });

        layout.run();
        // find service nodes and collapse them



        //this.instance.collapseAllNodes();
        //this.instance.collapseAllEdges();
    }
    private updateGraph() {
        console.log("updateGraph");

        this.calculateConstraints();
         this.cy.resize();
        this.cy.fit();
        layoutOptions.randomize = false;
        let layout = this.cy.layout({...layoutOptions, stop: () => {
                this.initializer(this.cy);
            }});
        this.cy.layoutUtilities("get").setOption("randomize", false);
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

    private styleNodes() {


        // find the largest label length
        const maxLabelLength = this.cy.nodes().reduce((max: any, ele: any) => {
            const label = ele.data("label");
            return Math.max(max, label.length);
        }, 5);

        // set the width to maxLabelLength * 10px
        this.cy.style().selector("node").style({
            "text-max-width": maxLabelLength * 5,

        });


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
            // get edges length, iterate over fields starting from 1 up to length
            // fields[0] is the time field
            // fields[1] is the edges value field with labels

            const edgesLength = edges.fields.length;
            console.log("edgesLength", edgesLength);
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
                            source,
                            target,
                            value
                        }

                    });

                } else {
                    // if edge exists update the value and label
                    this.cy.getElementById('service-' + source + '-' + target).data('label', value);
                    this.cy.getElementById('service-' + source + '-' + target).data('value', value);
                }
                // TODO: query is instant for the moment, needs to be average on selected time range
                // TODO: traces_service_graph_request_failed_total is not available yet


            }

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
        } );
    }

    private setOperationNodes() {
        const {data} = this.props;
        // TODO: A hash map to store the operation nodes would be better, parenting(compound) can be then used
        // for now sticking with hierarchical approach
        data.series.filter((operation: any) => operation.refId === "spanmetrics_calls_total").forEach((operation: any) => {
            // get the service name from the labels
            const service = operation.fields[1].labels.service_name;
            // get the operation name from the labels
            const operationName = operation.fields[1].labels.span_name.replace(/(\/|\s|\.)/g, "_");
            let spanKind = operation.fields[1].labels.span_kind.replace(/SPAN_KIND_(.*)/g, "$1");
            let spanStatus = operation.fields[1].labels.status_code.replace(/STATUS_CODE_(.*)/g, "$1");
            let operationId = service + "_" + operationName + "_" + spanKind;
            // optional , get http_method and htt_status_code from the labels if
            let httpMethod = operation.fields[1].labels.http_method;

            // if exists add to operationId
            if (httpMethod !== undefined) {
                operationId = operationId + "_" + httpMethod;
            }

            const httpStatusCode = operation.fields[1].labels.http_status_code;
            // if exists add to operationId
            let operationStatus=spanStatus;
            if (httpStatusCode !== undefined) {
                operationStatus +=
                "_" + httpStatusCode;
            }
            let operationStatusId = operationId + "_" + operationStatus;
            // Create a unique node id from labels extracted from the fields with optionals as well
            // TODO: hash node id in case length is too long or similar restrictions in cytoscape
            // get the value from the values array

            let value = operation.fields[1].values.get(0);
            // round the value to 2 decimals after the dot
            value = Math.round(value * 100) / 100;
            // if operation node does not exist create it
            if (this.cy.getElementById(operationId).length === 0) {
                this.cy.add({
                    data: {
                        id: operationId,
                        label: operationName,
                        nodeType: "operation",
                        spanKind: spanKind,
                        spanStatus: spanStatus,
                        httpMethod: httpMethod,
                        httpStatusCode: httpStatusCode,
                        service: service,
                        parent: service+"-compound",
                    }
                });
                this.cy.add({
                    data: {
                        id: operationStatusId,
                        label: operationStatus,
                        nodeType: "operationStatus",
                        spanStatus: spanStatus,
                        httpStatusCode: httpStatusCode,
                        value: value,
                        parent: operationId,
                    }
                } );
            } else {
                // if operation node exists update the label
                this.cy.getElementById(operationStatusId).data('value', value);
            }

        });

    }

    private groupNodes(attrName: string) {
        // get distinct values of the attribute available on operation nodes
        const distinctValues = this.cy.nodes().filter("node[nodeType = 'operation']").map((node: any) => node.data(attrName)).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
        // iterate over the services and get matching operations containing distinct values
        this.cy.nodes().filter("node[nodeType = 'service']").forEach((service: any) => {
            // iterate over the distinct values
            distinctValues.forEach((value: any) => {

                // get the matching operations
                const matchingOperations = this.cy.nodes().filter("node[nodeType = 'operation'][parent = '" + service.data('id') + "-compound'][spanKind = '" + value + "']");
                // if there are matching operations
                if (matchingOperations.length > 0) {
                    // create a group node
                    // if group node exists skip
                    if (this.cy.getElementById(service.data('id') + "_" + value).length > 0) {
                        return;
                    }
                    const groupNode = this.cy.add({
                        data: {
                            id: service.data('id') + "_" + value,
                            label: value,
                            nodeType: value,
                            parent: service.data('id')+ "-compound",
                        }
                    });
                    // move the matching operations under the group node
                    matchingOperations.move({parent: groupNode.data('id')});
                }

            });

        });


    }

    private correlateOperations() {
        // correlate operations in different services with same name ,spanStatus and if exist http status code
        // where one operation has spanKind client other as server. create edge from client one to server.

        const clientOperations = this.cy.nodes().filter("node[nodeType = 'operation'][spanKind = 'CLIENT']");
        console.log("clientOperations", clientOperations);
        // iterate over the collections of client operations
        clientOperations.forEach((clientOperation: any) => {
            //console.log("clientOperation", clientOperation);
            // get the matching server operations
            const serverOperations = this.cy.nodes().filter("node[nodeType = 'operation'][spanKind = 'SERVER'][label = '" + clientOperation.data('label') + "'][spanStatus = '" + clientOperation.data('spanStatus') + "'][httpStatusCode = '" + clientOperation.data('httpStatusCode') + "']");
            //console.log("serverOperations", serverOperations);
            // if there are matching operations
            if (serverOperations.length > 0) {
                // create an edge from client to server
                this.cy.add({
                    data: {
                        id: clientOperation.data('id') + "_" + serverOperations[0].data('id'),
                        source: clientOperation.data('id'),
                        target: serverOperations[0].data('id'),
                        edgeType: "operation",
                        label: clientOperation.data('value') + "/" + serverOperations[0].data('value'),
                        value: (clientOperation.data('value') + serverOperations[0].data('value')) / 2
                    }
                });
                addHallignConstraint([clientOperation.data('id'), serverOperations[0].data('id')]) ;

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
        this.relativeAllignSpanKinds();


    }

    private relativeAllignSpanKinds() {
        // relative allignment for spanKind group compounds: SERVER left and CLIENT right
        // find services containing both spanKind SERVER and CLIENT
        const services = this.cy.nodes().filter("node[nodeType = 'service']");
        services.forEach((service: any) => {
            const spanKindGroups = service.children();
            const serverGroup = spanKindGroups.filter("node[label = 'SERVER']");
            const clientGroup = spanKindGroups.filter("node[label = 'CLIENT']");
            if (serverGroup.length === 1 && clientGroup.length === 1) {
                addRelativeConstraint(serverGroup.data('id'), clientGroup.data('id'));
                let vallign = [];
                vallign.push(serverGroup.data('id'));
                vallign.push(clientGroup.data('id'));
                addVallignConstraint(vallign);
            }
        });
    }

    private vAllignOperations() {
        // get all operation nodes
        const operations = this.cy.nodes().filter("node[nodeType = 'operation']");
        // iterate over the operations
        operations.forEach((operation: any) => {
            // find the matching operation in other services
            const matchingOperations = operations.filter("node[parent = '" + operation.data('parent') + "'][spanKind = '" + operation.data('spanKind') + "'][id != '" + operation.data('id') + "']");
            // if there are matching operations
            if (matchingOperations.length > 0) {
                // iterate over the matching operations
                let vallign = [];

                matchingOperations.forEach((matchingOperation: any) => {
                    vallign.push(matchingOperation.data('id'));
                });
                addVallignConstraint(vallign);
            }
        });
    }
}
