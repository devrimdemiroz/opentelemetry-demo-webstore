import {colorHub, colors, colorService, colorStatus} from "./colors";


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
    hub_compound_nodes(),
    hub2hub_compound_edges(),
    hubs2operations_edges(),
    operation_compound_nodes(),
    operation_nodes(),
    operations2spanLeafs_edges(),
    // TODO: unify for span leaf nodes
    spanLeaf_error_nodes(), spanLeaf_unset_nodes(),
    // Dynamic styles
    ucm_node(),
    ucm_first_node(),
    ucm_path(),
    ucm_last_edge(),
    traditional_trace_path()

];
function default_for_compound_nodes() {
    return  {
        selector: ':compound',
        style: {
            "background-color": function (ele) {
                return colorService(ele);
            },
            "background-opacity": 0.1,
            // "text-margin-y": function (ele) {
            //     return nodeSize(ele);
            // },
            "text-max-width": function (ele) {
                // compound node width ?
                return nodeSize(ele) * 2;
            },
            "text-wrap": "ellipsis",
            "border-opacity": 0,
            "shape": "round-rectangle",
            "font-size": function (ele) {
                return fontSize(nodeSize(ele)) * 0.8;
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
                return fontSize(nodeSize(ele));
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

function service_node_attached_label_edges() {
    return {
        selector: '.label-edge',
        style: {
            "curve-style": "haystack",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "segment-distances": "-20 20 -20",
            "segment-weights": "0.75",
            "edge-distances ": "node-position",
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele) / 5;
            },
            // no arrow
            "target-arrow-shape": "none",
            "mid-target-arrow-shape": "none",
            "line-color": function (ele) {
                return colorService(ele);
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
            "background-opacity": 0.7,
            // no border
            "border-width": 0,
            "shape": "round-rectangle",
            "color": "white",
            "background-color": function (ele) {
                return colorService(ele);
            },


            "width": function (ele) {
                // according to label text length
                return ele.data("label").length * 10;
            },
            "height": function (ele) {
                return fontSize(nodeSize(ele));
            },
            "font-size": function (ele) {
                return fontSize(nodeSize(ele)) * 0.8;
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

function hub_compound_nodes() {
    return {
        selector: '.hub-compound',
        style: {
            // full transparent background
            "background-color": function (ele) {
                return colorHub(ele);
            },
            "background-opacity": 0.1,
            "border-color": function (ele) {
                return colors['gray'];
            },
            "border-width": 1,
            "border-style": "dashed",
            "border-opacity": 1,
        }
    }
}

function hub_nodes() {
    return {
        selector: '.hub-node',
        style: {
            "border-color": function (ele) {
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
        selector: '.node-operation',
        style: {
            "border-color": function (ele) {
                return colorService(ele);
            },


            "border-opacity": 0.7,
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
                return colorService(ele);
            },
            "border-color": function (ele) {
                return colorService(ele);
            },
            "border-width": 0.1,
            "border-opacity": 0.6,
            "background-opacity": 0.1,

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
            "curve-style": "bezier",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "line-cap": "round",
            "opacity": 0.5,

            "text-rotation": "autorotate",
            "text-margin-y": -15,
            // "text-margin-x": -10,
            "font-size": function (ele) {
                return edgeWidth(ele) * 0.5;
            },
            "label": "data(label)",
            "color": colors['SERVICE_HIGHWAY'],
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
            //"target-arrow-shape": "none",
            "target-arrow-shape": "vee",
            "target-arrow-color": 'white',
            "target-arrow-scale": 0.3,

        }
    };
}

function service2service_edges() {
    return {// service to service
        selector: 'edge[edgeType = "service"]',
        style: {
            "line-color": colors['SERVICE_HIGHWAY'],
            "opacity": 0.6,
            "curve-style": "straight",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "line-cap": "round",
        }
    };
}

function service2hubs_edges() {
    return {// service in/out
        selector: '.service2hubs_edges',
        style: {
            //edge color
            "line-color": function (ele) {
                return colorService(ele);

            },
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele);
            },
            "border-width": function (ele) {
                return edgeWidth(ele) / 3;
            },
            "opacity": 0.3,

            // arrow target circle
            "target-arrow-shape": "none",
            "curve-style": "straight",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "line-cap": "square",// options: butt, round, square
        }
    };
}

function hub2hub_compound_edges() {
    return {// service in/out
        selector: '.hub2hub_compound_edges',
        style: {
            //edge color
            "line-color": function (ele) {
                //edgeType: 'connector-out'
                return colors['gray'];

            },
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele);
            },
            "border-width": function (ele) {
                return edgeWidth(ele) / 3;
            },
            "opacity": 0.6,
            "curve-style": "straight",//options: segments, bezier, unbundled-bezier, segments, haystack straight - the default curve
            "source-endpoint": "outside-to-line",
            "target-endpoint": "outside-to-line",
            "line-cap": "square",// options: butt, round, square
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
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele) / 3;
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
        style: {}
    };
}


function ucm_node() {
    return {
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
    };
}

function ucm_first_node() {
    return {
        selector: '.ucmFirstNode',
        style: {
            "border-color": "black",
            "border-style": "solid",

        }
    };
}

function ucm_path() {
    return {
        selector: '.ucmPath',
        style: {
            "curve-style": "straight-triangle",// options: haystack, bezier, unbundled-bezier, segments, haystack
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
                return edgeWidth(ele) * 0.5;
            },
            "label": "data(label)",

            "border-width": function (ele) {
                return edgeWidth(ele) * 0.7;
            },
            "border-opacity": 0.5,
            "arrow-scale": 1.3,
            "mid-target-arrow-color": "black",
            "z-index": "999",
        }
    };
}

function ucm_last_edge() {
    return {
        selector: '.ucmLastEdge',
        style: {
            "target-arrow-shape": "tee", // options:
        }
    };
}

function traditional_trace_path() {
    return {
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
                return edgeWidth(ele) * 0.5;
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
    };
}


function fontSize(size) {
    return size * 0.33;
}
export const nodeSize = function (ele) {
    let weight = 0.1;
    const baseSize = 60;
    const scaleExponent = 2;

    if (ele.data("weight")) {
        weight = ele.data("weight");
    }

    // Create a custom logarithmic scale function
    const logScale = (value, minValue, maxValue, minResult, maxResult) => {
        const logMinValue = Math.log(minValue);
        const logMaxValue = Math.log(maxValue);
        const scale = (Math.log(value) - logMinValue) / (logMaxValue - logMinValue);

        return minResult + scale * (maxResult - minResult);
    };

    const scaledWeight = logScale(weight, 1, 100, 1, scaleExponent); // Adjust the domain and range according to the range of weights in your dataset and desired node size
    // Check if the calculated size is valid, if not, return a default value
    if (isNaN(scaledWeight) || scaledWeight <= 0) {
        return baseSize;
    }
    return baseSize * scaledWeight;
};


export const edgeWidth = function (ele) {
    let calculatedWeight = 0.1;
    const baseWidth = 40;
    const scaleExponent = 2;

    if (ele.source().data("weight") && ele.target().data("weight")) {
        let sourceWeight = ele.source().data("weight");
        let targetWeight = ele.target().data("weight");

        calculatedWeight = Math.min(sourceWeight, targetWeight);
    } else if (ele.data("weight")) {
        calculatedWeight = ele.data("weight");
    } else {
        return 1;
    }

    const logScale = (value, minValue, maxValue, minResult, maxResult) => {
        const logMinValue = Math.log(minValue);
        const logMaxValue = Math.log(maxValue);
        const scale = (Math.log(value) - logMinValue) / (logMaxValue - logMinValue);

        return minResult + scale * (maxResult - minResult);
    };

    const scaledWeight = logScale(calculatedWeight, 1, 100, 1, scaleExponent); // Adjust the domain and range according to the range of weights in your dataset and desired edge width
    // Check if the calculated size is valid, if not, return a default value
    if (isNaN(scaledWeight) || scaledWeight <= 0) {
        return baseWidth;
    }
    return baseWidth * scaledWeight;
};


