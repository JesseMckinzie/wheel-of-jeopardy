var io;
var gameSocket;

/* Game information */
var players = [];
var numOfActivePlayers = players.length;
var currentPlayer = 0;
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
  // on socket connection to the server
  io = sio;
  gameSocket = socket;
  io.emit('connected');
  
  // SERVER: Updates all clients' rooms
  gameSocket.on('update-room-info', () => {
    io.emit('update-room-info', players);
  });
  // SERVER: Saves a username and socket ID combination
  gameSocket.on('save-user-and-socket-id', (data) => {
    var found = false;
    players.forEach(function (item, index) {
      // check if socket connection already exists, update socket id but keep username
      if (item.username == data.username) {
          players[index].socketid = data.socketid;
          found = true;
      }
    });
    // if this player does not exist, push it
    if (!found) {
      // Update the player role, either 0 = host, or > 0 for players 1 and 2
      data.playerRole = numOfActivePlayers;
      numOfActivePlayers++;
      if (data.playerRole == currentPlayer) {
        data.currentPlayer = true;
      }
      players.push(data);
    };
    console.log(players);
  });
  // SERVER: Sends a client chat message to all clients
  gameSocket.on('chat-message', (data) => {
    io.emit('chat-message-bounce', data);
  });
  // SERVER: Return the chosen question category after a wheel spin
  gameSocket.on('spin', () => {
    io.emit('getQuestionCategory', gameCategories[Math.floor(Math.random()*gameCategories.length)]);
  });
  // SERVER: Return a question corresponding to the requested point value
  gameSocket.on('choose-q-value', (data) => {
    console.log(data);
    // Update current player
    currentPlayer = (currentPlayer + 1) % 2;
    players.forEach(function (item, index) {
      // update current player
      if (item.playerRole == currentPlayer) {
          players[index].currentPlayer = true;
      } else {
        players[index].currentPlayer = false;
      };
    });
    io.emit('sendQuestion', getSingleQuestion(Math.floor(Math.random()*questions.results.length), questions));
    io.emit('update-room-info', players);
  });       
  
  // Host Events
  gameSocket.on('hostCreateNewGame', (data) => {
    //players.push(data.username);
    //data.push({players: players});
    //io.emit("playerCreatedGame", players);
  });

  // Player Events
  gameSocket.on('playerJoinGame', (data) => {
    //players.push(data.username);
    //data.push({players: players});
    //console.log(players);
    //io.emit("playerJoinedGame", players);
  });
}