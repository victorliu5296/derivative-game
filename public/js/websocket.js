import { getRoomId } from './room.js';
import { renderWithAnimation, displayMessage, triggerErrorAnimation } from './ui.js';
import { currentTranslations } from './translations.js'; // Import translations

const room = getRoomId();

// Determine the correct WebSocket protocol based on the environment
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// Determine the correct WebSocket host
const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

export let socket = null;

export function initializeWebSocket() {
    const room = getRoomId();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

    socket = new WebSocket(`${protocol}//${host}`);

    socket.onopen = function () {
        console.log('Connected to WebSocket server');
        const messagesElement = document.getElementById('messages');
        if (messagesElement) {
            messagesElement.textContent =
                currentTranslations.connected || 'Connected to the server!';
        }
        console.log(`currentTranslations.connected: ${currentTranslations.connected}`);

        socket.send(
            JSON.stringify({
                type: 'join',
                room: room,
            })
        );
    };

    socket.onclose = function () {
        console.log('Disconnected from WebSocket server');
        const messagesElement = document.getElementById('messages');
        if (messagesElement) {
            messagesElement.textContent =
                currentTranslations.disconnected || 'Disconnected from the server';
        }
    };

    socket.onerror = function (error) {
        console.error('WebSocket error observed:', error);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'newExpression':
                if (data.expression && data.expression.error) {
                    triggerErrorAnimation('currentExpression', data.expression.error);
                } else {
                    renderWithAnimation('currentExpression', data.expression);
                }
                break;
            case 'message':
                displayMessage(data.message);
                break;
            case 'simplificationStatus':
                if (data.status === 'alreadyApplied') {
                    triggerErrorAnimation(
                        'simplifyButton',
                        currentTranslations.simplificationAlreadyApplied || "Simplification already applied" // Use translation or fallback
                    );
                }
                break;
        }
    };
}

// Call this function initially to bind event handlers
initializeWebSocket();