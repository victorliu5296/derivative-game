const rooms = {};

function joinRoom(ws, room, onJoinCallback) {
    if (!rooms[room]) {
        rooms[room] = {
            clients: [],
            function: null,
            derivative: null
        };
    }

    rooms[room].clients.push(ws);
    console.log(`Client joined room: ${room}`);
    onJoinCallback();

    // Send the current function and derivative to the new client
    if (rooms[room].function && rooms[room].derivative) {
        ws.send(JSON.stringify({ type: 'newFunction', function: rooms[room].function }));
        ws.send(JSON.stringify({ type: 'derivativeResult', result: rooms[room].derivative }));
    }
}

function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room].clients = rooms[room].clients.filter(client => client !== ws);
        if (rooms[room].clients.length === 0) {
            delete rooms[room];
        }
    }
    console.log(`Client disconnected from room: ${room}`);
}

function broadcastMessage(room, message) {
    if (rooms[room]) {
        rooms[room].clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

module.exports = { joinRoom, leaveRoom, broadcastMessage };
