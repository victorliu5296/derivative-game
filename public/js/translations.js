import { initializeWebSocket } from './websocket.js';

export let currentLanguage = 'fr'; // Default language
export let currentTranslations = {}; // Store translations globally

// Function to load translations from a JSON file
export async function loadTranslations(language) {
    const response = await fetch(`/locales/${language}.json`);
    return await response.json();
}

// Function to update language and refresh UI
export async function updateLanguage(language) {
    currentLanguage = language;
    const translations = await loadTranslations(language);
    currentTranslations = translations; // Save translations globally
    console.log('Loaded Translations:', currentTranslations);

    // Map of element IDs or selectors to translation keys
    const translationMap = {
        'title': translations.title,
        'h1': translations.title,
        'h2': translations.currentFunction,
        'simplifyButton': translations.simplifyButton,
        'derivativeRulesTitle': translations.derivativeRules,
        'linearityRuleButton': translations.applyLinearityRule,
        'powerRuleButton': translations.applyPowerRule,
        'chainRuleButton': translations.applyChainRule,
        'productRuleButton': translations.applyProductRule,
        'quotientRuleButton': translations.applyQuotientRule,
        'constantRuleButton': translations.applyConstantRule,
        'functionDerivativesTitle': translations.functionDerivatives,
        'exponentialFunctionButton': translations.exponentialFunction,
        'logarithmicFunctionButton': translations.logarithmicFunction,
        'rewriteRecipTrigFunctionsButton': translations.rewriteRecipTrigFunctions,
        'sineFunctionButton': translations.sineFunction,
        'cosineFunctionButton': translations.cosineFunction,
        'tangentFunctionButton': translations.tangentFunction,
        'inverseSineFunctionButton': translations.inverseSineFunction,
        'inverseCosineFunctionButton': translations.inverseCosineFunction,
        'inverseTangentFunctionButton': translations.inverseTangentFunction,
        "fieldset legend:first-of-type": translations.exponentialAndLogarithmic,
        "fieldset legend:nth-of-type(2)": translations.trigonometricFunctions,
        '#difficultySettings label[for="difficulty"]': translations.difficultyLabel,
        '#difficultySelect option[value="easy"]': translations.difficultyEasy,
        '#difficultySelect option[value="medium"]': translations.difficultyMedium,
        '#difficultySelect option[value="hard"]': translations.difficultyHard,
        '#difficultySelect option[value="expert"]': translations.difficultyExpert
    };

    // Update the UI translations
    Object.entries(translationMap).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text || ''; // Fallback to empty string if text is undefined
        }
    });

    // Rebind WebSocket messages with updated translations
    initializeWebSocket?.(); // Ensure this function is defined safely

    // Render KaTeX for math expressions
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
        ]
    });
}

// Ensure WebSocket is initialized the first time translations are loaded
(async function initializeApp() {
    await updateLanguage(currentLanguage); // Load default language translations
    initializeWebSocket(); // Open WebSocket connection after translations are ready
})();
