require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios')

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const getQuestion = async() => {
    let response = await axios(`https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986`)
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
//var i = 0;
/* GET game session. */
router.get(`/`, async(req, res) => {
    //console.log(`Player ` + i + ` connected.`) // Counts connected players
    //++i;
    res.render('game', await getQuestion())
});

module.exports = router;
