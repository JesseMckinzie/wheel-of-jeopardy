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
            IO.socket.on('connected', () => {
                if (App.mySocketId == '') {
                    App.mySocketId = IO.socket.id;
                    App.myUsername = $('#player-0').text();
                    IO.socket.emit('save-user-and-socket-id', {socketid: App.mySocketId, username: App.myUsername});
                };
                IO.socket.emit('update-room-info');
            });
            IO.socket.on('update-room-info', (data) => {
                App.updatePlayerScreen(data);
            });
            IO.socket.on('playerJoinedGame', (data) => {
                //alert(data);
            });
            IO.socket.on('playerCreatedGame', (data) => {
                //alert(data);
            });
            IO.socket.on('chat-message-bounce', (data) => {
                App.updateChatBox(data);
            });              
        }
    };

    var App = {

        // The unique ID of this socket
        mySocketId: '',

        // The name of the client
        myUsername: '',

        init: function () {
            App.$doc = $(document);

            App.$templateOtherPlayersInfo = $('#other-players-template').html();
            $('#other-players').html(App.$templateOtherPlayersInfo);
            App.$templateCurrentPlayerInfo = $('#current-player-template').html();
            $('#current-player').html(App.$templateCurrentPlayerInfo);
            App.$templateChat = $('#chat-template').html();
            $('#chat-container').html(App.$templateChat);
            
            App.$doc.on('click', '#chat-send', App.onChatSend);
        },

        updatePlayerScreen: function(data) {
            let i = 1;
            data.forEach(function (item, index) {
                if (item.username != App.myUsername) {
                    $('#player-'.concat('', i)).append('<p/>').text(item.username);
                    i = i + 1;
                }
            });
        },

        onChatSend: function() {
            var msg = $('#chat-input').val();
            if (msg) {
                IO.socket.emit('chat-message', {msg: msg, username: App.myUsername});
                $('#chat-input').val() = '';
            }
        },

        updateChatBox: function(data) {
            var msg = data.username.concat(': ', data.msg);
            $("#messages").append('<li>'.concat(msg, '</li>'));
        }
    };

    IO.init();
    App.init();

}($));