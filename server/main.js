import * as RoomManager from './roomManager.js';
import * as GameState from './derivative-logic/gameState.js';

export function handleJoinRoom(ws, roomId, difficulty = 'medium') {
    RoomManager.joinRoom(ws, roomId, difficulty);
    const gameState = GameState.getGameState(roomId);
    ws.send(JSON.stringify({
        type: 'gameState',
        data: gameState,
        difficulty: RoomManager.getRoomDifficulty(roomId)
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

export function handleChangeDifficulty(roomId, difficulty) {
    const updatedExpression = RoomManager.updateRoomDifficulty(roomId, difficulty);
    if (updatedExpression) {
        RoomManager.broadcastToRoom(roomId, {
            type: 'difficultyUpdate',
            difficulty: difficulty,
            expression: updatedExpression
        });
    }
}

function broadcastRoomUpdate(roomId) {
    const clients = RoomManager.getRoomClients(roomId);
    RoomManager.broadcastToRoom(roomId, {
        type: 'roomUpdate',
        data: { clientCount: clients.length }
    });
}
