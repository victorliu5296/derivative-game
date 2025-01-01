export let currentLanguage = 'fr'; // Default language

export let translations = {}; // General translations

// Listeners for language change
let languageChangeListeners = [];

export function addLanguageChangeListener(listener) {
    languageChangeListeners.push(listener);
}

async function notifyLanguageChange() {
    for (const listener of languageChangeListeners) {
        listener(currentLanguage);
    }
}

// Function to load translations from JSON files
async function loadTranslations(language) {
    const generalResponse = await fetch(`/locales/${language}.json`);

    translations = await generalResponse.json();
}

// Main function to update the language
export async function updateLanguage(language) {
    currentLanguage = language;
    await loadTranslations(language);

    // Notify other components about the language change
    notifyLanguageChange();
}

// Function to retrieve a specific translation
export function getTranslation(key, params = {}) {
    if (!translations[key]) {
        console.warn(`Translation key not found: ${key}`);
        return `404 - [${key}]`; // Fallback for missing translations
    }
    return Object.keys(params).reduce((msg, param) => {
        return msg.replace(`{${param}}`, params[param]);
    }, translations[key]);
}