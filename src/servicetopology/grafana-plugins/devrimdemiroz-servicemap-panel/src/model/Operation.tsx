import {round2} from "../components/SimplePanel";

export class Operation {
    name: any;
    spanStatus: any;
    spanKind: any;
    id: string;
    spanName: string;
    weight: number;
    spanStatusId: string;
    status: string;
    httpMethod: string;
    httpStatusCode: any;
    service: any;
    parent: any;

    constructor(serie: any) {
        this.service = serie.fields[1].labels.service_name;
        this.spanName = serie.fields[1].labels.span_name;
        this.name = serie.fields[1].labels.span_name.replace(/(\/|\s|\.)/g, "_");
        this.spanKind = serie.fields[1].labels.span_kind.replace(/SPAN_KIND_(.*)/g, "$1");
        this.spanStatus = serie.fields[1].labels.status_code.replace(/STATUS_CODE_(.*)/g, "$1");
        this.id = this.service + "_" + this.name + "_" + this.spanKind;

        // if exists add to operationId
        this.httpMethod = serie.fields[1].labels.http_method;
        if (this.httpMethod !== undefined) {
            this.id += "_" + this.httpMethod;
        }

        this.httpStatusCode = serie.fields[1].labels.http_status_code;
        // if exists add to operationId
        this.status = this.spanStatus;
        if (this.httpStatusCode !== undefined) {
            this.status += "_" + this.httpStatusCode;
        }

        this.spanStatusId = this.id + "_" + this.status;

        let value = serie.fields[1].values.get(0);
        // round the value to 2 decimals after the dot
        this.weight = round2(value);
    }
}
