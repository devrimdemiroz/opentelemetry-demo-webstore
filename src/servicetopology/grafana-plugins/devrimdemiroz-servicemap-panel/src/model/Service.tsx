import {round2} from "../components/SimplePanel";
import {place_left2right} from "../components/layout";
import {DataFrame} from "@grafana/data";
import {createDonutChart} from "../components/donut";

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
        cy.add({
            data: {
                id: this.id,
                label: this.weight.toString(),
                nodeType: "service",
                parent: this.id + "-compound",
                weight: this.weight
            }
        }).addClass("service-node");
        // and add a service label node attached to the service node connected just to show service name
        cy.add({
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
            nodesMatching: connectedNodes,
            reposition: 'drag',
            dragWith: connectedNodes
        });
    }

    add_hub_nodes(cy: any) {
        this.addHubNode(cy, "in");
        this.addHubNode(cy, "out");
        this.addHubNode(cy, "internal");

    }

    addHubNode(cy, direction: string) {

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
        this.data_series.filter((queryResults: any) => queryResults.refId === "spanmetrics_calls_total_span_kind")
            .forEach((serie: any) => {
                console.log("service_name=", this.name, ",span_kind=", span_kind, ",serie=", serie);
                if (serie.length === 1) {
                    weight = round2(serie.fields[1].values.buffer[0]);
                    return;
                }
                console.log("spanmetrics_calls_total_span_kind query returned more than one result", serie);

                weight = 0;

            });

        // if (weight === 0) {
        //     return;
        // }
        cy.add({
            data: {
                id: this.id + "-" + direction,
                label: direction,
                nodeType: "connector-" + direction,
                parent: this.id + "-compound",
                weight: weight,
                service: this.id,
            }
        });
// connect to service node
        cy.add({
            data: {
                id: this.id + "-" + direction + "-edge",
                label: "",
                source: direction === "in" ? this.id + "-" + direction : this.id,
                target: direction === "in" ? this.id : this.id + "-" + direction,
                service: this.id,
                parent: this.id + "-compound",

            }
        }).addClass("service2hubs_edges");

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

