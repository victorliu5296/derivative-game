// main.js

import * as RoomManager from './roomManager.js';
import * as GameState from './derivative-logic/gameState.js';

export function handleJoinRoom(ws, roomId) {
    RoomManager.joinRoom(ws, roomId);
    const gameState = GameState.getGameState(roomId);
    ws.send(JSON.stringify({
        type: 'gameState',
        data: gameState
    }));
    broadcastRoomUpdate(roomId);
}

export function handleLeaveRoom(ws, roomId) {
    RoomManager.leaveRoom(ws, roomId);
    broadcastRoomUpdate(roomId);
}

export function handleApplyRule(roomId) {
    const newGameState = GameState.applyDerivativeRule(roomId);
    if (newGameState) {
        RoomManager.broadcastToRoom(roomId, {
            type: 'gameState',
            data: newGameState
        });
    }
}

export function handleResetGame(roomId) {
    const newGameState = GameState.resetGameState(roomId);
    RoomManager.broadcastToRoom(roomId, {
        type: 'gameState',
        data: newGameState
    });
}

function broadcastRoomUpdate(roomId) {
    const clients = RoomManager.getRoomClients(roomId);
    RoomManager.broadcastToRoom(roomId, {
        type: 'roomUpdate',
        data: { clientCount: clients.length }
    });
}

// You would call these functions from your WebSocket server logic