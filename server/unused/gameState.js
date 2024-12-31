import { generateRandomFunction } from '../randomFunctionGenerator.js';
import { toKaTeX } from '../toKaTeX.js';
import { applyDerivativeRule } from './gameLogic.js';
import { getDifficultySettings } from '../difficultySettings.js';

const gameStates = {};

export function initializeGameState(roomId, difficulty = 'medium') {
    console.log(`Initializing game state for room ${roomId} with difficulty ${difficulty}`);
    const difficultySettings = getDifficultySettings(difficulty);
    const originalTree = generateRandomFunction(difficultySettings);
    const katexExpression = toKaTeX(originalTree);

    console.log('Generated expression: ', katexExpression);

    gameStates[roomId] = {
        tree: originalTree,
        katex: katexExpression,
        score: 0,
        isComplete: false,
        difficulty,
    };

    return getGameState(roomId);
}

export function getGameState(roomId) {
    const state = gameStates[roomId];
    if (!state) {
        throw new Error(`Game state for room ${roomId} not found.`);
    }
    return {
        tree: state.tree,
        katex: state.katex,
        score: state.score,
        isComplete: state.isComplete,
        difficulty: state.difficulty,
    };
}

export function applyRuleToGameState(roomId, rule) {
    const state = gameStates[roomId];
    if (!state) {
        throw new Error(`Game state for room ${roomId} not found.`);
    }

    const updatedTree = applyDerivativeRule(state, rule);
    const updatedKatex = toKaTeX(updatedTree);
    const isComplete = isFullyDifferentiated(updatedTree);
    gameStates[roomId] = { ...state, tree: updatedTree, katex: updatedKatex, isComplete: isComplete };

    return getGameState(roomId);
}

export function resetGameState(roomId) {
    if (gameStates[roomId]) {
        const difficulty = gameStates[roomId].difficulty;
        delete gameStates[roomId];
        return initializeGameState(roomId, difficulty);
    }
    return initializeGameState(roomId);
}