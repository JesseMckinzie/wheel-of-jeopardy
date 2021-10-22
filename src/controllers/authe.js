const express = require('express');
const router = express.Router();
const axios = require('axios')


/* GET home page. */
router.get(`/`, async(req, res) => {
    res.render('authe')
});
// get data from client
router.post('/api', (req, res) => {
    console.log(req.body);
});

module.exports = router;
