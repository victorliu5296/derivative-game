const { joinRoom, leaveRoom, broadcastMessage } = require('./roomManager');
const { generateRandomFunction, calculateDerivative } = require('./functionUtils');
const { random } = require('mathjs');

function handleWebSocketConnection(ws) {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            currentRoom = data.room;
            joinRoom(ws, currentRoom, () => {
                const randomFunction = generateRandomFunction();
                const derivative = calculateDerivative(randomFunction);

                // Send the function and derivative to the client
                ws.send(JSON.stringify({ type: 'newFunction', function: randomFunction }));
                ws.send(JSON.stringify({ type: 'derivativeResult', result: derivative }));
            });
        }

        if (data.type === 'submitFunction' && currentRoom) {
            const result = calculateDerivative(data.function);
            broadcastMessage(currentRoom, JSON.stringify({ type: 'derivativeResult', result }));
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

module.exports = { handleWebSocketConnection };
