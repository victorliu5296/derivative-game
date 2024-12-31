import { generateRandomFunction } from './randomFunctionGenerator.js';
import { toKaTeX } from './toKaTeX.js';
import * as Rules from './rules.js';
import { isFullyDifferentiated } from './expressionSimplifier.js';

const gameStates = {};

// Initialize game state
export function initializeGameState(roomId, difficulty = 'medium') {
    if (!roomId) throw new Error('Room ID is required to initialize a game state');

    console.log(`Initializing game for room: ${roomId}, Difficulty: ${difficulty}`);
    const randomFunc = generateRandomFunction();
    const katexExpression = toKaTeX(randomFunc);

    const initialState = {
        tree: randomFunc,
        katex: katexExpression,
        score: 0,
        isComplete: false,
        difficulty,
    };

    gameStates[roomId] = initialState;
    return initialState;
}

// Get game state
export function getGameState(roomId) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found`);
    }
    return gameStates[roomId];
}

// Apply a rule
export function applyRuleToGameState(roomId, rule) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found`);
    }

    const gameState = gameStates[roomId];
    const updatedState = applyDerivativeRule(gameState, rule);

    gameStates[roomId] = updatedState;
    return updatedState;
}

// Reset game state
export function resetGameState(roomId, difficulty) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found.`);
    }

    const currentScore = gameStates[roomId].score; // Preserve current score
    const isComplete = false; // Reset completion status
    const newGameState = initializeGameState(roomId, difficulty);

    // Merge the preserved score and reset completion status into the new game state
    gameStates[roomId] = { ...newGameState, score: currentScore, isComplete };

    return getGameState(roomId);
}

// Apply derivative rule
export function applyDerivativeRule(gameState, rule) {
    const ruleFn = Rules.getRuleFunction(rule);
    if (!ruleFn) {
        throw new Error(`Unknown rule: ${rule}`);
    }

    const { tree, score, difficulty } = gameState;
    const { result: derivedTree, ruleApplied } = Rules.applyRuleRecursively(tree, ruleFn);

    if (!ruleApplied) {
        return { ...gameState }; // No changes
    }

    const newScore = Rules.calculateScore(score, difficulty, rule);
    const katexExpression = toKaTeX(derivedTree);
    const isComplete = isFullyDifferentiated(derivedTree);

    return {
        ...gameState,
        tree: derivedTree,
        katex: katexExpression,
        score: newScore,
        isComplete,
    };
}