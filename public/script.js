// Get the party (room) ID from the URL or create a new one
const urlParams = new URLSearchParams(window.location.search);
let room = urlParams.get('room');

if (!room) {
    // If no room in the URL, generate a new one and update the URL
    room = Math.random().toString(36).substring(2, 9);
    window.history.replaceState(null, null, `?room=${room}`);
}

const socket = new WebSocket(`wss://${window.location.host}`);

socket.onopen = function (event) {
    console.log('Connected to WebSocket server');
    document.getElementById('messages').textContent = 'Connected to the server!';

    // Join the room
    socket.send(JSON.stringify({
        type: 'join',
        room: room
    }));
};

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        console.log('Message from server ', data.message);
        document.getElementById('messages').textContent = data.message;
    }
};

socket.onclose = function (event) {
    console.log('Disconnected from WebSocket server');
    document.getElementById('messages').textContent = 'Disconnected from the server';
};

socket.onerror = function (error) {
    console.error('WebSocket error observed:', error);
};

document.getElementById('sendMessageButton').addEventListener('click', () => {
    const message = 'Player action!';
    socket.send(JSON.stringify({
        type: 'message',
        message: message
    }));
});
