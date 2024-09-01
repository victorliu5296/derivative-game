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

    return terms.join(' + ').replace(/\+ -/g, '- ');
}