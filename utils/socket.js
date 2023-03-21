// socket.js

const socketIo = require('socket.io');

let io;

function init(server, options) {
  io = socketIo( server, options );
  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = {
  init,
  getIo
};
