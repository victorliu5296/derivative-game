import { initializeWebSocket } from './websocket.js';
import { updateLanguage } from './translations.js';
import { initializeUI } from './ui.js';

async function main() {
    // Step 1: Load translations first
    const defaultLanguage = 'fr';
    await updateLanguage(defaultLanguage);
    console.log('Translations loaded');

    // Step 2: Initialize the UI
    initializeUI();
    console.log('UI initialized');

    // Step 3: Initialize WebSocket
    initializeWebSocket();
    console.log('WebSocket initialized');

    // Language switcher buttons
    document.getElementById('langEn').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('langFr').addEventListener('click', () => updateLanguage('fr'));
    document.getElementById('langEs').addEventListener('click', () => updateLanguage('es'));
}

// Run the main function after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    main().catch((error) => {
        console.error('Error initializing application:', error);
    });
});