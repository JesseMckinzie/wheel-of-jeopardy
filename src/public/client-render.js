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
                    IO.socket.emit('save-user-and-socket-id', {socketid: App.mySocketId, username: App.myUsername, playerRole: '', currentPlayer: false});
                };
                IO.socket.emit('update-room-info');
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
        }
    };

    var App = {

        // The unique ID of this socket
        mySocketId: '',
        // The name of the client
        myUsername: '',
        myRole: '',
        currentPlayer: false,

        init: function () {
            // JQuery stuff. Renders the main game
            App.$doc = $(document);
            App.$templateOtherPlayersInfo = $('#other-players-template').html();
            $('#other-players').html(App.$templateOtherPlayersInfo);
            App.$templateCurrentPlayerInfo = $('#current-player-template').html();
            $('#current-player').html(App.$templateCurrentPlayerInfo);
            App.$templateChat = $('#chat-template').html();
            $('#chat-container').html(App.$templateChat);

            // Binds buttons to events            
            App.$doc.on('click', '#chat-send', App.onChatSend);
            App.$doc.on('click', '#spin-button', App.onSpinBtn);
            App.$doc.on('click', '#choose-q-val-btn', App.onChooseQuestionVal);
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
        },

        /**
         * Sends a chat message when the user clicks the send button in the chat box.
         */        
        onChatSend: function() {
            var msg = $('#chat-input').val();
            if (msg) {
                IO.socket.emit('chat-message', {msg: msg, username: App.myUsername});
                $('#chat-input').val() = '';
            }
        },

        /**
         * Updates the chat box whenever there is a new message.
         * @param {Array.<{msg: String, username: String}>} data
         */        
        updateChatBox: function(data) {
            var msg = data.username.concat(': ', data.msg);
            $("#messages").append('<li>'.concat(msg, '</li>'));
        },

        /**
         * Notifies the server that a user spun the wheel.
         */        
        onSpinBtn: function() {
            if (App.currentPlayer) {
                IO.socket.emit('spin');
            }
        },

        /**
         * Updates the chosen question category after the wheel is spun.
         * @param data{String}
         */          
        getQuestionCategory: function(data) {
            $('#game-area').html($('#wheel-template').html());
            $('#question-cat').append('<p/>').text(data);
        },

        /**
         * Notifies the server that a user chose a question value.
         */         
        onChooseQuestionVal: function() {
            var qVal = $('#q-val-input').val();
            if (qVal) {
                IO.socket.emit('choose-q-value', {qVal: qVal, username: App.myUsername});
                $('#q-val-input').val() = '';
            }            
        },

        /**
         * Updates the chosen question after the question point value has been selected.
         * @param {Array.<{question: String, answerA: String, answerB: String, answerC: String, answerD: String, correctAnswer: String}>} data
         */         
        getQuestion: function(data) {
            $('#game-area').html($('#question-template').html());
            $('#question').append('<p/>').text(data.question);
            $('#answer_a').text('a)'.concat(' ', data.answerA));
            $('#answer_b').text('b)'.concat(' ', data.answerB));
            $('#answer_c').text('c)'.concat(' ', data.answerC));
            $('#answer_d').text('d)'.concat(' ', data.answerD));
        }
    };

    IO.init();
    App.init();

}($));