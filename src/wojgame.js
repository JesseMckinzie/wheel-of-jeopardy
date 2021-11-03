var io;
var gameSocket;

/* Game information */
var players = [];

/**
 * This function is called by www to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
 exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    io.emit('connected');
    
    gameSocket.on('update-room-info', () => {
      io.emit('update-room-info', players);
    });
    gameSocket.on('save-user-and-socket-id', (data) => {
      players.push(data);
      console.log(players);
    });    
    gameSocket.on('chat-message', (data) => {
      io.emit('chat-message-bounce', data);
    });        

    // Host Events
    gameSocket.on('hostCreateNewGame', (data) => {
      //players.push(data.username);
      //data.push({players: players});
      //io.emit("playerCreatedGame", players);
    });
    /* gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostCountdownFinished', hostStartGame);
    gameSocket.on('hostNextRound', hostNextRound); */

    // Player Events
    gameSocket.on('playerJoinGame', (data) => {
      //players.push(data.username);
      //data.push({players: players});
      //console.log(players);
      //io.emit("playerJoinedGame", players);
    });
    /* gameSocket.on('playerAnswer', playerAnswer);
    gameSocket.on('playerRestart', playerRestart); */


}

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */

/**
 * The 'create game' button was clicked and 'hostCreateNewGame' event occurred.
 */
 function hostCreateNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = data.game_id;
    var thisGamePasscode = data.passcode;
    var thisGameLength = data.game_length;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    //this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    //this.join(thisGameId.toString());
};

/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */

/**
 * A player clicked the 'join game' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
 function playerJoinGame(data) {
    console.log('Player ' + data.username + ' attempting to join game: ' + data.game_id );

    this.emit("playerJoinGame", data);
}