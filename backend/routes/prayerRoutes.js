// const express = require("express");
// const OpenAI = require("openai");

// const router = express.Router();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // ✅ Helper function with retry logic
// async function generatePrayerWithRetry(prompt, retries = 1) {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: "You are a kind and reverent Christian prayer generator.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.85,
//     });

//     return completion.choices[0].message.content;
//   } catch (error) {
//     // ⏳ If rate limit error (429) and we have retries left
//     if (error.response?.status === 429 && retries > 0) {
//       console.warn("⚠️ Rate limit hit. Waiting 60 seconds before retry...");
//       await new Promise((resolve) => setTimeout(resolve, 60000)); // wait 1 minute
//       return generatePrayerWithRetry(prompt, retries - 1); // retry once
//     }

//     // ❌ Other errors
//     console.error("🔥 OpenAI Error:", error);
//     throw error;
//   }
// }

// router.post("/generate", async (req, res) => {
//   const { intention, situation, style, includeScripture } = req.body;

//   try {
//     const today = new Date();
//     const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });
//     const formattedDate = today.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//     const dayPrompts = {
//       Monday: "Ask for strength and renewal as a new week begins.",
//       Tuesday: "Pray for perseverance and trust in God’s plan.",
//       Wednesday: "Focus on wisdom and guidance midweek.",
//       Thursday: "Offer gratitude and intercession for others.",
//       Friday: "Reflect on forgiveness and peace through Christ’s love.",
//       Saturday: "Rest and reflect on God’s faithfulness.",
//       Sunday: "Celebrate worship, renewal, and unity in Christ.",
//     };

//     const extraContext = dayPrompts[dayOfWeek] || "";

//     const prompt = `
// You are a Christian prayer writer.
// Today is ${dayOfWeek}, ${formattedDate}.
// ${extraContext}

// Create a ${style} style prayer focused on "${intention}"${situation ? ` in the context of ${situation}` : ""}.
// Return both:

// 1. A short poetic prayer (4 lines)
// 2. A longer prose-style prayer
// ${includeScripture ? "Include one short relevant Bible verse at the end." : ""}

// The prayer should sound human, heartfelt, and faithful.
// `;

//     console.log("🕊️ Generating prayer with prompt...");
//     const output = await generatePrayerWithRetry(prompt);

//     res.json({ prayer: output });
//   } catch (error) {
//     console.error("❌ Prayer generation failed:", error.message);
//     res.status(500).json({
//       error: "Failed to generate prayer. Please try again later.",
//     });
//   }
// });

// module.exports = router;

// const express = require("express");
// const OpenAI = require("openai");

// const router = express.Router();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // ✅ Helper function with retry logic and better error clarity
// async function generatePrayerWithRetry(prompt, retries = 1) {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a kind and reverent Christian prayer generator." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.85,
//     });

//     return completion.choices[0].message.content;
//   } catch (error) {
//     // Handle rate limit or quota
//     if (error.status === 429 || error.code === "insufficient_quota") {
//       console.error("⚠️ OpenAI quota or rate limit reached.");
//       if (retries > 0) {
//         console.log("⏳ Retrying in 60 seconds...");
//         await new Promise((resolve) => setTimeout(resolve, 60000));
//         return generatePrayerWithRetry(prompt, retries - 1);
//       } else {
//         // Stop retrying
//         throw new Error("insufficient_quota");
//       }
//     }

//     console.error("🔥 OpenAI Error:", error.message);
//     throw error;
//   }
// }


// router.post("/generate", async (req, res) => {
//   const { intention, situation, style, includeScripture } = req.body;

//   try {
//     const today = new Date();
//     const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" });
//     const formattedDate = today.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//     const dayPrompts = {
//       Monday: "Ask for strength and renewal as a new week begins.",
//       Tuesday: "Pray for perseverance and trust in God’s plan.",
//       Wednesday: "Focus on wisdom and guidance midweek.",
//       Thursday: "Offer gratitude and intercession for others.",
//       Friday: "Reflect on forgiveness and peace through Christ’s love.",
//       Saturday: "Rest and reflect on God’s faithfulness.",
//       Sunday: "Celebrate worship, renewal, and unity in Christ.",
//     };

//     const extraContext = dayPrompts[dayOfWeek] || "";

//     const prompt = `
// You are a Christian prayer writer.
// Today is ${dayOfWeek}, ${formattedDate}.
// ${extraContext}

// Create a ${style} style prayer focused on "${intention}"${situation ? ` in the context of ${situation}` : ""}.
// Return both:

// 1. A short poetic prayer (4 lines)
// 2. A longer prose-style prayer
// ${includeScripture ? "Include one short relevant Bible verse at the end." : ""}

// The prayer should sound human, heartfelt, and faithful.
// `;

//     console.log("🕊️ Generating prayer with prompt...");
//     const output = await generatePrayerWithRetry(prompt);

//     res.json({ prayer: output });
//   } catch (error) {
//     if (error.message === "insufficient_quota") {
//       res.status(503).json({
//         error:
//           "Server out of OpenAI credits. Please try again later while we restore service.",
//       });
//     } else {
//       console.error("❌ Prayer generation failed:", error.message);
//       res.status(500).json({
//         error: "Failed to generate prayer. Please try again later.",
//       });
//     }
//   }
// });

// module.exports = router;


// backend/routes/prayerRoutes.js
const express = require("express");
const router = express.Router();
const openaiService = require("../services/openaiServices");

// Mock prayer templates for fallback
const prayerTemplates = {
  contemplative: [
    "In the quiet of this moment, I seek Your presence.",
    "Still my heart and mind to hear Your gentle whisper.",
    "Guide me to the depths where Your peace resides.",
    "In silence, may I find the answers my soul seeks.",
    "Wrap me in Your comfort and understanding.",
    "Lead me beside still waters, restore my soul.",
    "In Your light, may I find clarity and purpose.",
    "Quiet the storms within me with Your calming touch."
  ],
  intercessory: [
    "I lift up to You all those in need of Your grace.",
    "Surround them with Your healing light and love.",
    "Provide strength and comfort in their time of need.",
    "May Your peace guard their hearts and minds.",
    "Work through me to be a blessing to others.",
    "Comfort the grieving and strengthen the weak.",
    "Provide for those in lack and heal those in pain.",
    "Protect the vulnerable and guide the lost."
  ],
  petition: [
    "Humbly I come before You with my needs and concerns.",
    "Grant me wisdom to navigate this situation.",
    "Provide for my needs according to Your will.",
    "Strengthen my faith as I wait upon You.",
    "Help me to trust in Your perfect timing.",
    "Guide my decisions with Your divine wisdom.",
    "Supply all my needs from Your abundant riches.",
    "Protect me from harm and lead me in truth."
  ],
  thanksgiving: [
    "With a grateful heart, I thank You for Your blessings.",
    "Your faithfulness endures through every season.",
    "I praise You for the gift of this new day.",
    "Thank You for Your unending love and mercy.",
    "All good things come from Your generous hand.",
    "For life, love, and every breath I take, I give thanks.",
    "Your mercies are new every morning, great is Your faithfulness.",
    "I worship You for who You are, the giver of every good gift."
  ],
  reflective: [
    "Search my heart and reveal what needs Your touch.",
    "Help me to grow in wisdom and understanding.",
    "Transform my weaknesses into strengths.",
    "Guide me to live with purpose and meaning.",
    "May my life reflect Your love and grace.",
    "Create in me a clean heart, O God.",
    "Renew a right spirit within me each day.",
    "Shape me into the person You created me to be."
  ],
  gospel: [
    "As I meditate on Your Word, speak to my heart.",
    "Illumine the scriptures with Your truth.",
    "Help me to apply Your teachings to my life.",
    "May Your Word be a lamp unto my feet.",
    "Transform me through the power of Your gospel.",
    "Let Your words dwell in me richly each day.",
    "Open my eyes to see wonderful things in Your law.",
    "May the message of Christ dwell among us richly."
  ],
  worship: [
    "You are worthy of all praise and honor.",
    "I worship You for who You are, not just what You do.",
    "Your majesty fills the heavens and the earth.",
    "I bow before Your holiness and grace.",
    "All creation declares Your glory and power.",
    "Holy, holy, holy is the Lord God Almighty.",
    "Great are You, Lord, and most worthy of praise.",
    "Your greatness no one can fathom, Your love never fails."
  ]
};

const scriptureVerses = [
  "Philippians 4:6-7 - Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
  "Matthew 11:28 - Come to me, all you who are weary and burdened, and I will give you rest.",
  "Psalm 46:10 - Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
  "Jeremiah 29:12 - Then you will call on me and come and pray to me, and I will listen to you.",
  "1 Thessalonians 5:16-18 - Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
  "Psalm 34:17 - The righteous cry out, and the Lord hears them; he delivers them from all their troubles.",
  "Romans 8:26 - In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans.",
  "James 5:16 - Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.",
  "Psalm 145:18 - The Lord is near to all who call on him, to all who call on him in truth.",
  "Matthew 6:6 - But when you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father, who sees what is done in secret, will reward you.",
  "Mark 11:24 - Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.",
  "Psalm 17:6 - I call on you, my God, for you will answer me; turn your ear to me and hear my prayer.",
  "Ephesians 6:18 - And pray in the Spirit on all occasions with all kinds of prayers and requests. With this in mind, be alert and always keep on praying for all the Lord's people.",
  "Colossians 4:2 - Devote yourselves to prayer, being watchful and thankful.",
  "1 John 5:14 - This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us."
];

// GET /api/prayer/status - Check API status
router.get("/status", async (req, res) => {
  try {
    // Check if OpenAI is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({ 
      status: openaiConfigured ? "working" : "fallback", 
      message: openaiConfigured ? "AI Prayer Generation Available" : "Using Curated Prayer Templates",
      openai_configured: openaiConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Error checking prayer API status:", err);
    res.status(500).json({ message: "Error checking API status" });
  }
});

// POST /api/prayer/generate - Generate a prayer with OpenAI
router.post("/generate", async (req, res) => {
  try {
    const { intention, situation, style, emotion, length, includeScripture } = req.body;
    
    console.log("📝 Generating prayer request:", { 
      intention: intention.substring(0, 50) + (intention.length > 50 ? '...' : ''),
      style, 
      emotion, 
      length,
      includeScripture 
    });

    if (!intention || !style) {
      return res.status(400).json({ 
        error: "Prayer intention and style are required" 
      });
    }

    // Try OpenAI first if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("🤖 Attempting OpenAI prayer generation...");
        const prayerContent = await openaiService.generatePrayer(req.body);
        
        const prayerResponse = {
          prayer: `${prayerContent.poetic.join('\n')}\n\n${prayerContent.prose}${prayerContent.scripture ? '\n\n' + prayerContent.scripture : ''}`,
          source: "openai",
          timestamp: new Date().toISOString(),
          content: prayerContent // Include structured content
        };

        console.log("✅ AI Prayer generated successfully");
        return res.json(prayerResponse);

      } catch (openaiError) {
        console.error("❌ OpenAI generation failed:", openaiError.message);
        // Fall through to fallback generation
      }
    }

    // Use fallback prayer generation
    console.log("🔄 Using fallback prayer templates");
    return generateFallbackPrayer(req, res);

  } catch (err) {
    console.error("❌ Error generating prayer:", err);
    res.status(500).json({ 
      error: "Failed to generate prayer",
      message: err.message 
    });
  }
});

// Fallback prayer generation function
const generateFallbackPrayer = (req, res) => {
  const { intention, situation, style, emotion, length, includeScripture } = req.body;

  // Get template lines for the selected style
  const templateLines = prayerTemplates[style] || prayerTemplates.contemplative;
  
  // Select lines based on prayer length
  let lineCount;
  switch (length) {
    case 'short': lineCount = 3; break;
    case 'long': lineCount = 6; break;
    default: lineCount = 4; // medium
  }
  
  const selectedLines = templateLines.slice(0, lineCount);
  
  // Customize lines with intention and emotion
  const customizedLines = selectedLines.map(line => {
    let customized = line;
    
    // Add intention reference (50% chance)
    if (intention && Math.random() > 0.5) {
      const cleanIntention = intention.length > 30 ? intention.substring(0, 30) + '...' : intention;
      customized = customized.replace(/\.$/, ` for ${cleanIntention.toLowerCase()}.`);
    }
    
    // Add emotional tone
    if (emotion === 'peaceful') {
      customized = customized.replace(/\.$/, ' in perfect peace.');
    } else if (emotion === 'joyful') {
      customized = customized.replace(/\.$/, ' with joyful heart.');
    } else if (emotion === 'hopeful') {
      customized = customized.replace(/\.$/, ' with hopeful expectation.');
    } else if (emotion === 'humble') {
      customized = customized.replace(/\.$/, ' in humble submission.');
    } else if (emotion === 'strength') {
      customized = customized.replace(/\.$/, ' with renewed strength.');
    }
    
    return customized;
  });

  // Create poetic prayer (line breaks)
  const poeticPrayer = customizedLines;

  // Create prose prayer (paragraph)
  const situationText = situation ? ` In the situation of ${situation.toLowerCase()},` : '';
  const prosePrayer = `Heavenly Father,${situationText} ${customizedLines.join(' ')} Thank You for hearing this prayer offered in faith and trust. We pray all this in the precious name of Jesus. Amen.`;

  // Add scripture if requested
  const randomScripture = includeScripture 
    ? scriptureVerses[Math.floor(Math.random() * scriptureVerses.length)]
    : null;

  const prayerResponse = {
    prayer: `${poeticPrayer.join('\n')}\n\n${prosePrayer}${randomScripture ? '\n\n' + randomScripture : ''}`,
    source: "fallback",
    timestamp: new Date().toISOString(),
    content: {
      poetic: poeticPrayer,
      prose: prosePrayer,
      scripture: randomScripture
    }
  };

  console.log("✅ Fallback prayer generated successfully");
  res.json(prayerResponse);
};

// GET /api/prayer/user-prayers - Get user's saved prayers
router.get("/user-prayers", async (req, res) => {
  try {
    // Mock data - implement real user authentication and database later
    const mockPrayers = [
      {
        id: "1",
        intention: "Peace and guidance",
        style: "contemplative",
        poetic: [
          "In the quiet of this moment, I seek Your presence.",
          "Guide me to the depths where Your peace resides.",
          "Lead me beside still waters, restore my soul."
        ],
        prose: "Heavenly Father, in the quiet of this moment, I seek Your presence. Guide me to the depths where Your peace resides. Lead me beside still waters, restore my soul. Thank You for hearing this prayer offered in faith and trust. Amen.",
        scripture: "Psalm 46:10 - Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        source: "fallback"
      },
      {
        id: "2",
        intention: "Healing for a friend",
        style: "intercessory",
        poetic: [
          "I lift up to You all those in need of Your grace.",
          "Surround them with Your healing light and love.",
          "Provide strength and comfort in their time of need."
        ],
        prose: "Heavenly Father, I lift up to You all those in need of Your grace. Surround them with Your healing light and love. Provide strength and comfort in their time of need. Thank You for hearing this prayer offered in faith and trust. Amen.",
        scripture: "James 5:16 - Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        source: "fallback"
      }
    ];

    res.json({
      prayers: mockPrayers,
      total: mockPrayers.length,
      hasMore: false
    });
  } catch (err) {
    console.error("❌ Error fetching user prayers:", err);
    res.status(500).json({ message: "Error fetching user prayers" });
  }
});

// GET /api/prayer/user-stats - Get user prayer statistics
router.get("/user-stats", async (req, res) => {
  try {
    // Mock stats - implement real user stats later
    const mockStats = {
      totalPrayers: 12,
      prayersThisWeek: 3,
      streak: 5,
      favoriteStyle: "contemplative",
      mostCommonIntention: "peace and guidance",
      prayerTime: "morning",
      achievements: [
        "First Prayer",
        "Weekly Devotion",
        "Variety Seeker"
      ]
    };

    res.json(mockStats);
  } catch (err) {
    console.error("❌ Error fetching user stats:", err);
    res.status(500).json({ message: "Error fetching user stats" });
  }
});

// POST /api/prayer/save - Save a prayer
router.post("/save", async (req, res) => {
  try {
    const prayer = req.body;
    console.log("💾 Saving prayer:", { 
      id: prayer.id, 
      intention: prayer.formData?.intention?.substring(0, 30) + '...' 
    });
    
    // For now, just acknowledge the save - implement database storage later
    // In a real implementation, you would save to MongoDB
    
    res.json({ 
      message: "Prayer saved successfully",
      id: prayer.id,
      timestamp: new Date().toISOString(),
      saved: true
    });
  } catch (err) {
    console.error("❌ Error saving prayer:", err);
    res.status(500).json({ 
      message: "Error saving prayer",
      saved: false 
    });
  }
});

// POST /api/prayer/like - Like a prayer
router.post("/like", async (req, res) => {
  try {
    const { prayerId } = req.body;
    console.log("❤️ Liked prayer:", prayerId);
    
    res.json({ 
      message: "Prayer liked successfully",
      prayerId,
      liked: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Error liking prayer:", err);
    res.status(500).json({ 
      message: "Error liking prayer",
      liked: false 
    });
  }
});

// GET /api/prayer/templates - Get available prayer templates
router.get("/templates", async (req, res) => {
  try {
    const templates = Object.keys(prayerTemplates).map(style => ({
      value: style,
      label: style.charAt(0).toUpperCase() + style.slice(1),
      description: getStyleDescription(style),
      example: prayerTemplates[style][0],
      lines: prayerTemplates[style].length
    }));

    res.json({
      templates,
      totalStyles: templates.length,
      scriptureVerses: scriptureVerses.length
    });
  } catch (err) {
    console.error("❌ Error fetching templates:", err);
    res.status(500).json({ message: "Error fetching templates" });
  }
});

// Helper function for style descriptions
function getStyleDescription(style) {
  const descriptions = {
    contemplative: "Deep, reflective prayer for meditation and inner peace",
    intercessory: "Prayers for others and their needs",
    petition: "Personal requests and specific needs",
    thanksgiving: "Gratitude and praise for blessings",
    reflective: "Self-examination and spiritual growth",
    gospel: "Scripture-based meditation and reflection",
    worship: "Adoration and praise-focused prayer"
  };
  return descriptions[style] || "Christian prayer";
}

// GET /api/prayer/scriptures - Get available scripture verses
router.get("/scriptures", async (req, res) => {
  try {
    res.json({
      verses: scriptureVerses,
      total: scriptureVerses.length
    });
  } catch (err) {
    console.error("❌ Error fetching scriptures:", err);
    res.status(500).json({ message: "Error fetching scriptures" });
  }
});

// POST /api/prayer/feedback - Submit feedback about a prayer
router.post("/feedback", async (req, res) => {
  try {
    const { prayerId, rating, comments, helpful } = req.body;
    
    console.log("📝 Prayer feedback received:", {
      prayerId,
      rating,
      helpful,
      comments: comments ? comments.substring(0, 50) + '...' : 'No comments'
    });

    res.json({
      message: "Thank you for your feedback!",
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Error submitting feedback:", err);
    res.status(500).json({ message: "Error submitting feedback" });
  }
});

// GET /api/prayer/analytics - Get prayer analytics (admin only)
router.get("/analytics", async (req, res) => {
  try {
    // Mock analytics - implement real analytics later
    const analytics = {
      totalPrayersGenerated: 1567,
      mostPopularStyle: "contemplative",
      averagePrayerLength: "medium",
      scriptureUsage: 68, // percentage
      peakUsageTime: "09:00 AM",
      userSatisfaction: 4.5, // out of 5
      topIntentions: [
        "peace", "guidance", "healing", "strength", "thanks"
      ]
    };

    res.json(analytics);
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

module.exports = router;