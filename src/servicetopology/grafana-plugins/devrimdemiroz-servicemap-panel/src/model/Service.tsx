import {round2} from "../components/SimplePanel";
import {place_left2right} from "../components/layout";
import {DataFrame} from "@grafana/data";
import {createDonutChart} from "../components/donut";

function direction(span_kind: any) {
    if (span_kind === "SPAN_KIND_SERVER") {
        return "in";
    } else if (span_kind === "SPAN_KIND_CLIENT") {
        return "out";
    } else if (span_kind === "SPAN_KIND_INTERNAL") {
        return "internal";
    }
    return "unknown";
}

export class Service {
    name: string;
    id: string;
    weight: number;
    data_series: DataFrame[];
    cy: any;

    constructor(serie: any) {
        this.name = serie.fields[1].labels.service_name;
        this.id = this.name;
        this.weight = round2(serie.fields[1].values.get(0));
    }

    add_service_compound(cy: any) {
        return cy.add({
            data: {
                id: this.id + "-compound",
                label: this.name,
                service: this.id,
                nodeType: "service-compound",
                weight: this.weight
            }
        }).addClass("service-compound");


    }

    add_service_nodes(cy: any) {
        let service_node = cy.add({
            data: {
                id: this.id,
                label: this.weight.toString(),
                nodeType: "service",
                parent: this.id + "-compound",
                weight: this.weight
            }
        }).addClass("service-node");
        // and add a service label node attached to the service node connected just to show service name
        let label_node = cy.add({
            data: {
                id: this.id + "-label",
                label: this.name,
                type: "label-node",
                parent: this.id + "-compound",
                service: this.id,
                weight: this.weight
            }
        }).addClass("label-node");


        // connect to service node
        let connectedNodes = cy.add({
            data: {
                id: this.id + "-label-edge",
                label: "",
                source: this.id + "-label",
                target: this.id,
                service: this.id,
                parent: this.id + "-compound",
                weight: this.weight
            }
        }).addClass("label-edge").connectedNodes();

        // add automove to connected nodes
        console.log("auto-move=", connectedNodes);
        cy.automove({
            nodesMatching: label_node,
            reposition: 'drag',
            dragWith: service_node
        });
    }

    add_hub_nodes() {
        this.data_series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind"
            && queryResults.fields[1].labels.service_name === this.id)
            .forEach((serie: any) => {
                // get the span_kind
                let span_kind = serie.fields[1].labels.span_kind;
                console.log("-->spanmetrics_calls_total_span_kind query returned", serie, "span_kind=", span_kind);
                this.addHubNode(serie, direction(span_kind));
            });


    }

    addHubNode(serie, direction: string) {

        // find the related serie in this.props.data.series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind") if exists and get value as weight
        // if not exists set weight to 0 {service_name="frontend", span_kind="SPAN_KIND_INTERNAL"}

        if (serie.length !== 1) {
            console.log("spanmetrics_calls_total_span_kind query returned " + serie.length + " result=", serie);
            return;
        }
        let weight = round2(serie.fields[1].values.buffer[0]);

        // if (weight === 0) {
        //     return;
        // }
        // hub compound
        this.cy.add({
            data: {
                id: this.id + "-compound-" + direction,
                label: direction,
                parent: this.id + "-compound",
                weight: weight,
                service: this.id,
            }
        }).addClass("hub-compound");
        // hub node
        this.cy.add({
            data: {
                id: this.id + "-" + direction,
                label: direction,
                parent: this.id + "-compound",
                weight: weight,
                service: this.id,
            }
        }).addClass("hub-node");

        this.cy.add({
            data: {
                id: this.id + "-" + direction + "-hub-label",
                label: direction,
                parent: this.id + "-compound",
                service: this.id,
                weight: this.weight
            }
        }).addClass("label-node");
        let connectedNodes = this.cy.add({
            data: {
                id: this.id + "-" + direction + "-label-edge",
                label: "",
                source: this.id + "-" + direction + "-hub-label",
                target: this.id + "-" + direction,
                service: this.id,
                parent: this.id + "-compound",
                weight: this.weight
            }
        }).addClass("label-edge").connectedNodes();

        // add automove to connected nodes
        console.log("auto-move=", connectedNodes);
        this.cy.automove({
            nodesMatching: connectedNodes,
            reposition: 'drag',
            dragWith: connectedNodes
        });

        //connect to service node
        this.cy.add({
            data: {
                id: this.id + "-" + direction + "-edge",
                label: "",
                source: direction === "in" ? this.id + "-compound-" + direction : this.id,
                target: direction === "in" ? this.id : this.id + "-compound-" + direction,
                service: this.id,
                parent: this.id + "-compound",

            }
        }).addClass("service2hubs_edges");

        console.log("4- addHubNode", direction, "weight=", weight, "this.id=", this.id);
        // add edge from hub to hub-compound
        this.cy.add({
            data: {
                id: this.id + "-" + direction + "-edgy",
                label: "",
                source: direction === "in" ? this.id + "-" + direction : this.id + "-compound-" + direction,
                target: direction === "in" ? this.id + "-compound-" + direction : this.id + "-" + direction,
                service: this.id,
                parent: this.id + "-compound",
            }
        }).addClass("hub2hub_compound_edges");

        if (direction === "in") {
            place_left2right(this.id + "-" + direction, this.id);// left right
        } else if (direction === "out") {
            place_left2right(this.id, this.id + "-" + direction);// left right
        }

    }

    set_series(data_series: DataFrame[]) {
        this.data_series = data_series;
    }

    add_donut() {
        const imageUrl = createDonutChart(this);
        const backgroundImage = `url(${imageUrl})`;
        const node = this.cy.getElementById(this.id);
        node.style('background-image', backgroundImage);

    }
}

