/*
*********************************************************************************************************
 *  @File Name     : server.js
 *  @Author        : Kashika Saxena (kashika.saxena@antrazal.com)
 *  @Company       : Antrazal
 *  @Date          : 16-12-2025
 *  @Description   : Express server setup and API initialization
 *********************************************************************************************************
*/

const express = require("express");
const cors = require("cors");

const patientRoutes = require("./routes/patients");
const policyRoutes = require("./routes/policies");

const app = express();

/* ================= MIDDLEWARE ================= */

// enable CORS
app.use(cors());

// IMPORTANT: enables req.body (JSON)
app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/patients", patientRoutes);
app.use("/api/policies", policyRoutes);

/* ================= SERVER ================= */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

