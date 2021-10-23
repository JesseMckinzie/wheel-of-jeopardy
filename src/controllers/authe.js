require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios')
const db = require('../database/database')


/* GET home page. */
router.get(`/`, async(req, res) => {
    res.render('authe')
});

var i = 1;
// get data from client
router.post('/api', (req, res) => {
    //console.log(req.body);
    var userName = req.body.uname;
    var email = req.body.email;


    db.query(`SELECT username, email FROM users WHERE username = "` + userName + `"`, (err, result, field) => {
        if(result.length == 0) {
            var command = `INSERT INTO users (username, email) VALUES ( "` + userName + `","` + email + `")`;

            db.query(command, (err, result) => {
                if (err) throw err;
                console.log('User has been added to database.');
            });
        } else {
            result = JSON.stringify(result);
            result = JSON.parse(result)[0];
            if(result.email === email) {
                //throw username already associated with another email error
                console.log("Log in successful!")
                console.log("Player " + i + " has connected.");
                ++i;
                
                res.redirect('/game')
            } else {
                console.log("Incorrect username or email.")
            } 
        }
    });

    

    
});

module.exports = router;
