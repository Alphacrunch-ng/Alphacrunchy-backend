// events.js
const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const authEvents = new Emitter();

module.exports = {
    authEvents,
};
