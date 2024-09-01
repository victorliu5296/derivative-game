import { getRoomId } from './room.js';
import { renderWithAnimation, displayMessage, triggerErrorAnimation } from './ui.js';

const room = getRoomId();

// Determine the correct WebSocket protocol based on the environment
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// Determine the correct WebSocket host
const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

export const socket = new WebSocket(`${protocol}//${host}`);

socket.onopen = function (event) {
    console.log('Connected to WebSocket server');
    document.getElementById('messages').textContent = 'Connected to the server!';

    // Join the room
    socket.send(JSON.stringify({
        type: 'join',
        room: room
    }));
};

socket.onclose = function (event) {
    console.log('Disconnected from WebSocket server');
    document.getElementById('messages').textContent = 'Disconnected from the server';
};

socket.onerror = function (error) {
    console.error('WebSocket error observed:', error);
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'newExpression') {
        if (data.expression && data.expression.error) {
            triggerErrorAnimation('currentExpression', data.expression.error);
        } else {
            renderWithAnimation('currentExpression', data.expression);
        }
    }

    if (data.type === 'message') {
        displayMessage(data.message);
    }
};
