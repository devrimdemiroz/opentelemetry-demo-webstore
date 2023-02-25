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
        },
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
            "border-color": colors['COMPOUND'],
            "text-valign": "center", // default
            "text-halign": "center", // default
            "font-size": 7,
            "color": "black",
            "width": function (ele) {
                return nodeSize(ele);
            } ,
            "height": function (ele) {
                return nodeSize(ele);
            } ,
        }
    },
    {
        selector: 'node[nodeType = "operation"]',
        style: {
            "background-color": "white",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "ellipsis",
            "label": "data(weight)",

            "width": function (ele) {
                return nodeSize(ele);
            } ,
            "height": function (ele) {
                return nodeSize(ele);
            } ,

        }
    },
    {
        selector: 'node[nodeType *= "connector"]',
        style: {
            "border-color": colors['10'],
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "white",
            "width": function (ele) {
                return nodeSize(ele);
            } ,
            "height": function (ele) {
                return nodeSize(ele);
            } ,
            "label": "data(weight)",
            "border-color": colors['COMPOUND'],
        }
    }
    ,
    {
        selector: 'node[spanStatus = "ERROR"]',
        style: {
            "color": colors['ERROR'],
            "border-color": colors['ERROR'],
            "text-valign": "top",
            "width": function (ele) {
                return nodeSize(ele);
            } ,
            "height": function (ele) {
                return nodeSize(ele);
            } ,
        }
    },
    {
        selector: 'node[spanStatus = "UNSET"]',
        style: {
            "color": colors['UNSET'],
            "border-color": colors['UNSET'],
            "text-valign": "top",
            "width": function (ele) {
                return nodeSize(ele);
            } ,
            "height": function (ele) {
                return nodeSize(ele);
            } ,
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
    // edges

    { // default
        selector: 'edge',
        style: {
            "curve-style": "bezier",
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
            //edge color
            "line-color": colors['COMPOUND'],
        }
    },
    {// service in/out
        selector: 'edge[edgeType *= "connector"]',
        style: {
            // no target arrow
            "target-arrow-shape": "vee",
            // thin line
            "width": 3,
            //edge color
            "line-color": colors['COMPOUND'],
        }
    }

];

export const nodeSize = function (ele) {
    let weight = ele.data("weight");
    if (weight) {
        return weight * 40;
    }
    return 10;
}
