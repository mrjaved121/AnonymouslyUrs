// controllers/blogPostController.js
// controllers/blogPostController.js
// const { uploadToAzure } = require("../utils/azureUpload");
// const { CosmosClient } = require("@azure/cosmos");

// const endpoint = process.env.COSMOS_ENDPOINT;
// const key = process.env.COSMOS_KEY;
// const databaseId = process.env.COSMOS_DATABASE;
// const containerId = process.env.COSMOS_CONTAINER;

// if (!endpoint || !key || !databaseId || !containerId) {
//   console.warn("⚠️ Missing Cosmos DB ENV vars. Set COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE, COSMOS_CONTAINER");
// }

// const cosmosClient = new CosmosClient({ endpoint, key });
// const container = cosmosClient.database(databaseId).container(containerId);

// const createBlog = async (req, res) => {
//   console.log("📝 POST /api/blogs - Received request");
//   console.log("📁 req.files keys:", Object.keys(req.files || {}));
//   try {
//     const { title, author, category, excerpt, blocks } = req.body;

//     if (!title || !author || !category) {
//       return res.status(400).json({ message: "Title, author, and category are required" });
//     }

//     // Parse blocks (may be JSON string)
//     let parsedBlocks = [];
//     if (blocks) {
//       parsedBlocks = typeof blocks === "string" ? JSON.parse(blocks) : blocks;
//       if (!Array.isArray(parsedBlocks)) parsedBlocks = [];
//     }

//     // Upload main image if present (multer placed under req.files.mainImage[0])
//     let mainImageUrl = "https://placehold.co/400x250?text=No+Image";
//     if (req.files && req.files.mainImage && req.files.mainImage[0]) {
//       const file = req.files.mainImage[0];
//       mainImageUrl = await uploadToAzure(file, file.originalname);
//       console.log("✅ Main image uploaded:", mainImageUrl);
//     }

//     // Upload block images. We expect the client to append block images in same order as blocks.
//     const uploadedBlockImages = {}; // index -> url
//     if (req.files && req.files.blockImages && req.files.blockImages.length > 0) {
//       // If more images than blocks, we still map in order
//       for (let i = 0; i < req.files.blockImages.length; i++) {
//         const f = req.files.blockImages[i];
//         if (!f) continue;
//         const url = await uploadToAzure(f, f.originalname);
//         uploadedBlockImages[i] = url;
//         console.log(`✅ Uploaded block image ${i}: ${url}`);
//       }
//     }

//     // Merge uploaded URLs into blocks
//     const processedBlocks = parsedBlocks.map((b, idx) => ({
//       title: b.title || "",
//       content: b.content || "",
//       imageUrl: uploadedBlockImages[idx] || b.imageUrl || "",
//       order: idx,
//     }));

//     // Generate excerpt fallback
//     const finalExcerpt = (excerpt && excerpt.trim()) || (processedBlocks[0] && processedBlocks[0].content
//       ? processedBlocks[0].content.slice(0, 120) + "..."
//       : "No summary available");

//     // Create document for Cosmos
//     const blogDoc = {
//       id: require("uuid").v4(),
//       title,
//       author,
//       category,
//       excerpt: finalExcerpt,
//       mainImageUrl,
//       blocks: processedBlocks,
//       publishedDate: new Date().toISOString(),
//     };

//     // Persist to Cosmos DB
//     const { resource: created } = await container.items.create(blogDoc);

//     console.log("💾 Saved blog in Cosmos:", created.id);
//     res.status(201).json({ message: "Blog created successfully", blog: created });
//   } catch (err) {
//     console.error("❌ createBlog error:", (err && err.message) || err);
//     res.status(500).json({ error: "Failed to create blog", details: err.message || err });
//   }
// };

// module.exports = { createBlog };



// controllers/blogPostController.js
const { uploadToAzure } = require("../utils/azureUpload");
const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require("uuid");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;
const containerId = process.env.COSMOS_CONTAINER;

if (!endpoint || !key || !databaseId || !containerId) {
  console.warn("⚠️ Missing Cosmos DB ENV vars. Set COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE, COSMOS_CONTAINER");
}

const cosmosClient = new CosmosClient({ endpoint, key });
const container = cosmosClient.database(databaseId).container(containerId);

const createBlog = async (req, res) => {
  console.log("📝 POST /api/blogs - Received request");

  try {
    const { title, author, category, excerpt, blocks } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ message: "Title, author, and category are required" });
    }

    // Parse blocks safely
    let parsedBlocks = [];
    if (blocks) {
      parsedBlocks = typeof blocks === "string" ? JSON.parse(blocks) : blocks;
      if (!Array.isArray(parsedBlocks)) parsedBlocks = [];
    }

    // ✅ Upload main image
    let mainImageUrl = "https://placehold.co/400x250?text=No+Image";
    if (req.files?.mainImage?.[0]) {
      mainImageUrl = await uploadToAzure(req.files.mainImage[0]);
    }

    // ✅ Upload block images
    const uploadedBlockImages = {};
    if (req.files?.blockImages?.length > 0) {
      for (let i = 0; i < req.files.blockImages.length; i++) {
        const imgFile = req.files.blockImages[i];
        if (imgFile) {
          const url = await uploadToAzure(imgFile);
          uploadedBlockImages[i] = url;
        }
      }
    }

    // ✅ Combine block data
    const processedBlocks = parsedBlocks.map((b, idx) => ({
      title: b.title || "",
      content: b.content || "",
      imageUrl: uploadedBlockImages[idx] || b.imageUrl || "",
      order: idx,
    }));

    // ✅ Excerpt fallback
    const finalExcerpt =
      excerpt?.trim() ||
      (processedBlocks[0]?.content
        ? processedBlocks[0].content.slice(0, 120) + "..."
        : "No summary available");

    // ✅ Create blog document
    const blogDoc = {
      id: uuidv4(),
      title,
      author,
      category,
      excerpt: finalExcerpt,
      mainImageUrl,
      blocks: processedBlocks,
      publishedDate: new Date().toISOString(),
    };

    const { resource: created } = await container.items.create(blogDoc);

    console.log("💾 Blog saved in Cosmos DB:", created.id);
    res.status(201).json({ message: "Blog created successfully", blog: created });
  } catch (err) {
    console.error("❌ Error creating blog:", err);
    res.status(500).json({ error: "Failed to create blog", details: err.message });
  }
};

module.exports = { createBlog };
