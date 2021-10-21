const express = require('express');
const router = express.Router();

router.get(`/session`, (req, res) => {
    res.render('session')
});

module.exports = router;
