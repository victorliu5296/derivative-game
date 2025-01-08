// websocket.js
import { getRoomId } from './room.js';
import { eventBus, EVENTS } from './eventBus.js';
import { getTranslation, addLanguageChangeListener } from './translations.js';

let socket;
let latestMessage = '';

export function initializeWebSocket() {
    const room = getRoomId();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

    socket = new WebSocket(`${protocol}//${host}`);

    socket.onopen = handleSocketOpen.bind(null, room);
    socket.onmessage = handleSocketMessage;
    socket.onclose = handleSocketClose;
    socket.onerror = handleSocketError;

    // Listen for language changes and retranslate messages
    addLanguageChangeListener(retranslateMessages);

    // Listen for events that need to be sent to server
    setupEventListeners();
}

function setupEventListeners() {
    eventBus.subscribe(EVENTS.RULE_APPLIED, ({ rule }) => {
        sendSocketMessage('applyRule', { rule });
    });

    eventBus.subscribe(EVENTS.NEW_EXPRESSION_REQUESTED, ({ difficulty }) => {
        sendSocketMessage('reset', { difficulty });
    });
}

function handleSocketOpen(room) {
    console.log('Connected to WebSocket server');
    eventBus.publish(EVENTS.UI_MESSAGE, { message: getTranslation('connected') });
    latestMessage = 'connected';

    const joinMessage = {
        type: 'join',
        room: room,
    };
    console.log('Sending join message:', joinMessage);
    socket.send(JSON.stringify(joinMessage));
}

function handleSocketMessage(event) {
    console.log('Message received from server:', event.data);
    try {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
    } catch (error) {
        console.error('Error handling WebSocket message:', error);
    }
}

function handleSocketClose() {
    console.log('Disconnected from WebSocket server');
    eventBus.publish(EVENTS.UI_MESSAGE, { message: getTranslation('disconnected') });
    latestMessage = 'disconnected';
}

function handleSocketError(error) {
    console.error('WebSocket error observed:', error);
}

function sendSocketMessage(type, data = {}) {
    if (!socket) {
        console.error('Socket not initialized');
        return;
    }
    const message = { type, ...data };
    console.log(`Sending WebSocket message:`, message);
    socket.send(JSON.stringify(message));
}

function handleServerMessage(data) {
    switch (data.type) {
        case 'gameStateUpdate':
            console.log('Handling gameStateUpdate:', data);
            handleGameStateUpdate(data);
            break;
        case 'message':
            console.log('Handling message:', data.message);
            handleMessageUpdate(data);
            break;
        case 'error':
            console.log('Handling error message:', data);
            handleErrorMessage(data);
            break;
        default:
            console.warn('Unhandled message type:', data.type);
    }
}

function handleGameStateUpdate(data) {
    console.log('Processing gameStateUpdate:', data);
    const { state } = data;

    if (state.expressionChanged && state.katex) {
        eventBus.publish(EVENTS.KATEX_UPDATED, { katex: state.katex });
    }

    // Pass the complete state object
    eventBus.publish(EVENTS.GAME_STATE_UPDATED, state);
}

function handleMessageUpdate(data) {
    const { messageId, params } = data;
    latestMessage = messageId;
    const translatedMessage = getTranslation(messageId, params || {});
    eventBus.publish(EVENTS.UI_MESSAGE, { message: translatedMessage });
}

function handleErrorMessage(data) {
    console.error('Error from server:', data.message);
    latestMessage = 'error';
    eventBus.publish(EVENTS.ERROR_OCCURRED, {
        elementId: 'messages',
        message: data.message
    });
    eventBus.publish(EVENTS.UI_MESSAGE, {
        message: `Error: ${data.message}`
    });
}

function retranslateMessages() {
    console.log('Retranslating stored messages:', latestMessage);
    const translatedMessage = getTranslation(latestMessage);
    eventBus.publish(EVENTS.UI_MESSAGE, { message: translatedMessage });
}