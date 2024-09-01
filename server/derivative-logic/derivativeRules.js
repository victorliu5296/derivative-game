// derivativeRules.js

import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

export function applyPowerRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative' || expr.expression.type !== 'binary' || expr.expression.operator !== '^') {
        return expr;
    }

    const base = expr.expression.left;
    const exponent = expr.expression.right;

    if (exponent.type !== 'constant') {
        return expr;
    }

    console.log('Applying Power Rule');
    return createBinaryOp('*',
        createBinaryOp('*',
            exponent,
            createBinaryOp('^', base, createBinaryOp('-', exponent, createConstant(1)))
        ),
        createDerivative(base)
    );
}

export function applyProductRule(expr) {
    console.log('Expression:', JSON.stringify(expr, null, 2));

    if (expr.type !== 'derivative' || expr.expression.type !== 'binary' || expr.expression.operator !== '*') {
        return expr;
    }

    console.log('Applying Product Rule');
    const left = expr.expression.left;
    const right = expr.expression.right;

    return createBinaryOp('+',
        createBinaryOp('*', createDerivative(left), right),
        createBinaryOp('*', left, createDerivative(right))
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