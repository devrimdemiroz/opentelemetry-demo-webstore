import {colorConnector, colors, colorService, colorSpanKind, colorStatus} from "./colors";


function default_for_compound_nodes() {
    return  {
        selector: ':compound',
        style: {
            "background-color": function (ele) {
                return colorService(ele);
            },
            "background-opacity": 0.1,
            "text-margin-y": function (ele) {
                return nodeSize(ele);
            },
            "text-max-width": function (ele) {
                // compound node width ?
                return nodeSize(ele) * 7;
            },
            "text-wrap": "ellipsis",
            "border-opacity": 0,
            "shape": "round-rectangle",
            "font-size": function (ele) {
                return nodeSize(ele) * 0.7;
            },
            "color": function (ele) {
                return colorService(ele);
            },
            "text-valign": "bottom",
        } // moon crescent

    };
}

function compound_nodes_when_collapsed() {
    return {
        selector: '.cy-expand-collapse-collapsed-node',
        style: {
            'label': function (ele) {
                // 'data(weight)'+ newline + 'data(label)',
                // multiline label
                let newLabel = ele.data('weight');
                newLabel += '\n';
                newLabel += ele.data('label');
                return newLabel;


            },
            "background-color": "white",
            "border-color": function (ele) {
                return colorService(ele);
            },
            "text-wrap": "wrap",
            'text-valign': 'center',
            'text-halign': 'center',
        }
    };
}

function default_for_nodes() {
    return {
        selector: 'node',
        style: {
            "background-color": "white",
            "border-color": "black",
            "font-size": function (ele) {
                return nodeSize(ele) / 3;
            },
            "color": "black", // default color
            "background-opacity": 0.8,
            "text-wrap": "ellipsis",
            "label": "data(label)",
            "border-width": function (ele) {
                return nodeSize(ele) / 4;
            },
            "border-opacity": 0.5,
            "width": function (ele) {
                return nodeSize(ele);
            },
            "height": function (ele) {
                return nodeSize(ele);
            },


        }
    };
}

function service_node_attached_label_nodes() {
    return { // node type label rectangle with invisible border and invisible/transparent background
        // font with same compound color size according to node size
        selector: '.label-node',
        style: {
            "opacity": 1,
            "background-opacity": 0,
            "border-opacity": 0,
            "font-size": function (ele) {
                let fontSize = nodeSize(ele) * 0.7;
                if (fontSize < 10) {
                    fontSize = 10;
                }
                return fontSize;
            },
            "color": function (ele) {
                return colorService(ele);
            },
            "text-valign": "center",

        }

    };
}

function service_nodes() {
    return {
        selector: 'node[nodeType = "service"]',
        style: {
            "background-color": "white",
            "border-color": function (ele) {
                if (colors[ele.data('id')]) {
                    return colors[ele.data('id')];
                }
                return colors['SERVICE_HIGHWAY']
            },
            "border-opacity": 0.5,
            "text-valign": "center", // default
            "color": "black",


        }
    };
}

function hub_nodes() {
    return {
        selector: 'node[nodeType *= "connector"]',
        style: {
            "border-color": function (ele) {
                // if id contains 'in', then color is colors['SERVER']
                if (ele.data('nodeType') === 'connector-in') {
                    return colors['SERVER']
                } else if (ele.data('nodeType') === 'connector-out') {
                    return colors['CLIENT']
                } else {
                    return colors['INTERNAL']
                }
                return colors['gray'];

            },
            "border-width": function (ele) {
                return nodeSize(ele) / 5;
            },
            "border-opacity": 0.5,
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "white",
            "width": function (ele) {
                return nodeSize(ele) * 0.9;
            },
            "height": function (ele) {
                return nodeSize(ele) * 0.9;
            },
            "label": "data(weight)",
        }
    };
}

function operation_nodes() {
    return {
        selector: 'node[nodeType = "operation"]',
        style: {
            "border-color": function (ele) {
                return colorSpanKind(ele);
            },


            "border-opacity": 0.5,
            "opacity": 0.9,
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
    };
}

function operation_compound_nodes() {
    return {
        selector: 'node[nodeType = "operation-compound"]',
        style: {
            "background-color": function (ele) {
                return colorSpanKind(ele);
            },
            "background-opacity": 0.2,
        }
    };
}

function service_compound_nodes() {
    return {
        selector: 'node[nodeType = "service-compound"]',
        style: {
            // make label invisible
            "label": "",

        }
    };
}

function spanLeaf_error_nodes() {
    return {
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
    };
}

function spanLeaf_unset_nodes() {
    return {
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
    };
}

function default_for_edges() {
    return { // default
        selector: 'edge',
        style: {
            "curve-style": "haystack",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "line-cap": "round",
            "opacity": 0.5,

            "text-rotation": "autorotate",
            "text-margin-y": -15,
            // "text-margin-x": -10,
            "font-size": function (ele) {
                return edgeWidth(ele) * 0.7;
            },
            "label": "data(label)",
            "color": "gray",
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele);
            },
            "border-width": function (ele) {
                return edgeWidth(ele) / 2;
            },
            "border-opacity": 0.5,
            "mid-target-arrow-shape": "vee", // options:
            "arrow-scale": 0.3,
            "mid-target-arrow-color": "white",
            "target-arrow-shape": "none",


        }
    };
}

function service2service_edges() {
    return {// service to service
        selector: 'edge[edgeType = "service"]',
        style: {
            //edge color SERVICE_HIGHWAY
            "line-color": colors['SERVICE_HIGHWAY'],
            "opacity": 0.6,

        }
    };
}

function service2hubs_edges() {
    return {// service in/out
        selector: 'edge[edgeType *= "connector"]',
        style: {
            //edge color
            "line-color": function (ele) {
                // if edgetype connector-in, then color is colors SERVER  , out CLIENT, internal INTERNAL
                //edgeType: 'connector-out'
                return colorConnector(ele);

            },
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele);
            },
            "border-width": function (ele) {
                return edgeWidth(ele) / 3;
            },

            // arrow target circle
            "target-arrow-shape": "none",


        }
    };
}

function operations2spanLeafs_edges() {
    return {
        //, edgeType: "span", spanStatus: "ERROR" or UNSET
        selector: 'edge[edgeType = "operation-span"]',
        style: {
            "line-color": function (ele) {
                return colorStatus(ele);
            },

            // arrow target circle
            "target-arrow-shape": "none",
            "mid-target-arrow-shape": "none", // options:
            "curve-style": "haystack",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve


        },
    };
}

function hubs2operations_edges() {
    return {
        selector: 'edge[edgeType = "operation"]',
        style: {
            "line-color": function (ele) {
                // if 'source'  contains 'in', then color is colors['SERVER']
                return ele.data('source').includes('in') ? colors['SERVER'] : colors['CLIENT'];
            },


        }
    };
}

function service_node_attached_label_edges() {
    return {
        selector: '.label-edge',
        style: {
            "curve-style": "segments",
            "width": 1,

        }
    };
}

export const cyStyle = [
    default_for_nodes(),

    default_for_compound_nodes(),
    compound_nodes_when_collapsed(),

    default_for_edges(),

    service_compound_nodes(),
    service_nodes(),
            service_node_attached_label_edges(),
            service_node_attached_label_nodes(),
    service2service_edges(),// SERVICE_HIGHWAY
            service2hubs_edges(),
                hub_nodes(),
                    hubs2operations_edges(),
                        operation_compound_nodes(),
                        operation_nodes(),
                            operations2spanLeafs_edges(),
                                // TODO: unify for span leaf nodes
                                spanLeaf_error_nodes(), spanLeaf_unset_nodes(),
    // Dynamic styles
    {
        selector: '.ucmNode',
        style: {
            //"border-color": "black",
            "border-opacity": 0.9,
            "border-width": function (ele) {
                return nodeSize(ele) * 0.3;
            },
            "width": function (ele) {
                return nodeSize(ele) * 1.1;
            },
            "height": function (ele) {
                return nodeSize(ele) * 1.1;
            },


        }
    },
    {
        selector: '.ucmFirstNode',
        style: {
            "border-color": "black",
            "border-style": "solid",

        }
    },

    {
        selector: '.ucmPath',
        style: {
            // "curve-style": "unbundled-bezier",// options: haystack, bezier, unbundled-bezier, segments, haystack
            "mid-target-arrow-shape": "triangle", // options:
            "background-color": colors['highlighted'],
            "line-color": "black",
            "transition-property": "background-color, line-color, target-arrow-color",
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele) * 0.2;
            },

            "line-cap": "round",
            "opacity": 1,

            "text-rotation": "autorotate",
            "text-margin-y": -15,
            // "text-margin-x": -10,
            "font-size": function (ele) {
                return edgeWidth(ele) * 0.7;
            },
            "label": "data(label)",

            "border-width": function (ele) {
                return edgeWidth(ele) * 0.7;
            },
            "border-opacity": 0.5,
            "arrow-scale": 1.3,
            "mid-target-arrow-color": "black",
            "z-index": "999",
            "inside-to-node": "true",
        }
    },
    {
        selector: '.ucmLastEdge',
        style: {
            "target-arrow-shape": "tee", // options:
        }
    },
    {
        selector: '.traditionalPath',
        style: {
            "background-color": "black",
            "line-color": "black",
            "target-arrow-shape": "vee",//
            "curve-style": "straight",
            "line-cap": "butt",// options: butt, round, square

            "text-rotation": "autorotate",
            "text-margin-y": -15,
            // "text-margin-x": -10,
            "font-size": function (ele) {
                return edgeWidth(ele) * 0.7;
            },
            "label": function (ele) {
                return ele.data('label') + " ms";
            },
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele) / 5;
            },
            "border-width": function (ele) {
                return edgeWidth(ele) / 5;
            },
            "border-opacity": 0,
            "mid-target-arrow-shape": "none", // options:
            "arrow-scale": 1,
            "target-arrow-color": "black",
        }
    }

];

export const nodeSize = function (ele) {
    if (ele.data("weight")) {
        return ele.data("weight") * 50;
    }
    return 10;
}

export const edgeWidth = function (ele) {
    if (ele.source().data("weight") && ele.target().data("weight")){

        let sourceWeight = ele.source().data("weight");
        let targetWeight = ele.target().data("weight");
        if (targetWeight < sourceWeight) {
            return targetWeight * 50;
        } else {
            return sourceWeight * 50;
        }
    }

    if (ele.data("weight")) {
        return ele.data("weight") * 15;
    }
    return 1;
}


