import { socket } from './websocket.js';
import { updateLanguage } from './translations.js';
import { renderWithAnimation, setupRuleButtons, setupFunctionDerivativeButtons } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Set default language and initialize the language setting
    const defaultLanguage = 'fr'; // Set the default language to French
    updateLanguage(defaultLanguage); // This will load the French translations by default

    // Handle WebSocket messages
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'newFunction') {
            renderWithAnimation('currentFunction', data.function);
        }
    };

    // Set up buttons using functions from ui.js
    setupRuleButtons();
    setupFunctionDerivativeButtons();

    // Language switcher buttons
    document.getElementById('langEn').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('langFr').addEventListener('click', () => updateLanguage('fr'));
});
