export const difficultySettings = {
    easy: {
        minTerms: 1,
        maxTerms: 2,
        maxDepth: 1,
        maxCoefficient: 5,
        functionProbability: 0.1,
        exponentProbability: 0.1,
        maxConstantExponent: 3,
        maxExponentNesting: 1,
        allowNonConstantExponents: false,
        functions: ['sin', 'cos'],
        operators: ['+', '-', '*']
    },
    medium: {
        minTerms: 2,
        maxTerms: 3,
        maxDepth: 2,
        maxCoefficient: 8,
        functionProbability: 0.2,
        exponentProbability: 0.2,
        maxConstantExponent: 5,
        maxExponentNesting: 1,
        allowNonConstantExponents: false,
        functions: ['sin', 'cos', 'tan', 'ln'],
        operators: ['+', '-', '*', '/']
    },
    hard: {
        minTerms: 2,
        maxTerms: 4,
        maxDepth: 3,
        maxCoefficient: 10,
        functionProbability: 0.3,
        exponentProbability: 0.3,
        maxConstantExponent: 8,
        maxExponentNesting: 2,
        allowNonConstantExponents: false,
        functions: ['sin', 'cos', 'tan', 'ln', 'exp'],
        operators: ['+', '-', '*', '/', '^']
    },
    expert: {
        minTerms: 3,
        maxTerms: 5,
        maxDepth: 4,
        maxCoefficient: 12,
        functionProbability: 0.4,
        exponentProbability: 0.4,
        maxConstantExponent: 10,
        maxExponentNesting: 3,
        allowNonConstantExponents: true,
        functions: ['sin', 'cos', 'tan', 'ln', 'exp'],
        operators: ['+', '-', '*', '/', '^']
    }
};

let currentDifficulty = 'medium';

export function getCurrentDifficulty() {
    return currentDifficulty;
}

export function getDifficultySettings() {
    return difficultySettings[currentDifficulty];
}

export function setDifficulty(difficulty) {
    if (difficultySettings[difficulty]) {
        currentDifficulty = difficulty;
        return true;
    }
    return false;
}
