// ui.js
import { eventBus, EVENTS } from './eventBus.js';
import { getTranslation, addLanguageChangeListener } from "./translations.js";
import { gameConfig } from '../config/gameConfig.js';

const ANIMATION_DURATION = 1000;

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

    setupMultipleButtons(ruleButtons, handleRuleButtonClick);
    setupDifficultyControls();
    await initializeMathContent();
    setupEventListeners();
}

function setupDifficultyControls() {
    const difficultySelect = document.getElementById('difficultySelect');
    const newExpressionButton = document.getElementById('newExpressionButton');

    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            console.log(`Selected difficulty: ${difficultySelect.value}`);
            updateDifficultyDisplay(difficultySelect.value);
        });
    }

    if (newExpressionButton) {
        newExpressionButton.addEventListener('click', () => {
            const selectedDifficulty = difficultySelect?.value || 'easy';
            eventBus.publish(EVENTS.NEW_EXPRESSION_REQUESTED, {
                difficulty: selectedDifficulty
            });
            updateDifficultyDisplay(selectedDifficulty);
        });
    }
}

function setupEventListeners() {
    eventBus.subscribe(EVENTS.KATEX_UPDATED, ({ katex }) => {
        renderWithAnimation('currentExpression', katex);
    });

    eventBus.subscribe(EVENTS.UI_MESSAGE, ({ message }) => {
        displayMessage(message);
    });

    eventBus.subscribe(EVENTS.ERROR_OCCURRED, ({ elementId, message }) => {
        triggerErrorAnimation(elementId, message);
    });

    eventBus.subscribe(EVENTS.GAME_STATE_UPDATED, handleGameStateUpdate);

    // Add language change listener
    addLanguageChangeListener(() => {
        // Update static translations
        updateUITranslations();

        // Re-translate current difficulty and multiplier
        const difficultySelect = document.getElementById('difficultySelect');
        if (difficultySelect) {
            const currentDifficulty = difficultySelect.value || 'easy';
            updateDifficultyDisplay(currentDifficulty);
        }

        // Re-translate current message if exists
        const messagesElement = document.getElementById('messages');
        if (messagesElement && messagesElement.getAttribute('data-message-key')) {
            const messageKey = messagesElement.getAttribute('data-message-key');
            displayMessage(getTranslation(messageKey));
        }
    });
}

function handleGameStateUpdate(state) {
    const { score, isComplete, difficulty, expressionChanged, lastSuccessfulRule } = state;

    if (lastSuccessfulRule === 'simplify' && !expressionChanged) {
        eventBus.publish(EVENTS.ERROR_OCCURRED, {
            elementId: 'simplifyButton',
            message: 'You cannot apply "simplify" twice in a row!'
        });
        return;
    }

    if (score !== undefined) {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }

    if (isComplete !== undefined) {
        const messageKey = isComplete ? 'congratulations' : 'keepGoing';
        displayMessage(getTranslation(messageKey), messageKey);
    }

    if (difficulty) {
        updateDifficultyDisplay(difficulty);
        const difficultySelect = document.getElementById('difficultySelect');
        if (difficultySelect) {
            difficultySelect.value = difficulty;
        }
    }
}

function handleRuleButtonClick(rule) {
    eventBus.publish(EVENTS.RULE_APPLIED, { rule });
}

async function loadMathKeys() {
    const mathResponse = await fetch(`/locales/math.json`);
    return await mathResponse.json();
}

function updateUITranslations() {
    document.querySelectorAll('[data-translation-key]').forEach((element) => {
        const key = element.getAttribute('data-translation-key');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });

    // Also update any dynamic messages
    const messagesElement = document.getElementById('messages');
    if (messagesElement && messagesElement.getAttribute('data-current-key')) {
        const currentKey = messagesElement.getAttribute('data-current-key');
        messagesElement.textContent = getTranslation(currentKey);
    }
}

async function initializeMathContent() {
    await injectMathContent();
    renderMathGlobally();
}

async function injectMathContent() {
    let mathTranslations = await loadMathKeys();
    document.querySelectorAll('[data-math-key]').forEach((element) => {
        const key = element.getAttribute('data-math-key');
        const katexExpression = mathTranslations[key];
        if (katexExpression) {
            element.textContent = katexExpression;
        } else {
            console.warn(`Math key not found: ${key}`);
            element.textContent = '';
        }
    });
}

function renderMathGlobally() {
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
    });
}

function setupMultipleButtons(buttonConfigs, callback) {
    buttonConfigs.forEach(({ id, rule }) => {
        setupButton(id, () => callback(rule));
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

function renderWithAnimation(elementId, katexString) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    console.log(`Rendering KaTeX string for element ${elementId}:`, katexString);
    element.textContent = '';
    element.classList.remove('animate');
    katex.render(katexString, element);
    void element.offsetWidth;
    element.classList.add('animate');
}

// When displaying messages, store the translation key
function displayMessage(message, messageKey = null) {
    const messagesElement = document.getElementById('messages');
    if (messagesElement) {
        messagesElement.textContent = message;
        if (messageKey) {
            messagesElement.setAttribute('data-message-key', messageKey);
        }
    }
}

function triggerErrorAnimation(elementId, errorMessage) {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`Triggering error animation for ${elementId}:`, errorMessage);
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), ANIMATION_DURATION);
    } else {
        console.error(`Element with ID ${elementId} not found for error animation`);
    }
}

function updateDifficultyDisplay(difficulty) {
    const difficultyElement = document.getElementById('currentDifficulty');
    const multiplierElement = document.getElementById('difficultyMultiplier');

    if (difficultyElement) {
        const translationKey = `difficulty${capitalizeFirstLetter(difficulty)}`;
        difficultyElement.textContent = getTranslation(translationKey);
        // Store the translation key for future updates
        difficultyElement.setAttribute('data-translation-key', translationKey);
    }

    if (multiplierElement) {
        const multiplier = gameConfig.difficultyMultipliers[difficulty];
        multiplierElement.textContent = `${multiplier}x`;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
