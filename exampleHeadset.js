const WebSocket = require('ws');

const ws = new WebSocket('ws://54.185.14.55:8080/game');

let gameCode;

ws.on('open', function open() {
  console.log('Connection Opened')
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