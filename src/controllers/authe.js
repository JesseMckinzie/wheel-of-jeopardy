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
    
    var command = `INSERT INTO users (username, email) VALUES ("{userName}", "{email}")`;

    db.query(command, (err, result) => {
        if (err) throw err;
        console.log('User has been added to database.');
    });
});

module.exports = router;
