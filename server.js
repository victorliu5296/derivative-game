const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Object to hold rooms and their participants
const rooms = {};

wss.on('connection', (ws) => {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            currentRoom = data.room;
            if (!rooms[currentRoom]) {
                rooms[currentRoom] = [];
            }
            rooms[currentRoom].push(ws);
            console.log(`Client joined room: ${currentRoom}`);
        }

        if (data.type === 'message' && currentRoom) {
            // Broadcast the message to all clients in the same room
            rooms[currentRoom].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        message: data.message
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        // Remove the client from the room
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter(client => client !== ws);
            if (rooms[currentRoom].length === 0) {
                delete rooms[currentRoom];
            }
        }
        console.log(`Client disconnected from room: ${currentRoom}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
