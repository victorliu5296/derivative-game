// wsHandler.js

import { joinRoom, leaveRoom, updateGameState, broadcastToRoom, getRoomState } from './roomManager.js';
import { applyDerivativeRule } from './derivative-logic/gameLogic.js';

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

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
                        const result = applyDerivativeRule(roomState.expression);
                        updateGameState(currentRoom, result);
                        broadcastToRoom(currentRoom, {
                            type: 'newExpression',
                            expression: result.katex
                        });
                    }
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
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    });
}