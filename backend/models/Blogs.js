// const mongoose = require("mongoose");

// const blockSchema = new mongoose.Schema({
//   title: { type: String, default: "" },
//   content: { type: String, default: "" },
//   imageUrl: { type: String, default: "" },
//   order: { type: Number, default: 0 },
// });

// const blogSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   author: { type: String, required: true },
//   category: { type: String, required: true },
//   excerpt: { type: String, default: "" },
//   mainImageUrl: { type: String, default: "" },
//   blocks: [blockSchema],
//   publishedDate: { type: Date, default: Date.now },
//   slug: { type: String, unique: true, sparse: true, unique: true  } // Add this to make the index sparse},
// });

// // 🔤 Generate slug before saving (for pretty URLs)
// blogSchema.pre("save", function (next) {
//   if (this.title) {
//     this.slug = this.title
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9 ]/g, "") // remove non-alphanumeric
//       .replace(/\s+/g, "-") // replace spaces with hyphens
//       .substring(0, 50); // limit length
//   }
//   next();
// });

// module.exports = mongoose.model("Blog", blogSchema);

const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  author: String,
  category: String,
  excerpt: String,
  mainImageUrl: String,
  blocks: [
    {
      title: String,
      content: String,
      imageUrl: String,
      order: Number,
    },
  ],
  publishedDate: { type: Date, default: Date.now },
});

// ✅ Auto-generate unique slug before saving
blogSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  // 🔁 Check for duplicates in MongoDB
  while (await mongoose.models.Blog.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
