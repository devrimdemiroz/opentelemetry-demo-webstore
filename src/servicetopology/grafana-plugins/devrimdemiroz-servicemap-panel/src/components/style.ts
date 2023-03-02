import {colors} from "./colors";

function getColorSpanKind(ele) {
    if (ele.data('spanKind') === 'SERVER') {
        return colors['SERVER']
    } else if (ele.data('spanKind') === 'CLIENT' ) {
        return colors['CLIENT']
    } else {
        return colors['INTERNAL']
    }
}

function getColorStatus(ele) {
    if (ele.data('spanStatus') === 'ERROR') {
        return colors['ERROR'];
    } else if (ele.data('spanStatus') === 'UNSET') {
        return colors['UNSET'];
    }
    return "";
}

function getColorConnector(ele) {
    if (ele.data('edgeType') === 'connector-in') {
        return colors['SERVER']
    } else if (ele.data('edgeType') === 'connector-out') {
        return colors['CLIENT']
    } else {
        return colors['INTERNAL']
    }
}

function getServiceColor(ele) {
    // if compound is a service, get colors according to service name if defined in colors, otherwise use default color
    if (ele.data('nodeType') === 'serviceCompound') {
        // colors[ele.data('label')] if defined
        if (colors[ele.data('label')]) {
            return colors[ele.data('label')];
        }
    }
    return "gray";
}

export const cyStyle = [
    {
        selector: 'node',
        style: {
            "background-color": "white",
            "border-color": "black",
            "font-size": function (ele) {
                return nodeSize(ele) / 3;
            },
            "color": "black",
            //'compound-sizing-wrt-labels': 'include',
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
    },

    {
        selector: ':compound',
        style: {
            "background-color": function (ele) {
                return getServiceColor(ele);
            },
            "background-opacity": 0.1,
            "text-margin-y": function (ele) {
                if (ele.data('nodeType') === 'serviceCompound') {
                    return -(nodeSize(ele));
                }
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
                return getServiceColor(ele);
            },
            "text-valign": function (ele) {
                if (ele.data('nodeType') === 'serviceCompound') {
                    return 'bottom';
                }
                return 'bottom';
            },
        } // moon crescent

    },
    {
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
                return getServiceColor(ele);
            },
            "text-wrap": "wrap",
            'text-valign': 'center',
            'text-halign': 'center',
        }
    },

    {
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
            "text-halign": "center", // default
            "color": "black",


        }
    },

    {
        selector: 'node[nodeType *= "connector"]',
        style: {
            "border-color": function (ele) {
                // if id contains 'in', then color is colors['SERVER']
                if (ele.data('nodeType') === 'connector-in') {
                    return colors['SERVER']
                } else if (ele.data('nodeType') === 'connector-out') {
                    return colors['CLIENT']
                } else  {
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
    },

    {
        selector: 'node[nodeType = "operation"]',
        style: {
            "border-color": function (ele) {
                return getColorSpanKind(ele);
            },


            "border-opacity": 0.5,
            "opacity": 0.5,
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
        selector: 'node[nodeType = "operation-compound"]',
        style: {
            "background-color": function (ele) {
                // if spankind SERVER, then color is colors['SERVER']
                return getColorSpanKind(ele);
            },
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
                return edgeWidth(ele)  +  0.6;
            },
            "border-width": function (ele) {
                return edgeWidth(ele) /2;
            },
            "border-opacity": 0.5,
            "mid-target-arrow-shape": "vee", // options:
            "arrow-scale": 0.3,
            "mid-target-arrow-color": "white",
            "target-arrow-shape": "none",


        }
    },
    {// service to service
        selector: 'edge[edgeType = "service"]',
        style: {
            //edge color SERVICE_HIGHWAY
            "line-color": colors['SERVICE_HIGHWAY'],

        }
    },
    {// service in/out
        selector: 'edge[edgeType *= "connector"]',
        style: {
            //edge color
            "line-color": function (ele) {
                // if edgetype connector-in, then color is colors SERVER  , out CLIENT, internal INTERNAL
                //edgeType: 'connector-out'
                return getColorConnector(ele);

            },
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele)  +  0.4;
            },
            "border-width": function (ele) {
                return edgeWidth(ele) /3;
            },

            // arrow target circle
            "target-arrow-shape": "none",


        }
    },
    // if spanstus is error on edge, change color to colors['ERROR'] and make the edge line based on weight but very thin
    {
        //, edgeType: "span", spanStatus: "ERROR" or UNSET
        selector: 'edge[edgeType = "operation-span"]',
        style: {
            "line-color": function (ele) {
                return getColorStatus(ele);
            },

            // arrow target circle
            "target-arrow-shape": "none",
            "mid-target-arrow-shape": "none", // options:
            "curve-style": "straight-triangle",


        },
    },
    {
        selector: 'edge[edgeType = "span"]',
        style: {
            "line-color": colors['span'],

            // arrow target circle
            "target-arrow-shape": "none",


        },
    },
    // edge type operation-span
    {
        selector: 'edge[edgeType = "operation"]',
        style: {
            "line-color": function (ele) {
                // if 'source'  contains 'in', then color is colors['SERVER']
                return ele.data('source').includes('in') ? colors['SERVER'] : colors['CLIENT'];
            },


        }
    },
    // Dynamic styles

    {
        selector: '.tracePath',
        style: {
            "background-color": colors['highlighted'],
            "line-color": "black",
            "transition-property": "background-color, line-color, target-arrow-color",
            "width": function (ele) {
                // find target node edge connected to,
                return edgeWidth(ele) / 4;
            }
        }
    }

];

export const nodeSize = function (ele) {
    // node size minimum 5 characters wide font size 7
    // min weitght 1


    let weight = ele.data("weight");
    if (weight) {

        return weight * 46;
    }
    return 20;
}

export const edgeWidth = function (ele) {
    // get source and target node if present
    let sourceWeight = ele.source().data("weight");
    let targetWeight = ele.target().data("weight");
    if (targetWeight < sourceWeight) {
        return targetWeight * 50;
    } else {
        return sourceWeight * 50;
    }


    let weight = ele.data("weight");
    if (weight) {

        return weight * 15;
    }
    return 10;
}
