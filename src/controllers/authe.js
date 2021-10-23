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

// SIGN OUT ROUTE
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
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
                
                res.redirect('/game')
            } else {
                console.log("Incorrect username or email.")
                res.redirect('/')
            } 
        }
    });

    

    
});

module.exports = router;
