// eventBus.js
class EventBus {
    constructor() {
        this.subscribers = {};
    }

    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        return () => this.unsubscribe(event, callback);
    }

    unsubscribe(event, callback) {
        if (!this.subscribers[event]) return;
        this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }

    publish(event, data) {
        if (!this.subscribers[event]) return;
        this.subscribers[event].forEach(callback => callback(data));
    }
}

export const eventBus = new EventBus();

// Events constants
export const EVENTS = {
    RULE_APPLIED: 'RULE_APPLIED',
    NEW_EXPRESSION_REQUESTED: 'NEW_EXPRESSION_REQUESTED',
    KATEX_UPDATED: 'KATEX_UPDATED',
    UI_MESSAGE: 'UI_MESSAGE',
    ERROR_OCCURRED: 'ERROR_OCCURRED',
    GAME_STATE_UPDATED: 'GAME_STATE_UPDATED'
};