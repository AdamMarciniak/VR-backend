const WebSocket = require('ws');

const ws = new WebSocket('ws://54.185.14.55/game');

ws.on('open', function open() {
  console.log('Connection Opened')
});

ws.on('message', function incoming(data) {
  console.log(data)
});