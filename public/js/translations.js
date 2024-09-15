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

    document.getElementById('simplifyButton').textContent = translations.simplifyButton;

    // Update derivative rule buttons
    document.getElementById('linearityRuleButton').textContent = translations.applyLinearityRule;
    document.getElementById('powerRuleButton').textContent = translations.applyPowerRule;
    document.getElementById('chainRuleButton').textContent = translations.applyChainRule;
    document.getElementById('productRuleButton').textContent = translations.applyProductRule;
    document.getElementById('quotientRuleButton').textContent = translations.applyQuotientRule;
    document.getElementById('constantRuleButton').textContent = translations.applyConstantRule;

    // Update fieldset legends and function derivative buttons
    document.querySelector('fieldset legend').textContent = translations.exponentialAndLogarithmic;
    document.querySelector('fieldset:nth-of-type(2) legend').textContent = translations.trigonometricFunctions;

    document.getElementById('exponentialFunctionButton').textContent = translations.exponentialFunction;
    document.getElementById('logarithmicFunctionButton').textContent = translations.logarithmicFunction;

    document.getElementById('rewriteRecipTrigFunctionsButton').textContent = translations.rewriteRecipTrigFunctions;
    document.getElementById('sineFunctionButton').textContent = translations.sineFunction;
    document.getElementById('cosineFunctionButton').textContent = translations.cosineFunction;
    document.getElementById('tangentFunctionButton').textContent = translations.tangentFunction;
    document.getElementById('inverseSineFunctionButton').textContent = translations.inverseSineFunction;
    document.getElementById('inverseCosineFunctionButton').textContent = translations.inverseCosineFunction;
    document.getElementById('inverseTangentFunctionButton').textContent = translations.inverseTangentFunction;

    document.getElementById('messages').textContent = translations.connected;

    // Render KaTeX in all relevant elements
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
        ]
    });
}
