import { createConstant, createVariable, createBinaryOp, createFunction } from './expressionStructure.js';

export function derivative(expr) {
    switch (expr.type) {
        case 'constant':
            return createConstant(0);
        case 'variable':
            return createConstant(1);
        case 'binary':
            return derivativeBinary(expr);
        case 'function':
            return derivativeFunction(expr);
        case 'derivative':
            return derivative(expr.expression);
        default:
            throw new Error('Unknown expression type');
    }
}

function derivativeBinary(expr) {
    switch (expr.operator) {
        case '+':
        case '-':
            return createBinaryOp(expr.operator, derivative(expr.left), derivative(expr.right));
        case '*':
            return createBinaryOp('+',
                createBinaryOp('*', derivative(expr.left), expr.right),
                createBinaryOp('*', expr.left, derivative(expr.right))
            );
        case '/':
            return createBinaryOp('/',
                createBinaryOp('-',
                    createBinaryOp('*', derivative(expr.left), expr.right),
                    createBinaryOp('*', expr.left, derivative(expr.right))
                ),
                createBinaryOp('^', expr.right, createConstant(2))
            );
        case '^':
            if (expr.right.type === 'constant') {
                return createBinaryOp('*',
                    createBinaryOp('*',
                        expr.right,
                        createBinaryOp('^', expr.left, createBinaryOp('-', expr.right, createConstant(1)))
                    ),
                    derivative(expr.left)
                );
            } else {
                // For non-constant exponents, use the general power rule
                return createBinaryOp('*',
                    createBinaryOp('^', expr.left, expr.right),
                    createBinaryOp('+',
                        createBinaryOp('*',
                            createFunction('ln', expr.left),
                            derivative(expr.right)
                        ),
                        createBinaryOp('*',
                            createBinaryOp('/', expr.right, expr.left),
                            derivative(expr.left)
                        )
                    )
                );
            }
        default:
            throw new Error('Unknown binary operator');
    }
}

function derivativeFunction(expr) {
    switch (expr.name) {
        case 'sin':
            return createBinaryOp('*',
                createFunction('cos', expr.argument),
                derivative(expr.argument)
            );
        case 'cos':
            return createBinaryOp('*',
                createBinaryOp('*', createConstant(-1), createFunction('sin', expr.argument)),
                derivative(expr.argument)
            );
        case 'tan':
            return createBinaryOp('*',
                createBinaryOp('+', createConstant(1), createBinaryOp('^', createFunction('tan', expr.argument), createConstant(2))),
                derivative(expr.argument)
            );
        case 'ln':
            return createBinaryOp('*',
                createBinaryOp('/', createConstant(1), expr.argument),
                derivative(expr.argument)
            );
        case 'exp':
            return createBinaryOp('*',
                createFunction('exp', expr.argument),
                derivative(expr.argument)
            );
        default:
            throw new Error('Unknown function');
    }
}