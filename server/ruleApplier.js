import { applyPowerRule, applyProductRule } from './derivativeRules.js';

const ruleFunctions = {
    power: applyPowerRule,
    product: applyProductRule,
    // Add more rules as needed
};

export function applyRuleToFunction(func, rule) {
    const ruleFunction = ruleFunctions[rule];

    if (!ruleFunction) {
        throw new Error(`Unknown rule: ${rule}`);
    }

    return ruleFunction(func);
}