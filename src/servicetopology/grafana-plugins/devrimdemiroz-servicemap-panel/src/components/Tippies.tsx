import tippy, {Instance, Props} from "tippy.js";
import {getTraceOnNode, Trace} from "./Trace";
import {SimplePanel} from "./SimplePanel";


export class Tippies {
    panel: SimplePanel | undefined;

    constructor(panel: SimplePanel) {
        this.panel = panel;
    }

    makeEdgeTippy(ele, props) {
        let ref = ele.popperRef();

        // Since tippy constructor requires DOM element/elements, create a placeholder
        let dummyDomEle = document.createElement('div');
        let cardDetails = "";
        let tip = tippy(dummyDomEle, {
            appendTo: document.body,
            arrow: true, // mandatory
            placement: 'right-end',// options: top, bottom, left, right, top-start, top-end, bottom-start, bottom-end, left-start, left-end, right-start, right-end
            content: function () {
                let div = document.createElement('div'), eleJson = JSON.stringify(ele.data(), null, 2),
                    edgeId = "";
                // @ts-ignore
                JSON.parse(eleJson, (key, value) => {
                    //console.log("key", key, "value", value.toString());
                    if (key === 'id') {

                        edgeId += `<div > ${value}  
                                <hr>
                                <div >
                                    <button class="tooltip-button" id="edgeDetails"><span > 👀</span></button>
                                    
                                </div>
                            </div>`;


                        return edgeId;
                    }
                    // stash the rest under cardDetails
                    cardDetails += "<b>" + key + ": " + value + "</b><br/>";

                });
                // and classes of ele
                cardDetails += "classes: " + ele.classes() + "<br/>";


                div.innerHTML = edgeId;

                return div;
            },
            // your own preferences:
            getReferenceClientRect: ref.getBoundingClientRect,
            hideOnClick: true,
            interactive: true,
            // if interactive:
            sticky: true,
            trigger: 'manual' // or append dummyDomEle to document.body
        });
        tip.show();
        attachDetails(tip, cardDetails);
        // @ts-ignore
        this.attachTrace(tip, ele, this.panel);


        return tip;
    }

    makeNodeTippy(ele, props) {
        let ref = ele.popperRef();

        // Since tippy constructor requires DOM element/elements, create a placeholder
        let dummyDomEle = document.createElement('div');
        let cardDetails = "";
        let tip = tippy(dummyDomEle, {
            appendTo: document.body,
            arrow: true, // mandatory
            placement: 'right-end',// options: top, bottom, left, right, top-start, top-end, bottom-start, bottom-end, left-start, left-end, right-start, right-end
            content: function () {
                let div = document.createElement('div'), eleJson = JSON.stringify(ele.data(), null, 2),
                    cardId = "";
                // @ts-ignore
                JSON.parse(eleJson, (key, value) => {
                    //console.log("key", key, "value", value.toString());
                    if (key === 'id') {

                        cardId += `<div > ${value}  
                                <hr>
                                <div >
                                    <button class="tooltip-button" id="cardDetails"><span > 👀</span></button>
                                    <button class="tooltip-button" id="trace"><span > | trace </span></button>
                                    
                                </div>
                            </div>`;


                        return cardId;
                    }
                    // stash the rest under cardDetails
                    cardDetails += "<b>" + key + ": " + value + "</b><br/>";

                });
                // and classes of ele
                cardDetails += "classes: " + ele.classes() + "<br/>";


                div.innerHTML = cardId;

                return div;
            },
            // your own preferences:
            getReferenceClientRect: ref.getBoundingClientRect,
            hideOnClick: true,
            interactive: true,
            // if interactive:
            sticky: true,
            trigger: 'manual' // or append dummyDomEle to document.body
        });
        tip.show();
        this.attachDetails(tip, cardDetails);
        this.attachTrace(tip, ele, this.panel);


        return tip;
    }

    attachDetails(tip: Instance<Props>, cardDetails: string) {
        tip.popper.querySelector('#cardDetails').addEventListener('click', () => {
            let detailsTippy = tippy(tip.popper, {
                appendTo: 'parent',
                arrow: true, // mandatory
                // dom element inside the tippy:
                content: function () {
                    let div = document.createElement('div');
                    div.innerHTML = cardDetails;
                    return div;
                },
                // open in right
                placement: 'bottom',
            });
            detailsTippy.show();

        });
    }

    attachTrace(tip: Instance<Props>, node: any, panel: SimplePanel | undefined) {
        tip.popper.querySelector('#trace').addEventListener('click', () => {
            let traceTippy = tippy(tip.popper, {
                appendTo: 'parent',
                arrow: true, // mandatory
                // dom element inside the tippy:
                content: function () {
                    let div = document.createElement('div');

                    let tracePromise = getTraceOnNode(node.data(), panel);
                    // when promise completed
                    let trace: Trace;

                    tracePromise.then((value) => {
                        let traceResult = "<div >";

                        trace = value;
                        traceResult += `${trace.toString()}  
                                <hr>
                                <div >
                                    <button class="tooltip-button" id="traditional">traditional</button><br>
                                    <button class="tooltip-button" id="ucm">usecasemaps </button><br>
                                    <button class="tooltip-button" id="ucm-full">usecasemaps full</button>
                                    
                                </div>`;
                        traceResult += "</div >";

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
                // open in right
                placement: 'bottom-start',// options:
                // close on click
                hideOnClick: true,
                interactive: true,
                // if interactive:
                sticky: true,

            });
            // assign tratidional button click listener


            traceTippy.show();

        });
    }
}





