require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { response } = require("express");
const { JsonWebTokenError } = require("jsonwebtoken");

/*
const getQuestion = async() => {
    let response = await axios(`https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986`)
    console.log(response.data)
    response = response.data.results[0];
    question = unescape(response.question);
    correctAnswer = unescape(response.correct_answer);
    answers = response.incorrect_answers;
    answers.push(correctAnswer);

    shuffleArray(answers);

    const answerA = unescape(answers[0]);
    const answerB = unescape(answers[1]);
    const answerC = unescape(answers[2]);
    const answerD = unescape(answers[3]);

    return {question, answerA, answerB, answerC, answerD, correctAnswer};
}
*/
const questions = {"response_code":0,"results":[{"category":"History","type":"multiple","difficulty":"easy","question":"The%20original%20Roman%20alphabet%20lacked%20the%20following%20letters%20EXCEPT%3A","correct_answer":"X","incorrect_answers":["W","U","J"]},{"category":"Science%20%26%20Nature","type":"multiple","difficulty":"hard","question":"Which%20moon%20is%20the%20only%20satellite%20in%20our%20solar%20system%20to%20possess%20a%20dense%20atmosphere%3F","correct_answer":"Titan","incorrect_answers":["Europa","Miranda","Callisto"]},{"category":"Entertainment%3A%20Video%20Games","type":"multiple","difficulty":"medium","question":"In%20Terraria%2C%20what%20does%20the%20Wall%20of%20Flesh%20not%20drop%20upon%20defeat%3F","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker%20Blade","Laser%20Rifle"]},{"category":"Geography","type":"multiple","difficulty":"easy","question":"How%20many%20stars%20are%20featured%20on%20New%20Zealand%27s%20flag%3F","correct_answer":"4","incorrect_answers":["5","2","0"]},{"category":"Entertainment%3A%20Television","type":"multiple","difficulty":"hard","question":"In%20%22Star%20Trek%22%2C%20who%20was%20the%20founder%20of%20the%20Klingon%20Empire%20and%20its%20philosophy%3F","correct_answer":"Kahless%20the%20Unforgettable","incorrect_answers":["Lady%20Lukara%20of%20the%20Great%20Hall","Molor%20the%20Unforgiving","Dahar%20Master%20Kor"]}]};
/*
const getQuestions = async() => {
    let response = await axios('https://opentdb.com/api.php?amount=10&encode=url3986');
    let questions = response.data;

    return questions;
}
*/


var index = 0;
const getSingleQuestion = (index, questions) => {
    var information = questions.results[index]
    var question = unescape(information.question);
    var correctAnswer = unescape(information.correct_answer);
    var answers = information.incorrect_answers;
    answers.push(correctAnswer);

    //shuffleArray(answers);

    const answerA = unescape(answers[0]);
    const answerB = unescape(answers[1]);
    const answerC = unescape(answers[2]);
    const answerD = unescape(answers[3]);

    return {question, answerA, answerB, answerC, answerD, correctAnswer};
}

var numberOfSubmits = 0;

//var i = 0;
/* GET game session. */
router.get(`/`, async(req, res) => {
    //console.log(`Player ` + i + ` connected.`) // Counts connected players
    //++i;
    // console.log(req.query); // log created game parameters
    ++numberOfSubmits;
    console.log(numberOfSubmits)
    if(numberOfSubmits%2 === 0) index = ++index%questions.results.length;

    let thingsToRender = {
        ...{user: req.user.username},
        ...getSingleQuestion(index, questions)
    };
    res.render('game', thingsToRender)
});

module.exports = router;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
