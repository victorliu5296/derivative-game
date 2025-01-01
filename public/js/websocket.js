import { getRoomId } from './room.js';
import { renderWithAnimation, displayMessage, triggerErrorAnimation } from './ui.js';
import { gameConfig } from '../config/gameConfig.js';
import { getTranslation } from './translations.js';

let socket;

export function initializeWebSocket() {
    const room = getRoomId();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('localhost') ? 'localhost:3000' : window.location.host;

    socket = new WebSocket(`${protocol}//${host}`);

    socket.onopen = function () {
        console.log('Connected to WebSocket server');
        displayMessage(getTranslation('connected'));

        const joinMessage = {
            type: 'join',
            room: room,
        };
        console.log('Sending join message:', joinMessage);
        socket.send(JSON.stringify(joinMessage));
    };

    socket.onmessage = function (event) {
        console.log('Message received from server:', event.data);
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    };

    socket.onclose = function () {
        console.log('Disconnected from WebSocket server');
        displayMessage(getTranslation('disconnected'));
    };

    socket.onerror = function (error) {
        console.error('WebSocket error observed:', error);
    };
}

export function sendSocketMessage(type, data = {}) {
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
            displayMessage(data.message);
            break;
        case 'simplificationStatus':
            console.log('Handling simplificationStatus:', data);
            if (data.status === 'alreadyApplied') {
                triggerErrorAnimation('simplifyButton', 'Simplification already applied');
            }
            break;
        case 'error':
            console.log('Handling error message:', data);
            handleErrorMessage(data);
            break;
        default:
            console.warn('Unhandled message type:', data.type);
    }
}

function handleErrorMessage(data) {
    console.error('Error from server:', data.message);
    displayMessage(`Error: ${data.message}`);
    triggerErrorAnimation('messages', data.message); // Visual indication of the error
}

function handleGameStateUpdate(data) {
    console.log('Rendering gameStateUpdate:', data);
    const { tree, katex, score, isComplete, difficulty } = data.state;

    if (katex) {
        console.log('Rendering KaTeX expression:', katex);
        renderWithAnimation('currentExpression', katex);
    } else {
        console.warn('No expression tree provided in gameStateUpdate');
    }

    if (score !== undefined) {
        console.log('Updating score:', score);
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) scoreElement.textContent = score;
        else console.warn('Score element not found');
    }

    if (isComplete !== undefined) {
        console.log('Game completion status:', isComplete);
        const message = isComplete
            ? getTranslation('congratulations')
            : getTranslation('keepGoing');
        displayMessage(message);
    }

    if (difficulty) {
        console.log('Updating difficulty:', difficulty);
        const difficultyElement = document.getElementById('currentDifficulty');
        if (difficultyElement) difficultyElement.textContent = getTranslation(`difficulty${capitalizeFirstLetter(difficulty)}`);
        else console.warn('Difficulty element not found');
        const multiplierElement = document.getElementById('difficultyMultiplier');
        if (multiplierElement) multiplierElement.textContent = `${gameConfig.difficultyMultipliers[difficulty]}x`;
        else console.warn('Difficulty multiplier element not found');
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}