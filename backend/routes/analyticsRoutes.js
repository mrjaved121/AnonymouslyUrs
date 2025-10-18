// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();

// POST /api/analytics/page-views
router.post("/page-views", async (req, res) => {
  try {
    const { page, userId } = req.body;
    console.log(`📊 Page view tracked: ${page} by user: ${userId || 'anonymous'}`);
    
    res.json({ message: "Page view tracked successfully" });
  } catch (err) {
    console.error("❌ Error tracking page view:", err);
    res.status(500).json({ message: "Error tracking page view" });
  }
});

// POST /api/analytics/interactions
router.post("/interactions", async (req, res) => {
  try {
    const { type, element, userId } = req.body;
    console.log(`📊 Interaction tracked: ${type} on ${element} by user: ${userId || 'anonymous'}`);
    
    res.json({ message: "Interaction tracked successfully" });
  } catch (err) {
    console.error("❌ Error tracking interaction:", err);
    res.status(500).json({ message: "Error tracking interaction" });
  }
});

// GET /api/analytics/footer-stats
router.get("/footer-stats", async (req, res) => {
  try {
    // Mock analytics data - replace with actual analytics
    res.json({
      totalUsers: 1247,
      totalPrayers: 8563,
      activeToday: 342,
      communities: 28
    });
  } catch (err) {
    console.error("❌ Error fetching footer stats:", err);
    res.status(500).json({ message: "Error fetching footer stats" });
  }
});

module.exports = router;