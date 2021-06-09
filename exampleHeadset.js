const WebSocket = require('ws');

const ws = new WebSocket('ws://54.185.14.55:8080/game');

let gameCode;

ws.on('open', function open() {
  console.log('Connection Opened')
});


ws.on('message', (msg) => {
console.log(msg);
let parsed;
try{
    parsed = JSON.parse(msg);
    console.log(parsed);
} catch (e) {
    console.log(e)
    return
}


  if(parsed.type === 'config'){
  }

  if(parsed.type === 'gameCode'){
    gameCode = parsed.message;
    console.log('Got gamecode')
  }

  if(parsed.type === 'data'){
    const data = JSON.parse(parsed.message);
    // Do stuff with the game state object or whatever
  }
});