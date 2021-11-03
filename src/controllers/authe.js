require("dotenv").config();
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

router.get('/wait', async(req, res) => {
    username = req.query.username;
    gameId = req.query.gameId;
    passcode = req.query.passcode;
    gameLength = req.query.gameLength;
    console.log(username);
    res.render('wait', {username, gameId, passcode, gameLength})
});

/* POST signup page. */
router.post(`/reg_api`, (req, res) => {
    var buttonPressed = req.body.button;
    // console.log(buttonPressed);
    if (buttonPressed == "create") {

        var userName = req.body.username;
        var email = req.body.email;

        db.query(`SELECT username FROM users WHERE username = "` + userName + `"`, (err, result, field) => {
            
            // Check if username is already in use
            if(result.length != 0) {

                console.log('Username already in use.')
                res.render('register'); // route back to registration page, need to add alert

            } else {

                //Check if email is already in use
                db.query(`SELECT email FROM users WHERE email = "` + email + `"`, (err, result, field) => {
                    if(result.length != 0) {

                        console.log('Email already in use.')
                        res.render('register'); // route back to registration page, need to add alert

                    } else { // If username and email have not been used, create a new account

                        var command = `INSERT INTO users (username, email) VALUES ( "` + userName + `","` + email + `")`;
    
                        db.query(command, (err, result) => {
                            if (err) throw err;
                            console.log('User has been added to database.');
                        });
                        res.render('authe') // Route to login page
                    }
                });
            }
        });

    } else if (buttonPressed == "back") {
        // Go back to login
        res.clearCookie("jwt");
        res.redirect("/");
    } else {
        console.log("User did not press any buttons on the register page.");
    }
});

/* POST user action. */
router.post(`/player_actions`, (req, res) => {
    var buttonPressed = req.body.button;
    //console.log(buttonPressed);
    if (buttonPressed == "logout") {
        // logout
        res.redirect('/logout');
    } else if (buttonPressed == "back") {
        // Go back
        res.redirect('/lobby');
    }  else {
        console.log("User did not press any buttons on the game page.");
    }
});

// SIGN OUT ROUTE
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

var i = 1;
// get data from client
router.post('/api', (req, res) => {
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
   // res.redirect(redirect);
});

module.exports = router;
