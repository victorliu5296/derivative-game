import { getRoomId } from './room.js';
import { renderWithAnimation, displayMessage, triggerErrorAnimation } from './ui.js';
import { currentTranslations } from './translations.js'; // Import translations

const room = getRoomId();

// Determine the correct WebSocket protocol based on the environment
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// Determine the correct WebSocket host
const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

export const socket = new WebSocket(`${protocol}//${host}`);

// Function to update WebSocket messages dynamically
function updateWebSocketMessages() {
    const messagesElement = document.getElementById('messages');

    socket.onopen = function (event) {
        console.log('Connected to WebSocket server');
        messagesElement.textContent =
            currentTranslations.connected || 'Connected to the server!'; // Use translation or fallback

        // Join the room
        socket.send(JSON.stringify({
            type: 'join',
            room: room
        }));
    };

    socket.onclose = function (event) {
        console.log('Disconnected from WebSocket server');
        messagesElement.textContent =
            currentTranslations.disconnected || 'Disconnected from the server'; // Use translation or fallback
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
updateWebSocketMessages();

// Export a function to rebind WebSocket messages when language changes
export function refreshWebSocketMessages() {
    updateWebSocketMessages();
}
