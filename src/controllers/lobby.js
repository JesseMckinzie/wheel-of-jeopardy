require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const url = require('url');
const alert = require('alert'); 

let gameIds = [0] // list to hold all game IDs
var games = {}; // dictionary to hold all active game IDs and passcode

/* GET lobby page. */
router.get(`/`, (req, res) => {
    const username = req.user.username;
    
    res.render('lobby', {username});
});

/* POST lobby page. */
router.get(`/host`, (req, res) => {
    const username = req.user.username;
    const thisGameId = gameIds[gameIds.length - 1] + 1; // unique game ID
    
    gameIds.push(thisGameId);
    res.render('host', {thisGameId, username});
});

router.get(`/join`, (req, res) => {
    const username = req.user.username;
    res.render('join', {username})
});

/* POST host page. */
router.post(`/host`, (req, res) => {
    const username = req.user.username;
    const gameId = gameIds[gameIds.length - 1];
    const passcode = req.body.passcode;
    const gameLength = req.body.game_length;
    if (!gameLength) { gameLength = 30;};

    // Save gameId and corresponding passcode
    games[gameId] = passcode;
    console.log(games[gameId]);
    res.redirect(url.format({
        pathname:"/wait",
        query: {
            "username": username,
            "gameId": gameId,
            "passcode": passcode,
            "gameLength": gameLength
            }
    }));
    // need a game creation method here
});

router.post(`/join`, (req, res) => {
    // join game and direct to game
    const username = req.user.username;
    const gameId = req.body.game_id;
    
    if (gameId != "") {
        console.log(games[gameId]);
        if (passcode == games[gameId]) {
            res.redirect(url.format({
                pathname:"/wait",
                query: {
                "username": username,
                "gameId": gameId,
                "passcode": passcode,
                "gameLength": gameLength
                }
            }));
        } else {
            alert(`Incorrect game passcode.`);
            res.redirect(`/`);
        };
    } else {
        alert(`Empty game ID.`);
        res.redirect(`/`);
    };
});

module.exports = router;
