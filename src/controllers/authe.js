require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios')
const db = require('../database/database')
const jwt = require("jsonwebtoken");

const User = require("../models").User;

const createToken = (username, email) => {
    return jwt.sign(
        {
          username: username,
          email: email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30 days",
        }
    );
}

/* GET home page. */
router.get(`/`, async(req, res) => {
    res.render('authe')
});

/* GET signup page. */
router.get(`/register`, async(req, res) => {
    res.render('register')
});

router.get('/wait', async(req, res) => {
    username = req.query.username;
    gameId = req.query.gameId;
    passcode = req.query.passcode;
    gameLength = req.query.gameLength;
    console.log(username);
    res.render('wait', {username, gameId, passcode, gameLength})
});

/* POST signup page. */
router.post(`/register`, (req, res) => {
    var buttonPressed = req.body.button;
    // console.log(buttonPressed);
    if (buttonPressed == "create") {
        User.create(req.body)
        .then((newUser) => {
            const token = createToken(newUser.username, newUser.email);
            console.log(token);
            res.cookie("jwt", token); // SEND A NEW COOKIE TO THE BROWSER TO STORE TOKEN
            res.redirect(`/lobby`);
        })
        .catch((err) => {
            // res.send(`err ${err}`);
            console.log(err.errors[0].message);
            res.render(`register`);
            // res.redirect(`/register`);
        });
    } else if (buttonPressed == "back") {
        // Go back to login
        res.clearCookie("jwt");
        res.redirect("/");
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

// SIGN OUT ROUTE
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

var i = 1;
// get data from client
router.post('/login', (req, res) => {
    // console.log(req.body);
    var userName = req.body.username;
    var email = req.body.email;

    db.query(`SELECT username, email FROM users WHERE username = "` + userName + `"`, (err, result, field) => {
        if(result.length == 0) {
            console.log("User does not exist") // Need to add alert for this
            redirect = '/';
        } else {

            result = JSON.stringify(result);
            result = JSON.parse(result)[0];

            if(email !== "" && userName !== "" && result.email === email) {
                console.log("Log in successful!")
                console.log(`Player ${i} (${userName}) has connected.`);
                ++i;
                
                const token = createToken(userName, email)
                res.cookie("jwt", token);
                
                res.redirect('/lobby');
                redirect = '/lobby';
            } else {
                console.log("Incorrect username or email.")
                res.redirect('/')
                redirect = '/'
            } 
        }
    });
});

module.exports = router;
