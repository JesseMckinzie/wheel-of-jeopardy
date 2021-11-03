var io;
var gameSocket;

/* Game information */
var players = [];
var gameCategories = ["History", "Science", "Art", "Geography"];
const questions = {"response_code":0,"results":[{"category":"History","type":"multiple","difficulty":"easy","question":"The%20original%20Roman%20alphabet%20lacked%20the%20following%20letters%20EXCEPT%3A","correct_answer":"X","incorrect_answers":["W","U","J"]},{"category":"Science%20%26%20Nature","type":"multiple","difficulty":"hard","question":"Which%20moon%20is%20the%20only%20satellite%20in%20our%20solar%20system%20to%20possess%20a%20dense%20atmosphere%3F","correct_answer":"Titan","incorrect_answers":["Europa","Miranda","Callisto"]},{"category":"Entertainment%3A%20Video%20Games","type":"multiple","difficulty":"medium","question":"In%20Terraria%2C%20what%20does%20the%20Wall%20of%20Flesh%20not%20drop%20upon%20defeat%3F","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker%20Blade","Laser%20Rifle"]},{"category":"Geography","type":"multiple","difficulty":"easy","question":"How%20many%20stars%20are%20featured%20on%20New%20Zealand%27s%20flag%3F","correct_answer":"4","incorrect_answers":["5","2","0"]},{"category":"Entertainment%3A%20Television","type":"multiple","difficulty":"hard","question":"In%20%22Star%20Trek%22%2C%20who%20was%20the%20founder%20of%20the%20Klingon%20Empire%20and%20its%20philosophy%3F","correct_answer":"Kahless%20the%20Unforgettable","incorrect_answers":["Lady%20Lukara%20of%20the%20Great%20Hall","Molor%20the%20Unforgiving","Dahar%20Master%20Kor"]}]};

const getSingleQuestion = (index, questions) => {
   var information = questions.results[index]
   var question = unescape(information.question);
   var correctAnswer = unescape(information.correct_answer);
   var answers = information.incorrect_answers;
   answers.push(correctAnswer);

   //shuffleArray(answers);

   const answerA = unescape(answers[0]);
   const answerB = unescape(answers[1]);
   const answerC = unescape(answers[2]);
   const answerD = unescape(answers[3]);

   return {question, answerA, answerB, answerC, answerD, correctAnswer};
}

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
    gameSocket.on('spin', () => {
      io.emit('getQuestionCategory', gameCategories[Math.floor(Math.random()*gameCategories.length)]);
    });    
    gameSocket.on('choose-q-value', (data) => {
      console.log(data);
      io.emit('sendQuestion', getSingleQuestion(Math.floor(Math.random()*questions.results.length), questions));
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