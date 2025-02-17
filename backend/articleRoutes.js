const express = require("express");
const router = express.Router();
const Article = require("./models/Article");

// Get all articles
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new article
router.post("/", async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get article by ID
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;    