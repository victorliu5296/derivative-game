import { generateRandomFunction } from './randomFunctionGenerator.js';

const rooms = {}; // Keeps track of users in each room
const roomFunctions = {}; // Keeps track of the math function and its correct derivative for each room

export function joinRoom(ws, room, onJoin) {
    if (!rooms[room]) {
        rooms[room] = [];
    }
    rooms[room].push(ws);

    if (!roomFunctions[room]) {
        const randomFunction = generateRandomFunction();
        roomFunctions[room] = randomFunction;
    }

    onJoin(roomFunctions[room].currentFunction);
}

export function leaveRoom(ws, room) {
    if (rooms[room]) {
        rooms[room] = rooms[room].filter(user => user !== ws);
        if (rooms[room].length === 0) {
            delete rooms[room];
            delete roomFunctions[room];
        }
    }
}

export function broadcastMessage(room, message) {
    if (rooms[room]) {
        rooms[room].forEach(user => user.send(message));
    }
}

export { roomFunctions }; // Export roomFunctions for use in wsHandlers.js