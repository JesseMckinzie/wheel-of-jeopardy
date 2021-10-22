var mysql = require('mysql');
var connect = mysql.createConnection({
    host: 3306,
    user: 'root',
    password: 'password',
    database: 'applications',
})

connect.connect((err)=> {
    if (err) throw err;
    console.log('Database is connected successfully.');
})

module.exports = connect;


/*
const Sequelize = require('sequelize');

db_url = 'postgres://postgrs:password@127.0.0.1:5432/src';

database = new Sequelize(db_url);

module.exports = database;
*/