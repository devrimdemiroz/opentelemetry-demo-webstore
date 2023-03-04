import tippy, {Instance, Props} from "tippy.js";
import {getTraceOnNode} from "./Trace";

function attachDetails(tip: Instance<Props>, cardDetails: string) {
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

function attachTrace(tip: Instance<Props>, node: any, props: any) {
    tip.popper.querySelector('#trace').addEventListener('click', () => {
        let traceTippy = tippy(tip.popper, {
            appendTo: 'parent',
            arrow: true, // mandatory
            // dom element inside the tippy:
            content: function () {
                let div = document.createElement('div');

                let traceDetails = getTraceOnNode(node.data(), props);
                // when promise completed
                traceDetails.then((value) => {
                    div.innerHTML = JSON.stringify(value, null, 2);

                });
                return div;
            },
            // open in right
            placement: 'bottom',
        });
        traceTippy.show();

    });
}

export function makeTippy(ele, props) {
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
                                    <button class="tooltip-button" id="trace"><span > 🕡 </span></button>
                                    
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
    attachDetails(tip, cardDetails);
    attachTrace(tip, ele, props);


    return tip;
}
