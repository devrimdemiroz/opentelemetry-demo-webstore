import constraints from "./constraints";

export let layoutOptions = {
    name: 'fcose',



    // 'draft', 'default' or 'proof'
    // - "draft" only applies spectral layout
    // - "default" improves the quality with incremental layout (fast cooling rate)
    // - "proof" improves the quality with incremental layout (slow cooling rate)
    quality: "default",
    // Use random node positions at beginning of layout
    // if this is set to false, then quality option must be "proof"
    randomize: true,
    // Whether or not to animate the layout
    animate: true,
    // Duration of animation in ms, if enabled
    animationDuration: 1000,
    // Easing of animation, if enabled
    animationEasing: undefined,
    // Fit the viewport to the repositioned nodes
    fit: true,
    // Padding around layout
    padding: 15,
    // Whether to include labels in node dimensions. Valid in "proof" quality
    nodeDimensionsIncludeLabels: false,
    // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
    uniformNodeDimensions: false,
    // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
    packComponents: false,
    // Layout step - all, transformed, enforced, cose - for debug purpose only
    step: "all",

    /* spectral layout options */

    // False for random, true for greedy sampling
    samplingType: true,
    // Sample size to construct distance matrix
    sampleSize: 25,
    // Separation amount between nodes
    nodeSeparation: 40,
    // Power iteration tolerance
    piTol: 0.0000001,

    /* incremental layout options */

    // Node repulsion (non overlapping) multiplier
    //nodeRepulsion: node => 4000,
    nodeRepulsion: 4000,
    // Ideal edge (non nested) length
    idealEdgeLength: 10,
    // Divisor to compute edge forces
    edgeElasticity: 1,
    //edgeElasticity: 1, // Devrim note: Change works for good
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: true,
    // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
    numIter: 2500,
    // For enabling tiling
    tile: false,
    // The comparison function to be used while sorting nodes during tiling operation.
    // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
    // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
    // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
    // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
    // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
    tilingCompareBy: undefined,
    // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingVertical: 10,
    // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingHorizontal: 10,


    // Gravity force (constant)
    gravity: 2.25,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 12.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.5,
    // Gravity range (constant)
    gravityRange: 3.8,
    // Initial cooling factor for incremental layout
    initialEnergyOnIncremental: 0.3,

    /* constraint options */

    // Fix desired nodes to predefined positions
    // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
    fixedNodeConstraint: undefined,
    // Align desired nodes in vertical/horizontal direction
    // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
    alignmentConstraint: undefined,
    // Place two nodes relatively in vertical/horizontal direction
    // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
    relativePlacementConstraint: undefined,


    /* layout event callbacks */
    ready: () => {}, // on layoutready
    stop: () => {}, // on layoutstop

};

export let colaOptions = {
    name: 'cola',
    animate: true, // whether to show the layout as it's running
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 4000, // max length in ms to run the layout
    ungrabifyWhileSimulating: true, // so you can't drag nodes during layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 20, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

    // layout event callbacks
    ready: function () {
    }, // on layoutready
    stop: function () {
    }, // on layoutstop

    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: false, // if true, avoids disconnected components from overlapping
    convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    nodeSpacing: 1, // extra spacing around nodes
    flow: false, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
    centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)


    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation

    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};


export const addVallignConstraint = ( valignArray ) =>{

    if(layoutOptions.alignmentConstraint){
        if(layoutOptions.alignmentConstraint.vertical){
            layoutOptions.alignmentConstraint.vertical.push(valignArray);
        }
        else{
            layoutOptions.alignmentConstraint.vertical = [valignArray];
        }
    }
    else{
        layoutOptions.alignmentConstraint = {};
        layoutOptions.alignmentConstraint.vertical = [valignArray];
    }

};

export const addHallignConstraint = ( alignArray ) =>{

    if(layoutOptions.alignmentConstraint){
        if(layoutOptions.alignmentConstraint.horizontal){
            // check if the constraint is already added
            layoutOptions.alignmentConstraint.horizontal.push(alignArray);
        }
        else{
            layoutOptions.alignmentConstraint.horizontal = [alignArray];
        }
    }
    else{
        layoutOptions.alignmentConstraint = {};
        layoutOptions.alignmentConstraint.horizontal = [alignArray];
    }


};

export const addRelativeConstraint = ( node1,node2 ) =>{
    if(layoutOptions.alignmentConstraint === undefined){

        layoutOptions.alignmentConstraint = {};
    }

    if(layoutOptions.relativePlacementConstraint){
        layoutOptions.relativePlacementConstraint.push({left: node1, right: node2, gap: 10});
    } else {
        layoutOptions.relativePlacementConstraint = [{left: node1, right: node2, gap: 10}];
    }
    console.log("relative left right added nodes=",node1,",",node2 ,", layout=", layoutOptions.relativePlacementConstraint);
};

export const resetConstraints = () => {
    if (constraints.alignmentConstraint){
        layoutOptions.alignmentConstraint = {};

        if (constraints.alignmentConstraint.horizontal) {

            layoutOptions.alignmentConstraint.horizontal = constraints.alignmentConstraint.horizontal;
        }
        if (constraints.alignmentConstraint.vertical) {

            layoutOptions.alignmentConstraint.vertical = constraints.alignmentConstraint.vertical;
        }
    }


    if(constraints.relativePlacementConstraint){

        layoutOptions.relativePlacementConstraint = constraints.relativePlacementConstraint;
    }
    if (constraints.fixedNodeConstraint) {
        layoutOptions.fixedNodeConstraint = constraints.fixedNodeConstraint;
    }
};
