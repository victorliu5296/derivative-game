import { joinRoom, leaveRoom, broadcastMessage, updateCurrentExpression, rooms } from './roomManager.js';
import { calculateDerivative } from './derivativeRules.js';

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            currentRoom = data.room;
            joinRoom(ws, currentRoom, (currentKatexExpression) => {
                ws.send(JSON.stringify({ type: 'newExpression', expression: currentKatexExpression }));
            });
        }

        if (data.type === 'applyRule' && currentRoom) {
            const roomData = rooms[currentRoom];
            const result = calculateDerivative(roomData.currentExpression, data.rule);

            if (result.error) {
                ws.send(JSON.stringify({
                    type: 'ruleApplicationError',
                    result: result.error
                }));
            } else {
                updateCurrentExpression(currentRoom, result.toString());
                ws.send(JSON.stringify({
                    type: 'newExpression',
                    expression: result.toString()
                }));
            }
        }

        if (data.type === 'message' && currentRoom) {
            broadcastMessage(currentRoom, JSON.stringify({ type: 'message', message: data.message }));
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    });
}