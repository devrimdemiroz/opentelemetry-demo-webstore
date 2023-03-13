let constraints = {
    fixedNodeConstraint: [
        // {
        //     nodeId: "loadgenerator",
        //     position: {
        //         x: -900,
        //         y: 250
        //     }
        // }
    ],
    alignmentConstraint: {
        horizontal: [
            ["loadgenerator", "frontend", "cartservice"]
        ],
        // horizontal: [[],],
        vertical: undefined
    },
    relativePlacementConstraint: [{left: "loadgenerator", right: "frontend", gap: 100}
        , {left: "frontend", right: "cartservice", gap: 100}],
    //relativePlacementConstraint: [],
};
export default constraints;
