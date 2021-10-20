const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')


const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public"))); // static folder

server.listen(PORT, () => console.log(`Running on port ${PORT}`));// start server

// Socket request

const connections = [null, null, null];

io.on("connect", socket => {
    let playerIdx = -1;
    
    // Find player id
    for(const i in connections){
        if (connections[i] == null){
            playerIdx = i;
            break;
        }
    }

    if (playerIdx === -1) return; //Ignore more than 3 players

    socket.emit('player-number', playerIdx);
    console.log('Player has connected');
})

