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
app.use(express.json({limit: '1mb'})); // parse client POST requests

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

server.listen(PORT, () => console.log(`Running on port ${PORT}`));// start server

// Socket request

const connections = [null, null, null];

/*
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
*/
var theQuestion

https.get('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986', res => {
    let data = [];

    res.on('data', chunk => {
        data.push(chunk);
    });

    res.on('end', () => {
        const question = JSON.parse(Buffer.concat(data).toString());
        theQuestion = unescape(question.results[0].question)

        console.log(theQuestion);
    });

});

var theAnswer = "hello world";

app.get("/", (req, res) => {
    res.render('index', {theQuestion: theQuestion, theAnswer:theAnswer})
});

// main game page
app.get("/game", (req, res) => {
    res.render('session')
});

// get data from client
app.post('/api', (req, res) => {
    console.log(req.body);
});
