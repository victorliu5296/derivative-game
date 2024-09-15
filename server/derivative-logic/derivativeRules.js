// derivativeRules.js

import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

export function applyLinearityRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative') {
        return expr;
    }

    const innerExpr = expr.expression;

    // Base case: if the inner expression is not a sum, difference, or product with a constant, return unchanged
    if (innerExpr.type !== 'binary' || (innerExpr.operator !== '+' && innerExpr.operator !== '-' && innerExpr.operator !== '*')) {
        return expr;
    }

    console.log('Applying Linearity Rule');

    if (innerExpr.operator === '+' || innerExpr.operator === '-') {
        // For addition and subtraction, distribute the derivative
        return createBinaryOp(innerExpr.operator,
            createDerivative(innerExpr.left, expr.variable),
            createDerivative(innerExpr.right, expr.variable)
        );
    } else if (innerExpr.operator === '*') {
        // For multiplication, check if one operand is a constant
        if (innerExpr.left.type === 'constant') {
            return createBinaryOp('*',
                innerExpr.left,
                createDerivative(innerExpr.right, expr.variable)
            );
        } else if (innerExpr.right.type === 'constant') {
            return createBinaryOp('*',
                innerExpr.right,
                createDerivative(innerExpr.left, expr.variable)
            );
        }
    }

    // If we can't apply the rule, return the original expression
    return expr;
}

export function applyPowerRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative') {
        return expr;
    }

    const innerExpr = expr.expression;

    // Case 1: Explicit power (u^v)
    if (innerExpr.type === 'binary' && innerExpr.operator === '^') {
        const base = innerExpr.left;
        const exponent = innerExpr.right;

        console.log('Applying Power Rule (explicit power)');

        // If exponent is constant, use simple power rule with direct computation
        if (exponent.type === 'constant') {
            if (exponent.value === 1) {
                return createDerivative(base, expr.variable);
            } else {
                const newExponent = createConstant(exponent.value - 1);
                return createBinaryOp('*',
                    exponent,
                    createBinaryOp('^', base, newExponent)
                );
            }
        } else {
            // General case: d/dx(u^v) = v * u^(v-1) * du/dx + u^v * ln(u) * dv/dx
            return createBinaryOp('+',
                createBinaryOp('*',
                    exponent,
                    createBinaryOp('*',
                        createBinaryOp('^', base, createBinaryOp('-', exponent, createConstant(1))),
                        createDerivative(base, expr.variable)
                    )
                ),
                createBinaryOp('*',
                    createBinaryOp('^', base, exponent),
                    createBinaryOp('*',
                        createFunction('ln', base),
                        createDerivative(exponent, expr.variable)
                    )
                )
            );
        }
    }


    // Case 2: Implicit power of 1 (x or cx)
    else if (innerExpr.type === 'variable' ||
        (innerExpr.type === 'binary' && innerExpr.operator === '*' &&
            ((innerExpr.left.type === 'constant' && innerExpr.right.type === 'variable') ||
                (innerExpr.right.type === 'constant' && innerExpr.left.type === 'variable')))) {
        console.log('Applying Power Rule (implicit power of 1)');
        if (innerExpr.type === 'variable') {
            return createConstant(1);
        } else {
            return innerExpr.left.type === 'constant' ? innerExpr.left : innerExpr.right;
        }
    }

    return expr;
}

export function applyChainRule(expr) {
    if (expr.type !== 'derivative' || expr.expression.type !== 'function') {
        return expr;
    }

    const outerFunction = expr.expression;
    const innerFunction = expr.expression.argument;

    // Check if the differentiation variable matches the function argument
    if (JSON.stringify(expr.variable) !== JSON.stringify(innerFunction)) {
        // Apply the chain rule
        return createBinaryOp('*',
            createDerivative(
                outerFunction,
                innerFunction
            ),
            createDerivative(innerFunction, expr.variable)
        );
    }

    // If the variables don't match, don't apply the rule
    return expr;
}

export function applyProductRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative' || expr.expression.type !== 'binary' || expr.expression.operator !== '*') {
        return expr;
    }

    const left = expr.expression.left;
    const right = expr.expression.right;

    // Check if either operand is a constant
    if (left.type === 'constant' || right.type === 'constant') {
        console.log('Skipping Product Rule due to constant factor');
        return expr;
    }

    console.log('Applying Product Rule');
    return createBinaryOp('+',
        createBinaryOp('*', createDerivative(left, expr.variable), right),
        createBinaryOp('*', left, createDerivative(right, expr.variable))
    );
}

export function applyQuotientRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative' || expr.expression.type !== 'binary' || expr.expression.operator !== '/') {
        return expr;
    }

    console.log('Applying Quotient Rule');
    const numerator = expr.expression.left;
    const denominator = expr.expression.right;

    return createBinaryOp('/',
        createBinaryOp('-',
            createBinaryOp('*', createDerivative(numerator), denominator),
            createBinaryOp('*', numerator, createDerivative(denominator))
        ),
        createBinaryOp('^', denominator, createConstant(2))
    );
}

export function applyConstantRule(expr) {
    if (expr.type !== 'derivative' || expr.expression.type !== 'constant') {
        return expr;
    }

    return createConstant(0);
}