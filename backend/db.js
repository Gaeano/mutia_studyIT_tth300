const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',               
  password: '',               
  database: 'study_planner_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;