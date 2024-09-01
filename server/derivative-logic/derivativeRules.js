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

    if (expr.type !== 'derivative' || expr.expression.type !== 'binary' || (expr.expression.operator !== '+' && expr.expression.operator !== '-')) {
        return expr;
    }

    console.log('Applying Linearity Rule');

    const left = expr.expression.left;
    const right = expr.expression.right;

    function handleTerm(term) {
        if (term.type === 'binary' && term.operator === '*') {
            if (term.left.type === 'constant') {
                return createBinaryOp('*', term.left, createDerivative(term.right));
            } else if (term.right.type === 'constant') {
                return createBinaryOp('*', term.right, createDerivative(term.left));
            }
        }
        return createDerivative(term);
    }

    return createBinaryOp(expr.expression.operator,
        handleTerm(left),
        handleTerm(right)
    );
}