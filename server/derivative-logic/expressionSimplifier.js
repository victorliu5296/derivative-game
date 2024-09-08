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
function mathjsToTree(expr) {
    try {
        const node = math.parse(expr);
        return convertNode(node);
    } catch (error) {
        console.error('Error in mathjsToTree:', error);
        return null;
    }
}

function convertNode(node) {
    if (!node) {
        console.error('Received undefined node in convertNode: ' + JSON.stringify(node));
        return null;
    }
    try {
        switch (node.type) {
            case 'ConstantNode':
                return createConstant(node.value);
            case 'SymbolNode':
                return createVariable(node.name);
            case 'OperatorNode':
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
    if (node.type === 'derivative') return true;
    if (node.type === 'binary') {
        return containsDerivative(node.left) || containsDerivative(node.right);
    }
    if (node.type === 'function') {
        return containsDerivative(node.argument);
    }
    return false;
}

function simplifySubExpression(node) {
    if (containsDerivative(node)) {
        return node;
    }
    try {
        const mathjsExpr = treeToMathjs(node);
        console.log('mathjs expression:', mathjsExpr);
        const simplified = math.simplify(mathjsExpr).toString();
        console.log('simplified expression:', simplified);
        return mathjsToTree(simplified);
    } catch (error) {
        console.error('Error in simplifySubExpression:', error);
        return node;
    }
}

function simplifyExpressionTree(node) {
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
                const simplifiedLeft = simplifyExpressionTree(node.left);
                const simplifiedRight = simplifyExpressionTree(node.right);
                return simplifySubExpression(createBinaryOp(node.operator, simplifiedLeft, simplifiedRight));
            case 'function':
                const simplifiedArg = simplifyExpressionTree(node.argument);
                return simplifySubExpression(createFunction(node.name, simplifiedArg));
            case 'derivative':
                const simplifiedExpr = simplifyExpressionTree(node.expression);
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
        console.log('Input node:', JSON.stringify(node, null, 2));
        const simplifiedTree = simplifyExpressionTree(node);
        console.log('Simplified tree:', JSON.stringify(simplifiedTree, null, 2));
        const katexString = toKaTeX(simplifiedTree);
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