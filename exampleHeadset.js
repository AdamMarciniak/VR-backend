const WebSocket = require('ws');

const ws = new WebSocket('ws://54.185.14.55:8080/game');

const heartbeat = (ws) => {
  clearTimeout(ws.pingTimeout);
  ws.pingTimeout = setTimeout(() => {
    ws.terminate();
  }, 30000 + 1000);
}

let gameCode;

ws.on('open', function open() {
  console.log('Connection Opened')
  heartbeat(ws);
});

ws.on('ping', heartbeat);

ws.on('close', function clear() {
  clearTimeout(ws.pingTimeout);
});


ws.on('message', (msg) => {
const parsed = JSON.parse(msg);

  if(parsed.type === 'config'){
  }

  if(parsed.type === 'gameCode'){
    gameCode = parsed.message;
  }

  if(parsed.type === 'data'){
    const data = JSON.parse(parsed.message);
    // Do stuff with the game state object or whatever
  }
});

const sendDataToClients = (data) => {

    ws.send(data);

}