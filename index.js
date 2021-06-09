const WebSocket = require('ws');

// Game URL connection will be
// localhost:8080/game/gameId

// Client URL connecton will be
// localhost:8080/client/gameId

const wss = new WebSocket.Server({ port: 8080 });

const games = [{id: '', gameWs: null, clients: []}];


const sendMessageToGame = (message, gameId) => {
  console.log(`Send to game Message: ${message}, ID: ${gameId}`)

  const gameObj = games.filter(game => game.id === gameId)[0];

  if(!gameObj){
    console.log('Game obj empty')
    return;
  }

  gameObj.gameWs.send(message);

}

const sendMessageToClients = (message, gameId) => {
  const gameObj = games.filter(game => game.id === gameId)[0];
  console.log(`Send to clients Message: ${message}, ID: ${gameId}`)


  if(!gameObj){
    return;
  }

  gameObj.clients.forEach(client => {
    client.send(message);
  })
  return;

}

const handleGameConnection = (ws) => {
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

  if(!type || !gameId){
    ws.send('Client Type and Game Id must be specified.')
    console.log('Client type and gameId not specified.')
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
    ws.send('Client onnected succesfully');
    console.log('Client Games', games);

    const game = games.filter(game => game.id === gameId)[0];
    game.clients.push(ws);
    handleClientConnection(ws);
  } else if(type === 'game'){
    if(checkIfGameIdExists(gameId)){
      console.log('game ID already exists');

      ws.send('Cannot connect to already existing game Id. Try another');
      ws.close();
      return;
    }

    ws.on('close', (ws, req) => {
      console.log('game deleted');
      console.log(games);
      deleteGame(gameId);
    })
    games.push({id: gameId, gameWs: ws, clients: []})
    console.log(games)
    ws.gameId = gameId;
    handleGameConnection(ws);
  } else {
    ws.send('Invalid client type. Must be either game or client')
    console.log('Invalid client type');

  }

  

  
});

const checkIfGameIdExists = (gameId) => {
  games.forEach(game => console.log(game.id))
  console.log(gameId)
  const existingGame = games.filter(game => game.id === gameId)[0];

  if(!existingGame){
    return false;
  }

  return true;
}

const deleteGame = (gameId) => {
  const index = games.findIndex(game => game.id === gameId);
  games.splice(index, 1);
  return;
}


console.log('Server listening on port 8080')