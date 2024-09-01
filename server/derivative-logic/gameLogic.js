// gameLogic.js

import { generateRandomFunction } from './randomFunctionGenerator.js';
import { derivative } from './derivativeRules.js';
import { toKaTeX } from './katexConverter.js';

export function initializeGame() {
    const randomFunc = generateRandomFunction();
    const katexExpression = toKaTeX(randomFunc);

    return {
        expression: randomFunc,
        katex: katexExpression
    };
}

export function applyDerivativeRule(expression) {
    const derivedExpression = derivative(expression);
    const katexExpression = toKaTeX(derivedExpression);

    return {
        expression: derivedExpression,
        katex: katexExpression
    };
}

// You can add more game-specific logic here