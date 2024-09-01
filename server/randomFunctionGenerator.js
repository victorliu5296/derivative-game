export function generateRandomFunction(minTerms = 2, maxTerms = 4, maxDepth = 2) {
    const numTerms = Math.floor(Math.random() * (maxTerms - minTerms + 1)) + minTerms;
    const terms = [];

    function generateTerm(depth = 0) {
        const functions = ['\\sin', '\\cos', '\\tan', '\\ln', '\\exp'];
        const operators = ['+', '-', '*', '/'];

        if (depth >= maxDepth || Math.random() < 0.5) {
            // Generate a basic term
            const coefficient = Math.floor(Math.random() * 10) + 1;
            return coefficient === 1 ? 'x' : `${coefficient}x`;
        } else {
            // Generate a nested function
            const func = functions[Math.floor(Math.random() * functions.length)];
            const innerTerm = generateTerm(depth + 1);
            return `${func}\\left(${innerTerm}\\right)`;
        }
    }

    for (let i = 0; i < numTerms; i++) {
        let term = generateTerm();

        // Randomly add coefficient
        if (Math.random() < 0.5) {
            const coefficient = Math.floor(Math.random() * 5) + 2; // 2 to 6
            term = `${coefficient}${term}`;
        }

        terms.push(term);
    }

    // Join terms with random operators
    let expression = terms[0];
    for (let i = 1; i < terms.length; i++) {
        const operator = ['+', '-', '\\cdot', '\\frac'][Math.floor(Math.random() * 4)];
        if (operator === '\\frac') {
            expression = `\\frac{${expression}}{${terms[i]}}`;
        } else {
            expression += ` ${operator} ${terms[i]}`;
        }
    }

    return `\\frac{d}{dx} \\left(${expression}\\right)`;
}