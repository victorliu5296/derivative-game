// functionDerivatives.js

import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

// Helper function to check if the expression is a derivative of the specified function
// and if the function's argument is the same as the variable we're differentiating with respect to
function isSimpleDerivativeOf(tree, funcName) {
    return tree.type === 'derivative' &&
        tree.tree.type === 'function' &&
        tree.tree.name.toLowerCase() === funcName.toLowerCase() &&
        tree.tree.argument === tree.variable;
}

export function applyExpRule(tree) {
    if (!isSimpleDerivativeOf(tree, 'exp')) return tree;

    return createFunction('exp', tree.variable);
}

export function applyLogRule(tree) {
    if (!isSimpleDerivativeOf(tree, 'ln')) return tree;

    return createBinaryOp('/',
        createConstant(1),
        tree.variable
    );
}

export function applySinRule(tree) {
    if (!isSimpleDerivativeOf(tree, 'sin')) return tree;

    return createFunction('cos', tree.variable);
}

export function applyCosRule(tree) {
    if (!isSimpleDerivativeOf(tree, 'cos')) return tree;

    return createBinaryOp('*',
        createConstant(-1),
        createFunction('sin', tree.variable)
    );
}

export function applyTanRule(tree) {
    if (!isSimpleDerivativeOf(tree, 'tan')) return tree;

    return createBinaryOp('+',
        createConstant(1),
        createBinaryOp('^',
            createFunction('tan', tree.variable),
            createConstant(2)
        )
    );
}