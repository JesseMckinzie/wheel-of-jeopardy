var io;
var gameSocket;
const axios = require('axios');

/* Game information */
var players = [];
var numOfActivePlayers = players.length;
var currentPlayer = 0;
var curRound = 0;
var gameCategories = ["Science", "Sports", "Literature", "Film", "History", "Art"];
var gameCategoriesSpinValues = [360, 330, 300, 270, 240, 210];
//const questions = {"response_code":0,"results":[{"category":"History","type":"multiple","difficulty":"easy","question":"The%20original%20Roman%20alphabet%20lacked%20the%20following%20letters%20EXCEPT%3A","correct_answer":"X","incorrect_answers":["W","U","J"]},{"category":"Science%20%26%20Nature","type":"multiple","difficulty":"hard","question":"Which%20moon%20is%20the%20only%20satellite%20in%20our%20solar%20system%20to%20possess%20a%20dense%20atmosphere%3F","correct_answer":"Titan","incorrect_answers":["Europa","Miranda","Callisto"]},{"category":"Entertainment%3A%20Video%20Games","type":"multiple","difficulty":"medium","question":"In%20Terraria%2C%20what%20does%20the%20Wall%20of%20Flesh%20not%20drop%20upon%20defeat%3F","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker%20Blade","Laser%20Rifle"]},{"category":"Geography","type":"multiple","difficulty":"easy","question":"How%20many%20stars%20are%20featured%20on%20New%20Zealand%27s%20flag%3F","correct_answer":"4","incorrect_answers":["5","2","0"]},{"category":"Entertainment%3A%20Television","type":"multiple","difficulty":"hard","question":"In%20%22Star%20Trek%22%2C%20who%20was%20the%20founder%20of%20the%20Klingon%20Empire%20and%20its%20philosophy%3F","correct_answer":"Kahless%20the%20Unforgettable","incorrect_answers":["Lady%20Lukara%20of%20the%20Great%20Hall","Molor%20the%20Unforgiving","Dahar%20Master%20Kor"]}]};
var questions;
var gameInit = false; // has the game been created yet?
var gameInfo;
var playersBuzzedTime = [];
var playerScores = [0,0,0];
var currentScore = 0;
var currentPoint = 0;
var questionsReaming = -1;

const apiReqBuilder = (gameLength) => {
  return 'https://opentdb.com/api.php?amount='.concat(gameLength, '&encode=url3986');
}

const getQuestions = async(gameLength) => {
  let response = await axios(apiReqBuilder(gameLength));
  let questions = response.data;

  return questions;
}

const getWinnerIdx = (array) =>{
  if(array.length === 1) return 0;
  else return array.indexOf(Math.max(...array));
}

/*
// Fisher-Yates shuffle from https://javascript.info/task/shuffle
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}
*/

const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
    array[randomIndex], array[currentIndex]];
  }

  return array;
}

const getSingleQuestion = (index, questions) => {
  var question = "Game over!";
  var answerA = "Game over!";
  var answerB = "Game over!";
  var answerC = "Game over!";
  var answerD = "Game Over!"
  var correctAnswer = "";

  var information = questions.results[index];
  if(information !== undefined) {
    var question = unescape(information.question);
    var correctAnswer = unescape(information.correct_answer);
    var answers = information.incorrect_answers;
    answers.push(correctAnswer);

    answers = shuffle(answers);

    answerA = unescape(answers[0]);
    answerB = unescape(answers[1]);
    answerC = unescape(answers[2]);
    answerD = unescape(answers[3]);

    questions.results.splice(index, 1);
    --questionsReaming;
  }

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

  // SERVER: Initialize game
  gameSocket.on('initialize-game', (data) => {
    if (!gameInit) {
      gameInfo = data;
      gameInit = true;
      questionsReaming = data.gameLength;
      console.log(questionsReaming);
      //questions = getQuestions(gameInfo.gameLength); // get all the questions in the beginning
      // get all the questions in the beginning and wait for api call to complete
      async function awaitQuestions() {
        let myPromise = new Promise(function(resolve) {
          resolve(getQuestions(gameInfo.gameLength));
        });
        questions = await myPromise;
      }
      awaitQuestions();
      // Notify everyone in the room that the game has been created
      io.emit('chat-message-bounce', {username: "System", msg: "The game is initialized with ".concat(data.gameLength, " questions. The room's ID is ", data.gameId,
      " and the passcode is ", data.passcode, ".")});
    }
  });  
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
      data.score = 0;
      numOfActivePlayers++;
      if (data.playerRole == currentPlayer) {
        data.currentPlayer = true;
      }
      players.push(data);
    };
    console.log(players);
    // Notify everyone in the room that a user just joined
    io.emit('chat-message-bounce', {username: "System", msg: data.username.concat(" just joined the game.")});
  });
  // SERVER: Sends a client chat message to all clients
  gameSocket.on('chat-message', (data) => {
    io.emit('chat-message-bounce', data);
  });
  // SERVER: Return the chosen question category after a wheel spin
  gameSocket.on('spin', (data) => {
    chosenInd = Math.floor(Math.random()*gameCategories.length);
    chosenQCat = gameCategories[chosenInd];
    io.emit('getQuestionCategory', {chosen_q : chosenQCat, chosen_q_spin_val : gameCategoriesSpinValues[chosenInd]});
    // Notify everyone in the room that a user spun the wheel
    io.emit('chat-message-bounce', {username: "System", msg: data.username.concat(" just spun the wheel.")});
    // Notify everyone in the room of the current question category
    io.emit('chat-message-bounce', {username: "System", msg: "The current question category is ".concat(chosenQCat)});
  });
  // SERVER: Return a question corresponding to the requested point value
  gameSocket.on('choose-q-value', (data) => {
    // Update current player
    /* currentPlayer = (currentPlayer + 1) % 2;
    players.forEach(function (item, index) {
      // update current player
      if (item.playerRole == currentPlayer) {
          players[index].currentPlayer = true;
      } else {
        players[index].currentPlayer = false;
      };
    }); */
    chosenQ = getSingleQuestion(Math.floor(Math.random()*questions.results.length), questions);
    // Delay 3 seconds before sending question
    function sendQuestionDelay() {
      gameInfo.chosenQ = chosenQ;
      io.emit('sendQuestion', chosenQ);
    }
    setTimeout(sendQuestionDelay, 3000);
    // Notify everyone in the room of the chosen question point value
    io.emit('chat-message-bounce', {username: "System", msg: data.username.concat(" has chosen a point value of ", data.qVal)});
    currentPoint = data.qVal;
    //io.emit('update-room-info', players);
  });
  // SERVER: Times everyone buzzing in
  gameSocket.on('buzzed-in', (data) => {
    playersBuzzedTime.push(data);
    if (playersBuzzedTime.length == numOfActivePlayers) {
      let winnerTime = Number.MAX_VALUE;
      playersBuzzedTime.forEach(function (item, index) {
        // update current player
        if (item.time < winnerTime) {
          winnerTime = item.time;
          winner = item;
        };
      });
      console.log(winner);   
      playersBuzzedTime.length = 0;
      // Update current player
      players.forEach(function (item, index) {
        // Update the current player according to the winner of the buzzer
        if (item.username == winner.username) {
          players[index].currentPlayer = true;
          currentPlayer = players[index].playerRole;
          currentScore = playerScores[currentPlayer];
        } else {
          players[index].currentPlayer = false;
        }
      });
      
      io.emit('decideWhoBuzzedFirst', players);
      // Notify everyone in the room of the person who buzzed in first
      io.emit('chat-message-bounce', {username: "System", msg: winner.username.concat(" is the person who buzzed in first!")});
    };
  });
  
  gameSocket.on('submit-answer', (data) => {
    ansChoice = data.choice.split(' ').slice(1).join(' ');
    correctChoice = gameInfo.chosenQ.correctAnswer;
    msg = data.username.concat(" picked answer choice ", ansChoice, ".");
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    msg = "The correct answer was ".concat(correctChoice, ".");
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    if (ansChoice == correctChoice) {
      msg = data.username.concat(" got ") + currentPoint + (" points.");
      currentScore = Number(currentScore) + Number(currentPoint);
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      msg = data.username.concat(" has ") + currentScore + " total points";
    } else {
      msg = data.username.concat(" lost ") + currentPoint + (" points.");
      currentScore = Number(currentScore) - Number(currentPoint);
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      msg = data.username.concat(" has ") + currentScore + " total points"; 
    }
    
    playerScores[currentPlayer] = currentScore;  //update current player's score
    players.forEach(function (item, index) {
      // Update the current player according to the winner of the buzzer
      if (item.username == data.username) {
        players[index].score = currentScore;
      };
    });    
    // Notify users of the current player's answer choice, and if they won or lost
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    io.emit('update-scores', [{username: data.username, score: currentScore}]);
    io.emit('chat-message-bounce', {username: "System", msg: "There are ".concat(questionsReaming, " questions remaining.")});
    if(questionsReaming === 0){
      const winner = getWinnerIdx(playerScores);
      console.log("-------------")
      console.log(winner)
      console.log("-------------")
      io.emit('chat-message-bounce', {username: "System", msg: "The winner is ".concat(players[winner].username, "!")});
    }
    io.emit('reset-wheel');
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
    //PUSH TEST - MORGAN
  });
}
