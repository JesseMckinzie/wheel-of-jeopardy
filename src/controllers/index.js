const express = require('express');
const router = express.Router();
// const https = require('https')
const axios = require('axios')

// let theQuestion = ``;
// let theAnswer = ``;

const getQuestion = async() => {


    // await https.get('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986', res => {
    //     let data = [];

    //     res.on('data', chunk => {
    //         data.push(chunk);
    //     });

    //     res.on('end', () => {
    //         const question = JSON.parse(Buffer.concat(data).toString());
    //         theQuestion = unescape(question.results[0].question)

    //         console.log(theQuestion);
    //     });
    // });

    let response = await axios(`https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&encode=url3986`)
    response = response.data.results[0];
    question = unescape(response.question);
    answer = unescape(response.correct_answer);

    return {question, answer};
}

/* GET home page. */
router.get(`/`, async(req, res) => {
    res.render('index', await getQuestion())
});

module.exports = router;
