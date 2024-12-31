import { socket } from './websocket.js';

export function initializeUI() {
    const ruleButtons = [
        { id: 'simplifyButton', rule: 'simplify' }, // Simplify is treated as a rule
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
}

function setupButtons(buttonId, callback) {
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
        setupButtons(id, () => callback(rule));
    });
}

function sendSocketMessage(type, data = {}) {
    const message = { type, ...data };
    console.log(`Sending WebSocket message:`, message);
    socket.send(JSON.stringify(message));
}

export function renderWithAnimation(elementId, latexString) {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    console.log(`Rendering LaTeX string for element ${elementId}:`, latexString);
    element.textContent = ''; // Clear previous content
    element.classList.remove('animate'); // Remove the animation class
    katex.render(latexString, element, { throwOnError: false }); // Render the LaTeX

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
        setTimeout(() => element.classList.remove('shake-error'), 1000); // Remove animation after 1 second
    } else {
        console.error(`Element with ID ${elementId} not found for error animation`);
    }
}
