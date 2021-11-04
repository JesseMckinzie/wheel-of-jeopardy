require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const url = require('url');

let gameIds = [0] // list to hold all game IDs

/* GET lobby page. */
router.get(`/`, (req, res) => {
    const username = req.user.username;

    res.render('lobby', {username});
});

/* POST lobby page. */
router.post(`/`, (req, res) => {
    var buttonPressed = req.body.button;
    const username = req.user.username;

    if (buttonPressed == "host") {
        var thisGameId = gameIds[gameIds.length - 1] + 1; // unique game ID
        gameIds.push(thisGameId);
        res.render('host', {thisGameId, username});
    } else if (buttonPressed == "join") {
        // Go back
        res.render('join', {username})
    } else if (buttonPressed == "logout") {
        res.redirect('/logout')
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

/* POST host page. */
router.post(`/host_api`, (req, res) => {
    var buttonPressed = req.body.button;
    var gameId = gameIds[gameIds.length - 1];
    var passcode = req.body.passcode;
    var gameLength = req.body.game_length;
    const username = req.user.username;
     
    if (buttonPressed == "create") {
        // host game and direct to game
        /* res.redirect(url.format({
            pathname:"/game",
            query: {
               "gameId": gameId,
               "passcode": passcode,
               "gameLength": gameLength,
               "type": "host"
             }
        })); */
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
    } else if (buttonPressed == "join") {
        // join game and direct to game
        gameId = req.body.gameId;
        /* res.redirect(url.format({
            pathname:"/game",
            query: {
               "gameId": gameId,
               "passcode": passcode,
               "type": "join"
             }
        })); */
        res.redirect(url.format({
            pathname:"/wait",
            query: {
               "username": username,
               "gameId": gameId,
               "passcode": passcode,
               "gameLength": gameLength
             }
        }));
    } else if (buttonPressed == "back") {
        // Go back
        res.redirect('/lobby');
    }  else {
        console.log("User did not press any buttons on the register page.");
    }
});

module.exports = router;