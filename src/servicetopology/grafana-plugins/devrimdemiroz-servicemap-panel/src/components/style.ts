import {colors} from "./colors";

export const cyStyle =  [
    {
        selector: 'node',
        style: {
            "border-color": "black",
            "border-width": 1,
            "border-style": "solid",
            "font-size": 5,
            "color" : "gray",
            //'compound-sizing-wrt-labels': 'include',
          //  "background-opacity": 0.3,
            "text-wrap" : "ellipsis",
            "label": "data(label)",
        },
    },
    {
        selector:  'node[nodeType = "service"]' ,
        style: {
            "background-color" : "white",
            "border-color": colors['COMPOUND'],
            "text-valign": "center", // default
            "text-halign": "center", // default
            "font-size": 7,
            "color" : "black",
            "width": 20,
            "height": 20,
        }
    },
    {
        selector:  'node[nodeType = "operation"]' ,
        style: {
            "background-color" : "white",
            "background-opacity": 0.7,
            "text-valign": "bottom",
            "text-halign": "center",
            "text-wrap" : "ellipsis",
            "label": "",

            "width": 10,
            "height": 10,

        }
    },

    {
        selector:  'node[spanStatus = "ERROR"]' ,
        style: {
            "color" : colors['ERROR'],
            "border-color": colors['ERROR'],
            "text-valign": "top",
            "width": 5,
            "height": 5,
        }
    },
    {
        selector:  'node[spanStatus = "UNSET"]' ,
        style: {
            "color" : colors['UNSET'],
            "border-color": colors['UNSET'],
            "text-valign": "top",
            "width": 5,
            "height": 5,
        }
    },

    {
        selector:  'node[spanKind = "CLIENT"]' ,
        style: {
            "background-color" : colors['CLIENT'],
        }
    },
    {
        selector:  'node[spanKind = "SERVER"]' ,
        style: {
            "background-color" : colors['SERVER'],
        }
    },
    {
        selector: ':compound',
        style:{
            "background-opacity": 0.333,
            "text-valign": "bottom",
            "text-margin-y": "10px",
            "text-wrap" : "wrap",// options
            "border-opacity": 0,

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
            "color" : "gray",
        }
    },
    {// service to service
        selector: 'edge[edgeType = "service"]',
        style: {
            //edge color
            "line-color": colors['COMPOUND'],
        }
        }

];
