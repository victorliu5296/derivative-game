import WebSocket from 'ws';
import { initializeGameState, applyRuleToGameState, resetGameState, getGameState } from './gameEngine.js';
import { gameConfig } from '../public/config/gameConfig.js';

const rooms = {};

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message from client:', data);

            const handlers = {
                join: handleJoin,
                applyRule: handleApplyRule,
                reset: handleReset,
                message: handleMessage,
            };

            const handler = handlers[data.type];
            if (handler) {
                console.log(`Handling message type: ${data.type}`);
                handler(data);
            } else {
                console.error(`Unknown message type: ${data.type}`);
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: `Unknown message type: ${data.type}`,
                    })
                );
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
            console.log(`Client disconnected. Leaving room: ${currentRoom}`);
            leaveRoom(ws, currentRoom);
        }
    });

    function handleJoin(data) {
        console.log(`Client joining room: ${data.room}`);
        currentRoom = data.room;

        if (!rooms[currentRoom]) {
            console.log(`Creating new room: ${currentRoom}`);
            rooms[currentRoom] = {
                clients: [],
                gameState: initializeGameState(currentRoom, data.difficulty || gameConfig.defaultDifficulty),
            };
        } else {
            console.log(`Room already exists. Adding client to room: ${currentRoom}`);
        }

        rooms[currentRoom].clients.push(ws);

        const initialState = getGameState(currentRoom);
        console.log(`Sending initial game state to client in room ${currentRoom}:`, initialState);

        ws.send(JSON.stringify({ type: 'gameStateUpdate', state: initialState }));
    }

    function handleApplyRule(data) {
        if (!currentRoom) {
            console.error('No current room to apply rule');
            throw new Error('No current room');
        }

        console.log(`Applying rule "${data.rule}" in room: ${currentRoom}`);
        const updatedState = applyRuleToGameState(currentRoom, data.rule);
        console.log(`Updated game state after applying rule in room ${currentRoom}:`, updatedState);

        broadcastToRoom(currentRoom, { type: 'gameStateUpdate', state: updatedState });
    }

    function handleReset(data) {
        if (!currentRoom) {
            console.error('No current room to reset');
            throw new Error('No current room');
        }

        const selectedDifficulty = data.difficulty || rooms[currentRoom].gameState.difficulty;
        console.log(`Resetting game state in room ${currentRoom} to difficulty: ${selectedDifficulty}`);

        const resetState = resetGameState(currentRoom, selectedDifficulty);
        console.log(`New game state after reset in room ${currentRoom}:`, resetState);

        broadcastToRoom(currentRoom, { type: 'gameStateUpdate', state: resetState });
    }

    function handleMessage(data) {
        if (currentRoom) {
            console.log(`Broadcasting message to room ${currentRoom}:`, data.message);
            broadcastToRoom(currentRoom, { type: 'message', message: data.message });
        } else {
            console.warn('No current room to broadcast message');
        }
    }
}

function broadcastToRoom(room, message) {
    if (!rooms[room]) {
        console.warn(`Attempted to broadcast to non-existent room: ${room}`);
        return;
    }

    console.log(`Broadcasting message to room ${room}:`, message);
    rooms[room].clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            console.log(`Sending message to client in room ${room}:`, message);
            client.send(JSON.stringify(message));
        } else {
            console.warn('Client WebSocket is not open. Skipping message.');
        }
    });
}

function leaveRoom(ws, room) {
    if (rooms[room]) {
        console.log(`Removing client from room: ${room}`);
        rooms[room].clients = rooms[room].clients.filter((client) => client !== ws);

        if (rooms[room].clients.length === 0) {
            console.log(`No clients left in room ${room}. Deleting room.`);
            delete rooms[room];
        }
    } else {
        console.warn(`Attempted to leave non-existent room: ${room}`);
    }
}