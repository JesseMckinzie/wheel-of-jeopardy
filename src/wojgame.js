var io;
var gameSocket;
const axios = require('axios');
const User = require("./models").User;
var fs = require('fs');
parseString = require("xml2js").parseString;
xml2js = require("xml2js");

/* Game information */
var players = [];
var numOfActivePlayers = players.length;
var currentPlayer = 0;
var curRound = 1;
var gameCategories = ["Science", "Sports", "Literature", "Film", "History", "Art"];
//var gameCategories = ["Science", "Sports", "Literature", "Film", "Music", "Geography"];
var gameCategoriesSpinValues = [360, 330, 300, 270, 240, 210];
var categoriesIds;
if (gameCategories[gameCategories.length-1] === "Art") categoriesIds = [17, 21, 10, 11, 23, 25];
else categoriesIds = [17, 21, 10, 11, 12, 22];
var categories = [
  {id: 17, name: "Science", spinValue:360}, 
  {id: 21, name: "Sports", spinValue:330}, 
  {id: 10, name: "Literature", spinValue:300}, 
  {id: 11, name: "Film", spinValue:270}, 
  {id: 23, name: "History", spinValue:240},
  {id: 25, name: "Art", spinValue:210},
  {id: 12, name: "Music", spinValue:180},
  {id: 22, name: "Geography", spinValue:150}];
// array to hold the number of point values we have left per question
var qPointValues = {};
//const questions = {"response_code":0,"results":[{"category":"History","type":"multiple","difficulty":"easy","question":"The%20original%20Roman%20alphabet%20lacked%20the%20following%20letters%20EXCEPT%3A","correct_answer":"X","incorrect_answers":["W","U","J"]},{"category":"Science%20%26%20Nature","type":"multiple","difficulty":"hard","question":"Which%20moon%20is%20the%20only%20satellite%20in%20our%20solar%20system%20to%20possess%20a%20dense%20atmosphere%3F","correct_answer":"Titan","incorrect_answers":["Europa","Miranda","Callisto"]},{"category":"Entertainment%3A%20Video%20Games","type":"multiple","difficulty":"medium","question":"In%20Terraria%2C%20what%20does%20the%20Wall%20of%20Flesh%20not%20drop%20upon%20defeat%3F","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker%20Blade","Laser%20Rifle"]},{"category":"Geography","type":"multiple","difficulty":"easy","question":"How%20many%20stars%20are%20featured%20on%20New%20Zealand%27s%20flag%3F","correct_answer":"4","incorrect_answers":["5","2","0"]},{"category":"Entertainment%3A%20Television","type":"multiple","difficulty":"hard","question":"In%20%22Star%20Trek%22%2C%20who%20was%20the%20founder%20of%20the%20Klingon%20Empire%20and%20its%20philosophy%3F","correct_answer":"Kahless%20the%20Unforgettable","incorrect_answers":["Lady%20Lukara%20of%20the%20Great%20Hall","Molor%20the%20Unforgiving","Dahar%20Master%20Kor"]}]};
var questions;
var gameInit = false; // has the game been created yet?
var gameInfo;
var playersBuzzedTime = [];
var playerScores = [0,0,0];
var currentScore = 0;
var currentPoint = 0;
var questionsReaming = -1;
var gameStarted = false;
const requiredNumPlayers = 3;
var avaiPlayerRoles = [0, 1, 2];
var chosenInd = -1;
var hasSomeoneBuzzedIn = false;

const apiReqBuilder = (amount, id) => {
  return `https://opentdb.com/api.php?amount=${amount}&category=${id}&type=multiple&encode=url3986`;
  //return `https://opentdb.com/api.php?amount=${amount}&type=multiple&encode=url3986`;
}
/*
const questionsBuilder = () => {
  var questions = [];
  const questionNum = floor(gameLength/5);
  for(const category in categories){
    response.push((await axios(apiReqBuilder(questionNum, category.id))).data)
  }
  return questions;
}
*/

/*
const getQuestions = async(gameLength) => {
  let response = await axios(apiReqBuilder(gameLength));
  let questions = response.data;

  return questions;
}
*/

const getWinnerIdx = (array) =>{
  var max = -Number.MAX_VALUE;
  var maxIdx = [];
  var temp = -1;

  for(var i = 0; i < array.length; i++){
    if(array[i] > max) {
      temp = i;
      max = array[i];
    };
  }
  maxIdx.push(temp);
  // check to see if there are ties
  if (array.length > 1) {
    for(var i = 0; i < array.length; i++){
      if(i != temp && (array[i] == array[temp])) {
        maxIdx.push(i);
      };
    }
  };
  return maxIdx;
}

const getQuestions = async(categoryIds, numQPerCat) => {
  const responses = await Promise.all([
    axios(apiReqBuilder(numQPerCat, categoryIds[0])), 
    axios(apiReqBuilder(numQPerCat, categoryIds[1])),
    axios(apiReqBuilder(numQPerCat, categoryIds[2])),
    axios(apiReqBuilder(numQPerCat, categoryIds[3])),
    axios(apiReqBuilder(numQPerCat, categoryIds[4])),
    axios(apiReqBuilder(numQPerCat, categoryIds[5]))
  ]);

  return responses;
}



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

const getSingleQuestion = (categoryIdx, questions) => {
  console.log(gameCategories[categoryIdx]);
  var question = "Question not found.";
  var answerA = "";
  var answerB = "";
  var answerC = "";
  var answerD = ""
  var correctAnswer = "no correct answer";
  const information = questions[categoryIdx].data.results[0];
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

    questions[categoryIdx].data.results.splice(0, 1);
    --questionsReaming;
    if(questions[categoryIdx].data.results.length === 0){ 
      io.emit('chat-message-bounce', {username: "System", msg: `There are no more questions remaining in the ${gameCategories[categoryIdx]} category.`});
      console.log("Removing ".concat(gameCategories[categoryIdx]))
      editSVG("public/img/wheel3.svg", "public/img/wheel3.svg", gameCategories[categoryIdx]);
      gameCategories.splice(categoryIdx,1);
      questions.splice(categoryIdx, 1);
      gameCategoriesSpinValues.splice(categoryIdx,1);
    }
  }

   return {question, answerA, answerB, answerC, answerD, correctAnswer};
}

// Reads and edits an svg file. Deletes the chosen question category from the SVG
const editSVG = (imageLink, outLink, qCat) => {
  fs.readFile(imageLink, "utf-8", function(err, data) {
    if (err) console.log(err);
    // we log out the readFile results
    // console.log(data);
    // we then pass the data to our method here
    parseString(data, function(err, result) {
      if (err) console.log(err);
      // here we log the results of our xml string conversion
      // console.log(result);
      var json = result;
      let foundInd = -1;
      json.svg.g[0].text.forEach(function (item, index) {
        let catName = "";
        if (item._) {
          catName = catName + item._.trim();
        };
        item.tspan.forEach(function (item2, index2) {
          if (item2._) {
            catName = catName + item2._.trim();
          }
        });
        //console.log(catName);
        if (catName == qCat.toUpperCase()) {
          foundInd = index;
        };
      });
      if (foundInd != -1) {
        json.svg.g[0].text[foundInd]._ = "";
        json.svg.g[0].text[foundInd].tspan.forEach(function (item3, index3) {
          item3._ = "";
        });
      };
      var builder = new xml2js.Builder();
      var xml = builder.buildObject(json);
      fs.writeFile(outLink, xml, function(err, data) {
        if (err) console.log(err);
        console.log("successfully updated the wheel");
      });
      io.emit('remove-slice-from-wheel', {src: "/img/wheel3.svg"});
    });
  });
};

// Make determine winner of buzz in a function so we can reuse it
const determineWinnerOfBuzzIn = () => {
  let winnerTime = Number.MAX_VALUE;
  playersBuzzedTime.forEach(function (item, index) {
    // update current player
    if (item.time < winnerTime) {
      winnerTime = item.time;
      winner = item;
    };
  });
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
  clearTimeout(displayTime);
  function displaySubmitTimer() {
    io.emit('chat-message-bounce', {username: "System", msg: `${winner.username} has not submitted an answer. Time's up!`});
    correctChoice = gameInfo.chosenQ.correctAnswer;
    msg = "The correct answer was ".concat(correctChoice, ".");
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    io.emit('reset-wheel');
    msg = `${winner.username} lost ${currentPoint} points.`;
    currentScore = Number(currentScore) - Number(currentPoint);
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    msg = `${winner.username} has ${currentScore} total points`; 
    // answerStatus = "lost";
    playerScores[currentPlayer] = currentScore;  //update current player's score
    players.forEach(function (item, index) {
      // Update the current player according to the winner of the buzzer
      if (item.username == winner.username) {
        players[index].score = currentScore;
      };
    });
    console.log(players);
    io.emit('decideWhoBuzzedFirst', players);
  }

  submitTime = setTimeout(displaySubmitTimer, 10000);
  
  io.emit('decideWhoBuzzedFirst', players);
  // Notify everyone in the room of the person who buzzed in first
  io.emit('chat-message-bounce', {username: "System", msg: `${winner.username} is the person who buzzed in first!`});
  io.emit('startTimerForQA');  
};

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
          resolve(getQuestions(categoriesIds, data.gameLength / 6));
        });
        questions = await myPromise;
      }
      awaitQuestions();
      // give each category a set of question point values
      gameCategories.forEach(function (item, index) {
        qPointValues[item] = []
        for (i = 1; i <= data.gameLength / 6; i++) {
          qPointValues[item].push(i * 10);
        };
      });
      // Notify everyone in the room that the game has been created
      io.emit('chat-message-bounce', {
        username: "System", 
        msg: `The game is initialized with ${data.gameLength} questions. 
        The room's ID is ${data.gameId} and the passcode is ${data.passcode}.`
      });
      io.emit('chat-message-bounce', {username: "System", msg: `The game is currently in Round ${curRound}.`});
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
      data.playerRole = avaiPlayerRoles[0];
      avaiPlayerRoles.splice(0, 1);
      data.score = 0;
      numOfActivePlayers++;
      if (data.playerRole == currentPlayer) {
        data.currentPlayer = true;
      }
      players.push(data);
    };
    console.log(players);
    // Notify everyone in the room that a user just joined
    io.emit('chat-message-bounce', {username: "System", msg: `${data.username} just joined the game.`});
    // Can we start the game?
    if (numOfActivePlayers == requiredNumPlayers) {
      gameStarted = true;
      io.emit('game-started');
      io.emit('chat-message-bounce', {username: "System", msg: `The game has started.`});
    } else {
      io.emit('chat-message-bounce', {username: "System", msg: `Waiting for more players before starting the game.`});
    };
  });

  // SERVER: Sends a client chat message to all clients
  gameSocket.on('chat-message', (data) => {
    io.emit('chat-message-bounce', data);
  });

  // SERVER: Return the chosen question category after a wheel spin
  gameSocket.on('spin', (data) => {
    console.log(gameCategories)
    chosenInd = Math.floor(Math.random()*gameCategories.length);
    chosenQCat = gameCategories[chosenInd];
    io.emit('getQuestionCategory', {chosen_q : chosenQCat, chosen_q_spin_val : gameCategoriesSpinValues[chosenInd], qPointValues: qPointValues[chosenQCat]});
    // Notify everyone in the room that a user spun the wheel
    io.emit('chat-message-bounce', {username: "System", msg: `${data.username} just spun the wheel.`});
    // Notify everyone in the room of the current question category
    io.emit('chat-message-bounce', {username: "System", msg: `The current question category is ${chosenQCat}`});
    io.emit('remove-slice-from-wheel', {src: "/img/wheel3.svg"});
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
    chosenQ = getSingleQuestion(chosenInd, questions);
    qPointValues[chosenQCat].forEach(function (item, index) {
      if (item == data.qVal) {
        qPointValues[chosenQCat].splice(index, 1);
      };
    });
    console.log(qPointValues[chosenQCat]);
    io.emit('start-3-sec-countdown');
    
    // Delay 3 seconds before sending question
    function sendQuestionDelay() {
      gameInfo.chosenQ = chosenQ;
      io.emit('sendQuestion', chosenQ);
    }
    
    // Delay 5 seconds before buzz-in
    
    function displayQuestionTimer() {
      if (!hasSomeoneBuzzedIn) {
        io.emit('chat-message-bounce', {username: "System", msg: "No players have buzzed in. Time's up!"});
        correctChoice = gameInfo.chosenQ.correctAnswer;
        msg = "The correct answer was ".concat(correctChoice, ".");
        io.emit('chat-message-bounce', {username: "System", msg: msg});
        io.emit('reset-wheel');
        console.log(players);
        io.emit('decideWhoBuzzedFirst', players);
      } else {
        determineWinnerOfBuzzIn();
      };
    }
    
    setTimeout(sendQuestionDelay, 3000);
    // Notify everyone in the room of the chosen question point value
    io.emit('chat-message-bounce', {username: "System", msg: `${data.username} has chosen a point value of ${data.qVal}`});
    hasSomeoneBuzzedIn = false;
    currentPoint = data.qVal;
    //io.emit('update-room-info', players);
    displayTime = setTimeout(displayQuestionTimer, 10000);
  });

  // SERVER: Times everyone buzzing in
  gameSocket.on('buzzed-in', (data) => {
    // Only push unique usernames, so no repeat buzzes
    flag = false;
    playersBuzzedTime.forEach(function (item, index) {
      if (item.username == data.username) { flag = true;};
    });
    if (!flag) {
      playersBuzzedTime.push(data);
    }
    // reset question timeout after buzz-in
    // clearTimeout(displayTime);
    hasSomeoneBuzzedIn = true;
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
      clearTimeout(displayTime);

       // Delay 10 seconds before answer submit
    
    function displaySubmitTimer() {
      io.emit('chat-message-bounce', {username: "System", msg: `${winner.username} has not submitted an answer. Time's up!`});
      correctChoice = gameInfo.chosenQ.correctAnswer;
      msg = "The correct answer was ".concat(correctChoice, ".");
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      io.emit('reset-wheel');
      msg = `${winner.username} lost ${currentPoint} points.`;
      currentScore = Number(currentScore) - Number(currentPoint);
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      msg = `${winner.username} has ${currentScore} total points`; 
      // answerStatus = "lost";
      playerScores[currentPlayer] = currentScore;  //update current player's score
      players.forEach(function (item, index) {
        // Update the current player according to the winner of the buzzer
        if (item.username == data.username) {
          players[index].score = currentScore;
        };
      });
      console.log(players);
      io.emit('decideWhoBuzzedFirst', players);
    }

      submitTime = setTimeout(displaySubmitTimer, 10000);
      
      io.emit('decideWhoBuzzedFirst', players);
      // Notify everyone in the room of the person who buzzed in first
      io.emit('chat-message-bounce', {username: "System", msg: `${winner.username} is the person who buzzed in first!`});
      io.emit('startTimerForQA');
    };
  });
  
  gameSocket.on('submit-answer', (data) => {
    let answerStatus = "";
    clearTimeout(submitTime);
    ansChoice = data.choice.split(' ').slice(1).join(' ');
    correctChoice = gameInfo.chosenQ.correctAnswer;
    msg = `${data.username} picked answer choice ${ansChoice}.`;
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    msg = `The correct answer was ${correctChoice}.`;
    io.emit('chat-message-bounce', {username: "System", msg: msg});
    if (ansChoice == correctChoice) {
      msg = `${data.username} got ${currentPoint} points.`;
      currentScore = Number(currentScore) + Number(currentPoint);
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      msg = `${data.username} has ${currentScore} total points`;
      answerStatus = "won";
    } else {
      msg = `${data.username} lost ${currentPoint} points.`;
      currentScore = Number(currentScore) - Number(currentPoint);
      io.emit('chat-message-bounce', {username: "System", msg: msg});
      msg = `${data.username} has ${currentScore} total points`; 
      answerStatus = "lost";
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
    io.emit('chat-message-bounce', {username: "System", msg: `There are ${questionsReaming} questions remaining.`});
    if(questionsReaming === 0){
      const winner = {}
      winner.winners = getWinnerIdx(playerScores);
      console.log(winner.winners)
      winner.winner = "";
      if (winner.winners.length == 1) {
        winner.winner = players[winner.winners[0]].username;
      } else if (winner.winners.length > 1) {
        winner.winners.forEach(function (item, index) {
          winner.winner = winner.winner + players[item].username + " and ";
        });
        winner.winner = winner.winner.substring(0, winner.winner.length - 5);
      };
      winner.message = "Game over!"
      io.emit('chat-message-bounce', {username: "System", msg: `The winner is ${winner.winner}!`});
      io.emit('game-end', winner)   
      
      updateDatabase(playerScores);  
      // flush all variables
      numOfActivePlayers = 0;
      players = [];
      currentPlayer = 0;
      curRound = 1;
      questions = {};
      gameInit = false;
      qPointValues = {};
      gameInfo = {};
      playersBuzzedTime = [];
      playerScores = [0,0,0];
      currentScore = 0;
      currentPoint = 0;
      questionsReaming = -1;
      gameStarted = false;
      avaiPlayerRoles = [0, 1, 2];
      hasSomeoneBuzzedIn = false;
      gameCategories = ["Science", "Sports", "Literature", "Film", "History", "Art"];
      if (gameCategories[gameCategories.length-1] === "Art") categoriesIds = [17, 21, 10, 11, 23, 25];
      else categoriesIds = [17, 21, 10, 11, 12, 22];
      gameCategoriesSpinValues = [360, 330, 300, 270, 240, 210];
      chosenInd = -1;
      // Reset wheel image
      fs.readFile("public/img/wheel.svg", "utf-8", function(err, data) {
        fs.writeFile("public/img/wheel3.svg", data, function(err, data) {
          if (err) console.log(err);
        });
      });      
    } else {
      io.emit('reset-wheel');
      io.emit('remove-slice-from-wheel', {src: "/img/wheel3.svg"});
      io.emit('play-pts-anim', {status: answerStatus});
    }
    io.emit('chat-message-bounce', {username: "System", msg: `The game is currently in Round ${++curRound}.`});
  });

  // A player logs out
  gameSocket.on('disconnect', () => {
    if (gameInit) {
      console.log(gameSocket.id);
      console.log("A client disconnected");
      let loggedOutPlayer = "";
      let loggedOutPlayerRole = "";
      // Purge player from players
      players.forEach(function (item, index) {
        if (item.socketid == socket.id) {
          numOfActivePlayers = numOfActivePlayers - 1;
          // if the player who logged out is the current player, transfer current player status
          if (players[index].currentPlayer) {
            if (numOfActivePlayers > 0) {
              // if there are more players in the room, transfer ownership to the next player
              players[(index + 1) % players.length].currentPlayer = true;
              currentPlayer = players[(index + 1) % players.length].playerRole;
              io.emit('decideWhoBuzzedFirst', players);
            };
          };
          players.splice(index, 1);
          loggedOutPlayer = item.username;
          loggedOutPlayerRole = item.playerRole;
          io.emit('remove-player', {username: loggedOutPlayer});
        };
      });
      avaiPlayerRoles.push(loggedOutPlayerRole);      
      console.log(players);
      io.emit('chat-message-bounce', {username: "System", msg: `${loggedOutPlayer} just left the game.`});
      // flush all game variables
      if (players.length < 1 && questionsReaming > 0) {
        players = [];
        numOfActivePlayers = 0;
        currentPlayer = 0;
        curRound = 1;
        questions = {};
        gameInit = false;
        qPointValues = {};
        gameInfo = {};
        playersBuzzedTime = [];
        playerScores = [0,0,0];
        currentScore = 0;
        currentPoint = 0;
        questionsReaming = -1;
        gameStarted = false;
        avaiPlayerRoles = [0, 1, 2];
        hasSomeoneBuzzedIn = false;
        chosenInd = -1;
        gameCategories = ["Science", "Sports", "Literature", "Film", "History", "Art"];
        if (gameCategories[gameCategories.length-1] === "Art") categoriesIds = [17, 21, 10, 11, 23, 25];
        else categoriesIds = [17, 21, 10, 11, 12, 22];
        gameCategoriesSpinValues = [360, 330, 300, 270, 240, 210];
        // Reset wheel image
        fs.readFile("public/img/wheel.svg", "utf-8", function(err, data) {
          fs.writeFile("public/img/wheel3.svg", data, function(err, data) {
            if (err) console.log(err);
          });
        });
      };
    };
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

const updateDatabase = (scores) => {
  for(var i = 0; i < players.length; ++i){
    User.findOne({
      where: {
          username: players[i].username
      },
    }).then((user) => {
        if(user){
            var newScore = user.cumulativeScore + scores[i];
            var newGamesPlayed = user.gamesPlayed + 1;

            user.update({
              cumulativeScore: newScore,
              gamesPlayed: newGamesPlayed
              
            })
            if(scores[i] > user.highScore){
              user.update({
                highScore: scores[i]
              })
            }
        } else{ 
          console.log("Error updating user info.")
        }
    })
  }
}
