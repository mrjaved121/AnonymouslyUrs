const Blog = require("../models/Blogs");

// 📄 GET /api/blogs?page=1&limit=6 — Fetch paginated blogs
const getBlogs = async (req, res) => {
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
};

// 📄 GET /api/blogs/slug/:slug — Fetch single blog by slug
const getBlogBySlug = async (req, res) => {
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
};

module.exports = { getBlogs, getBlogBySlug };
