const express = require('express');
const router = express.Router();
const axios = require('axios');
// stuck on this part
const { Server } = require("socket.io");
// const io = new Server(server);

router.get('/', (req, res) => {
    res.render('chat');
});

module.exports = router;

