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
    const powerRuleRegex = /^\\frac{d}{dx}\s*\\left\((.*?)x(\^{?\d+}?)?\\right\)$/;
    return func.replace(powerRuleRegex, (match, coefficient, exp) => {
        const coeff = coefficient ? parseFloat(coefficient) || 1 : 1;
        let exponent;
        if (exp) {
            exponent = exp.startsWith('^{') ? parseInt(exp.slice(2, -1)) : parseInt(exp.slice(1));
        } else {
            exponent = 1;
        }
        const newCoefficient = coeff * exponent;
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
    const productRuleRegex = /^\\frac{d}{dx}\s*\\left\((.*?)(?:\\cdot|\*)(.*?)\\right\)$/;
    const match = func.match(productRuleRegex);

    if (!match) {
        return func;
    }

    const [, u, v] = match;

    return `\\left(\\frac{d}{dx}\\left(${u.trim()}\\right) \\cdot ${v.trim()} + ${u.trim()} \\cdot \\frac{d}{dx}\\left(${v.trim()}\\right)\\right)`;
}

function applyChainRule(func) {
    const chainRuleRegex = /^\\frac{d}{dx}\s*\\left\((\w+)\\left\((.*?)\\right\)\\right\)$/;
    return func.replace(chainRuleRegex, (_, outerFunc, innerFunc) => {
        return `\\frac{d}{d${outerFunc}} \\left(${outerFunc}\\left(${innerFunc}\\right)\\right) \\cdot \\frac{d}{dx}\\left(${innerFunc}\\right)`;
    });
}

function applyQuotientRule(func) {
    const quotientRuleRegex = /^\\frac{d}{dx}\s*\\left\(\\frac{(.*?)}{(.*?)}\\right\)$/;
    const match = func.match(quotientRuleRegex);

    if (!match) {
        return func;
    }

    const [, numerator, denominator] = match;

    return `\\frac{${denominator} \\cdot \\frac{d}{dx}\\left(${numerator}\\right) - ${numerator} \\cdot \\frac{d}{dx}\\left(${denominator}\\right)}{{\\left(${denominator}\\right)}^{2}}`;
}

function applyLinearityRule(func) {
    const derivativeExpressionRegex = /^\\frac{d}{dx}\s*\\left\((.*?)\\right\)$/;
    const match = func.match(derivativeExpressionRegex);

    if (!match) {
        return func;
    }

    const innerExpression = match[1];

    // Function to split terms while respecting parentheses, fractions, and function calls
    function splitTerms(expr) {
        let terms = [];
        let currentTerm = '';
        let parenCount = 0;
        let bracketCount = 0;

        for (let i = 0; i < expr.length; i++) {
            let char = expr[i];
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (char === '{') bracketCount++;
            if (char === '}') bracketCount--;

            if ((char === '+' || char === '-') && parenCount === 0 && bracketCount === 0 && !expr.substring(i - 5, i).includes('\\frac')) {
                if (currentTerm.trim()) terms.push(currentTerm.trim());
                currentTerm = char;
            } else {
                currentTerm += char;
            }
        }
        if (currentTerm.trim()) terms.push(currentTerm.trim());
        return terms;
    }

    const terms = splitTerms(innerExpression);

    // Check if there's only one term
    if (terms.length === 1) {
        return { error: "Linearity rule cannot be applied. There is only one term in the expression." };
    }

    const derivatives = terms.map(term => {
        term = term.trim();
        const sign = term.startsWith('+') || term.startsWith('-') ? term[0] : '';
        const cleanTerm = sign ? term.slice(1).trim() : term;

        const scalarMatch = cleanTerm.match(/^(\d+|\d*\.\d+)(.+)$/);
        if (scalarMatch) {
            const [, scalar, rest] = scalarMatch;
            return `${sign}${scalar}\\frac{d}{dx}{\\left(${rest}\\right)}`;
        } else {
            return `${sign}\\frac{d}{dx}{\\left(${cleanTerm}\\right)}`;
        }
    });

    return derivatives.join(' ');
}