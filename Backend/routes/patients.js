const express = require("express");
const db = require("../db");

const router = express.Router();

/* ================= CREATE PATIENT ================= */
router.post("/", (req, res) => {
  const { firstName, lastName, email, phone, city } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !phone || !city) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check duplicate phone
  db.query(
    "SELECT id FROM patients WHERE phone = ?",
    [phone],
    (err, results) => {
      if (err) {
        console.error("Select error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Patient already exists" });
      }

      // Insert patient
      db.query(
        `INSERT INTO patients
         (first_name, last_name, email, phone, city)
         VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phone, city],
        (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ message: "Insert failed" });
          }

          res.json({
            message: "Patient created successfully",
            patientId: result.insertId
          });
        }
      );
    }
  );
});

/* ================= SEARCH PATIENT ================= */
router.get("/search", (req, res) => {
  const term = `%${req.query.q || ""}%`;

  db.query(
    `SELECT *
     FROM patients
     WHERE first_name LIKE ?
        OR last_name LIKE ?
        OR phone LIKE ?
        OR email LIKE ?
        OR city LIKE ?
     ORDER BY id DESC`,
    [term, term, term, term, term],
    (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ message: "Search failed" });
      }
      res.json(results);
    }
  );
});

/* ================= GET ALL PATIENTS ================= */
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM patients ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error("Fetch error:", err);
        return res.status(500).json({ message: "Fetch failed" });
      }
      res.json(results);
    }
  );
});

module.exports = router;



