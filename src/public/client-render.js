;
jQuery(function($){    
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io({transports: ['websocket'], upgrade: false});
            IO.bindEvents();
            IO.socket.connect();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents: function() {
            // Fires when the server confirms our connection. Updates THIS client's unique socket ID and username. Saves this combination in the server.
            IO.socket.on('connected', () => {
                if (App.mySocketId == '') {
                    App.mySocketId = IO.socket.id;
                    App.myUsername = $('#player-0').text();
                    IO.socket.emit('save-user-and-socket-id', {socketid: App.mySocketId, username: App.myUsername, playerRole: '', currentPlayer: false, score: 0});
                };
                // Update the room whenever someone connects
                IO.socket.emit('update-room-info');
                // initialize the game if this client is a host
                if (App.myRole == 0) {
                    IO.socket.emit('initialize-game', {gameId: $('#gameId').val(), passcode: $('#passcode').val(), gameLength: $('#gameLength').val()});
                };
            });
            // CLIENT: Update the room whenever a new user joins
            IO.socket.on('update-room-info', (data) => {
                data.forEach(function (item, index) {
                    if (item.username == App.myUsername) {
                        App.currentPlayer = item.currentPlayer;
                        App.myRole = item.playerRole;
                    }
                });
                App.updatePlayerScreen(data);
            });
            // CLIENT: Fires when the client joins a game. Currently empty
            IO.socket.on('playerJoinedGame', (data) => {
                //alert(data);
            });
            // CLIENT: Fires when the client hosts a game. Currently empty
            IO.socket.on('playerCreatedGame', (data) => {
                //alert(data);
            });
            // CLIENT: Updates the chat box whenever someone sends a message
            IO.socket.on('chat-message-bounce', (data) => {
                App.updateChatBox(data);
            });
            // CLIENT: Updates the chosen question category whenever someone spins the wheel
            IO.socket.on('getQuestionCategory', (data) => {
                App.getQuestionCategory(data);
            });
            // CLIENT: Updates the question whenever someone chooses a point value
            IO.socket.on('sendQuestion', (data) => {
                App.getQuestion(data);
            });
            // CLIENT: Updates the player who buzzed-in first as the current player
            IO.socket.on('decideWhoBuzzedFirst', (data) => {
                data.forEach(function (item, index) {
                    if (item.username == App.myUsername) {
                        App.currentPlayer = item.currentPlayer;
                    }
                });
                App.updatePlayerScreen(data);
            });     
            // CLIENT: Start a 10-second timer for question & answer
            IO.socket.on('startTimerForQA', () => {
                clearInterval(App.refreshIntervalId);
                App.startTimer(10, $('#timer'));
            });            
            // CLIENT: Reset the wheel for the next round
            IO.socket.on('reset-wheel', () => {
                $('#game-area').html(App.$initWheel);
            });
            // CLIENT: Update scores
            IO.socket.on('update-scores', (data) => {
                App.updateScores(data);
            });   
            // CLIENT: Remove player from screen
            IO.socket.on('remove-player', (data) => {
                App.removePlayer(data);
            });
            // CLIENT: Start the game when there are 3 players
            IO.socket.on('game-started', () => {
                App.gameStarted = true;
            });            

            IO.socket.on('game-end', (data) => {
                App.endGame(data);
            });
            // CLIENT: Remove slice from wheel
            IO.socket.on('remove-slice-from-wheel', (data) => {
                var timestamp = new Date().getTime();
                $('#wheel-img').attr("src", data.src + "?t=" + timestamp);
            });         
            // CLIENT: Render points won or lost animation
            IO.socket.on('play-pts-anim', (data) => {
                if (App.currentPlayer) {
                    if (data.status == "won") {
                        $('.wheel-container').append('<img class="video" id="video-got-pts" src="/img/no-scope-low-res.gif" alt="current-profile-pic">');
                    } else if (data.status == "lost") {
                        $('.wheel-container').append('<img class="video" id="video-lost-pts" src="/img/thanos.gif" alt="current-profile-pic">');
                    };
                };
            });                       
        }
    };

    var App = {

        // The unique ID of this socket
        mySocketId: '',
        // The name of the client
        myUsername: '',
        myRole: '',
        currentPlayer: false,
        questionDisplayed: false,
        timeQuestionDisplayed: new Date().getTime(),
        gameStarted: false,
        refreshIntervalId: '',

        init: function () {
            // JQuery stuff. Renders the main game
            App.$doc = $(document);
            App.$templateOtherPlayersInfo = $('#other-players-template').html();
            $('#other-players').html(App.$templateOtherPlayersInfo);
            App.$templateCurrentPlayerInfo = $('#current-player-template').html();
            $('#current-player').html(App.$templateCurrentPlayerInfo);
            App.$templateChat = $('#chat-template').html();
            $('#chat-container').html(App.$templateChat);
            App.$initWheel = $('#init-wheel-template').html();
            $('#game-area').html(App.$initWheel);

            // Binds buttons to events            
            App.$doc.on('click', '#chat-send', App.onChatSend);
            App.$doc.on('click', '#spin-button', App.onSpinBtn);
            App.$doc.on('click', '#choose-q-val-btn', App.onChooseQuestionVal);
            App.$doc.on('click', '#buzz-in-button', App.onBuzzIn);

            App.$doc.on('click', '#submit-ans-a', App.onChooseA);
            App.$doc.on('click', '#submit-ans-b', App.onChooseB);
            App.$doc.on('click', '#submit-ans-c', App.onChooseC);
            App.$doc.on('click', '#submit-ans-d', App.onChooseD);

            // Prevent enter button from refreshing page
            App.$doc.on('keyup keypress', function(e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode == 13) { 
                    e.preventDefault();
                    return false;
                }
            });
        },

        /**
         * Updates the other player's screen whenever other people join.
         * @param {Array.<{socketid: *, username: String}>} data
         */
        updatePlayerScreen: function(data) {
            let i = 1;
            data.forEach(function (item, index) {
                if (item.username != App.myUsername) {
                    $('#player-'.concat('', i)).append('<p/>').text(item.username);
                    if (!item.currentPlayer) {
                        $('#cur-player-'.concat('', i)).replaceWith( "<p id='cur-player-".concat('', i, "'hidden>c u r r e n t  p l a y e r</p>"));
                    } else {
                        $('#cur-player-'.concat('', i)).replaceWith( "<p id='cur-player-".concat('', i, "'>c u r r e n t  p l a y e r</p>"));
                    };
                    i = i + 1;
                }
            });
            if (App.currentPlayer) {
                $('#cur-player-0').replaceWith( "<p id='cur-player-0'>c u r r e n t  p l a y e r</p>");
            } else {
                $('#cur-player-0').replaceWith( "<p id='cur-player-0' hidden>c u r r e n t  p l a y e r</p>");
            };
            App.updateScores(data);
        },

        updateScores: function(data) {
            data.forEach(function (item, index) {
                for (let i = 0; i < 3; i++) {
                    if ($('#player-'.concat(i)).text() == item.username) {
                        $('#score-'.concat(i)).text(item.score);
                        break;
                    };
                };
            });
        },

        /**
         * Sends a chat message when the user clicks the send button in the chat box.
         */        
        onChatSend: function() {
            var msg = $('#chat-input').val();
            if (msg) {
                IO.socket.emit('chat-message', {msg: msg, username: App.myUsername});
                // $('#chat-input').val() = '';
            }
        },

        /**
         * Updates the chat box whenever there is a new message.
         * @param {Array.<{msg: String, username: String}>} data
         */        
        updateChatBox: function(data) {
            var msg = data.username.concat(': ', data.msg);
            $("#messages").append('<li>'.concat(msg, '</li>'));
            $("#messages").scrollTop($("#messages").prop("scrollHeight"));
        },

        /**
         * Notifies the server that a user spun the wheel.
         */        
        onSpinBtn: function() {
            // reset got and lost points animations
            // $("img").remove(".video");
            if (App.gameStarted) {
                if (App.currentPlayer) {
                    IO.socket.emit('spin', {username: App.myUsername});
                }
                App.questionDisplayed = false;
            };
        },

        /**
         * Updates the chosen question category after the wheel is spun.
         * @param data{String}
         */          
        getQuestionCategory: function(data) {
            if (App.gameStarted) {
                $("#wheel-img").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend animationend',   
                function(e) {
                    //$("#wheel-img").css("animation", "");
                });
                if (App.currentPlayer) {
                    $('#game-area').html($('#wheel-template').html());
                    $("#wheel-img").css("animation", "spin-".concat(data.chosen_q_spin_val, " 1s forwards"));
                    console.log("data: " + data.chosen_q_spin_val);
                    let ptVals = [10, 20, 30, 40, 50]
                    ptVals.forEach(function (item, index) {
                        $("#pt-val-" + item.toString()).hide();
                        $("#pt-val-lb-" + item.toString()).hide();
                    });
                    data.qPointValues.forEach(function (item, index) {
                        $("#pt-val-" + item.toString()).show();
                        $("#pt-val-lb-" + item.toString()).show();
                    });
                } else {
                    // render a different screen for a person who is not the current player
                    $('#game-area').html($('#wheel-template-alt').html());
                    $("#wheel-img").css("animation", "spin-".concat(data.chosen_q_spin_val, " 1s forwards"));
                };
                // $('#question-cat').append('<p/>').text(data.chosen_q);
            };
        },

        /**
         * Notifies the server that a user chose a question value.
         */         
        onChooseQuestionVal: function() {
            if (App.gameStarted) {
                App.startTimer(3, $('#timer'));
                if (App.currentPlayer) {
                    var qVal = $('input[name=pt-val-radio-btn]:checked', '#choose-q-val').val();
                    if (qVal) {
                        IO.socket.emit('choose-q-value', {qVal: qVal, username: App.myUsername});
                        // $('#q-val-input').val() = '';
                    }
                };
            };
        },

        /**
         * Updates the chosen question after the question point value has been selected.
         * @param {Array.<{question: String, answerA: String, answerB: String, answerC: String, answerD: String, correctAnswer: String}>} data
         */         
        getQuestion: function(data) {
            if (App.gameStarted) {
                $('#game-area').html($('#question-template').html());
                $('#question').append('<p/>').text(data.question);
                $('#answer_a').text('a)'.concat(' ', data.answerA));
                $('#answer_b').text('b)'.concat(' ', data.answerB));
                $('#answer_c').text('c)'.concat(' ', data.answerC));
                $('#answer_d').text('d)'.concat(' ', data.answerD));
                // Set the time that the question displayed
                App.timeQuestionDisplayed = new Date().getTime();
                App.questionDisplayed = true;
                // No one is the current player until someone buzzes in
                App.currentPlayer = false;
                $('#cur-player-0').replaceWith( "<p id='cur-player-0' hidden>c u r r e n t  p l a y e r</p>");
                $('#cur-player-1').replaceWith( "<p id='cur-player-1' hidden>c u r r e n t  p l a y e r</p>");
                $('#cur-player-2').replaceWith( "<p id='cur-player-2' hidden>c u r r e n t  p l a y e r</p>");
                App.startTimer(5, $('#timer'));
            };
        },

        endGame: function(data){
            if (App.gameStarted) {
                $('#game-area').html($('#game-over-template').html());
                $('#message').append('<p/>').text(data.message);
                $('#winner').append('<p/>').text('The winner is '.concat(data.winner, '!'));
                // Set the time that the question displayed
                App.timeQuestionDisplayed = new Date().getTime();
                App.questionDisplayed = true;
                // No one is the current player until someone buzzes in
                App.currentPlayer = false;
            };
        },

        onBuzzIn: function() {
            if (App.gameStarted) {
                // You can only buzz in if a question has been displayed
                if (App.questionDisplayed) {
                    let time = new Date().getTime();
                    // Submit the time you buzzed in minus the time the question was first displayed
                    IO.socket.emit('buzzed-in', {time: time - App.timeQuestionDisplayed, username: App.myUsername});
                }
            };
        },

        onChooseA: function() {
            if (App.currentPlayer && App.questionDisplayed && App.gameStarted) {
                IO.socket.emit('submit-answer', {choice: $('#answer_a').text(), username: App.myUsername});
            };
        },
        onChooseB: function() {
            if (App.currentPlayer && App.questionDisplayed && App.gameStarted) {
                IO.socket.emit('submit-answer', {choice: $('#answer_b').text(), username: App.myUsername});
            };
        },
        onChooseC: function() {
            if (App.currentPlayer && App.questionDisplayed && App.gameStarted) {
                IO.socket.emit('submit-answer', {choice: $('#answer_c').text(), username: App.myUsername});
            };
        },
        onChooseD: function() {
            if (App.currentPlayer && App.questionDisplayed && App.gameStarted) {
                IO.socket.emit('submit-answer', {choice: $('#answer_d').text(), username: App.myUsername});
            };
        },

        removePlayer: function(data) {
            for (let i = 0; i < 3; i++) {
                if ($('#player-'.concat(i)).text() == data.username) {
                    $('#player-'.concat(i)).text('');
                    $('#score-'.concat(i)).text('');
                    $('#cur-player-'.concat(i)).replaceWith( "<p id='cur-player-".concat(i, "'hidden>c u r r e n t  p l a y e r</p>"));
                    break;
                };
            };            
        },

        // Timer display function credit to robbmj. https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
        startTimer: function(duration, display) {
            var timer = duration, minutes, seconds;
            var refreshIntervalId = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);
        
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
        
                display.text(minutes + ":" + seconds);
        
                if (--timer < 0) {
                    clearInterval(refreshIntervalId);
                }
            }, 1000);
            // grab interval id if duration is 5 seconds to clear it for the 10 second countdown
            if (duration == 5) {
                App.refreshIntervalId = refreshIntervalId;
            }
        },
    };

    IO.init();
    App.init();

}($));