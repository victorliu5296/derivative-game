import { joinRoom, leaveRoom, broadcastToRoom, updateGameState, resetRoomState } from './roomManager.js';
import { applyRuleToGameState } from '../gameState.js';

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
            handleError(ws, error);
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    });

    function handleJoin(data) {
        currentRoom = data.room;
        const initialState = joinRoom(ws, currentRoom, data.difficulty || 'medium');
        sendGameStateUpdate(ws, initialState);
    }

    function handleApplyRule(data) {
        if (!currentRoom) throw new Error('No current room');

        console.log(`Applying rule "${data.rule}" to room: ${currentRoom}`);

        // Pass the roomId directly to applyRuleToGameState
        const updatedState = updateGameState(currentRoom, (state) =>
            applyRuleToGameState(currentRoom, data.rule)
        );
        broadcastGameStateUpdate(currentRoom, updatedState);
    }

    function handleReset() {
        if (!currentRoom) throw new Error('No current room');

        const resetState = resetRoomState(currentRoom);
        broadcastGameStateUpdate(currentRoom, resetState);
    }

    function handleMessage(data) {
        if (currentRoom) {
            broadcastToRoom(currentRoom, {
                type: 'message',
                message: data.message,
            });
        }
    }

    function sendGameStateUpdate(client, state) {
        client.send(
            JSON.stringify({
                type: 'gameStateUpdate',
                state,
            })
        );
    }

    function broadcastGameStateUpdate(room, state) {
        broadcastToRoom(room, {
            type: 'gameStateUpdate',
            state,
        });
    }

    function handleError(client, error) {
        console.error('Error:', error.message);
        client.send(
            JSON.stringify({
                type: 'error',
                message: error.message,
            })
        );
    }
}