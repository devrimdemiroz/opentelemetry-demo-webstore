export const colors = {
    // CARTO Earth diverging tones https://carto.com/carto-colors/
    // a color for combination of CLIENT and SERVER
    // "SERVER": "#A16928",
    "2": "#bd925a",
    "SERVER": "#d6bd8d",
    "INTERNAL": "#edeac2",
    "4": "#b5c8b8",
    "CLIENT": "#79a7ac",
    "6": "#2887a1",

    // Carto geyzer diverging
    "50": "#008080",
    "51": "#70a494",
    "UNSET": "#b4c8a8",
    "53": "#f6edbd",
    "54": "#edbb8a",
    "57": "#de8a5a",
    "ERROR": "#ca562c",


    // CARTO Sequential Teal
    "8": "#d1eeea",
    "9": "#a8dbd9",
    "10": "#85c4c9",
    "span": "#68abb8",
    "SERVICE_HIGHWAY": "#4f90a6",
    "13": "#3b738f",
    "14": "#2a5674",

    // CARTO Qualitative Antique
    "productcatalogservice": "#855C75",
    "frontend": "#D9AF6B",
    "checkoutservice": "#D9AF6B",
    "frontend-proxy": "#AF6458",
    "paymentservice": "#736F4C",
    "loadgenerator": "#526A83",
    "quoteservice": "#625377",
    "cartservice": "#68855C",
    "shippingservice": "#9C9C5E",
    "currencyservice": "#9C9C5E",
    "featureflagservice": "#A06177",
    "adservice": "#8C785D",
    "frontend-web": "#467378",
    "emailservice": "#467378",
    "recommendationservice": "#7C7C7C",

    // CARTO Army Rose
    "27": "#798234",
    //"UNSET": "#798234",
    "28": "#a3ad62",
    "29": "#d0d3a2",
    "30": "#fdfbe4",
    "31": "#f0c6c3",
    "32": "#df91a3",
    "33": "#d46780",
    //"ERROR": "#d46780",

    // Carto qualitative pastel colors
    "electro": "#66C5CC",
    "35": "#F6CF71",
    "highlighted": "#F89C74",
    "37": "#DCB0F2",
    "38": "#87C55F",
    "39": "#9EB9F3",
    "40": "#FE88B1",
    "41": "#C9DB74",
    "42": "#8BE0A4",
    "43": "#B497E7",
    "44": "#D3B484",
    "gray": "#B3B3B3",
    //vey light gray
    "46": "#E6E6E6",


    // from https://github.com/karthik/wesanderson
    //Royal2
    /*
    "CLIENT": "#899DA4",
    "SERVER": "#F5CDB4",
    "ERROR": "#9B110E",
    "UNSET": "#74A089",
    "COMPOUND": "#FDDDA0",
    "INTERNAL": "#d5c5c5",
    "SERVICE_HIGHWAY": "#999999",
    "span": "#F98400",
    "electro": "#5BBCD6",
    "14": "#F2AD00",
    "4": "#d5c5c5",

    "13": "#F2AD00",
    // lighter red than ERROR
    "highlighted": "#F98400",

    "frontend": "#F98400",
    "frontend-web": "#F98400",
    "TypeScript": "#F98400",

    // dark brown

    "Java": "#624a2a",


    "Python": "#046C9A",

    ".NET": "#446455",

    "C++": "#de8787",



    "Erlang": "#a83ca0",



    "15": "#F98400",
    "20": "#ABDDDE",
    // blue in Royal2
    "21": "#F2AD00",
    "22": "#F98400",
    "23": "#5BBCD6",
    "24": "#ECCBAE",
    "25": "#D69C4E",
    "26": "#ABDDDE",
    "27": "#F2AD00",
    "3": "#F8AFA8",
    // very light grey
    "6": "#F2AD00",
    "7": "#F98400",
    "8": "#5BBCD6",
    "9": "#ECCBAE",
    "11": "#f2f2f2",
    // gray
    "17": "#ECCBAE",
    "19": "#D69C4E",


*/
};

export function colorSpanKind(ele) {
    if (ele.data('spanKind') === 'SERVER') {
        return colors['SERVER']
    } else if (ele.data('spanKind') === 'CLIENT') {
        return colors['CLIENT']
    } else {
        return colors['INTERNAL']
    }
}

export function colorStatus(ele) {
    if (ele.data('spanStatus') === 'ERROR') {
        return colors['ERROR'];
    } else if (ele.data('spanStatus') === 'UNSET') {
        return colors['UNSET'];
    }
    return "";
}

export function colorConnector(ele) {
    if (ele.data('edgeType') === 'connector-in') {
        return colors['SERVER']
    } else if (ele.data('edgeType') === 'connector-out') {
        return colors['CLIENT']
    } else {
        return colors['INTERNAL']
    }
}

export function colorService(ele) {
    if (ele.data('service')) {
        return colors[ele.data('service')];
    }
    if (colors[ele.data('label')]) {
        return colors[ele.data('label')];
    }
    return "gray";
}
