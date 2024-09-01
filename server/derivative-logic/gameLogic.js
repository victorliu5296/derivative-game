// gameLogic.js

import { generateRandomFunction } from './randomFunctionGenerator.js';
import { toKaTeX } from './katexConverter.js';
import * as Rules from './derivativeRules.js';

export function initializeGame() {
    const randomFunc = generateRandomFunction();
    const katexExpression = toKaTeX(randomFunc);
    console.log('Generated random function:', randomFunc);
    console.log('Converted to KaTeX:', katexExpression);

    return {
        expression: randomFunc,
        katex: katexExpression
    };
}

const ruleMap = {
    power: Rules.applyPowerRule,
    product: Rules.applyProductRule,
    quotient: Rules.applyQuotientRule,
    chain: Rules.applyChainRule,
    linearity: Rules.applyLinearityRule
};

export function applyDerivativeRule(expression, rule) {
    console.log(`Attempting to apply rule: ${rule}`);
    console.log('Current expression:', JSON.stringify(expression, null, 2));

    const { result: derivedExpression, ruleApplied } = applyRuleRecursively(expression, rule);

    if (ruleApplied) {
        console.log(`Successfully applied ${rule} rule`);
    } else {
        console.log(`${rule} rule was not applicable to any part of the expression`);
    }

    console.log('Derived expression:', JSON.stringify(derivedExpression, null, 2));

    const katexExpression = toKaTeX(derivedExpression);
    console.log('KaTeX expression:', katexExpression);

    return {
        expression: derivedExpression,
        katex: katexExpression
    };
}

function applyRuleRecursively(expr, rule) {
    const applyRule = ruleMap[rule];

    if (!applyRule) {
        console.error(`Unknown rule: ${rule}`);
        throw new Error(`Unknown rule: ${rule}`);
    }

    let ruleApplied = false;

    function recurse(node) {
        // Try to apply the rule to the current node
        let result = applyRule(node);
        let changed = result !== node;

        if (changed) {
            ruleApplied = true;
        }

        // Recursively apply to sub-expressions
        switch (result.type) {
            case 'binary':
                const newLeft = recurse(result.left);
                const newRight = recurse(result.right);
                if (newLeft !== result.left || newRight !== result.right) {
                    result = { ...result, left: newLeft, right: newRight };
                    changed = true;
                }
                break;
            case 'function':
                const newArg = recurse(result.argument);
                if (newArg !== result.argument) {
                    result = { ...result, argument: newArg };
                    changed = true;
                }
                break;
            case 'derivative':
                const newExpr = recurse(result.expression);
                if (newExpr !== result.expression) {
                    result = { ...result, expression: newExpr };
                    changed = true;
                }
                break;
        }

        // If any changes were made, try applying the rule again
        return changed ? recurse(result) : result;
    }

    const result = recurse(expr);
    return { result, ruleApplied };
}