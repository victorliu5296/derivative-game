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
        const derivative = applyRule(func);
        return derivative ? derivative : { error: `${rule} rule is not applicable` };
    } catch (err) {
        return { error: `Error applying ${rule} rule: ${err.message}` };
    }
}

function applyPowerRule(func) {
    const powerRuleRegex = /([+-]?\d*)\{?\s*x\s*\}?\^?\{?(\d+)\}?/g;
    return func.replace(powerRuleRegex, (match, coef, exp) => {
        const coefficient = coef ? parseInt(coef) : 1;
        const exponent = parseInt(exp);
        const newCoefficient = coefficient * exponent;
        const newExponent = exponent - 1;
        if (newExponent === 0) return `${newCoefficient}`;
        if (newExponent === 1) return `${newCoefficient}{x}`;
        return `${newCoefficient}{x}^{${newExponent}}`;
    });
}

// Match and apply product rule
function applyProductRule(func) {
    const productRuleRegex = /(\w+)\((.*?)\)\s*\*\s*(\w+)\((.*?)\)/g;
    return func.replace(productRuleRegex, (_, u, uInner, v, vInner) => {
        return `\\frac{d}{dx}{${u}(${uInner})} \\cdot {${v}(${vInner})} + {${u}(${uInner})} \\cdot \\frac{d}{dx}{${v}(${vInner})}`;
    });
}

// Match and apply chain rule
function applyChainRule(func) {
    const chainRuleRegex = /(\w+)\((.*?)\)/g;
    return func.replace(chainRuleRegex, (_, outerFunc, innerFunc) => {
        return `\\frac{d}{dx}{${outerFunc}(${innerFunc})} \\cdot \\frac{d}{dx}{${innerFunc}}`;
    });
}

// Match and apply quotient rule
function applyQuotientRule(func) {
    const quotientRuleRegex = /(\w+)\((.*?)\)\s*\/\s*(\w+)\((.*?)\)/g;
    return func.replace(quotientRuleRegex, (_, u, uInner, v, vInner) => {
        return `\\frac{{${v}(${vInner})} \\cdot \\frac{d}{dx}{${u}(${uInner})} - {${u}(${uInner})} \\cdot \\frac{d}{dx}{${v}(${vInner})}}{{(${v}(${vInner}))}^{2}}`;
    });
}

// Handle the linearity rule
function applyLinearityRule(func) {
    const terms = func.split('+').map(term => term.trim());
    const derivatives = terms.map(term => `\\frac{d}{dx}{${term}}`);
    return derivatives.join(' + ');
}