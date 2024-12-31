import { generateRandomFunction } from './randomFunctionGenerator.js';
import { toKaTeX } from './toKaTeX.js';
import * as Rules from './derivativeRules.js';
import * as FunctionDerivatives from './functionDerivatives.js';
import { simplifyExpression } from './expressionSimplifier.js';

export function initializeGame(difficulty = 'medium') {
    const randomFunc = generateRandomFunction();
    const katexExpression = toKaTeX(randomFunc);

    return {
        tree: randomFunc,
        katex: katexExpression,
        score: 0,
        isComplete: false,
        difficulty,
    };
}

const ruleMap = {
    simplify: simplifyExpression,
    linearity: Rules.applyLinearityRule,
    power: Rules.applyPowerRule,
    chain: Rules.applyChainRule,
    product: Rules.applyProductRule,
    quotient: Rules.applyQuotientRule,
    constant: Rules.applyConstantRule,
    exp: FunctionDerivatives.applyExpRule,
    ln: FunctionDerivatives.applyLogRule,
    sin: FunctionDerivatives.applySinRule,
    cos: FunctionDerivatives.applyCosRule,
    tan: FunctionDerivatives.applyTanRule,
};

export function applyDerivativeRule(gameState, rule) {
    const { tree, score, difficulty } = gameState;

    if (!ruleMap[rule]) {
        throw new Error(`Unknown rule: ${rule}`);
    }

    const { result: derivedTree, ruleApplied } = applyRuleRecursively(tree, rule);

    if (ruleApplied) {
        const newScore = calculateScore(score, difficulty, rule);
        const katexExpression = toKaTeX(derivedTree);

        return {
            ...gameState,
            tree: derivedTree,
            katex: katexExpression,
            score: newScore,
            isComplete: checkCompletion(derivedTree),
        };
    } else {
        return { ...gameState, isComplete: false }; // No change to the state
    }
}

function applyRuleRecursively(expr, rule) {
    const applyRule = ruleMap[rule];
    let ruleApplied = false;

    function recurse(node) {
        let result = applyRule(node);
        let changed = result !== node;

        if (changed) {
            ruleApplied = true;
        }

        switch (result.type) {
            case 'binary': {
                const newLeft = recurse(result.left);
                const newRight = recurse(result.right);
                if (newLeft !== result.left || newRight !== result.right) {
                    result = { ...result, left: newLeft, right: newRight };
                }
                break;
            }
            case 'function': {
                const newArg = recurse(result.argument);
                if (newArg !== result.argument) {
                    result = { ...result, argument: newArg };
                }
                break;
            }
            case 'derivative': {
                const newExpr = recurse(result.tree);
                if (newExpr !== result.tree) {
                    result = { ...result, tree: newExpr };
                }
                break;
            }
        }

        return changed ? recurse(result) : result;
    }

    const result = recurse(expr);
    return { result, ruleApplied };
}

function calculateScore(currentScore, difficulty, rule) {
    const ruleScores = {
        linearity: 5,
        power: 10,
        chain: 15,
        product: 20,
        quotient: 25,
        constant: 5,
        exp: 15,
        ln: 15,
        sin: 10,
        cos: 10,
        tan: 15,
    };

    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        expert: 3,
    };

    const baseScore = ruleScores[rule] || 0;
    return currentScore + baseScore * (difficultyMultiplier[difficulty] || 1);
}

function checkCompletion(tree) {
    // Example completion logic: check if the tree is reduced to a constant
    return tree.type === 'constant';
}