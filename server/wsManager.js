import WebSocket from 'ws';
import { initializeGameState, applyRuleToGameState, resetGameState, getGameState } from './gameEngine.js';

const rooms = {};

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);

            const handlers = {
                join: handleJoin,
                applyRule: handleApplyRule,
                reset: handleReset,
                message: handleMessage,
            };

            const handler = handlers[data.type];
            if (handler) {
                handler(data);
            } else {
                throw new Error('Unknown message type');
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error.message);
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: error.message,
                })
            );
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    });

    function handleJoin(data) {
        currentRoom = data.room;
        if (!rooms[currentRoom]) {
            rooms[currentRoom] = {
                clients: [],
                gameState: initializeGameState(currentRoom, data.difficulty || 'medium'),
            };
        }

        rooms[currentRoom].clients.push(ws);
        const initialState = getGameState(currentRoom);
        ws.send(JSON.stringify({ type: 'gameStateUpdate', state: initialState }));
    }

    function handleApplyRule(data) {
        if (!currentRoom) throw new Error('No current room');

        const updatedState = applyRuleToGameState(currentRoom, data.rule);
        broadcastToRoom(currentRoom, { type: 'gameStateUpdate', state: updatedState });
    }

    function handleReset() {
        if (!currentRoom) throw new Error('No current room');

        const resetState = resetGameState(currentRoom);
        broadcastToRoom(currentRoom, { type: 'gameStateUpdate', state: resetState });
    }

    function handleMessage(data) {
        if (currentRoom) {
            broadcastToRoom(currentRoom, { type: 'message', message: data.message });
        }
    }
}

function broadcastToRoom(room, message) {
    if (!rooms[room]) return;

    rooms[room].clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room].clients = rooms[room].clients.filter((client) => client !== ws);
        if (rooms[room].clients.length === 0) {
            delete rooms[room];
        }
    }
}