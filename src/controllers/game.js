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
    console.log(answerA)

    return {question, answerA, answerB, answerC, answerD};
}

//var questions;
const getQuestions = async() => {
    let response = await axios('https://opentdb.com/api.php?amount=10&encode=url3986');
    questions = response.data;

    return questions;
}

const getSingleQuestion = (index) => questions[index];

/* GET game session. */
router.get(`/`, async(req, res) => {
    res.render('game', await getQuestion())
});

const playerAnswersQuestion = () => {
}

module.exports = router;
