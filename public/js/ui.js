import { sendSocketMessage } from "./websocket.js";

const ANIMATION_DURATION = 1000; // Animation duration in milliseconds

export function initializeUI() {
    const ruleButtons = [
        { id: 'simplifyButton', rule: 'simplify' },
        { id: 'rewriteRecipTrigFunctionsButton', rule: 'rewriteRecipTrigFunctions' },
        { id: 'powerRuleButton', rule: 'power' },
        { id: 'productRuleButton', rule: 'product' },
        { id: 'chainRuleButton', rule: 'chain' },
        { id: 'quotientRuleButton', rule: 'quotient' },
        { id: 'linearityRuleButton', rule: 'linearity' },
        { id: 'constantRuleButton', rule: 'constant' },
        { id: 'exponentialFunctionButton', rule: 'exp' },
        { id: 'logarithmicFunctionButton', rule: 'ln' },
        { id: 'sineFunctionButton', rule: 'sin' },
        { id: 'cosineFunctionButton', rule: 'cos' },
        { id: 'tangentFunctionButton', rule: 'tan' },
        { id: 'inverseSineFunctionButton', rule: 'arcsin' },
        { id: 'inverseCosineFunctionButton', rule: 'arccos' },
        { id: 'inverseTangentFunctionButton', rule: 'arctan' },
    ];

    setupMultipleButtons(ruleButtons, (rule) => {
        console.log(`Button clicked for rule: ${rule}`);
        sendSocketMessage('applyRule', { rule });
    });

    const difficultySelect = document.getElementById('difficultySelect');
    const newExpressionButton = document.getElementById('newExpressionButton');
    const currentDifficultyElement = document.getElementById('currentDifficulty');

    // Update difficulty indicator dynamically
    difficultySelect.addEventListener('change', () => {
        console.log(`Selected difficulty: ${difficultySelect.value}`);
    });

    // Handle "Get New Expression" button click
    newExpressionButton.addEventListener('click', () => {
        const selectedDifficulty = difficultySelect.value;
        console.log(`Requesting new expression with difficulty: ${selectedDifficulty}`);
        sendSocketMessage('reset', { difficulty: selectedDifficulty });

        // Update current difficulty indicator
        currentDifficultyElement.textContent = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
    });
}

function setupButton(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
        console.log(`Setting up button with ID: ${buttonId}`);
        button.addEventListener('click', callback);
    } else {
        console.warn(`Button with ID ${buttonId} not found`);
    }
}

function setupMultipleButtons(buttonConfigs, callback) {
    buttonConfigs.forEach(({ id, rule }) => {
        setupButton(id, () => callback(rule));
    });
}

export function renderWithAnimation(elementId, katexString) {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    console.log(`Rendering KaTeX string for element ${elementId}:`, katexString);
    element.textContent = ''; // Clear previous content
    element.classList.remove('animate'); // Remove the animation class
    katex.render(katexString, element, { throwOnError: false }); // Render the KaTeX

    void element.offsetWidth; // Trigger reflow to restart animation
    element.classList.add('animate'); // Add animation class
}

export function displayMessage(message) {
    console.log('Displaying message:', message);
    const messagesElement = document.getElementById('messages');
    if (messagesElement) {
        messagesElement.textContent = message;
    } else {
        console.error('Messages element not found');
    }
}

export function triggerErrorAnimation(elementId, errorMessage) {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`Triggering error animation for ${elementId}:`, errorMessage);
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), ANIMATION_DURATION);
    } else {
        console.error(`Element with ID ${elementId} not found for error animation`);
    }
}