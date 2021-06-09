const WebSocket = require('ws');

// Game URL connection will be
// localhost:8080/game/gameId

// Client URL connecton will be
// localhost:8080/client/gameId

const wss = new WebSocket.Server({ port: 8080 });

const games = {'abc' : { gameWs: null, clients: []}};

const getRandomString = () => {
  return Math.random().toString(36).substr(2, 5);
}


const sendMessageToGame = (message, gameId) => {

  sendWsMessage(games[gameId].gameWs, message, 'data');

}

const sendMessageToClients = (message, gameId) => {
  console.log(`Send to clients Message: ${message}, ID: ${gameId}`)



  games[gameId].clients.forEach(client => {
    sendWsMessage(client, message, 'data');
  })
  return;

}

const sendWsMessage = (ws, message, type) => {
  ws.send(`{type: ${type}, message: ${message}}`)
}

const handleGameConnection = (ws) => {
  sendWsMessage(ws,`${ws.gameId}`, 'gameCode' );
  ws.on('message', (data) => {
    sendMessageToClients(data, ws.gameId);
  })
}

const handleClientConnection = (ws) => {
  ws.on('message', (data) => {
    sendMessageToGame(data, ws.gameId);
  })
}

wss.on('connection', (ws, req) => {

  const paths = req.url.split('/');
  const type = paths[1];
  const gameId = paths[2];

  console.log(`Connected. Paths: ${paths}`)

  

  if(!type){
    sendWsMessage(ws, `client type must be specified. Example: ws://IP:8080/CLIENT_TYPE/GAME_ID `, 'config' )
    console.log('Client type  not specified.')
    ws.close();
    return;
  }

  
  if(type === 'client'){
    if(!checkIfGameIdExists(gameId)){
      console.log('game id does not exist');
      sendWsMessage(ws, 'Game ID does not exist. Please start game from headset first', 'config');
      ws.close();
      return;
    }
    
    ws.gameId = gameId;
    sendWsMessage(ws, 'Client connected succesfully', 'config');
    console.log('Client Games', games);

    games[gameId].clients.push(ws);
    handleClientConnection(ws);
  } else if(type === 'game'){

    if(!gameId){
      console.log('No game Id, creating new one');
      const newGameId = getRandomString();
      ws.gameId = newGameId;
      games[newGameId] = {gameWs: ws, clients: []};
      handleGameConnection(ws);
    }
    else if(checkIfGameIdExists(gameId)){
      console.log('game ID already exists');
      ws.gameId = gameId;
      games[gameId].gameWs = ws;
      sendWsMessage(ws, 'Headset connected to existing game', 'config');
      handleGameConnection(ws);
    } else {
      console.log('Game Id does not exist anymore');
      sendWsMessage(ws, 'Game Id does not exist anymore.', 'config');
      ws.close();
      return;
    }

    
    
    
  } else {
    sendWsMessage(ws, `Invalid client type. Must be either 'game' or 'client'`, 'config');
    console.log('Invalid client type');

  }

  

  
});

const checkIfGameIdExists = (gameId) => {
  
  if(!games[gameId]) {
    return false;
  }

  return true;
}




console.log('Server listening on port 8080')