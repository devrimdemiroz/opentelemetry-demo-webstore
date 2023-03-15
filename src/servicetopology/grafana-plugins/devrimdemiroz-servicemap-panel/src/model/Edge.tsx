import {round2} from "../components/SimplePanel";

export class Edge {
    name: string;
    id: string;
    source: string;
    target: string;
    weight: number;
    type: string;
    label: string;
    failed_weight: number;
    classes: string[];
    source_operationId: string;
    target_operationId: string;

    constructor() {
        this.failed_weight = 0;
        this.classes = [];
    }

    addClass(className: string) {
        this.classes.push(className);
    }

    join(cy) {
        return cy.add({
            data: {
                id: this.id,
                label: this.label,
                edgeType: this.type,
                source: this.source,
                target: this.target,
                weight: this.weight,
                classes: this.classes,
            }
        });
    }

    getLabel() {
        return this.weight.toString() + " / " + this.failed_weight.toString();
    }

    static create(serie: any) {
        let edge = new Edge();
        edge.source = serie.labels.client;
        edge.target = serie.labels.server;
        edge.weight = round2(serie.values.get(0));
        edge.failed_weight = 0;
        edge.label = edge.getLabel();
        return edge;
    }
}
