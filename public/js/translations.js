export let currentLanguage = 'fr'; // Default language

export async function loadTranslations(language) {
    const response = await fetch(`/locales/${language}.json`);
    return await response.json();
}

export async function updateLanguage(language) {
    currentLanguage = language;
    const translations = await loadTranslations(language);

    // Define a mapping of element IDs/selectors to their translation keys
    const elementTranslations = {
        'title': ['title', 'title'], // [selector, translationKey]
        'h1': ['h1', 'title'],
        'h2': ['h2', 'currentFunction'],
        'simplifyButton': ['#simplifyButton', 'simplifyButton'],

        // Derivative rule buttons
        'linearityRuleButton': ['#linearityRuleButton', 'applyLinearityRule'],
        'powerRuleButton': ['#powerRuleButton', 'applyPowerRule'],
        'chainRuleButton': ['#chainRuleButton', 'applyChainRule'],
        'productRuleButton': ['#productRuleButton', 'applyProductRule'],
        'quotientRuleButton': ['#quotientRuleButton', 'applyQuotientRule'],
        'constantRuleButton': ['#constantRuleButton', 'applyConstantRule'],

        // Fieldset legends
        'fieldsetLegend1': ['fieldset legend', 'exponentialAndLogarithmic'],
        'fieldsetLegend2': ['fieldset:nth-of-type(2) legend', 'trigonometricFunctions'],

        // Function buttons
        'exponentialFunctionButton': ['#exponentialFunctionButton', 'exponentialFunction'],
        'logarithmicFunctionButton': ['#logarithmicFunctionButton', 'logarithmicFunction'],
        'rewriteRecipTrigFunctionsButton': ['#rewriteRecipTrigFunctionsButton', 'rewriteRecipTrigFunctions'],
        'sineFunctionButton': ['#sineFunctionButton', 'sineFunction'],
        'cosineFunctionButton': ['#cosineFunctionButton', 'cosineFunction'],
        'tangentFunctionButton': ['#tangentFunctionButton', 'tangentFunction'],
        'inverseSineFunctionButton': ['#inverseSineFunctionButton', 'inverseSineFunction'],
        'inverseCosineFunctionButton': ['#inverseCosineFunctionButton', 'inverseCosineFunction'],
        'inverseTangentFunctionButton': ['#inverseTangentFunctionButton', 'inverseTangentFunction'],
        'messages': ['#messages', 'connected']
    };

    // Update all elements
    Object.entries(elementTranslations).forEach(([key, [selector, translationKey]]) => {
        if (selector === 'title') {
            document.title = translations[translationKey];
        } else {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = translations[translationKey];
            }
        }
    });

    // Render KaTeX in all relevant elements
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
        ]
    });
}