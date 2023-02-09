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
    gravityCompound: 1.0, stop: () => {
        initializer(cy);
    }
};

function addVallignConstraint(valignArray) {

    if(constraints.alignmentConstraint){
        if(constraints.alignmentConstraint.vertical){
            constraints.alignmentConstraint.vertical.push(valignArray);
        }
        else{
            constraints.alignmentConstraint.vertical = [valignArray];
        }
    }
    else{
        constraints.alignmentConstraint = {};
        constraints.alignmentConstraint.vertical = [valignArray];
    }
}

let constraints = {
    fixedNodeConstraint: undefined,
    alignmentConstraint: undefined,
    relativePlacementConstraint: undefined
};
function loadServiceGraph() {

    // read service-graph.json from same folder
    const url = 'service-graph.json';
    fetch(url)
        .then((response) => {
            return response.json();
        } )
        .then((data) => {
            console.log(data);

            cy.$().remove();
            cy.add(data);
            // query node for nodeType service
            let serviceNodes = cy.nodes().filter(function (ele) {
                return ele.data('nodeType') === 'service';
            } );
            // for each service node, get the children
            serviceNodes.map(function (node) {
                let spankinds = node.children();
                // for each child, get the count and add it to the parent node
                spankinds.map(function (spankind) {
                    var vAlignArray = [];
                    // for each operation , create canstraint at this level
                    spankind.children().map(function (operation) {
                        vAlignArray.push(operation.id());
                        console.log("operation=", operation.id(),vAlignArray);
                        // set shape to rounded rectangle and length enough to fit the label inside
                        operation.style('shape', 'roundrectangle');
                        operation.style('width', operation.data('label').length * 10);
                        operation.style('height', 30);
                        // white background
                        operation.style('background-color', 'white');
                        operation.style('border-color', operation.data('color'));
                        // label inside the node
                        operation.style('label', operation.data('label'));
                        operation.style('text-valign', 'center');
                    } );
                    addVallignConstraint(vAlignArray);
                    // allign spankind compound nodes sever on left client on right

                } );

                console.log(constraints);
            } );
            options.allignmentConstraint = constraints.alignmentConstraint;

            console.log("options=", options)

            cy.layout({...options}).run();

        })

}

