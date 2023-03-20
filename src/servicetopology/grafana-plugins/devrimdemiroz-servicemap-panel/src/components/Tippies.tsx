import tippy, {Instance, Props} from "tippy.js";
import {getTraceOnNode} from "./Trace";
import {SimplePanel} from "./SimplePanel";

export class Tippies {
    panel: SimplePanel | undefined;

    constructor(panel: SimplePanel) {
        this.panel = panel;
    }

    createDummyElement() {
        return document.createElement('div');
    }

    createContent(ele, idKey, buttonHTML) {
        let cardDetails = "";
        let cardId = "";
        const eleJson = JSON.stringify(ele.data(), null, 2);

        // @ts-ignore
        JSON.parse(eleJson, (key, value) => {
            if (key === idKey) {
                cardId = `<div>${value}<hr><div>${buttonHTML}</div></div>`;
                return cardId;
            }
            cardDetails += `<b>${key}: ${value}</b><br/>`;
        });

        cardDetails += `classes: ${ele.classes()}<br/>`;
        return {cardId, cardDetails};
    }

    createTippyInstance(ele, content, placement) {
        const ref = ele.popperRef();
        const dummyDomEle = this.createDummyElement();

        return tippy(dummyDomEle, {
            appendTo: document.body,
            arrow: true,
            placement,
            content: () => {
                const div = document.createElement('div');
                div.innerHTML = content;
                return div;
            },
            getReferenceClientRect: ref.getBoundingClientRect,
            hideOnClick: true,
            interactive: true,
        });
    }

    makeEdgeTippy(ele) {
        const {cardId, cardDetails} = this.createContent(
            ele,
            'id',
            `<button class="tooltip-button" id="details"><span>👀</span></button>`
        );

        const tip = this.createTippyInstance(ele, cardId, 'right-end');
        tip.show();

        this.attachDetails(tip, cardDetails);
        return tip;
    }

    makeNodeTippy(ele, props) {
        const {cardId, cardDetails} = this.createContent(
            ele,
            'id',
            `<button class="tooltip-button" id="details"><span>👀</span></button>
       <button class="tooltip-button" id="trace"><span>| trace</span></button>`
        );

        const tip = this.createTippyInstance(ele, cardId, 'right-end');
        tip.show();

        this.attachDetails(tip, cardDetails);
        this.attachTrace(tip, ele, this.panel);

        return tip;
    }

    attachDetails(tip: Instance<Props>, cardDetails: string) {
        tip.popper.querySelector('#details').addEventListener('click', () => {
            const detailsTippy = tippy(tip.popper, {
                appendTo: 'parent',
                arrow: true,
                content: () => {
                    const div = document.createElement('div');
                    div.innerHTML = cardDetails;
                    return div;
                },
                placement: 'bottom',
            });
            detailsTippy.show();
        });
    }

    attachTrace(tip: Instance<Props>, node: any, panel: SimplePanel | undefined) {
        tip.popper.querySelector('#trace').addEventListener('click', () => {
            const traceTippy = tippy(tip.popper, {
                appendTo: 'parent',
                arrow: true,
                content: () => {
                    const div = document.createElement('div');

                    const tracePromise = getTraceOnNode(node.data(), panel);
                    tracePromise.then((value) => {
                        const trace = value;
                        const traceResult = `
              <div>
                ${trace.toString()}
                <hr>
                <div>
                  <button class="tooltip-button" id="traditional">traditional</button><br>
                  <button class="tooltip-button" id="ucm">usecasemaps</button><br>
                  <button class="tooltip-button" id="ucm-full">usecasemaps full</button>
                </div>
              </div>
            `;

                        div.innerHTML = traceResult;

                        traceTippy.popper.querySelector('#traditional').addEventListener('click', () => {
                            trace.appendTraditional();
                        });
                        traceTippy.popper.querySelector('#ucm').addEventListener('click', () => {
                            trace.appendUcm();
                        });
                        traceTippy.popper.querySelector('#ucm-full').addEventListener('click', () => {
                            trace.appendUcmFull();
                        });
                    });

                    return div;
                },
                placement: 'bottom-start',
                hideOnClick: true,
                interactive: true,
            });
            traceTippy.show();
        });
    }
}

