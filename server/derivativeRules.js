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
    // This function should extract terms correctly, including handling parenthetical expressions
    const terms = splitIntoTermsRespectingParentheses(func);

    // If no terms are found, return an error
    if (!terms || terms.length === 0) {
        return { error: `No terms found in the expression: ${func}` };
    }

    // Apply the derivative to each term
    const derivatives = terms.map(term => `\\frac{d}{dx}{${term.trim()}}`);

    // Join the derived terms into a single expression, ensuring correct handling of signs
    return derivatives.join(' + ').replace(/\+\s*-/g, '- ');
}

function splitIntoTermsRespectingParentheses(expression) {
    const terms = [];
    let currentTerm = '';
    let openParens = 0;

    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];

        if (char === '(') {
            openParens += 1;
        } else if (char === ')') {
            openParens -= 1;
        }

        // If we encounter a + or - at the top level (outside of parentheses), split here
        if ((char === '+' || char === '-') && openParens === 0) {
            if (currentTerm.trim()) {
                terms.push(currentTerm.trim());
            }
            currentTerm = char; // Start the new term with the current operator
        } else {
            currentTerm += char;
        }
    }

    // Push the last term
    if (currentTerm.trim()) {
        terms.push(currentTerm.trim());
    }

    return terms;
}