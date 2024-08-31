export function getRoomId() {
    const urlParams = new URLSearchParams(window.location.search);
    let room = urlParams.get('room');

    if (!room) {
        // If no room in the URL, generate a new one and update the URL
        room = Math.random().toString(36).substring(2, 9);
        window.history.replaceState(null, null, `?room=${room}`);
    }

    return room;
}