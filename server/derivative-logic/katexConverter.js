export function toKaTeX(expr, parentOp = null) {
    switch (expr.type) {
        case 'constant':
            return expr.value.toString();
        case 'variable':
            return expr.name;
        case 'binary':
            return formatBinaryOperation(expr, parentOp);
        case 'function':
            return `\\${expr.name}\\left(${toKaTeX(expr.argument)}\\right)`;
        case 'derivative':
            return formatDerivative(expr);
        default:
            throw new Error('Unknown expression type');
    }
}

function formatDerivative(expr) {
    if (expr.variable && expr.variable.type === 'function') {
        // This is for cases like d/d(6x) sin(6x)
        return `\\frac{d}{d\\left(${toKaTeX(expr.variable)}\\right)}${toKaTeX(expr.expression)}`;
    } else {
        // General case
        const variable = expr.variable ? toKaTeX(expr.variable) : 'x';
        const wrappedVariable = variable === 'x' ? 'x' : `\\left(${variable}\\right)`;
        return `\\frac{d}{d${wrappedVariable}}\\left(${toKaTeX(expr.expression)}\\right)`;
    }
}

function formatBinaryOperation(expr, parentOp) {
    let result;
    switch (expr.operator) {
        case '+':
        case '-':
            result = `${toKaTeX(expr.left, expr.operator)} ${expr.operator} ${toKaTeX(expr.right, expr.operator)}`;
            break;
        case '*':
            result = formatMultiplication(expr);
            break;
        case '/':
            result = `\\frac{${toKaTeX(expr.left)}}{${toKaTeX(expr.right)}}`;
            break;
        case '^':
            result = formatExponentiation(expr);
            break;
        default:
            throw new Error('Unknown binary operator');
    }

    return needsParentheses(expr, parentOp) ? wrapParentheses(result) : result;
}

function formatMultiplication(expr) {
    const left = toKaTeX(expr.left, '*');
    const right = toKaTeX(expr.right, '*');

    // Omit multiplication by 1
    if (left === '1') return right;
    if (right === '1') return left;

    // Omit \cdot for constant coefficients or when multiplying by variables
    if (expr.left.type === 'constant' || expr.right.type === 'variable') {
        return `${left}${right}`;
    }

    return `${left} \\cdot ${right}`;
}

function formatExponentiation(expr) {
    const base = toKaTeX(expr.left, '^');
    const exponent = toKaTeX(expr.right);

    // Omit exponents of 1
    if (exponent === '1') return base;

    // Special case for square root
    if (exponent === '0.5') return `\\sqrt{${base}}`;

    return `{${base}}^{${exponent}}`;
}

function needsParentheses(expr, parentOp) {
    if (expr.type !== 'binary') return false;

    const precedence = {
        '^': 4,
        '*': 3,
        '/': 3,
        '+': 2,
        '-': 2
    };

    return precedence[expr.operator] < precedence[parentOp];
}

function wrapParentheses(str) {
    return `\\left(${str}\\right)`;
}