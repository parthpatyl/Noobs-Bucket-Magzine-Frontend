const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    title: String,
    category: String,
    image: String,
    excerpt: String,
    readTime: String,
    date: { type: Date, default: Date.now },
    author: String,
    tags: [String],
    content: String
});

module.exports = mongoose.model("Article", ArticleSchema);