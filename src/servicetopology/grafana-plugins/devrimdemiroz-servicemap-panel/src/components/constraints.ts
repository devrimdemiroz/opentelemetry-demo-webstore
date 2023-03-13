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
        // horizontal: [["loadgenerator", "frontend"],
        // ["frontend", "cartservice"],],
        horizontal: [[],],
        vertical: [[]]
    },
    relativePlacementConstraint: [{left: "loadgenerator", right: "frontend", gap: 100}
        , {left: "frontend", right: "cartservice", gap: 100}],
    //relativePlacementConstraint: [],
};
export default constraints;
