// functionDerivatives.js

import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

// Helper function to check if the expression is a derivative of the specified function
// and if the function's argument is the same as the variable we're differentiating with respect to
function isSimpleDerivativeOf(expr, funcName) {
    return expr.type === 'derivative' &&
        expr.expression.type === 'function' &&
        expr.expression.name.toLowerCase() === funcName.toLowerCase() &&
        JSON.stringify(expr.expression.argument) === JSON.stringify(expr.variable);
}

export function applyExpRule(expr) {
    if (!isSimpleDerivativeOf(expr, 'exp')) return expr;

    return createFunction('exp', expr.variable);
}

export function applyLogRule(expr) {
    if (!isSimpleDerivativeOf(expr, 'ln')) return expr;

    return createBinaryOp('/',
        createConstant(1),
        expr.variable
    );
}

export function applySinRule(expr) {
    if (!isSimpleDerivativeOf(expr, 'sin')) return expr;

    return createFunction('cos', expr.variable);
}

export function applyCosRule(expr) {
    if (!isSimpleDerivativeOf(expr, 'cos')) return expr;

    return createBinaryOp('*',
        createConstant(-1),
        createFunction('sin', expr.variable)
    );
}

export function applyTanRule(expr) {
    if (!isSimpleDerivativeOf(expr, 'tan')) return expr;

    return createBinaryOp('+',
        createConstant(1),
        createBinaryOp('^',
            createFunction('tan', expr.variable),
            createConstant(2)
        )
    );
}