var io;
var gameSocket;

export function initGame(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', {message: "Connected to game!"});


}


let createNewGame = () => {
    var gameId = Math.random() * 1000000

    this.emit('newGame', {gameId: gameId, })
}