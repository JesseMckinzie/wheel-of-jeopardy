require("dotenv").config();
require("url");
const express = require('express');
const router = express.Router();
const axios = require('axios')
const db = require('../database/database')
const jwt = require("jsonwebtoken");


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

/* POST signup page. */
router.post(`/reg_api`, (req, res) => {
    var buttonPressed = req.body.button;
    console.log(buttonPressed);
    if (buttonPressed == "create") {
        // Save user account
        // res.render('authe')
    } else if (buttonPressed == "back") {
        // Go back
        res.render('authe')
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

/* GET lobby. */
router.get(`/lobby`, async(req, res) => {
    var userName = req.query.userName; // we need to pass username from login to lobby. Create code for sessions?
    res.render('lobby', userName);
});

/* POST lobby. */
router.post(`/lob_api`, (req, res) => {
    var buttonPressed = req.body.button;
    console.log(buttonPressed);
    if (buttonPressed == "host") {
        res.render('host')
    } else if (buttonPressed == "join") {
        // Go back
        res.render('join')
    } else if (buttonPressed == "logout") {
        res.redirect('/logout')
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

/* POST host. */
router.post(`/host_api`, (req, res) => {
    var buttonPressed = req.body.button;
    console.log(buttonPressed);
    if (buttonPressed == "create") {
        // host game and direct to game
        res.redirect('/game');
    } else if (buttonPressed == "join") {
        // join game and direct to game
        res.redirect('/game');
    } else if (buttonPressed == "back") {
        // Go back
        res.redirect('/lobby');
    }  else {
        console.log("User did not press any buttons on the register page.");
    }
});

// SIGN OUT ROUTE
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

// Back to lobby
router.get(`/back`, (req, res) => {
    res.redirect("/lobby");
});

var i = 1;
// get data from client
router.post('/api', (req, res) => {
    // console.log(req.body);
    var userName = req.body.username;
    var email = req.body.email;

    db.query(`SELECT username, email FROM users WHERE username = "` + userName + `"`, (err, result, field) => {
        if(result.length == 0) {
            var command = `INSERT INTO users (username, email) VALUES ( "` + userName + `","` + email + `")`;

            db.query(command, (err, result) => {
                if (err) throw err;
                console.log('User has been added to database.');

                const token = createToken(userName, email)
                res.cookie("jwt", token);

                res.redirect('/game')
            });
        } else {
            result = JSON.stringify(result);
            result = JSON.parse(result)[0];
            if(result.email === email) {
                //throw username already associated with another email error
                console.log("Log in successful!")
                console.log(`Player ${i} (${userName}) has connected.`);
                ++i;

                const token = createToken(userName, email)
                res.cookie("jwt", token);
                
                res.redirect('/lobby');
            } else {
                console.log("Incorrect username or email.")
                res.redirect('/')
            } 
        }
    });

    

    
});

module.exports = router;
