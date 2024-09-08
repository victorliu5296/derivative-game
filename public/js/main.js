import { updateLanguage } from './translations.js';
import { initializeUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Set default language and initialize the language setting
    const defaultLanguage = 'fr'; // Set the default language to French
    updateLanguage(defaultLanguage); // This will load the French translations by default

    // Set up buttons using functions from ui.js
    initializeUI();

    // Language switcher buttons
    document.getElementById('langEn').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('langFr').addEventListener('click', () => updateLanguage('fr'));
    document.getElementById('langEs').addEventListener('click', () => updateLanguage('es'));
});
