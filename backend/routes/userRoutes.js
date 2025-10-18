// routes/userRoutes.js
const express = require("express");
const router = express.Router();

// GET /api/user/stats
router.get("/stats", async (req, res) => {
  try {
    // Mock user stats - replace with actual user data
    res.json({
      prayersCreated: 12,
      bibleStudies: 5,
      communityPosts: 3,
      streak: 7
    });
  } catch (err) {
    console.error("❌ Error fetching user stats:", err);
    res.status(500).json({ message: "Error fetching user stats" });
  }
});

// GET /api/user/notifications
router.get("/notifications", async (req, res) => {
  try {
    // Mock notifications - replace with actual notifications
    res.json({
      notifications: [
        {
          id: 1,
          title: "Welcome to Faithful Journey",
          message: "Start your spiritual journey today",
          read: false,
          createdAt: new Date()
        }
      ]
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

module.exports = router;