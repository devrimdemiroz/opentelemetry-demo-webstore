let constraints = {
    fixedNodeConstraint: [{
        nodeId: "loadgenerator",
        position: {
                x: -900,
                y: 250
            }
        }
    ],
    alignmentConstraint: {
        horizontal: [[ "loadgenerator", "frontend" ],],
        vertical: [[  ]]
    },
    relativePlacementConstraint: [{ left: "loadgenerator", right: "frontend", gap: 100 }],
};
export default constraints;
