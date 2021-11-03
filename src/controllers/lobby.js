require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

/* GET lobby page. */
router.get(`/`, (req, res) => {
    let token = req.cookies.jwt;
    var username;
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        username = decodedUser.username;
    });
    res.render('lobby', {username});
});

module.exports = router;
