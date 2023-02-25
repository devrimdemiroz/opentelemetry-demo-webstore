import {colors} from "./colors";

export const cyStyle = [
    {
        selector: 'node',
        style: {
            "background-color": "white",
            "border-color": "black",
            "border-width": 1,
            "border-style": "solid",
            "font-size": 7,
            "color": "black",
            //'compound-sizing-wrt-labels': 'include',
            //  "background-opacity": 0.3,
            "text-wrap": "ellipsis",
            "label": "data(label)",
            // minimum size enough to represent 99,99
            "width": 4 * 20,

        }
    },

    {
        selector: ':compound',
        style: {
            "background-color": colors['4'],
            //"background-opacity": 0.1,
            "text-valign": "bottom",
            "text-margin-y": "10px",
            "text-wrap": "wrap",// options
            "border-opacity": 0,
            "shape": "round-rectangle",

        }

    },

    {
        selector: 'node[nodeType = "service"]',
        style: {
            "background-color": "white",
            "border-color": colors['SERVICE_HIGHWAY'],
            "border-opacity": 0.5,
            "text-valign": "center", // default
            "text-halign": "center", // default
            "font-size": 7,
            "color": "black",
            "border-width": function (ele) {
                return nodeSize(ele) / 5;
            },
            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },
        }
    },

    {
        selector: 'node[nodeType *= "connector"]',
        style: {
            "border-color": function (ele) {
                // if spankind SERVER, then color is colors['SERVER']
                return ele.data('label') === 'in' ? colors['SERVER'] : colors['CLIENT']

                // if spankind CLIENT, then color is colors['CLIENT']
            },
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "white",
            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },
            "label": "data(weight)",
        }
    },

    {
        selector: 'node[nodeType = "operation"]',
        style: {
            "border-color": function (ele) {
                // if spankind SERVER, then color is colors['SERVER']
                return ele.data('spanKind') === 'SERVER' ? colors['SERVER'] : colors['CLIENT']

                // if spankind CLIENT, then color is colors['CLIENT']
            },
            "opacity": 0.8,
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "ellipsis",
            "label": "data(weight)",

            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },

        }
    },

    {
        selector: 'node[spanKind = "CLIENT"][nodeType = "operation-compound"]',
        style: {
            "background-color": colors['CLIENT'],
            "background-opacity": 0.3,
        }
    },
    {
        selector: 'node[spanKind = "SERVER"][nodeType = "operation-compound"]',
        style: {
            "background-color": colors['SERVER'],
            "background-opacity": 0.3,
        }
    },

    {
        selector: 'node[spanStatus = "ERROR"]',
        style: {
            "color": colors['ERROR'],
            "border-color": colors['ERROR'],
            "text-valign": "center ",
            "text-halign": "center",
            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },
        }
    },
    {
        selector: 'node[spanStatus = "UNSET"]',
        style: {
            "color": colors['UNSET'],
            "border-color": colors['UNSET'],
            "text-valign": "center ",
            "text-halign": "center",


            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },
        }
    },

    // edges

    { // default
        selector: 'edge',
        style: {
            "curve-style": "segments",
            "line-cap": "round",

            "target-arrow-shape": "vee",// options are 'tee' 'triangle' 'triangle-tee' 'triangle-cross' 'triangle-backcurve' 'vee' 'square' 'circle' 'diamond' 'none'
            "text-rotation": "autorotate",
            "text-margin-y": -15,
            // "text-margin-x": -10,
            "font-size": 8,
            "label": "data(label)",
            "color": "gray",
        }
    },
    {// service to service
        selector: 'edge[edgeType = "service"]',
        style: {
            //edge color SERVICE_HIGHWAY
            "line-color": colors['SERVICE_HIGHWAY'],
            "width": function (ele) {
                // find target node edge connected to,
                return ele.data("weight") * 20;
            },
            "target-arrow-shape": "none",
            "opacity": 0.5,
        }
    },
    {// service in/out
        selector: 'edge[edgeType *= "connector"]',
        style: {
            //edge color
            "line-color": function (ele) {
                // if edgetype connector-in, then color is colors SERVER  , out CLIENT, internal INTERNAL
                //edgeType: 'connector-out'
                if (ele.data('edgeType') === 'connector-in') {
                    return colors['SERVER']
                } else if (ele.data('edgeType') === 'connector-out') {
                    return colors['CLIENT']
                } else {
                    return colors['4']
                }

            },
            "width": function (ele) {
                // find target node edge connected to,
                return ele.data("weight") * 20;
            },
            // arrow target circle
            "target-arrow-shape": "none",

        }
    },
    // if spanstus is error on edge, change color to colors['ERROR'] and make the edge line based on weight but very thin
    {
        //, edgeType: "span", spanStatus: "ERROR"
        selector: 'edge[edgeType = "operation-span"]',
        style: {
            "line-color": function (ele) {
                // if [spanStatus = "ERROR"] then color is colors['ERROR']
                return ele.data('spanStatus') === 'ERROR' ? colors['ERROR'] : colors['UNSET'];
            },
            "width": function (ele) {
                return ele.data("weight") * 10;
            },
            // arrow target circle
            "target-arrow-shape": "none",

        }
    }, // similar for UNSET
    {
        //, edgeType: "span", spanStatus: "UNSET"
        selector: 'edge[edgeType = "operation-span"][spanStatus = "UNSET"]',
        style: {
            "line-color": colors['UNSET'],
            "width": function (ele) {
                return ele.data("weight") * 10;
            },
            // arrow target circle
            "target-arrow-shape": "none",
            //"curve-style": "straight-triangle",


        }
    },
    // edge type operation-span
    {
        selector: 'edge[edgeType = "operation"]',
        style: {
            "line-color": function (ele) {
                // if 'source'  contains 'in', then color is colors['SERVER']
                return ele.data('source').includes('in') ? colors['SERVER'] : colors['CLIENT'];
            },

            "target-arrow-shape": "none",
            "width": function (ele) {
                return ele.data("weight") * 40;
            },
            "opacity": 0.8,
            "border-width": function (ele) {
                return ele.data("weight") * 5;
            },
            "border-opacity": 0.5,

        }
    }

];

export const nodeSize = function (ele) {
    // node size minimum 5 characters wide font size 7
    // min weitght 1


    let weight = ele.data("weight");
    if (weight) {

        return weight * 30;
    }
    return 20;
}
