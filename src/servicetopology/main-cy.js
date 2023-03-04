
document.addEventListener('DOMContentLoaded', onLoaded);
function onLoaded() {
    tippy('.tooltip', {
        placement: 'top', // Set the tooltip placement to top
        arrow: true, // Show an arrow on the tooltip
        arrowType: 'sharp', // Use a sharp arrow
        animation: 'fade', // Use a fade animation
        theme: 'dark', // Use a dark theme
        duration: [200, 200], // Set the animation duration
        distance: 10 // Set the distance between the tooltip and the element
    });
    let instance;
    const cyVisible = window.cyVisible = cytoscape({});
    const cyInvisible = window.cyInvisible = cytoscape({});
    const cy = window.cy = cytoscape({
        ready: function () {
            instance = window.instance = this.complexityManagement();
            this.elements().forEach((ele) => {
                let randomWeight = Math.floor(Math.random() * 101);
                ele.data('weight', randomWeight);
                ele.data('label', ele.data('id') + '(' + ele.data('weight') + ')');
            });
        },
        container: document.getElementById('cy'),
        wheelSensitivity: 0.1,
        style: [
            {
                selector: 'node',
                style: {
                    'label': (node) => {
                        return node.data('label') ? node.data('label') : node.id();
                    },
                    "color" : "black",
                    'font-size': '14px',
                    'compound-sizing-wrt-labels': 'include',
                    'height': 40,
                    'width': 40,
                    'padding': "5px",
                    "background-fit": "cover",
                    "border-color": "black",
                    "border-width": 1,
                    "border-opacity": 1,
                }
            },
            {
                selector: 'edge',
                style: {
                    'label': (edge) => {
                        if (edge.data('weight') != null) {
                            return edge.data('weight');
                        }
                        return '';
                    },
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'text-rotation': 'autorotate',
                    'width': '1.5px',
                    'text-margin-y': '10px',
                    'line-color' : 'black',
                    'target-arrow-color': 'black',
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'label': (edge) => {
                        if (edge.data('weight') != null) {
                            return edge.data('weight');
                        }
                        return '';
                    },
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'text-rotation': 'autorotate',
                    'width': '1.5px',
                    'text-margin-y': '10px',
                    'line-color' : '#0169d9',
                    'target-arrow-color': '#0169d9',
                }
            }
        ],
        elements: {
            nodes: [
                { data: { id: 'a', parent: 'c2' } },
                { data: { id: 'b', parent: 'c2' } },
                { data: { id: 'c', parent: 'c1' } },
                { data: { id: 'd', parent: 'c4' } },
                { data: { id: 'e', parent: 'c3' } },
                { data: { id: 'f', parent: 'c3' } },
                { data: { id: 'g' } },
                { data: { id: 'c1' } },
                { data: { id: 'c2', parent: 'c1' } },
                { data: { id: 'c3' } },
                { data: { id: 'c4', parent: 'c3' } }
            ],
            edges: [
                { data: { id: 'a-b', source: 'a', target: 'b' } },
                { data: { id: 'b-a', source: 'b', target: 'a' } },
                { data: { id: 'a-c', source: 'a', target: 'c' } },
                { data: { id: 'c2-c3', source: 'c2', target: 'c3' } },
                { data: { id: 'd-e', source: 'd', target: 'e' } },
                { data: { id: 'f-d', source: 'f', target: 'd' } },
                { data: { id: 'f-e', source: 'f', target: 'e' } },
                { data: { id: 'f-g', source: 'f', target: 'g' } }
            ]
        },
        layout: { name: 'fcose', animate: true }
    });

    let layoutUtilities = cy.layoutUtilities({ desigrayAspectRatio: cy.width() / cy.height() });
    cy.layout({ name: 'fcose', animate: true, stop: () => {initializer(cy);} }).run();


}

function initializer(cy){
    cyVisible.remove(cyVisible.elements());
    cyInvisible.remove(cyInvisible.elements());

    instance.getCompMgrInstance().visibleGraphManager.nodesMap.forEach((nodeItem,key) => {
        cyVisible.add({data: {id: nodeItem.ID, parent: instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID}, position: cy.getElementById(nodeItem.ID).position()});
    });
    instance.getCompMgrInstance().visibleGraphManager.edgesMap.forEach((edgeItem,key) => {
        cyVisible.add({data: {id: edgeItem.ID, source: edgeItem.source.ID, target: edgeItem.target.ID}});
    });

    instance.getCompMgrInstance().invisibleGraphManager.nodesMap.forEach((nodeItem,key) => {
        cyInvisible.add({data: {id: nodeItem.ID, label: nodeItem.ID + (nodeItem.isFiltered ? "(f)" : "") + (nodeItem.isHidden ? "(h)" : "") + (nodeItem.isCollapsed ? "(c)" : "") + (nodeItem.isVisible ? "" : "(i)"), parent: instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID}, position: cy.getElementById(nodeItem.ID).position()});
    });
    instance.getCompMgrInstance().invisibleGraphManager.edgesMap.forEach((edgeItem,key) => {
        cyInvisible.add({data: {id: edgeItem.ID, label: edgeItem.ID + (edgeItem.isFiltered ? "(f)" : "") + (edgeItem.isHidden ? "(h)" : "") + (edgeItem.isVisible ? "" : "(i)"),source: edgeItem.source.ID, target: edgeItem.target.ID}});
    });
}

