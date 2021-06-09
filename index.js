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


  games[gameId].gameWs.send(message);

}

const sendMessageToClients = (message, gameId) => {
  console.log(`Send to clients Message: ${message}, ID: ${gameId}`)



  games[gameId].clients.forEach(client => {
    client.send(message);
  })
  return;

}

const handleGameConnection = (ws) => {
  ws.send(`Game connected. Your Gamer Code: ${ws.gameId}`);
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
    ws.send('Client Type must be specified.')
    console.log('Client type  not specified.')
    ws.close();
    return;
  }

  
  if(type === 'client'){
    if(!checkIfGameIdExists(gameId)){
      console.log('game id does not exist');
      ws.send('Game ID does not exist. Please start game from headset first');
      ws.close();
      return;
    }
    
    ws.gameId = gameId;
    ws.send('Client connected succesfully');
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
      ws.send('Headset connected to existing game');
      handleGameConnection(ws);
    } else {
      console.log('Game Id does not exist anymore');
      ws.send('Game Id does not exist anymore.')
      ws.close();
      return;
    }

    
    
    
  } else {
    ws.send('Invalid client type. Must be either game or client')
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