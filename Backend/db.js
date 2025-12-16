/*
*********************************************************************************************************
 *  @File Name     : db.js
 *  @Author        : Kashika Saxena (kashika.saxena@antrazal.com)
 *  @Company       : Antrazal
 *  @Date          : 16-12-2025
 *  @Description   : Database connection configuration
 *********************************************************************************************************
*/

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kashika23@",
  database: "healthsure"
});

db.connect(err => {
  if (err) {
    console.error("MySQL error:", err);
    return;
  }
  console.log("MySQL Connected");
});

module.exports = db;

