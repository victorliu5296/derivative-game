import { generateRandomFunction } from './randomFunctionGenerator.js';

const rooms = {}; // Keeps track of users in each room

export function joinRoom(ws, room, onJoin) {
    if (!rooms[room]) {
        const originalFunction = generateRandomFunction();
        console.log("Room created: " + room + ", original function: " + originalFunction);
        rooms[room] = {
            clients: [],
            originalFunction: originalFunction,
            currentKatexExpression: originalFunction // Initially, the current expression is the original function
        };
    }

    rooms[room].clients.push(ws);
    onJoin(rooms[room].currentKatexExpression);
}

export function updateCurrentExpression(room, newExpression) {
    if (rooms[room]) {
        rooms[room].currentKatexExpression = newExpression;
    }
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