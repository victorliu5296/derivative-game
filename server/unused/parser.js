import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from '../derivative-logic/expressionStructure.js';

export function parse(expression) {
    const tokens = tokenize(expression);
    return parseExpression(tokens);
}

function tokenize(expression) {
    return expression.match(/\d+|\+|\-|\*|\/|\^|\(|\)|[a-zA-Z]+/g);
}

function parseExpression(tokens) {
    let expr = parseTerm(tokens);
    while (tokens.length > 0 && (tokens[0] === '+' || tokens[0] === '-')) {
        const operator = tokens.shift();
        const right = parseTerm(tokens);
        expr = createBinaryOp(operator, expr, right);
    }
    return expr;
}

function parseTerm(tokens) {
    let expr = parseFactor(tokens);
    while (tokens.length > 0 && (tokens[0] === '*' || tokens[0] === '/')) {
        const operator = tokens.shift();
        const right = parseFactor(tokens);
        expr = createBinaryOp(operator, expr, right);
    }
    return expr;
}

function parseFactor(tokens) {
    if (tokens[0] === '(') {
        tokens.shift(); // Remove opening parenthesis
        const expr = parseExpression(tokens);
        tokens.shift(); // Remove closing parenthesis
        return expr;
    } else if (isNaN(tokens[0])) {
        if (tokens[1] === '(') {
            const funcName = tokens.shift();
            tokens.shift(); // Remove opening parenthesis
            const arg = parseExpression(tokens);
            tokens.shift(); // Remove closing parenthesis
            return createFunction(funcName, arg);
        } else {
            return createVariable(tokens.shift());
        }
    } else {
        return createConstant(parseFloat(tokens.shift()));
    }
}