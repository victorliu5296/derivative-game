import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';

export function generateRandomFunction(options = {}) {
    const {
        minTerms = 2,
        maxTerms = 4,
        maxDepth = 2,
        variableName = 'x',
        maxCoefficient = 10,
        functionProbability = 0.3,
        exponentProbability = 0.2,
        maxConstantExponent = 10,
        maxExponentNesting = 1,
        allowNonConstantExponents = false,
        functions = ['sin', 'cos', 'tan', 'ln', 'exp'],
        operators = ['+', '-', '*', '/']
    } = options;

    const fullOperators = exponentProbability > 0 ? [...operators, '^'] : operators;

    const numTerms = Math.floor(Math.random() * (maxTerms - minTerms + 1)) + minTerms;

    function generateTerm(depth = 0, exponentNestingLevel = 0) {
        if (depth >= maxDepth || Math.random() < 0.5) {
            // Generate a basic term
            const coefficient = Math.floor(Math.random() * maxCoefficient) + 1;
            let term = coefficient === 1 ? createVariable(variableName) : createBinaryOp('*', createConstant(coefficient), createVariable(variableName));

            // Add a chance to create an exponent
            if (Math.random() < exponentProbability && exponentNestingLevel < maxExponentNesting) {
                const exponent = Math.floor(Math.random() * (maxConstantExponent - 1)) + 2;
                term = createBinaryOp('^', term, createConstant(exponent));
            }
            return term;
        } else {
            // Generate a nested function or binary operation
            if (Math.random() < functionProbability) {
                const func = functions[Math.floor(Math.random() * functions.length)];
                const innerTerm = generateTerm(depth + 1, exponentNestingLevel);
                return createFunction(func, innerTerm);
            } else {
                const operator = fullOperators[Math.floor(Math.random() * fullOperators.length)];
                const left = generateTerm(depth + 1, exponentNestingLevel);
                let right;
                if (operator === '^' && exponentNestingLevel < maxExponentNesting) {
                    if (allowNonConstantExponents && Math.random() < 0.3) {
                        right = generateTerm(depth + 1, exponentNestingLevel + 1);
                    } else {
                        right = createConstant(Math.floor(Math.random() * (maxConstantExponent - 1)) + 2);
                    }
                } else {
                    right = generateTerm(depth + 1, exponentNestingLevel);
                }
                return createBinaryOp(operator, left, right);
            }
        }
    }

    let expression = generateTerm();
    for (let i = 1; i < numTerms; i++) {
        const operator = operators[Math.floor(Math.random() * operators.length)];
        expression = createBinaryOp(operator, expression, generateTerm());
    }

    return createDerivative(expression, createVariable(variableName));
}