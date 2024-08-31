export let currentLanguage = 'fr'; // Default language

export async function loadTranslations(language) {
    const response = await fetch(`/locales/${language}.json`);
    return await response.json();
}

export async function updateLanguage(language) {
    currentLanguage = language;
    const translations = await loadTranslations(language);

    document.title = translations.title;
    document.querySelector('h1').textContent = translations.title;
    document.querySelector('h2').textContent = translations.currentFunction;

    document.getElementById('powerRuleButton').textContent = translations.applyPowerRule;
    document.getElementById('productRuleButton').textContent = translations.applyProductRule;
    document.getElementById('chainRuleButton').textContent = translations.applyChainRule;
    document.getElementById('quotientRuleButton').textContent = translations.applyQuotientRule;
    document.getElementById('linearityRuleButton').textContent = translations.applyLinearityRule;

    document.getElementById('exponentialFunctionButton').textContent = translations.exponentialFunction;
    document.getElementById('logarithmicFunctionButton').textContent = translations.logarithmicFunction;
    document.getElementById('trigonometricFunctionButton').textContent = translations.trigonometricFunction;
    document.getElementById('inverseTrigonometricFunctionButton').textContent = translations.inverseTrigonometricFunction;

    document.getElementById('messages').textContent = translations.connected;
}
