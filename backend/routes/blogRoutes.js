// //=== routes/blogRoutes.js ===
// const express = require("express");
// const router = express.Router();
// const Blog = require("../models/Blogs");

// // 🧭 GET /api/blogs?page=1&limit=6 — Fetch paginated blogs
// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 6;
//     const skip = (page - 1) * limit;

//     const total = await Blog.countDocuments();
//     const blogs = await Blog.find({})
//       .sort({ publishedDate: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({
//       blogs,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching blogs:", err);
//     res.status(500).json({ message: "Error fetching blogs" });
//   }
// });

// // 🧭 GET /api/blogs/:slug — Fetch single blog by slug
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const blog = await Blog.findOne({ slug: req.params.slug });
//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }
//     res.json(blog);
//   } catch (err) {
//     console.error("❌ Error fetching blog:", err);
//     res.status(500).json({ message: "Error fetching blog" });
//   }
// });

// // ✅ POST /api/blogs — Create new blog
// router.post("/", async (req, res) => {
//   console.log("📝 POST /api/blogs - Received request");
//   try {
//     const { title, author, category, blocks = [] } = req.body;

//     // Basic validation
//     if (!title || !author || !category) {
//       return res
//         .status(400)
//         .json({ message: "Title, author, and category are required" });
//     }

//     console.log("📝 Blog data:", {
//       title,
//       author,
//       category,
//       blocksCount: blocks.length,
//     });

//     // Process content blocks
//     const processedBlocks = blocks.map((block, index) => ({
//       title: block.title || "",
//       content: block.content || "",
//       imageUrl: block.imageUrl || "", // optional image link
//       order: index,
//     }));

//     // Create blog data
//     const blogData = {
//       title,
//       author,
//       category,
//       mainImageUrl: "https://placehold.co/400x250?text=No+Image",
//       blocks: processedBlocks,
//       publishedDate: new Date(),
//     };

//     // Save blog
//     const blog = new Blog(blogData);
//     const savedBlog = await blog.save();

//     console.log("✅ Blog saved successfully:", savedBlog._id);

//     res.status(201).json({
//       message: "Blog created successfully",
//       blog: savedBlog,
//     });
//   } catch (error) {
//     console.error("❌ Error saving blog:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to save blog", details: error.message });
//   }
// });

// // 🧰 DEBUG: GET /api/blogs/debug/all — View all blogs (no pagination)
// router.get("/debug/all", async (req, res) => {
//   try {
//     const allBlogs = await Blog.find({}).sort({ publishedDate: -1 });
//     res.json({
//       totalCount: allBlogs.length,
//       blogs: allBlogs.map((blog) => ({
//         id: blog._id,
//         title: blog.title,
//         author: blog.author,
//         category: blog.category,
//         publishedDate: blog.publishedDate,
//         slug: blog.slug,
//         hasMainImage: !!blog.mainImageUrl,
//         blocksCount: blog.blocks ? blog.blocks.length : 0,
//       })),
//     });
//   } catch (err) {
//     console.error("❌ Error fetching debug blogs:", err);
//     res.status(500).json({ message: "Error fetching debug info" });
//   }
// });

// module.exports = router;

//=== routes/blogRoutes.js ===
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Blog = require("../models/Blogs");
const { uploadToAzure } = require("../utils/azureUpload");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// 🧭 GET /api/blogs?page=1&limit=6 — Fetch paginated blogs
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await Blog.countDocuments();
    const blogs = await Blog.find({})
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("❌ Error fetching blogs:", err);
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

// 🧭 GET /api/blogs/:slug — Fetch single blog by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (err) {
    console.error("❌ Error fetching blog:", err);
    res.status(500).json({ message: "Error fetching blog" });
  }
});

// ✅ POST /api/blogs — Create new blog WITH Multer
router.post("/", upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "blockImages", maxCount: 10 }
]), async (req, res) => {
  console.log("📝 POST /api/blogs - Received request");
  console.log("📦 Request body:", req.body);
  console.log("📁 Request files:", req.files);

  try {
    const { title, author, category, excerpt, blocks = [] } = req.body;

    // Basic validation
    if (!title || !author || !category) {
      return res
        .status(400)
        .json({ message: "Title, author, and category are required" });
    }

    console.log("📝 Blog data:", {
      title,
      author,
      category,
      excerpt,
      blocksCount: blocks.length,
    });

    // ✅ Handle main image upload
    let mainImageUrl = "https://placehold.co/400x250?text=No+Image";
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      const file = req.files.mainImage[0];
      console.log("📸 Uploading main image:", file.originalname);
      mainImageUrl = await uploadToAzure(file, file.originalname);
      console.log("✅ Main image uploaded:", mainImageUrl);
    }

    // ✅ Process content blocks with image uploads
    let processedBlocks = [];
    
    if (blocks && blocks.length > 0) {
      // Parse blocks if it's a string (from FormData)
      const blocksArray = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;
      
      processedBlocks = await Promise.all(
        blocksArray.map(async (block, index) => {
          let imageUrl = block.imageUrl || "";

          // Upload block image if provided
          if (req.files && req.files.blockImages && req.files.blockImages[index]) {
            const imgFile = req.files.blockImages[index];
            console.log(`📸 Uploading block ${index} image:`, imgFile.originalname);
            imageUrl = await uploadToAzure(imgFile, imgFile.originalname);
            console.log(`✅ Block ${index} image uploaded:`, imageUrl);
          }

          return {
            title: block.title || "",
            content: block.content || "",
            imageUrl: imageUrl,
            order: index,
          };
        })
      );
    }

    // ✅ Auto-generate excerpt if empty
    const finalExcerpt = excerpt?.trim() || 
      (processedBlocks.length > 0 && processedBlocks[0].content 
        ? processedBlocks[0].content.slice(0, 120) + "..." 
        : "No summary available");

    // Create blog data
    const blogData = {
      title,
      author,
      category,
      excerpt: finalExcerpt,
      mainImageUrl,
      blocks: processedBlocks,
      publishedDate: new Date(),
    };

    console.log("💾 Saving blog data:", blogData);

    // Save blog
    const blog = new Blog(blogData);
    const savedBlog = await blog.save();

    console.log("✅ Blog saved successfully:", savedBlog._id);

    res.status(201).json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    console.error("❌ Error saving blog:", error);
    res
      .status(500)
      .json({ error: "Failed to save blog", details: error.message });
  }
});

// 🧰 DEBUG: GET /api/blogs/debug/all — View all blogs (no pagination)
router.get("/debug/all", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ publishedDate: -1 });
    res.json({
      totalCount: allBlogs.length,
      blogs: allBlogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        author: blog.author,
        category: blog.category,
        excerpt: blog.excerpt,
        publishedDate: blog.publishedDate,
        slug: blog.slug,
        hasMainImage: !!blog.mainImageUrl,
        blocksCount: blog.blocks ? blog.blocks.length : 0,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching debug blogs:", err);
    res.status(500).json({ message: "Error fetching debug info" });
  }
});

module.exports = router;

