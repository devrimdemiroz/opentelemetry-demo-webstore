import constraints from "./constraints";
export let layoutOptions = {
    name: 'fcose',
    randomize:  true,
    animate: true,
    animationDuration: 1000,
    animationEasing: undefined,
    fit: true,
    nestingFactor: 0.1,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    quality: 'proof',
    edgeElasticity: 0,
    nodeRepulsion: 400,
    packComponents: true,
    uniformNodeDimensions: true,
    samplingType: true,
    tile: true,
    idealEdgeLength: 50,
    gravity: 0.25,



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

    if(layoutOptions.relativePlacementConstraint){
        layoutOptions.relativePlacementConstraint.push({left: node1, right: node2, gap: 10});
    } else {
        layoutOptions.relativePlacementConstraint = [{left: node1, right: node2, gap: 10}];
    }
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
    console.log("layoutOptions=",layoutOptions);
};
