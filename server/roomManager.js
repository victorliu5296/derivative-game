// roomManager.js

import WebSocket from 'ws';  // Add this import at the top of the file
import { initializeGame } from './derivative-logic/gameLogic.js';

const rooms = {}; // Keeps track of rooms and their states

export function joinRoom(ws, room) {
    if (!rooms[room]) {
        rooms[room] = {
            clients: [],
            gameState: initializeGame()
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

export function broadcastToRoom(room, message) {
    if (rooms[room]) {
        rooms[room].clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

export function getRoomState(room) {
    return rooms[room] ? rooms[room].gameState : null;
}