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

