import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

export function generateRandomFunction(minTerms = 2, maxTerms = 4, maxDepth = 2) {
    const numTerms = Math.floor(Math.random() * (maxTerms - minTerms + 1)) + minTerms;

    function generateTerm(depth = 0) {
        const functions = ['sin', 'cos', 'tan', 'ln', 'exp'];
        const operators = ['+', '-', '*', '/'];

        if (depth >= maxDepth || Math.random() < 0.5) {
            // Generate a basic term
            const coefficient = Math.floor(Math.random() * 10) + 1;
            return coefficient === 1 ? createVariable('x') : createBinaryOp('*', createConstant(coefficient), createVariable('x'));
        } else {
            // Generate a nested function
            const func = functions[Math.floor(Math.random() * functions.length)];
            const innerTerm = generateTerm(depth + 1);
            return createFunction(func, innerTerm);
        }
    }

    let expression = generateTerm();
    for (let i = 1; i < numTerms; i++) {
        const operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
        expression = createBinaryOp(operator, expression, generateTerm());
    }

    return createDerivative(expression, createVariable('x'));
}