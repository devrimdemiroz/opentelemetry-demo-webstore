

export const colors = {
    // from https://github.com/karthik/wesanderson
    //Royal2
    "CLIENT": "#899DA4",
    "SERVER": "#F5CDB4",
    "ERROR": "#9B110E",
    "3": "#F8AFA8",
    "COMPOUND": "#FDDDA0",
    "5": "#74A089",
    "6": "#F2AD00",
    "7": "#F98400",
    "8": "#5BBCD6",
    "9": "#ECCBAE",
    "10": "#046C9A",
    "11": "#D69C4E",
    "12": "#ABDDDE",
    "14": "#446455",
} ;
export const cyStyle =  [
    {
        selector: 'node',
        style: {
            "border-color": "black",
            "border-width": 1,
            "border-style": "solid",
            "font-size": 5,
            "color" : "gray",
            //"background-color" : this.colors['COMPOUND'],
            //'compound-sizing-wrt-labels': 'include',
            "background-opacity": 0.3,
            "text-wrap" : "ellipsis",
            "label": "data(label)",
        },
    },
    {
        selector:  'node[nodeType = "operation"]' ,
        style: {
            "background-color" : "white",
            "background-opacity": 0.7,
            "text-valign": "bottom",
            "text-halign": "center",
            "shape": "circle",
            "text-wrap" : "ellipsis",
            "label": "data(label)",
            "text-max-width": "data(label * 2)",

        }
    },

    {
        selector:  'node[spanStatus = "ERROR"]' ,
        style: {
            "color" : colors['ERROR'],
            "border-color": colors['ERROR'],
        }
    },
    {
        selector:  'node[nodeType = "service"]' ,
        style: {

                "text-valign": "bottom", // default
                "text-halign": "center", // default
                "font-size": 8,
            }
    },
    {
        selector:  'node[nodeType = "CLIENT"]' ,
        style: {
            "background-color" : colors['CLIENT'],
        }
    },
    {
        selector:  'node[nodeType = "SERVER"]' ,
        style: {
            "background-color" : colors['SERVER'],
        }
    },
    {
        selector: ":parent",
        style:{
            "background-opacity": 0.333,
            "text-valign": "bottom",

             "shape": "barrel",

            "text-margin-y": "2px",
            "font-weight ": "normal",
            "border-color": colors['COMPOUND'],

        }


},

];