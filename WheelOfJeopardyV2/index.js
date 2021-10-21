const express = require('express')
const path = require('path')
const http = require('http')
const https = require('https')
const socketio = require('socket.io')
const { unescape } = require('querystring')
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);
//var hbs = require('express-handlebars');


const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public"))); // static folder

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
var theQuestion;
//var question;
function getQuestion() {
    // https.get('https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple&encode=url3986', res => { //10 questions
    https.get('https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&encode=url3986', res => { // 1 question
        let data = [];

        res.on('data', chunk => {
            data.push(chunk);
        });

        res.on('end', () => {
            var question = JSON.parse(Buffer.concat(data).toString());
            //theQuestion = question; // multiple questions
            
            theQuestion = unescape(question.results[0].question) // 1 question
            
            //console.log(theQuestion);
        });

    });

    console.log(theQuestion)

    // var rand = Math.floor(Math.random() * theQuestion.length)

    app.get("/", (req, res) => {
        res.render('index', {theQuestion: theQuestion})
    });
}

getQuestion();

$('#buttonId').click(function(){
    alert("clicked")
});

/*
var myTemplate = $('#myTempId').html();
var compiled = Handlebars.compile(myTemplate);

$('#buttonId').click(function(){
    $('#containerId').html(compiled({theQuestion: unescape(theQuestion.results[rand].question)}))
})
*/


