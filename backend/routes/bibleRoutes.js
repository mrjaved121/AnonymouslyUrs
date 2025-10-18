// backend/routes/bibleRoutes.js
const express = require("express");
const router = express.Router();

// Example placeholder route — replace with your real logic later
router.get("/", (req, res) => {
  res.json({
    message: "Bible routes are working properly!",
  });
});

module.exports = router;
