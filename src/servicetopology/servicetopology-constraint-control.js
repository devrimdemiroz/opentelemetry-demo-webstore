// define default stylesheet
let defaultStylesheet = [
    {
        selector: 'node',
        style: {
            'background-color': '#bdd3d4',
            'label': 'data(id)',
            'text-valign': 'center',
            'background-opacity': 0.7
        }
    },

    {
        selector: ':parent',
        style: {
//      'background-opacity': 0.333,
            'background-color': '#e8e8e8',
            'border-color': '#DADADA',
//      'border-width': 3,
            'text-valign': 'bottom'
        }
    },

    {
        selector: 'edge',
        style: {
            'curve-style': 'straight',
            'line-color': '#bdd3d4'
        }
    },

    {
        selector: 'node:selected',
        style: {
            'background-color': '#33ff00',
            'border-color': '#22ee00'
        }
    },

    {
        selector: 'node.fixed',
        style: {
            'shape': 'diamond',
            'background-color': '#9D9696',
        }
    },

    {
        selector: 'node.fixed:selected',
        style: {
            'background-color': '#33ff00',
        }
    },

    {
        selector: 'node.alignment',
        style: {
            'shape': 'round-heptagon',
            'background-color': '#fef2d1',
        }
    },

    {
        selector: 'node.alignment:selected',
        style: {
            'background-color': '#33ff00',
        }
    },

    {
        selector: 'node.relative',
        style: {
            'shape': 'rectangle',
            'background-color': '#fed3d1',
        }
    },

    {
        selector: 'node.relative:selected',
        style: {
            'background-color': '#33ff00',
        }
    },

    {
        selector: 'edge:selected',
        style: {
            'line-color': '#33ff00'
        }
    }
];


let cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    ready: function () {
        let layoutUtilities = this.layoutUtilities({
            desiredAspectRatio: this.width() / this.height()
        });

        this.nodes().forEach(function (node) {
            let size = Math.random() * 40 + 30;
            node.css("width", size);
            node.css("height", size);
        });

        let initialLayout = this.layout({name: 'fcose', step: 'all', animationEasing: 'ease-out'});
        initialLayout.pon('layoutstart').then(function (event) {
            constraints.fixedNodeConstraint = JSON.parse(JSON.stringify(sample1_constraints.fixedNodeConstraint));
            clearConstraintListTable();
            fillConstraintListTableFromConstraints();
        });
        initialLayout.run();
    },
    layout: {name: 'preset'},
    style: defaultStylesheet,
    elements: {
        nodes: [
            {data: {id: 'n1'}},
            {data: {id: 'n2'}},
            {data: {id: 'n3', parent: 'n8'}},
            {data: {id: 'n5'}},
            {data: {id: 'n6', parent: 'n8'}},
            {data: {id: 'n7', parent: 'n8'}},
            {data: {id: 'n8'}},
            {data: {id: 'f1'}, classes: ['fixed']},
            {data: {id: 'f2'}, classes: ['fixed']},
            {data: {id: 'f3', parent: 'n8'}, classes: ['fixed']},
        ],
        edges: [
            {data: {source: 'n1', target: 'f1'}},
            {data: {source: 'n1', target: 'n3'}},
            {data: {source: 'f1', target: 'n2'}},
            {data: {source: 'f1', target: 'n3'}},
            {data: {source: 'n3', target: 'f2'}},
            {data: {source: 'f2', target: 'n5'}},
            {data: {source: 'n5', target: 'n8'}},
            {data: {source: 'n6', target: 'n3'}},
            {data: {source: 'n6', target: 'n7'}},
            {data: {source: 'n6', target: 'f3'}}
        ]
    },
    wheelSensitivity: 0.3
});

let constraints = {
    fixedNodeConstraint: undefined,
    alignmentConstraint: undefined,
    relativePlacementConstraint: undefined
};

// Handle Menu ------------------------------------------

// Graph file input
document.getElementById("openFile").addEventListener("click", function () {
    document.getElementById("inputFile").click();
});

$("body").on("change", "#inputFile", function (e, fileObject) {
    var inputFile = this.files[0] || fileObject;

    if (inputFile) {
        var fileExtension = inputFile.name.split('.').pop();
        var r = new FileReader();
        r.onload = function (e) {
            cy.remove(cy.elements());
            var content = e.target.result;
            if (fileExtension == "graphml" || fileExtension == "xml") {
                cy.graphml({layoutBy: 'null'});
                cy.graphml(content);
//        updateGraphStyle();
            } else if (fileExtension == "json") {
                cy.json({elements: JSON.parse(content)});
//        updateGraphStyle();
            } else {
                var tsv = cy.tsv();
                tsv.importTo(content);
            }
        };
        r.addEventListener('loadend', function () {
            onLoad();
            clearConstraintListTable();
            constraints.fixedNodeConstraint = undefined;
            constraints.alignmentConstraint = undefined;
            constraints.relativePlacementConstraint = undefined;

            document.getElementById("nodeList").addEventListener("change", function () {
                document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
                document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
            });


        });
        r.readAsText(inputFile);
    } else {
        alert("Failed to load file");
    }
    $("#inputFile").val(null);
});

let updateGraphStyle = function () {
    cy.nodes().forEach(function (node) {
        node.style({
            'background-image': node.data('background-image'),
            'width': node.data('bbox').w,
            'height': node.data('bbox').h,
            "border-width": node.data('border-width'),
            "border-color": node.data('border-color'),
            "background-color": node.data('background-color'),
            "background-opacity": node.data('background-opacity'),
            "background-fit": "cover",
            "background-position-x": "50%",
            "background-position-y": "50%",
            "text-wrap": "wrap",
            "font-size": node.data('font-size'),
            "color": node.data('color')
        });

        if (node.data('label')) {
            node.style({
                'label': node.data('label')
            });
        }
    });

    cy.edges().forEach(function (edge) {
        edge.style({
            'width': edge.data('width'),
            "line-color": edge.data('line-color')
        });
    });
};

$("body").on("change", "#inputConstraint", function (e, fileObject) {
    var inputFile = this.files[0] || fileObject;

    if (inputFile) {
        var fileExtension = inputFile.name.split('.').pop();
        var r = new FileReader();
        r.onload = function (e) {
            var content = e.target.result;
            if (fileExtension == "json") {
                constraints.fixedNodeConstraint = undefined;
                constraints.alignmentConstraint = undefined;
                constraints.relativePlacementConstraint = undefined;
                let constraintObject = JSON.parse(content);
                if (constraintObject.fixedNodeConstraint)
                    constraints.fixedNodeConstraint = constraintObject.fixedNodeConstraint;
                if (constraintObject.alignmentConstraint)
                    constraints.alignmentConstraint = constraintObject.alignmentConstraint;
                if (constraintObject.relativePlacementConstraint)
                    constraints.relativePlacementConstraint = constraintObject.relativePlacementConstraint;
                clearConstraintListTable();
                fillConstraintListTableFromConstraints();
            }
        };
        r.addEventListener('loadend', function () {
        });
        r.readAsText(inputFile);
    } else {
        alert("Failed to load file");
    }
    $("#inputFile").val(null);
});

document.getElementById("exportConstraint").addEventListener("click", function () {
    let constraintString = JSON.stringify(constraints, null, 2);
    download('constraint.json', constraintString);
});

let download = function (filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
};


// Sample File Changer
let sampleFileNames = {};

document.getElementById("sample").addEventListener("change", function () {
    cy.startBatch();
    cy.elements().remove();
    cy.style().clear();

    var selectionObject = document.getElementById("sample");

    var selected = selectionObject.options[selectionObject.selectedIndex].index;

    if (selected == 1) {
        cy.add(elements3);
        applyPostLoadOperations(selected);
    } else if (selected == 2) {
        queryServiceGraph();
        queryTraceMetrics();
        serviceLevelGraph();
        applyPostLoadOperations(selected);
    }

    function applyPostLoadOperations(selected) {
        cy.nodes().forEach(function (node) {
            let size = Math.random() * 40 + 30;
            node.css("width", size);
            node.css("height", size);
        });
        cy.style(defaultStylesheet);

        clearConstraintListTable();
        constraints.fixedNodeConstraint = undefined;
        constraints.alignmentConstraint = undefined;
        constraints.relativePlacementConstraint = undefined;


    }

    let json = sampleFileNames[selectionObject.value];
    cy.json(json);
    cy.nodes().forEach(function (node) {
        node.style({
            'width': 90,
            'height': 50,
            "border-width": node.data('border-width'),
//            "border-color": node.data('border-color'),
        });

        if (node.data('class') === 'process' || node.data('class') === 'association' || node.data('class') === "dissociation") {
            node.style({
                'background-color': node.data('background-color'),
                'background-opacity': 0.3
            });
        } else {
            node.style({
                'background-image': node.data('background-image'),
//              'background-color': node.data('background-color'),
                'background-opacity': node.data('background-opacity'),
                'background-fit': 'contain',
                'background-position-x': '50%',
                'background-position-y': '50%',
            });
        }

        if (node.data('label')) {
            node.style({
                'label': node.data('label'),
                'text-wrap': 'wrap',
                'font-size': node.data('font-size'),
                'color': node.data('color')
            });
        }
    });


    clearConstraintListTable();
    fillConstraintListTableFromConstraints();

    cy.endBatch();

    let finalOptions = Object.assign({}, options);
    finalOptions.step = "all";
    cy.layout(finalOptions).run();
    onLoad();

    document.getElementById("nodeList").addEventListener("change", function () {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
});

// Layout buttons

let options = {
    name: 'fcose',
    quality: "default",
    randomize: true,
    animate: true,
    animationDuration: 1000,
    animationEasing: undefined,
    fit: true,
    padding: 30,
    nestingFactor: 0.1,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0
};

// Randomize
document.getElementById("randomizeButton").addEventListener("click", function () {
    var layout = cy.layout({
        name: 'random',
        animate: true
    });

    layout.run();
});

// Fcose
document.getElementById("fcoseButton").addEventListener("click", function () {
    let finalOptions = Object.assign({}, options);
    finalOptions.step = "all";
    finalOptions.randomize = !(document.getElementById("incremental").checked);


    finalOptions.fixedNodeConstraint = constraints.fixedNodeConstraint ? constraints.fixedNodeConstraint : undefined;
    finalOptions.alignmentConstraint = constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined;
    finalOptions.relativePlacementConstraint = constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined;
    let layout = cy.layout(finalOptions);
    layout.one("layoutstop", function (event) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
    cy.layoutUtilities("get").setOption("randomize", finalOptions.randomize);
//  let start = performance.now();
    layout.run();
//  console.log((performance.now() - start) + " ms" );
});

// Draft
document.getElementById("draftButton").addEventListener("click", function () {
    let finalOptions = Object.assign({}, options);
    finalOptions.quality = "draft";
    finalOptions.fixedNodeConstraint = constraints.fixedNodeConstraint ? constraints.fixedNodeConstraint : undefined;
    finalOptions.alignmentConstraint = constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined;
    finalOptions.relativePlacementConstraint = constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined;
    let layout = cy.layout(finalOptions);
    layout.one("layoutstop", function (event) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
    cy.layoutUtilities("get").setOption("randomize", true);
    layout.run();
});

// Transform
document.getElementById("transformButton").addEventListener("click", function () {
    let finalOptions = Object.assign({}, options);
    finalOptions.step = "transformed";
    finalOptions.fixedNodeConstraint = constraints.fixedNodeConstraint ? constraints.fixedNodeConstraint : undefined;
    finalOptions.alignmentConstraint = constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined;
    finalOptions.relativePlacementConstraint = constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined;

    let layout = cy.layout(finalOptions);
    layout.one("layoutstop", function (event) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
    layout.run();
});

// Enforce
document.getElementById("enforceButton").addEventListener("click", function () {
    let finalOptions = Object.assign({}, options);
    finalOptions.step = "enforced";

    finalOptions.fixedNodeConstraint = constraints.fixedNodeConstraint ? constraints.fixedNodeConstraint : undefined;
    finalOptions.alignmentConstraint = constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined;
    finalOptions.relativePlacementConstraint = constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined;

    let layout = cy.layout(finalOptions);
    layout.one("layoutstop", function (event) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
    layout.run();
});

document.getElementById("coseButton").addEventListener("click", function () {
    let finalOptions = Object.assign({}, options);

    finalOptions.fixedNodeConstraint = constraints.fixedNodeConstraint ? constraints.fixedNodeConstraint : undefined;
    finalOptions.alignmentConstraint = constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined;
    finalOptions.relativePlacementConstraint = constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined;

    finalOptions.randomize = false;
    finalOptions.step = "cose";
    let layout = cy.layout(finalOptions);
    layout.one("layoutstop", function (event) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
    cy.layoutUtilities("get").setOption("randomize", finalOptions.randomize);
    layout.run();
});

// Handle Constraints ----------------------------

let onLoad = function () {
    let nodeList = "<select id='nodeList' class='custom-select custom-select-sm' style='width:auto;' onchange='onSelect()'>";
    let simpleNodes = cy.nodes().not(":parent");
    for (let i = 0; i < simpleNodes.length; i++) {
        let node = simpleNodes[i];
        let label = (node.data('label')) ? (node.data('label')) : (node.id());
        if (label.length > 15)
            label = label.substring(0, 12).concat("...");
        nodeList += "<option value='" + cy.nodes().not(":parent")[i].id() + "'>" + label + "</option>";
    }
    let listComponentForFixed = document.getElementById("nodeListColumn");
    listComponentForFixed.innerHTML = nodeList;
    document.getElementById("fixedNodeX").value = Math.round(cy.nodes().not(":parent")[0].position("x"));
    document.getElementById("fixedNodeY").value = Math.round(cy.nodes().not(":parent")[0].position("y"));

    let nodeListRP1 = "<select id='nodeListRP1' class='custom-select custom-select-sm' style='width:auto;' onchange='onSelectRP1()'>";
    for (let i = 0; i < simpleNodes.length; i++) {
        let node = simpleNodes[i];
        let label = (node.data('label')) ? (node.data('label')) : (node.id());
        if (label.length > 15)
            label = label.substring(0, 12).concat("...");
        nodeListRP1 += "<option value=" + cy.nodes().not(":parent")[i].id() + ">" + label + "</option>";
    }

    let nodeListRP2 = "<select id='nodeListRP2' class='custom-select custom-select-sm' style='width:auto;' onchange='onSelectRP2()'>";
    for (let i = 0; i < simpleNodes.length; i++) {
        let node = simpleNodes[i];
        let label = (node.data('label')) ? (node.data('label')) : (node.id());
        if (label.length > 15)
            label = label.substring(0, 12).concat("...");
        nodeListRP2 += "<option value=" + cy.nodes().not(":parent")[i].id() + ">" + label + "</option>";
    }

    let listComponentForRP1 = document.getElementById("nodeListColumnRP1");
    listComponentForRP1.innerHTML = nodeListRP1;

    let listComponentForRP2 = document.getElementById("nodeListColumnRP2");
    listComponentForRP2.innerHTML = nodeListRP2;
};

let onSelect = function () {
    let id = document.getElementById("nodeList").value;
    cy.elements().unselect();
    cy.getElementById(id).select();
};

let onSelectRP1 = function () {
    let id = document.getElementById("nodeListRP1").value;
    cy.elements().unselect();
    cy.getElementById(id).select();
};

let onSelectRP2 = function () {
    let id = document.getElementById("nodeListRP2").value;
    cy.elements().unselect();
    cy.getElementById(id).select();
};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("nodeList").addEventListener("change", function () {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    });
});

cy.ready(function (event) {
    onLoad();
});

document.getElementById("nodeList").addEventListener("change", function () {
    document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
    document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
});

cy.on("position", "node", function (event) {
    if (event.target.id() == document.getElementById("nodeList").value) {
        document.getElementById("fixedNodeX").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("x"));
        document.getElementById("fixedNodeY").value = Math.round(cy.getElementById(document.getElementById("nodeList").value).position("y"));
    }
});

// Adding Constraints
let constraintListTable = document.getElementById("constraintListTable");

document.getElementById("fixedNode").addEventListener("click", function () {
    let nodeId = document.getElementById("nodeList").value;
    let exist = false;
    if (constraints.fixedNodeConstraint) {
        constraints.fixedNodeConstraint.forEach(function (constraintObject) {
            if (constraintObject.nodeId == nodeId) {
                exist = true;
            }
        });
    }
    if (!exist) {
        let fixedNode = {
            nodeId: nodeId,
            position: Object.assign({}, {
                x: parseInt(document.getElementById("fixedNodeX").value),
                y: parseInt(document.getElementById("fixedNodeY").value)
            })
        };
        if (constraints.fixedNodeConstraint) {
            constraints.fixedNodeConstraint.push(fixedNode);
        } else {
            constraints.fixedNodeConstraint = [fixedNode];
        }

        addToHistory("Fixed", [nodeId], fixedNode.position);
    }
});

document.getElementById("verticalAlignment").addEventListener("click", function () {
    if (cy.nodes(":selected").not(":parent").length > 0) {
        let valignArray = [];
        cy.nodes(":selected").not(":parent").forEach(function (node) {
            valignArray.push(node.id());
        });
        if (constraints.alignmentConstraint) {
            if (constraints.alignmentConstraint.vertical) {
                constraints.alignmentConstraint.vertical.push(valignArray);
            } else {
                constraints.alignmentConstraint.vertical = [valignArray];
            }
        } else {
            constraints.alignmentConstraint = {};
            constraints.alignmentConstraint.vertical = [valignArray];
        }
        addToHistory("Alignment", valignArray, 'vertical');
    }
});

document.getElementById("horizontalAlignment").addEventListener("click", function () {
    if (cy.nodes(":selected").not(":parent").length > 0) {
        let halignArray = [];
        cy.nodes(":selected").not(":parent").forEach(function (node) {
            halignArray.push(node.id());
        });
        if (constraints.alignmentConstraint) {
            if (constraints.alignmentConstraint.horizontal) {
                constraints.alignmentConstraint.horizontal.push(halignArray);
            } else {
                constraints.alignmentConstraint.horizontal = [halignArray];
            }
        } else {
            constraints.alignmentConstraint = {};
            constraints.alignmentConstraint.horizontal = [halignArray];
        }
        addToHistory("Alignment", halignArray, 'horizontal');
    }
});

document.getElementById("relativePlacement").addEventListener("click", function () {
    let nodeId1 = document.getElementById("nodeListRP1").value;
    let nodeId2 = document.getElementById("nodeListRP2").value;
    let isExist = false;
    if (constraints.relativePlacementConstraint) {
        constraints.relativePlacementConstraint.forEach(function (constraint) {
            if (constraint["left"]) {
                if ((constraint["left"] == nodeId1 && constraint["right"] == nodeId2 || constraint["left"] == nodeId2 && constraint["right"] == nodeId1) && document.getElementById("directionList").value == "left-right") {
                    isExist = true;
                }
            } else {
                if ((constraint["top"] == nodeId1 && constraint["bottom"] == nodeId2 || constraint["top"] == nodeId2 && constraint["bottom"] == nodeId1) && document.getElementById("directionList").value == "top-bottom") {
                    isExist = true;
                }
            }
        });
    }
    if ((nodeId1 != nodeId2) && !isExist) {
        let relativePlacementConstraint;
        if (document.getElementById("directionList").value == "left-right") {
            relativePlacementConstraint = {
                left: nodeId1,
                right: nodeId2,
                gap: (document.getElementById("gap").value) ? (parseInt(document.getElementById("gap").value)) : undefined
            };
        } else {
            relativePlacementConstraint = {
                top: nodeId1,
                bottom: nodeId2,
                gap: (document.getElementById("gap").value) ? (parseInt(document.getElementById("gap").value)) : undefined
            };
        }
        if (constraints.relativePlacementConstraint) {
            constraints.relativePlacementConstraint.push(relativePlacementConstraint);
        } else {
            constraints.relativePlacementConstraint = [];
            constraints.relativePlacementConstraint.push(relativePlacementConstraint);
        }

        if (document.getElementById("directionList").value == "left-right")
            addToHistory("Relative", [nodeId1, nodeId2], 'l-r - ' + ((document.getElementById("gap").value) ? (parseInt(document.getElementById("gap").value)) : parseInt(cy.getElementById(nodeId1).width() / 2 + cy.getElementById(nodeId2).width() / 2 + 50)));
        else {
            addToHistory("Relative", [nodeId1, nodeId2], 't-b - ' + ((document.getElementById("gap").value) ? (parseInt(document.getElementById("gap").value)) : parseInt(cy.getElementById(nodeId1).height() / 2 + cy.getElementById(nodeId2).height() / 2 + 50)));
        }
    }
});

let addToHistory = function (constraintType, nodeIds, constraintInfo) {

    let row = constraintListTable.insertRow();
    let cell4 = row.insertCell(0);
    let cell3 = row.insertCell(0);
    let cell2 = row.insertCell(0);
    let cell1 = row.insertCell(0);
    cell1.innerHTML = constraintType;

    if (constraintType == 'Fixed') {
        let label = (cy.getElementById(nodeIds[0]).css('label') ? cy.getElementById(nodeIds[0]).css('label') : nodeIds);
        if (label.length > 15)
            label = label.substring(0, 12).concat("...");
        cell2.innerHTML = label;
        cell3.innerHTML = "x: " + constraintInfo.x + " y: " + constraintInfo.y;
    } else if (constraintType == 'Alignment') {
        let nodeList = "";
        nodeIds.forEach(function (nodeId, index) {
            let label = (cy.getElementById(nodeId).css('label') ? cy.getElementById(nodeId).css('label') : nodeId);
            if (label.length > 15)
                label = label.substring(0, 12).concat("...");
            if (index == 0)
                nodeList += label;
            else
                nodeList += ' - ' + label;
        });
        cell2.innerHTML = nodeList;
        cell3.innerHTML = constraintInfo;
    } else {
        let nodeList = "";
        nodeIds.forEach(function (nodeId, index) {
            let label = (cy.getElementById(nodeId).css('label') ? cy.getElementById(nodeId).css('label') : nodeId);
            if (label.length > 15)
                label = label.substring(0, 12).concat("...");
            if (index == 0)
                nodeList += label;
            else
                nodeList += ' - ' + label;
        });
        cell2.innerHTML = nodeList;
        cell3.innerHTML = constraintInfo;
    }

    // needed for highlighting constrained nodes
    let instance = cy.viewUtilities({
        highlightStyles: [
            {node: {'background-color': '#da14ff', 'border-color': '#980eb2'}, edge: {}}
        ]
    });

    let rowToHighlight = $('#constraintListTable').find('tr').eq(row.rowIndex);

    let collectionToHighlight = cy.collection();
    nodeIds.forEach(function (id) {
        collectionToHighlight = collectionToHighlight.union(cy.getElementById(id));
    });

    // 'Delete' symbol
    let button = document.createElement('button');
    button.setAttribute('class', 'close');
    button.setAttribute('aria-label', 'Close');
    if (constraintType == 'Fixed')
        button.onclick = function (event) {
            deleteRowElements(row, nodeIds);
            instance.removeHighlights(collectionToHighlight.nodes());
        };
    else if (constraintType == 'Alignment')
        button.onclick = function (event) {
            deleteRowElements(row, nodeIds, constraintInfo);
            instance.removeHighlights(collectionToHighlight.nodes());
        };
    else
        button.onclick = function (event) {
            deleteRowElements(row, nodeIds, constraintInfo);
            instance.removeHighlights(collectionToHighlight.nodes());
        };
    let xSymbol = document.createElement('span');
    xSymbol.setAttribute('aria-hidden', 'true');
    xSymbol.style.color = "red";
    xSymbol.innerHTML = '&times';
    button.appendChild(xSymbol);
    cell4.appendChild(button);

    rowToHighlight.hover(function () {
        instance.highlight(collectionToHighlight.nodes(), 0);
    }, function () {
        instance.removeHighlights(collectionToHighlight.nodes());
    });
};

// Delete Row Elements
let deleteRowElements = function (row, nodeIds, info) {
    let constraintType = row.cells[0].innerHTML;
    if (constraintType == 'Fixed') {
        constraints.fixedNodeConstraint.forEach(function (item, index) {
            if (item.nodeId == nodeIds[0]) {
                constraints.fixedNodeConstraint.splice(index, 1);
            }
        });
        if (constraints.fixedNodeConstraint.length == 0) {
            constraints.fixedNodeConstraint = undefined;
        }
    } else if (constraintType == 'Alignment') {
        if (info == 'vertical') {
            constraints.alignmentConstraint.vertical.forEach(function (item, index) {
                if (item.length == nodeIds.length) {
                    let equal = true;
                    item.forEach(function (nodeId, i) {
                        if (nodeId != nodeIds[i]) {
                            equal = false;
                        }
                    });
                    if (equal) {
                        constraints.alignmentConstraint.vertical.splice(index, 1);
                        if (constraints.alignmentConstraint.vertical.length == 0) {
                            delete constraints.alignmentConstraint.vertical;
                            if (!constraints.alignmentConstraint.horizontal) {
                                constraints.alignmentConstraint = undefined;
                            }
                        }
                    }
                }
            });
        } else {
            constraints.alignmentConstraint.horizontal.forEach(function (item, index) {
                if (item.length == nodeIds.length) {
                    let equal = true;
                    item.forEach(function (nodeId, i) {
                        if (nodeId != nodeIds[i]) {
                            equal = false;
                        }
                    });
                    if (equal) {
                        constraints.alignmentConstraint.horizontal.splice(index, 1);
                        if (constraints.alignmentConstraint.horizontal.length == 0) {
                            delete constraints.alignmentConstraint.horizontal;
                            if (!constraints.alignmentConstraint.vertical) {
                                constraints.alignmentConstraint = undefined;
                            }
                        }
                    }
                }
            });
        }
    } else {
        constraints.relativePlacementConstraint.forEach(function (item, index) {
            if (info.substring(0, 1) == 'l') {
                if (item.left && item.left == nodeIds[0] && item.right == nodeIds[1]) {
                    constraints.relativePlacementConstraint.splice(index, 1);
                    if (constraints.relativePlacementConstraint.length == 0) {
                        constraints.relativePlacementConstraint = undefined;
                    }
                }
            } else {
                if (item.top && item.top == nodeIds[0] && item.bottom == nodeIds[1]) {
                    constraints.relativePlacementConstraint.splice(index, 1);
                    if (constraints.relativePlacementConstraint.length == 0) {
                        constraints.relativePlacementConstraint = undefined;
                    }
                }
            }
        });
    }
    constraintListTable.deleteRow(row.rowIndex);
};

// Clear logs table
let clearConstraintListTable = function () {
    if (constraintListTable.rows.length > 1) {
        let length = constraintListTable.rows.length;
        for (let i = 0; i < length - 1; i++) {
            constraintListTable.deleteRow(1);
        }
    }
};

let fillConstraintListTableFromConstraints = function () {
    if (constraints.fixedNodeConstraint) {
        constraints.fixedNodeConstraint.forEach(function (constraint) {
            addToHistory("Fixed", [constraint.nodeId], constraint.position);
        });
    }
    if (constraints.alignmentConstraint) {
        if (constraints.alignmentConstraint.vertical) {
            constraints.alignmentConstraint.vertical.forEach(function (item) {
                addToHistory("Alignment", item, 'vertical');
            });
        }
        if (constraints.alignmentConstraint.horizontal) {
            constraints.alignmentConstraint.horizontal.forEach(function (item) {
                addToHistory("Alignment", item, 'horizontal');
            });
        }
    }
    if (constraints.relativePlacementConstraint) {
        constraints.relativePlacementConstraint.forEach(function (constraint) {
            if (constraint.left)
                addToHistory("Relative", [constraint.left, constraint.right], 'l-r - ' + (constraint.gap ? parseInt(constraint.gap) : parseInt(cy.getElementById(constraint.left).width() / 2 + cy.getElementById(constraint.right).width() / 2 + 50)));
            else
                addToHistory("Relative", [constraint.top, constraint.bottom], 't-b - ' + (constraint.gap ? parseInt(constraint.gap) : parseInt(cy.getElementById(constraint.top).height() / 2 + cy.getElementById(constraint.bottom).height() / 2 + 50)));
        });

    }
};

//// Samples

let elements3 = {
    nodes: [
        {data: {id: 'r1', parent: 'n8'}, classes: ['relative']},
        {data: {id: 'r2', parent: 'n8'}, classes: ['relative']},
        {data: {id: 'r3', parent: 'n8'}, classes: ['relative']},
        {data: {id: 'r4'}, classes: ['relative']},
        {data: {id: 'r5'}, classes: ['relative']},
        {data: {id: 'r6', parent: 'n7'}, classes: ['relative']},
        {data: {id: 'r7', parent: 'n10'}, classes: ['relative']},
        {data: {id: 'r8', parent: 'n10'}, classes: ['relative']},
        {data: {id: 'n1', parent: 'n7'}},
        {data: {id: 'n2'}},
        {data: {id: 'n3'}},
        {data: {id: 'n4'}},
        {data: {id: 'n5'}},
        {data: {id: 'n6'}},
        {data: {id: 'n7', parent: 'n10'}},
        {data: {id: 'n8'}},
        {data: {id: 'n9'}},
        {data: {id: 'n10'}}
    ],
    edges: [
        {data: {source: 'r6', target: 'n1'}},
        {data: {source: 'r6', target: 'n3'}},
        {data: {source: 'n1', target: 'r8'}},
        {data: {source: 'n1', target: 'r5'}},
        {data: {source: 'n1', target: 'r7'}},
        {data: {source: 'n2', target: 'n3'}},
        {data: {source: 'n2', target: 'r2'}},
        {data: {source: 'n2', target: 'n4'}},
        {data: {source: 'r5', target: 'n5'}},
        {data: {source: 'r5', target: 'n6'}},
        {data: {source: 'r2', target: 'r1'}},
        {data: {source: 'r2', target: 'r3'}},
        {data: {source: 'n7', target: 'n9'}},
        {data: {source: 'n5', target: 'n6'}},
        {data: {source: 'n5', target: 'r4'}}
    ]
};


let sample1_constraints = {
    "fixedNodeConstraint": [
        {
            "nodeId": "f1",
            "position": {
                "x": -150,
                "y": -100
            }
        },
        {
            "nodeId": "f2",
            "position": {
                "x": -50,
                "y": -150
            }
        },
        {
            "nodeId": "f3",
            "position": {
                "x": 100,
                "y": 150
            }
        }
    ]
};

