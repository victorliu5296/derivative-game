export function toKaTeX(tree, parentOp = null) {
    if (!tree) {
        console.error('Received null or undefined node in toKaTeX: ', JSON.stringify(tree, null, 2));
        return '';
    }
    switch (tree.type) {
        case 'constant':
            return tree.value.toString();
        case 'variable':
            return tree.name;
        case 'binary':
            return formatBinaryOperation(tree, parentOp);
        case 'function':
            return `\\${tree.name}\\left(${toKaTeX(tree.argument)}\\right)`;
        case 'derivative':
            return formatDerivative(tree);
        default:
            throw new Error('Unknown expression type');
    }
}

function formatDerivative(tree) {
    if (tree.variable && tree.variable.type === 'function') {
        // This is for cases like d/d(6x) sin(6x)
        return `\\frac{d}{d\\left(${toKaTeX(tree.variable)}\\right)}${toKaTeX(tree.tree)}`;
    } else {
        // General case
        const variable = tree.variable ? toKaTeX(tree.variable) : 'x';
        const wrappedVariable = variable === 'x' ? 'x' : `\\left(${variable}\\right)`;
        return `\\frac{d}{d${wrappedVariable}}\\left(${toKaTeX(tree.tree)}\\right)`;
    }
}

function formatBinaryOperation(tree, parentOp) {
    const left = toKaTeX(tree.left);
    const right = toKaTeX(tree.right);
    if (!left || !right) {
        console.error('Invalid binary operation in toKaTeX');
        return '';
    }
    let result;
    switch (tree.operator) {
        case '+':
        case '-':
            result = `${toKaTeX(tree.left, tree.operator)} ${tree.operator} ${toKaTeX(tree.right, tree.operator)}`;
            break;
        case '*':
            result = formatMultiplication(tree);
            break;
        case '/':
            result = `\\frac{${toKaTeX(tree.left)}}{${toKaTeX(tree.right)}}`;
            break;
        case '^':
            result = formatExponentiation(tree);
            break;
        default:
            throw new Error('Unknown binary operator');
    }

    return needsParentheses(tree, parentOp) ? wrapParentheses(result) : result;
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

function formatExponentiation(tree) {
    const base = toKaTeX(tree.left, '^');
    const exponent = toKaTeX(tree.right);

    // Omit exponents of 1
    if (exponent === '1') return base;

    // Special case for square root
    if (exponent === '0.5') return `\\sqrt{${base}}`;

    return `{${base}}^{${exponent}}`;
}

function needsParentheses(tree, parentOp) {
    if (tree.type !== 'binary') return false;

    const precedence = {
        '^': 4,
        '*': 3,
        '/': 3,
        '+': 2,
        '-': 2
    };

    return precedence[tree.operator] < precedence[parentOp];
}

function wrapParentheses(str) {
    return `\\left(${str}\\right)`;
}