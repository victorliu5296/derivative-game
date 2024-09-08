// wsHandler.js

import { joinRoom, leaveRoom, updateGameState, broadcastToRoom, getRoomState } from './roomManager.js';
import { applyDerivativeRule } from './derivative-logic/gameLogic.js';
import { simplifyExpression } from './derivative-logic/expressionSimplifier.js';

export function handleWebSocketConnection(ws) {
    let currentRoom = null;
    let lastAction = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);

            const handlers = {
                join: handleJoin,
                applyRule: handleApplyRule,
                simplify: handleSimplify,
                message: handleMessage
            };

            const handler = handlers[data.type];
            if (handler) {
                handler(data);
            } else {
                throw new Error('Unknown message type');
            }
        } catch (error) {
            handleError(error);
        }
    });

    ws.on('close', handleClose);

    function handleJoin(data) {
        currentRoom = data.room;
        const initialExpression = joinRoom(ws, currentRoom);
        sendToClient('newExpression', { expression: initialExpression });
    }

    function handleApplyRule(data) {
        if (!currentRoom) {
            throw new Error('No current room');
        }

        const roomState = getRoomState(currentRoom);
        if (!roomState) {
            throw new Error('Room state is null');
        }

        if (!data.rule) {
            throw new Error('Rule is undefined');
        }

        console.log('Applying rule:', data.rule);
        const result = applyDerivativeRule(roomState.expression, data.rule);
        updateGameState(currentRoom, result);
        broadcastToRoom(currentRoom, {
            type: 'newExpression',
            expression: result.katex
        });
        lastAction = 'applyRule' + data.rule;
    }

    function handleSimplify() {
        if (!currentRoom) {
            throw new Error('No current room');
        }

        const roomState = getRoomState(currentRoom);
        if (!roomState) {
            throw new Error('Room state is null');
        }

        if (lastAction === 'simplify') {
            sendToClient('simplificationStatus', { status: 'alreadyApplied' });
            return;
        }

        const simplifiedResult = simplifyExpression(roomState.expression);
        updateGameState(currentRoom, simplifiedResult);
        broadcastToRoom(currentRoom, {
            type: 'newExpression',
            expression: simplifiedResult.katex
        });

        lastAction = 'simplify';
    }

    function handleMessage(data) {
        if (currentRoom) {
            broadcastToRoom(currentRoom, {
                type: 'message',
                message: data.message
            });
        }
    }

    function handleClose() {
        if (currentRoom) {
            leaveRoom(ws, currentRoom);
        }
    }

    function handleError(error) {
        console.error('Error:', error.message);
        sendToClient('error', { message: error.message });
    }

    function sendToClient(type, data) {
        ws.send(JSON.stringify({ type, ...data }));
    }
}