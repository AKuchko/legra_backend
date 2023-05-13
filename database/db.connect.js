const dbConfig  = require('./db.config')
const mysql     = require('mysql2')
const util      = require("util"); 

const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DATABASE
})

connection.query = util.promisify(connection.query).bind(connection);

connection.connect(err => {
    if (err) console.error(err);
})

module.exports = connection