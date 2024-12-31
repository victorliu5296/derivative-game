import WebSocket from 'ws';
import { initializeGame } from './derivative-logic/gameLogic.js';
import { getDifficultySettings } from './derivative-logic/difficultySettings.js';

const rooms = {}; // Keeps track of rooms and their states

export function joinRoom(ws, room, difficulty = 'medium') {
    if (!rooms[room]) {
        rooms[room] = {
            clients: [],
            gameState: initializeGame(getDifficultySettings(difficulty)),
            difficulty: difficulty
        };
    }

    rooms[room].clients.push(ws);
    return rooms[room].gameState.katex;
}

export function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room].clients = rooms[room].clients.filter(client => client !== ws);
        if (rooms[room].clients.length === 0) {
            delete rooms[room];
        }
    }
}

export function updateGameState(room, newState) {
    if (rooms[room]) {
        rooms[room].gameState = newState;
    }
}

export function updateRoomDifficulty(room, difficulty) {
    if (rooms[room]) {
        rooms[room].difficulty = difficulty;
        rooms[room].gameState = initializeGame(getDifficultySettings(difficulty));
        return rooms[room].gameState.katex;
    }
    return null;
}

export function broadcastToRoom(room, message) {
    if (rooms[room]) {
        rooms[room].clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

export function getRoomClients(room) {
    return rooms[room] ? rooms[room].clients : [];
}

export function getRoomDifficulty(room) {
    return rooms[room] ? rooms[room].difficulty : 'medium';
}

export function getRoomState(room) {
    return rooms[room] ? rooms[room].gameState : null;
}
