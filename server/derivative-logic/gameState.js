import { generateRandomFunction } from './randomFunctionGenerator.js';
import { toKaTeX } from './katexConverter.js';
import { derivative } from './derivativeRules.js';

const gameStates = {};

export function initializeGameState(roomId) {
    const originalExpression = generateRandomFunction();
    gameStates[roomId] = {
        originalExpression,
        currentExpression: originalExpression,
        steps: []
    };
    return getGameState(roomId);
}

export function getGameState(roomId) {
    if (!gameStates[roomId]) {
        return initializeGameState(roomId);
    }
    return {
        originalKatex: toKaTeX(gameStates[roomId].originalExpression),
        currentKatex: toKaTeX(gameStates[roomId].currentExpression),
        steps: gameStates[roomId].steps
    };
}

export function applyDerivativeRule(roomId) {
    if (gameStates[roomId]) {
        const newExpression = derivative(gameStates[roomId].currentExpression);
        gameStates[roomId].currentExpression = newExpression;
        gameStates[roomId].steps.push(toKaTeX(newExpression));
        return getGameState(roomId);
    }
    return null;
}

export function resetGameState(roomId) {
    if (gameStates[roomId]) {
        delete gameStates[roomId];
    }
    return initializeGameState(roomId);
}