const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
    res.render('chat', {user: req.user.username});
});

module.exports = router;

