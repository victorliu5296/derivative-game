import * as math from 'mathjs';
import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';
import { toKaTeX } from './katexConverter.js';

// Convert your nested object structure to mathjs expression string
function treeToMathjs(node) {
    if (!node) {
        console.error('Received undefined node in treeToMathjs');
        return '';
    }
    switch (node.type) {
        case 'constant':
            return node.value.toString();
        case 'variable':
            return node.name;
        case 'binary':
            return `(${treeToMathjs(node.left)} ${node.operator} ${treeToMathjs(node.right)})`;
        case 'function':
            return `${node.name}(${treeToMathjs(node.argument)})`;
        case 'derivative':
            return `derivative(${treeToMathjs(node.expression)}, "${node.variable}")`;
        default:
            console.error('Unknown node type in treeToMathjs:', node.type);
            return '';
    }
}

// Parse mathjs expression back to your nested object structure
function mathjsToTree(expression) {
    try {
        let parsedExpression;
        if (typeof expression === 'string') {
            parsedExpression = math.parse(expression);
        } else if (expression.toString && typeof expression.toString === 'function') {
            parsedExpression = math.parse(expression.toString());
        } else {
            throw new Error('Invalid expression type in mathjsToTree');
        }
        return convertNode(parsedExpression);
    } catch (error) {
        console.error('Error in mathjsToTree:', error);
        return null;
    }
}

function convertNode(node) {
    if (!node) {
        console.error('Received undefined node in convertNode');
        return null;
    }
    try {
        switch (node.type) {
            case 'ConstantNode':
                return createConstant(node.value);
            case 'SymbolNode':
                return createVariable(node.name);
            case 'OperatorNode':
                if (node.fn === 'unaryMinus') {
                    return createBinaryOp('*', createConstant(-1), convertNode(node.args[0]));
                }
                if (node.args.length === 1) {
                    return createFunction(node.fn, convertNode(node.args[0]));
                }
                return createBinaryOp(
                    node.op,
                    convertNode(node.args[0]),
                    convertNode(node.args[1])
                );
            case 'FunctionNode':
                if (node.name === 'derivative') {
                    return createDerivative(
                        convertNode(node.args[0]),
                        node.args[1].name
                    );
                }
                return createFunction(node.name, convertNode(node.args[0]));
            case 'ParenthesisNode':
                return convertNode(node.content);
            default:
                console.error('Unsupported node type in convertNode:', node.type);
                return null;
        }
    } catch (error) {
        console.error('Error in convertNode:', error);
        return null;
    }
}

// Check if a subtree contains a derivative node
function containsDerivative(node) {
    if (!node) return false;
    if (node.type === 'derivative') return true;
    if (node.type === 'binary') {
        return containsDerivative(node.left) || containsDerivative(node.right);
    }
    if (node.type === 'function') {
        return containsDerivative(node.argument);
    }
    return false;
}

const simplificationRules = [
    { l: "n1/n2/n3", r: "n1/(n2*n3)", repeat: true },
    { l: "n1/n2*n3", r: "(n1*n3)/n2" },
]

function simplifySubExpression(node) {
    if (node.type === 'derivative') {
        const simplifiedInner = simplifySubExpression(node.expression);
        return createDerivative(simplifiedInner, node.variable);
    }
    try {
        const mathjsExpr = treeToMathjs(node);
        console.log('mathjs expression to simplify:', mathjsExpr);
        const simplified1 = math.simplify(mathjsExpr);
        const simplified2 = math.simplify(simplified1, simplificationRules);
        console.log('simplified expression as string:', math.string(simplified2));
        const result = mathjsToTree(simplified2);
        if (!result) {
            console.error('mathjsToTree returned null, falling back to original node');
            return node;
        }
        return result;
    } catch (error) {
        console.error('Error in simplifySubExpression:', error);
        return node;
    }
}

function simplifyExpressionTree(node, isTopLevel = true) {
    if (!node) {
        console.error('Received undefined node in simplifyExpressionTree');
        return null;
    }
    try {
        switch (node.type) {
            case 'constant':
            case 'variable':
                return node;
            case 'binary':
                const simplifiedLeft = simplifyExpressionTree(node.left, false);
                const simplifiedRight = simplifyExpressionTree(node.right, false);
                const newNode = createBinaryOp(node.operator, simplifiedLeft, simplifiedRight);
                return isTopLevel ? simplifySubExpression(newNode) : newNode;
            case 'function':
                const simplifiedArg = simplifyExpressionTree(node.argument, false);
                const newFunc = createFunction(node.name, simplifiedArg);
                return isTopLevel ? simplifySubExpression(newFunc) : newFunc;
            case 'derivative':
                const simplifiedExpr = simplifyExpressionTree(node.expression, true);
                return createDerivative(simplifiedExpr, node.variable);
            default:
                console.error('Unknown node type in simplifyExpressionTree:', node.type);
                return node;
        }
    } catch (error) {
        console.error('Error in simplifyExpressionTree:', error);
        return node;
    }
}

export function simplifyExpression(node) {
    try {
        const simplifiedTree = simplifyExpressionTree(node, true);
        if (!simplifiedTree) {
            console.error('simplifyExpressionTree returned null');
            return { expression: node, katex: toKaTeX(node) };
        }
        console.log('Simplified tree:', JSON.stringify(treeToMathjs(simplifiedTree), null, 2));
        let katexString = toKaTeX(simplifiedTree);
        console.log('KaTeX string:', katexString);
        return {
            expression: simplifiedTree,
            katex: katexString
        };
    } catch (error) {
        console.error('Error in simplifyExpression:', error);
        return {
            expression: node,
            katex: toKaTeX(node)
        };
    }
}