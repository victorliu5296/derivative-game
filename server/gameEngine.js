// gameEngine.js
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
        lastSuccessfulRule: null,
        expressionChanged: true
    };

    gameStates[roomId] = initialState;
    return initialState;
}

// Apply derivative rule with change tracking
export function applyDerivativeRule(gameState, rule) {
    const ruleFn = Rules.getRuleFunction(rule);
    if (!ruleFn) {
        throw new Error(`Unknown rule: ${rule}`);
    }

    const { tree, score, difficulty, lastSuccessfulRule } = gameState;
    const { result: derivedTree, ruleApplied } = Rules.applyRuleRecursively(tree, ruleFn);

    // If no changes were made or invalid simplify attempt
    if (!ruleApplied || (rule === 'simplify' && lastSuccessfulRule === 'simplify')) {
        return {
            ...gameState,
            expressionChanged: false
        };
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
        lastSuccessfulRule: rule,
        expressionChanged: true
    };
}

// Apply a rule with change tracking
export function applyRuleToGameState(roomId, rule) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found`);
    }

    const gameState = gameStates[roomId];
    const updatedState = applyDerivativeRule(gameState, rule);

    // Only update the game state if the expression actually changed
    if (updatedState.expressionChanged) {
        gameStates[roomId] = updatedState;
    }

    return updatedState;
}

// Reset game state
export function resetGameState(roomId, difficulty) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found.`);
    }

    const currentScore = gameStates[roomId].score;
    const newGameState = initializeGameState(roomId, difficulty);

    gameStates[roomId] = {
        ...newGameState,
        score: currentScore
    };

    return getGameState(roomId);
}

// Get game state
export function getGameState(roomId) {
    if (!gameStates[roomId]) {
        throw new Error(`Game state for room ${roomId} not found`);
    }
    return gameStates[roomId];
}