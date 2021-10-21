const express = require('express');
const router = express.Router();
const https = require('https')

let theQuestion;
let theAnswer = "hello world";

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


/* GET home page. */
router.get(`/`, (req, res) => {
    res.render('index', {theQuestion: theQuestion, theAnswer:theAnswer})
});

module.exports = router;
