import WebSocket from 'ws';
import { initializeGameState, getGameState, resetGameState } from './gameState.js';

const rooms = {};

export function joinRoom(ws, room, difficulty = 'medium') {
    if (!rooms[room]) {
        rooms[room] = {
            clients: [],
            gameState: initializeGameState(room, difficulty),
        };
    }

    rooms[room].clients.push(ws);
    return rooms[room].gameState; // Return initial game state
}

export function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room].clients = rooms[room].clients.filter(client => client !== ws);
        if (rooms[room].clients.length === 0) {
            delete rooms[room];
        }
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

export function updateGameState(room, updater) {
    if (rooms[room]) {
        rooms[room].gameState = updater(rooms[room].gameState);
        return rooms[room].gameState;
    }
    throw new Error('Room not found');
}

export function resetRoomState(room) {
    if (rooms[room]) {
        rooms[room].gameState = resetGameState(room);
        return rooms[room].gameState;
    }
    throw new Error('Room not found');
}

export function getRoomState(room) {
    if (rooms[room]) {
        return getGameState(room);
    }
    return null;
}