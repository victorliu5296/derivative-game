import { joinRoom, leaveRoom, broadcastMessage, roomFunctions } from './roomManager.js';
import { calculateDerivative } from './derivativeRules.js';

export function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            currentRoom = data.room;
            joinRoom(ws, currentRoom, (roomFunction) => {
                ws.send(JSON.stringify({ type: 'newFunction', function: roomFunction }));
            });
        }

        if (data.type === 'applyRule' && currentRoom) {
            const roomData = roomFunctions[currentRoom];
            const calculatedDerivative = calculateDerivative(roomData.currentFunction, data.rule);

            if (calculatedDerivative && calculatedDerivative.toString() === roomData.correctDerivative) {
                ws.send(JSON.stringify({ type: 'derivativeCorrect', result: calculatedDerivative.toString() }));
            } else {
                ws.send(JSON.stringify({ type: 'derivativeIncorrect', result: calculatedDerivative ? calculatedDerivative.toString() : 'Error' }));
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