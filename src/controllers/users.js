const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/session', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
