import { simplifyExpression } from './expressionSimplifier.js';

// Derivative Rules
import { applyLinearityRule } from './derivativeRules.js';
import { applyPowerRule } from './derivativeRules.js';
import { applyChainRule } from './derivativeRules.js';
import { applyProductRule } from './derivativeRules.js';
import { applyQuotientRule } from './derivativeRules.js';
import { applyConstantRule } from './derivativeRules.js';

// Function Derivative Rules
import { applyExpRule, applyLogRule } from './functionDerivatives.js';
import { applySinRule, applyCosRule, applyTanRule } from './functionDerivatives.js';

import { gameConfig } from '../public/config/gameConfig.js';

// Centralized rule map
const ruleMap = {
    simplify: simplifyExpression,
    linearity: applyLinearityRule,
    power: applyPowerRule,
    chain: applyChainRule,
    product: applyProductRule,
    quotient: applyQuotientRule,
    constant: applyConstantRule,
    exp: applyExpRule,
    ln: applyLogRule,
    sin: applySinRule,
    cos: applyCosRule,
    tan: applyTanRule,
};

// Retrieve the function for a specific rule
export function getRuleFunction(rule) {
    return ruleMap[rule] || null;
}

// Recursive rule application
export function applyRuleRecursively(tree, ruleFunction) {
    let ruleApplied = false;

    function recurse(node) {
        if (!node) return node;

        let result = ruleFunction(node);
        const changed = result !== node;

        if (changed) ruleApplied = true;

        if (result.type === 'binary') {
            result.left = recurse(result.left);
            result.right = recurse(result.right);
        } else if (result.type === 'function') {
            result.argument = recurse(result.argument);
        }

        return result;
    }

    const result = recurse(tree);
    return { result, ruleApplied };
}

export function calculateScore(currentScore, difficulty, rule) {
    const baseScore = gameConfig.ruleScores[rule] || 0;
    const multiplier = gameConfig.difficultyMultipliers[difficulty] || 1;

    return currentScore + baseScore * multiplier;
}