require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios')


const getQuestion = async() => {
    let response = await axios(`https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986`)
    response = response.data.results[0];
    question = unescape(response.question);
    answer = unescape(response.correct_answer);

    return {question, answer};
}
//var i = 0;
/* GET game session. */
router.get(`/`, async(req, res) => {
    //console.log(`Player ` + i + ` connected.`) // Counts connected players
    //++i;
    res.render('game', await getQuestion())
});

module.exports = router;
