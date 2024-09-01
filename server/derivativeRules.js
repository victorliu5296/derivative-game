const derivativeRules = {
    power: applyPowerRule,
    product: applyProductRule,
    chain: applyChainRule,
    quotient: applyQuotientRule,
    linearity: applyLinearityRule,
    // Add more rules here as needed
};

export function calculateDerivative(func, rule) {
    const applyRule = derivativeRules[rule];

    if (!applyRule) {
        return { error: `Unsupported rule: ${rule}` };
    }

    try {
        // The function should only proceed if the entire expression matches a single term derivative
        const cleanedFunc = func.trim();
        const derivative = applyRule(cleanedFunc);

        // If derivative is unchanged, that means no match was found
        if (derivative === cleanedFunc) {
            return { error: `The expression doesn't match the required pattern for the ${rule} rule.` };
        }

        return derivative;
    } catch (err) {
        return { error: `Error applying ${rule} rule: ${err.message}` };
    }
}

function applyPowerRule(func) {
    const powerRuleRegex = /^\\frac{d}{dx}\s*\{?\s*x\s*\}?\s*(\^{\d+})?\s*$/;

    return func.replace(powerRuleRegex, (match, exp) => {
        const exponent = exp ? parseInt(exp.replace(/[\^\{\}]/g, '')) : 1;
        const newCoefficient = exponent;
        const newExponent = exponent - 1;

        if (newExponent === 0) {
            return `${newCoefficient}`;
        } else if (newExponent === 1) {
            return `${newCoefficient}x`;
        } else {
            return `${newCoefficient}x^{${newExponent}}`;
        }
    });
}

function applyProductRule(func) {
    const productRuleRegex = /^\\frac{d}{dx}\s*\{\s*(\w+)\((.*?)\)\s*\*\s*(\w+)\((.*?)\)\s*\}$/;
    return func.replace(productRuleRegex, (_, u, uInner, v, vInner) => {
        return `\\frac{d}{dx}{${u}(${uInner})} \\cdot {${v}(${vInner})} + {${u}(${uInner})} \\cdot \\frac{d}{dx}{${v}(${vInner})}`;
    });
}

function applyChainRule(func) {
    const chainRuleRegex = /^\\frac{d}{dx}\s*\{\s*(\w+)\((.*?)\)\s*\}$/;
    return func.replace(chainRuleRegex, (_, outerFunc, innerFunc) => {
        return `\\frac{d}{dx}{${outerFunc}(${innerFunc})} \\cdot \\frac{d}{dx}{${innerFunc}}`;
    });
}

function applyQuotientRule(func) {
    const quotientRuleRegex = /^\\frac{d}{dx}\s*\{\s*(\w+)\((.*?)\)\s*\/\s*(\w+)\((.*?)\)\s*\}$/;
    return func.replace(quotientRuleRegex, (_, u, uInner, v, vInner) => {
        return `\\frac{{${v}(${vInner})} \\cdot \\frac{d}{dx}{${u}(${uInner})} - {${u}(${uInner})} \\cdot \\frac{d}{dx}{${v}(${vInner})}}{{(${v}(${vInner}))}^{2}}`;
    });
}

function applyLinearityRule(func) {
    // Match the entire derivative expression and extract the inner content
    const derivativeExpressionRegex = /^\\frac{d}{dx}\s*\\left\((.*?)\\right\)$/;
    const match = func.match(derivativeExpressionRegex);

    if (!match) {
        return func; // Return unchanged if it doesn't match the pattern
    }

    const innerExpression = match[1];

    // Split the inner expression into terms
    const terms = innerExpression.split(/(?=[+-])/);

    // Apply the derivative to each term
    const derivatives = terms.map(term => {
        term = term.trim();
        const sign = term.startsWith('+') || term.startsWith('-') ? term[0] : '';
        const cleanTerm = sign ? term.slice(1).trim() : term;

        // Check for scalar multiplication
        const scalarMatch = cleanTerm.match(/^(\d+|\d*\.\d+)(.+)$/);
        if (scalarMatch) {
            const [, scalar, rest] = scalarMatch;
            return `${sign}${scalar}\\frac{d}{dx}{${rest}}`;
        } else {
            return `${sign}\\frac{d}{dx}{${cleanTerm}}`;
        }
    });

    // Join the derived terms into a single expression
    return derivatives.join(' ');
}

function splitTermsRespectingParentheses(expression) {
    const terms = [];
    let currentTerm = '';
    let openParentheses = 0;

    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];

        if (char === '(') {
            openParentheses++;
        } else if (char === ')') {
            openParentheses--;
        }

        if ((char === '+' || char === '-') && openParentheses === 0 && currentTerm.trim() !== '') {
            terms.push(currentTerm);
            currentTerm = char; // Start a new term with the current sign
        } else {
            currentTerm += char;
        }
    }

    if (currentTerm.trim() !== '') {
        terms.push(currentTerm);
    }

    return terms;
}
