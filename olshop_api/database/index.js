const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'maulana',
  password: 'M4ur1n156!',
  database: 'db_olshop',
  port: 3306,
  multipleStatements: true,
});

module.exports = db;
