const express = require('express');
const router = express.Router();
const axios = require('axios')
const db = require('../database/database')


/* GET home page. */
router.get(`/`, async(req, res) => {
    res.render('authe')
});
// get data from client
router.post('/api', (req, res) => {
    //console.log(req.body);
    var userName = req.body.userName;
    var email = req.body.email;


    db.query(`SELECT username, email FROM users WHERE username = "` + userName + `"`, (err, result, field) => {
        if(result.length == 0) {
            var command = `INSERT INTO users (username, email) VALUES ( "` + userName + `","` + email + `")`;

            db.query(command, (err, result) => {
                if (err) throw err;
                console.log('User has been added to database.');
            });
        } else {
            if(result.email != email) {
                //throw username already associated with another email error
                console.log("Username already in use.")
            } else (
                console.log("Login successful!")
            )
        }
    });

    

    //res.redirect('/')
});

module.exports = router;
