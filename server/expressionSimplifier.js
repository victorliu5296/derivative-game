import * as math from 'mathjs';
import { createConstant, createVariable, createBinaryOp, createFunction, createDerivative } from './expressionStructure.js';
import { toKaTeX } from './toKaTeX.js';

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
            return `derivative(${treeToMathjs(node.tree)}, "${node.variable}")`;
        default:
            console.error('Unknown node type in treeToMathjs:', node.type);
            return '';
    }
}

// Parse mathjs expression back to your nested object structure
function mathjsToTree(tree) {
    try {
        let parsedTree;
        if (typeof tree === 'string') {
            parsedTree = math.parse(tree);
        } else if (tree.toString && typeof tree.toString === 'function') {
            parsedTree = math.parse(tree.toString());
        } else {
            throw new Error('Invalid expression type in mathjsToTree');
        }
        return convertNode(parsedTree);
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
                        node.args[1]
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

const simplificationRules = [
    { l: "n1/n2/n3", r: "n1/(n2*n3)", repeat: true },
    { l: "-1 * n", r: "-n" },
]

function simplifySubExpression(node) {
    if (node.type === 'derivative') {
        const simplifiedInner = simplifySubExpression(node.tree);
        return createDerivative(simplifiedInner, node.variable);
    }
    try {
        const mathjsExpr = treeToMathjs(node);
        const simplified1 = math.simplify(mathjsExpr);
        const simplified2 = math.simplify(simplified1, simplificationRules);
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
                console.log('Before simplifying derivative:', node);
                const simplifiedExpr = simplifyExpressionTree(node.tree, true);
                console.log('After simplifying derivative:', simplifiedExpr);
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
        console.log('Simplifying expression tree:', JSON.stringify(node, null, 2));
        const simplifiedTree = simplifyExpressionTree(node, true);
        if (!simplifiedTree) {
            console.error('simplifyExpressionTree returned null');
            return node;
        }
        console.log('Simplified tree:', JSON.stringify(simplifiedTree, null, 2));
        let katexString = toKaTeX(simplifiedTree);
        console.log('KaTeX string:', katexString);
        return simplifiedTree;
    } catch (error) {
        console.error('Error in simplifyExpression:', error);
        return node;
    }
}

export function isFullyDifferentiated(tree) {
    if (!tree) return true;

    switch (tree.type) {
        case 'derivative':
            return false;
        case 'binary':
            return isFullyDifferentiated(tree.left) && isFullyDifferentiated(tree.right);
        case 'function':
            return isFullyDifferentiated(tree.argument);
        case 'constant':
        case 'variable':
            return true;
        default:
            console.error('Unknown tree type in isFullyDifferentiated:', tree);
            return true;
    }
}