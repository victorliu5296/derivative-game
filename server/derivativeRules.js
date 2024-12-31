// derivativeRules.js

import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

export function applyLinearityRule(tree) {
    console.log('Expression tree:', JSON.stringify(tree, null, 2));

    if (tree.type !== 'derivative') {
        return tree;
    }

    const innerTree = tree.tree;

    // Base case: if the inner expression is not a sum, difference, or product with a constant, return unchanged
    if (innerTree.type !== 'binary' || (innerTree.operator !== '+' && innerTree.operator !== '-' && innerTree.operator !== '*')) {
        return tree;
    }

    console.log('Applying Linearity Rule');

    if (innerTree.operator === '+' || innerTree.operator === '-') {
        // For addition and subtraction, distribute the derivative
        return createBinaryOp(innerTree.operator,
            createDerivative(innerTree.left, tree.variable),
            createDerivative(innerTree.right, tree.variable)
        );
    } else if (innerTree.operator === '*' || innerTree.operator === '/') {
        // For multiplication and division, check if one operand is a constant
        if (innerTree.right.type === 'constant') {
            if (innerTree.operator === '*') {
                return createBinaryOp('*',
                    innerTree.right,
                    createDerivative(innerTree.left, tree.variable)
                );
            } else { // division
                return createBinaryOp('/',
                    createDerivative(innerTree.left, tree.variable),
                    innerTree.right
                );
            }
        } else if (innerTree.left.type === 'constant' && innerTree.operator === '*') {
            // Only for multiplication, as division by variable is not a linear operation
            return createBinaryOp('*',
                innerTree.left,
                createDerivative(innerTree.right, tree.variable)
            );
        }
    }

    // If we can't apply the rule, return the original expression
    return tree;
}

export function applyPowerRule(tree) {
    console.log('Expression:', JSON.stringify(tree, null, 2));

    if (tree.type !== 'derivative') {
        return tree;
    }

    const innerTree = tree.tree;

    // Case 1: Explicit power (u^v)
    if (innerTree.type === 'binary' && innerTree.operator === '^') {
        const base = innerTree.left;
        const exponent = innerTree.right;

        console.log('Applying Power Rule (explicit power)');

        // If exponent is constant, use simple power rule with direct computation
        if (exponent.type === 'constant') {
            if (exponent.value === 1) {
                return createDerivative(base, tree.variable);
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
                        createDerivative(base, tree.variable)
                    )
                ),
                createBinaryOp('*',
                    createBinaryOp('^', base, exponent),
                    createBinaryOp('*',
                        createFunction('ln', base),
                        createDerivative(exponent, tree.variable)
                    )
                )
            );
        }
    }


    // Case 2: Implicit power of 1 (x or cx)
    else if (innerTree.type === 'variable' ||
        (innerTree.type === 'binary' && innerTree.operator === '*' &&
            ((innerTree.left.type === 'constant' && innerTree.right.type === 'variable') ||
                (innerTree.right.type === 'constant' && innerTree.left.type === 'variable')))) {
        console.log('Applying Power Rule (implicit power of 1)');
        if (innerTree.type === 'variable') {
            return createConstant(1);
        } else {
            return innerTree.left.type === 'constant' ? innerTree.left : innerTree.right;
        }
    }

    return tree;
}

export function applyChainRule(tree) {
    if (tree.type !== 'derivative' || tree.tree.type !== 'function') {
        return tree;
    }

    const outerFunction = tree.tree;
    const innerFunction = tree.tree.argument;

    // Check if the differentiation variable matches the function argument
    if (JSON.stringify(tree.variable) !== JSON.stringify(innerFunction)) {
        // Apply the chain rule
        return createBinaryOp('*',
            createDerivative(
                outerFunction,
                innerFunction
            ),
            createDerivative(innerFunction, tree.variable)
        );
    }

    // If the variables don't match, don't apply the rule
    return tree;
}

export function applyProductRule(tree) {
    console.log('Expression:', JSON.stringify(tree, null, 2));

    if (tree.type !== 'derivative' || tree.tree.type !== 'binary' || tree.tree.operator !== '*') {
        return tree;
    }

    const left = tree.tree.left;
    const right = tree.tree.right;

    // Check if either operand is a constant
    if (left.type === 'constant' || right.type === 'constant') {
        console.log('Skipping Product Rule due to constant factor');
        return tree;
    }

    console.log('Applying Product Rule');
    return createBinaryOp('+',
        createBinaryOp('*', createDerivative(left, tree.variable), right),
        createBinaryOp('*', left, createDerivative(right, tree.variable))
    );
}

export function applyQuotientRule(tree) {
    console.log('Expression:', JSON.stringify(tree, null, 2));

    if (tree.type !== 'derivative' || tree.tree.type !== 'binary' || tree.tree.operator !== '/') {
        return tree;
    }

    console.log('Applying Quotient Rule');
    const numerator = tree.tree.left;
    const denominator = tree.tree.right;

    return createBinaryOp('/',
        createBinaryOp('-',
            createBinaryOp('*', createDerivative(numerator), denominator),
            createBinaryOp('*', numerator, createDerivative(denominator))
        ),
        createBinaryOp('^', denominator, createConstant(2))
    );
}

export function applyConstantRule(tree) {
    console.log('Expression:', JSON.stringify(tree, null, 2));

    if (tree.type !== 'derivative' || tree.tree.type !== 'constant') {
        return tree;
    }

    console.log('Applying Constant Rule');
    return createConstant(0);
}