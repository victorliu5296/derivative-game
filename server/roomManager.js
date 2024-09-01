import { generateRandomFunction } from './randomFunctionGenerator.js';

const rooms = {}; // Keeps track of users in each room

export function joinRoom(ws, room, onJoin) {
    if (!rooms[room]) {
        rooms[room] = {
            clients: [],
            function: generateRandomFunction()
        };
    }

    rooms[room].clients.push(ws);
    onJoin(rooms[room].function);
}

export function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room] = rooms[room].clients.filter(user => user !== ws);
        if (rooms[room].length === 0) {
            delete rooms[room];
        }
    }
}

export function broadcastMessage(room, message) {
    if (rooms[room]) {
        rooms[room].forEach(user => {
            if (user.readyState === WebSocket.OPEN) {
                user.send(message);
            }
        });
    }
}

export { rooms };