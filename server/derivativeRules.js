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
    return math.derivative(func, 'x');
}

function applyProductRule(func) {
    const [u, v] = parseProductRule(func);
    if (!u || !v) return null;
    return math.derivative(u, 'x').multiply(v).add(u.multiply(math.derivative(v, 'x')));
}

function applyChainRule(func) {
    const [outerFunc, innerFunc] = parseChainRule(func);
    if (!outerFunc || !innerFunc) return null;
    return math.derivative(outerFunc, 'x').evaluate({ x: innerFunc }).multiply(math.derivative(innerFunc, 'x'));
}

function applyQuotientRule(func) {
    const [u, v] = parseQuotientRule(func);
    if (!u || !v) return null;
    const numerator = math.derivative(u, 'x').multiply(v).subtract(u.multiply(math.derivative(v, 'x')));
    const denominator = math.square(v);
    return numerator.divide(denominator);
}

function applyLinearityRule(func) {
    return math.derivative(func, 'x');
}

// Helper functions to parse the expressions for product, chain, and quotient rules

function parseProductRule(func) {
    const expr = math.parse(func);
    if (expr.type === 'OperatorNode' && expr.op === '*') {
        return [expr.args[0], expr.args[1]];
    }
    return [null, null]; // Return nulls if the function is not a product
}

function parseChainRule(func) {
    const expr = math.parse(func);
    if (expr.type === 'FunctionNode') {
        const innerFunc = expr.args[0];
        const outerFunc = math.parse(`${expr.name}(x)`);
        return [outerFunc, innerFunc];
    }
    return [null, null]; // Return nulls if the function is not in the form of f(g(x))
}

function parseQuotientRule(func) {
    const expr = math.parse(func);
    if (expr.type === 'OperatorNode' && expr.op === '/') {
        return [expr.args[0], expr.args[1]];
    }
    return [null, null]; // Return nulls if the function is not a quotient
}
