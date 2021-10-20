const express = require('express')
const path = require('path')
const http = require('http')
const https = require('https')
const socketio = require('socket.io')
const { unescape } = require('querystring')

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

https.get('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986', res => {
    let data = [];

    res.on('data', chunk => {
        data.push(chunk);
    });

    res.on('end', () => {
        const question = JSON.parse(Buffer.concat(data).toString());
        const theQuestion = unescape(question.results[0].question)

        console.log(theQuestion);
    });

});
