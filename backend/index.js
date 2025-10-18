// // === app.js ===
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// require("dotenv").config();

// // === ROUTES ===
// const authRoutes = require("./routes/authRoutes");
// const blogRoutes = require("./routes/blogRoutes");
// //====PrayerRoutes=====
// const prayerRoutes = require("./routes/prayerRoutes.js");



// const app = express();

// // === MIDDLEWARE ===
// app.use(express.json({ limit: "10mb" }));
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//   })
// );

// // === CONNECT TO AZURE COSMOS DB (MONGO API) ===
// mongoose
//   .connect(process.env.MONGO_URI, {
//     dbName: process.env.DB_NAME, // ✅ picks up 'anonymouslyurs'
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to Azure CosmosDB (blogDB)"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // === ROUTES ===
// app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);

// // Prayer Routes
// app.use("/api/prayer", prayerRoutes);
// // === TEST ROUTE ===
// app.get("/api/test", (req, res) => {
//   res.json({ message: "Backend running fine 🚀" });
// });

// // === FALLBACK ROUTE ===
// app.use("*", (req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // === START SERVER ===
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// === app.js ===
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();

// === ROUTES ===
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const prayerRoutes = require("./routes/prayerRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const bibleRoutes = require("./routes/bibleRoutes");
const communityRoutes = require("./routes/communityRoutes");

// === APP INITIALIZATION ===
const app = express();

// === MIDDLEWARE ===
app.use(express.json({ limit: "10mb" }));
const defaultFrontendUrl = "https://anonymouslyurssb.z13.web.core.windows.net";
const allowedOrigins = [
  process.env.CLIENT_URL,
  defaultFrontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// === DATABASE CONNECTION ===
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("✅ Connected to Azure CosmosDB (Mongo API)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === REGISTER ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bible", bibleRoutes);
app.use("/api/community", communityRoutes);

// === TEMPORARY / MOCK ENDPOINTS ===
// These provide dummy data until real implementations are added

// --- USER ---
app.get("/api/user/stats", (req, res) => {
  res.json({
    prayersCreated: 12,
    bibleStudies: 5,
    communityPosts: 3,
    streak: 7,
  });
});

app.get("/api/user/notifications", (req, res) => {
  res.json({
    notifications: [
      {
        id: 1,
        title: "Welcome to Faithful Journey",
        message: "Start your spiritual journey today",
        read: false,
        createdAt: new Date(),
      },
    ],
  });
});

// --- ANALYTICS ---
app.get("/api/analytics/footer-stats", (req, res) => {
  res.json({
    totalUsers: 1247,
    totalPrayers: 8563,
    activeToday: 342,
    communities: 28,
  });
});

app.post("/api/analytics/page-views", (req, res) => {
  res.json({ message: "📊 Page view tracked successfully" });
});

app.post("/api/analytics/interactions", (req, res) => {
  res.json({ message: "📈 Interaction tracked successfully" });
});

// --- BIBLE ---
app.get("/api/bible/books", (req, res) => {
  res.json({
    books: [
      { id: "gen", name: "Genesis" },
      { id: "exo", name: "Exodus" },
      { id: "mat", name: "Matthew" },
      { id: "mrk", name: "Mark" },
      { id: "luk", name: "Luke" },
      { id: "jhn", name: "John" },
    ],
  });
});

app.get("/api/bible/books/:book/chapters", (req, res) => {
  const chapters = Array.from({ length: 50 }, (_, i) => i + 1);
  res.json({ chapters });
});

app.get("/api/bible/books/:book/chapters/:chapter", (req, res) => {
  res.json({
    book: req.params.book,
    chapter: req.params.chapter,
    verses: [
      {
        verse: 1,
        text: "This is a sample verse text for demonstration purposes.",
      },
      {
        verse: 2,
        text: "Another sample verse to show how the Bible reader works.",
      },
    ],
  });
});

// --- COMMUNITY ---
app.get("/api/community/posts", (req, res) => {
  res.json({
    posts: [
      {
        id: 1,
        title: "Welcome to our community!",
        content: "This is a sample community post.",
        author: "Anonymous",
        createdAt: new Date(),
        likes: 5,
      },
    ],
  });
});

// --- ASK ANYTHING ---
app.post("/api/ask-anything", (req, res) => {
  const { question } = req.body;
  res.json({
    answer: `Sample AI response to your question: "${question}".`,
    scripture: "John 3:16 - For God so loved the world...",
  });
});

// --- LIFE COACH ---
app.post("/api/life-coach", (req, res) => {
  const { question } = req.body;
  res.json({
    advice: `For "${question}", here is wisdom: Trust in the Lord with all your heart.`,
    verse: "Proverbs 3:5-6",
  });
});

// === SYSTEM HEALTH & TEST ENDPOINTS ===
app.get("/api/test", (req, res) => {
  res.json({ message: "🚀 Backend running fine!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// === FALLBACK ROUTE ===
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// === DEBUG MIDDLEWARE ===
app.use("/api/blogs", (req, res, next) => {
  if (req.method === "POST") {
    console.log("=== BLOG POST REQUEST DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files keys:", req.files ? Object.keys(req.files) : "No files");
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        console.log(`File ${key}:`, req.files[key].map(f => f.originalname));
      });
    }
    console.log("=== END DEBUG ===");
  }
  next();
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
