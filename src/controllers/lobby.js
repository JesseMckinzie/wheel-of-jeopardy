require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const url = require('url');
const alert = require('alert'); 
const { REPL_MODE_SLOPPY } = require("repl");
const User = require("../models").User;
const { token } = require("morgan");

let gameIds = [0] // list to hold all game IDs
var games = {}; // dictionary to hold all active game IDs and passcode

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
    } else if (buttonPressed == "view-profile") {
        const user = req.user.username;
        const mail = req.user.email;
        var cumulativeScore, highScore, gamesPlayed;
        User.findOne({
            where: {
                username: user,
                email: mail
            },
        }).then((user) => {
            if(user){
                //console.log(user);
    
                cumulativeScore = user.cumulativeScore;
                highScore = user.highScore;
                gamesPlayed = user.gamesPlayed;
    
            } else{ 
                alert("Error retrieving user info.");
            }
        }).then(() => {
            res.render('profile', {username, mail, gamesPlayed});
        });
    } else if (buttonPressed == "logout") {
        res.redirect('/logout')
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

/* POST view profile page */
router.post(`/profile`, (req, res) => {    
    var buttonPressed = req.body.button;
    if (buttonPressed == "back") {
        res.redirect('/');
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
    if (!gameLength) { gameLength = 30;};
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

        // Save gameId and corresponding passcode
        if (gameLength % 6 == 0) {
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
        } else {
            alert(`Game length must be a multiple of 6.`);
        };
        // need a game creation method here
    } else if (buttonPressed == "join") {
        // join game and direct to game
        gameId = req.body.game_id;
        if (gameId != "") {
        /* res.redirect(url.format({
            pathname:"/game",
            query: {
               "gameId": gameId,
               "passcode": passcode,
               "type": "join"
             }
        })); */
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
            };
        } else {
            alert(`Empty game ID.`);
        };
    } else if (buttonPressed == "back") {
        // Go back
        res.redirect('/lobby');
    }  else {
        console.log("User did not press any buttons on the register page.");
    }
});

module.exports = router;
