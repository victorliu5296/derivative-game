export function generateRandomFunction() {
    const numTerms = Math.floor(Math.random() * 3) + 2; // 2 to 4 terms
    const terms = [];
    const usedTypes = new Set();

    for (let i = 0; i < numTerms; i++) {
        let termType;
        do {
            termType = Math.floor(Math.random() * 6);
        } while (usedTypes.has(termType) && usedTypes.size < 6);
        usedTypes.add(termType);

        let coefficient = Math.floor(Math.random() * 5) + 1;
        coefficient = coefficient === 1 ? '' : coefficient;
        let term;

        switch (termType) {
            case 0: // Polynomial
                let exponent = Math.floor(Math.random() * 3) + 1;
                exponent = exponent === 1 ? '' : exponent;
                term = `${coefficient}x^{${exponent}}`;
                break;
            case 1: // Sine
                term = `${coefficient}\\sin(x)`;
                break;
            case 2: // Cosine
                term = `${coefficient}\\cos(x)`;
                break;
            case 3: // Tangent
                term = `${coefficient}\\tan(x)`;
                break;
            case 4: // Exponential
                term = `${coefficient}e^x`;
                break;
            case 5: // Logarithmic
                term = `${coefficient}\\ln(x)`;
                break;
        }

        terms.push(term);
    }

    return "\\frac{d}{dx} \\left(" + terms.join(' + ') + "\\right)";
}