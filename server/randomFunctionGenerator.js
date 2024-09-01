import * as math from 'mathjs';

export function generateRandomFunction() {
    const numTerms = Math.floor(Math.random() * 3) + 2; // 2 to 4 terms
    const terms = [];
    const usedTypes = new Set();

    for (let i = 0; i < numTerms; i++) {
        let termType;
        do {
            termType = Math.floor(Math.random() * 6);  // Include trig functions
        } while (usedTypes.has(termType) && usedTypes.size < 6);
        usedTypes.add(termType);

        switch (termType) {
            case 0: // Polynomial
                const coeff = Math.floor(Math.random() * 10) + 1;
                const exponent = Math.floor(Math.random() * 3) + 1;
                terms.push(`${coeff} * x^${exponent}`);
                break;
            case 1: // Sine
                const coeffSin = Math.floor(Math.random() * 5) + 1;
                terms.push(`${coeffSin} * sin(x)`);
                break;
            case 2: // Cosine
                const coeffCos = Math.floor(Math.random() * 5) + 1;
                terms.push(`${coeffCos} * cos(x)`);
                break;
            case 3: // Tangent
                const coeffTan = Math.floor(Math.random() * 5) + 1;
                terms.push(`${coeffTan} * tan(x)`);
                break;
            case 4: // Exponential
                const coeffExp = Math.floor(Math.random() * 5) + 1;
                terms.push(`${coeffExp} * e^x`);
                break;
            case 5: // Logarithmic
                const coeffLog = Math.floor(Math.random() * 5) + 1;
                terms.push(`${coeffLog} * log(x)`);
                break;
            default:
                break;
        }
    }

    return formatForRendering(math.parse(terms.join(' + ').replace(/\+ -/g, '- ')).toTex());
}

function formatForRendering(latex) {
    // Remove unnecessary multiplication by 1
    latex = latex.replace(/\b1\\cdot\s*/g, '');

    // Remove \cdot between a number and a function or expression in curly braces, including sin, cos, e^x
    latex = latex.replace(/(\d+)\\cdot\s*(\\?[\w{}^]+)/g, '$1$2');

    // Remove identity power operations like x^1 or {x}^{1}
    latex = latex.replace(/(\{?\w+\}?)(\^{\s*1\s*})/g, '$1');

    return latex;
}