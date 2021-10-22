const express = require('express');
const router = express.Router();
var db = require('../database/database')

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

/*
const User = database.define(
  'users',
  {
    nickname: {
      type: Sequelize.TEXT
    }
  },
  { timestamps: false }
);

User.readAll = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.send({ users });
  } catch (error) {
    return res.send(error);
  }
};

module.exports = User;
*/
module.exports = router;
