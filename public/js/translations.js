export let currentLanguage = 'fr'; // Default language

export async function loadTranslations(language) {
    const response = await fetch(`/locales/${language}.json`);
    return await response.json();
}

export let translations = {};

export async function updateLanguage(language) {
    currentLanguage = language;
    translations = await loadTranslations(language);

    document.querySelectorAll('[data-translation-key]').forEach((element) => {
        const key = element.getAttribute('data-translation-key');
        if (translations[key]) {
            if (element.tagName === 'TITLE') {
                document.title = translations[key];
            } else {
                // Preserve child elements like <span>
                const spanElements = element.querySelectorAll('span');
                const translation = translations[key];

                // Replace only text outside <span>
                element.childNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.textContent = translation; // Update translation
                    }
                });

                // Re-attach spans (or leave them untouched if already correct)
                spanElements.forEach(span => element.appendChild(span));
            }
        }
    });

    // Render KaTeX
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
        ],
    });
}

export function getTranslation(key, params = {}) {
    if (!translations[key]) {
        console.warn(`Translation key not found: ${key}`);
        return `404 - [${key}]`; // Fallback to a placeholder for missing translations
    }
    return Object.keys(params).reduce((msg, param) => {
        return msg.replace(`{${param}}`, params[param]);
    }, translations[key]);
}