import { sendSocketMessage } from "./websocket.js";
import { addLanguageChangeListener, getTranslation } from "./translations.js";

export let lastAppliedRule = null; // Tracks the last applied rule
const ANIMATION_DURATION = 1000; // Animation duration in milliseconds

export async function initializeUI() {
    updateUITranslations();

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
    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            console.log(`Selected difficulty: ${difficultySelect.value}`);
        });
    }

    // Handle "Get New Expression" button click
    if (newExpressionButton) {
        newExpressionButton.addEventListener('click', () => {
            const selectedDifficulty = difficultySelect?.value || 'easy';
            console.log(`Requesting new expression with difficulty: ${selectedDifficulty}`);
            sendSocketMessage('reset', { difficulty: selectedDifficulty });

            // Update current difficulty indicator
            if (currentDifficultyElement) {
                currentDifficultyElement.textContent =
                    selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
            }
        });
    }

    // Inject and render math content once
    await injectMathContent();
    renderMathGlobally();

    // React to language changes
    addLanguageChangeListener(updateUITranslations);
}

// Function to load translations from JSON files
async function loadMathKeys() {
    const mathResponse = await fetch(`/locales/math.json`);
    return await mathResponse.json();
}

// Function to update UI translations dynamically (for non-math content)
function updateUITranslations() {
    // Update UI elements with static translations
    document.querySelectorAll('[data-translation-key]').forEach((element) => {
        const key = element.getAttribute('data-translation-key');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });
}

// Inject math expressions dynamically into elements with `data-math-key`
async function injectMathContent() {
    let mathTranslations = await loadMathKeys();

    document.querySelectorAll('[data-math-key]').forEach((element) => {
        const key = element.getAttribute('data-math-key');
        const katexExpression = mathTranslations[key];
        if (katexExpression) {
            element.textContent = katexExpression; // Inject raw LaTeX string
        } else {
            console.warn(`Math key not found: ${key}`);
            element.textContent = ''; // Clear content if key not found
        }
    });
}

// Render KaTeX globally for all math expressions with delimiters
function renderMathGlobally() {
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
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
        setupButton(id, () => {
            if (rule === 'simplify' && lastAppliedRule === 'simplify') {
                // Trigger error animation if "simplify" is clicked twice in a row
                triggerErrorAnimation(id, 'You cannot apply "simplify" twice in a row!');
                return;
            }

            // Update the last applied rule
            lastAppliedRule = rule;

            // Execute the callback for the rule
            callback(rule);
        });
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
    katex.render(katexString, element); // Render the KaTeX

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