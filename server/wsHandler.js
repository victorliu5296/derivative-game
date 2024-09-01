// wsHandler.js

import { joinRoom, leaveRoom, updateGameState, broadcastToRoom, getRoomState } from './roomManager.js';
import { applyDerivativeRule } from './derivative-logic/gameLogic.js';

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error('Error parsing message:', error);
            return;
        }

        console.log('Received message:', data); // Log the received message

        switch (data.type) {
            case 'join':
                currentRoom = data.room;
                const initialExpression = joinRoom(ws, currentRoom);
                ws.send(JSON.stringify({ type: 'newExpression', expression: initialExpression }));
                break;

            case 'applyRule':
                if (currentRoom) {
                    const roomState = getRoomState(currentRoom);
                    if (roomState) {
                        console.log('Applying rule:', data.rule); // Log the rule being applied
                        if (!data.rule) {
                            console.error('Rule is undefined');
                            ws.send(JSON.stringify({ type: 'error', message: 'Rule is undefined' }));
                            return;
                        }
                        try {
                            const result = applyDerivativeRule(roomState.expression, data.rule);
                            updateGameState(currentRoom, result);
                            broadcastToRoom(currentRoom, {
                                type: 'newExpression',
                                expression: result.katex
                            });
                        } catch (error) {
                            console.error('Error applying rule:', error);
                            ws.send(JSON.stringify({ type: 'error', message: error.message }));
                        }
                    } else {
                        console.error('Room state is null');
                        ws.send(JSON.stringify({ type: 'error', message: 'Room state is null' }));
                    }
                } else {
                    console.error('No current room');
                    ws.send(JSON.stringify({ type: 'error', message: 'No current room' }));
                }
                break;

            case 'message':
                if (currentRoom) {
                    broadcastToRoom(currentRoom, {
                        type: 'message',
                        message: data.message
                    });
                }
                break;

            default:
                console.error('Unknown message type:', data.type);
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    });
}