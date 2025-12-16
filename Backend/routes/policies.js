const express = require("express");
const db = require("../db");

const router = express.Router();

/* ================= CREATE POLICY ================= */
router.post("/", (req, res) => {
  const { patientId, plan, sumInsured, startDate, endDate } = req.body;

  if (!patientId || !plan || !sumInsured || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    `INSERT INTO policies
     (patient_id, plan, sum_insured, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
    [patientId, plan, sumInsured, startDate, endDate],
    err => {
      if (err) {
        console.error("Create policy error:", err);
        return res.status(500).json({ message: "Policy creation failed" });
      }
      res.json({ message: "Policy issued successfully" });
    }
  );
});

/* ================= CANCEL POLICY ================= */
router.put("/:id/cancel", (req, res) => {
  const policyId = req.params.id;
  const reason = req.body.reason || "Cancelled by user";

  db.query(
    `UPDATE policies
     SET status = 'CANCELLED'
     WHERE id = ? AND status = 'ACTIVE'`,
    [policyId],
    (err, result) => {
      if (err) {
        console.error("Cancel error:", err);
        return res.status(500).json({ message: "Cancel failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "Only ACTIVE policies can be cancelled"
        });
      }

      res.json({ message: "Policy cancelled successfully" });
    }
  );
});

/* ================= RENEW POLICY ================= */
router.put("/:id/renew", (req, res) => {
  const policyId = req.params.id;

  const newStart = new Date();
  const newEnd = new Date();
  newEnd.setFullYear(newEnd.getFullYear() + 1);

  db.query(
    `UPDATE policies
     SET start_date = ?, end_date = ?, status = 'ACTIVE'
     WHERE id = ?
       AND status != 'CANCELLED'`,
    [newStart, newEnd, policyId],
    (err, result) => {
      if (err) {
        console.error("Renew error:", err);
        return res.status(500).json({ message: "Renew failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "Cancelled policies cannot be renewed"
        });
      }

      res.json({ message: "Policy renewed successfully" });
    }
  );
});

/* ================= GET POLICIES BY PATIENT ================= */
router.get("/patient/:patientId", (req, res) => {
  const patientId = req.params.patientId;

  db.query(
    `SELECT
       id,
       patient_id,
       plan,
       sum_insured,
       start_date,
       end_date,
       status
     FROM policies
     WHERE patient_id = ?
     ORDER BY end_date DESC`,
    [patientId],
    (err, results) => {
      if (err) {
        console.error("Fetch policies error:", err);
        return res.status(500).json({
          message: "Failed to fetch policies"
        });
      }
      res.json(results);
    }
  );
});

/* ================= DASHBOARD STATS ================= */
router.get("/stats", (req, res) => {
  const stats = {};

  db.query(
    `SELECT COUNT(*) AS count
     FROM policies
     WHERE status = 'ACTIVE'`,
    (err, r1) => {
      if (err) return res.status(500).json({ message: "Stats error" });
      stats.active = r1[0].count;

      db.query(
        `SELECT COUNT(*) AS count
         FROM policies
         WHERE status = 'CANCELLED'`,
        (err, r2) => {
          if (err) return res.status(500).json({ message: "Stats error" });
          stats.cancelled = r2[0].count;

          db.query(
            `SELECT COUNT(*) AS count
             FROM policies
             WHERE end_date < CURDATE()
               AND status != 'CANCELLED'`,
            (err, r3) => {
              if (err) return res.status(500).json({ message: "Stats error" });
              stats.expired = r3[0].count;

              db.query(
                `SELECT COUNT(*) AS count
                 FROM policies
                 WHERE end_date BETWEEN CURDATE()
                 AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                   AND status = 'ACTIVE'`,
                (err, r4) => {
                  if (err) return res.status(500).json({ message: "Stats error" });
                  stats.expiringSoon = r4[0].count;

                  res.json(stats);
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;





