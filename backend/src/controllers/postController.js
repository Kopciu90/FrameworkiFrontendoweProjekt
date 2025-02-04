const Article = require("../models/Post");

const postArticle = async (req, res) => {
    try {
        const { headline, body } = req.body;
        const article = await Article.create({
            headline,
            body,
            author: req.userId,
        });
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ error: "Could not create article", message: error.message });
    }
};

const fetchAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate("author", "username email").populate("comments.author", "username email");
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
};

const fetchUserArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.params.userId }).populate("author", "username email");
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
};

const removeArticle = async (req, res) => {
    try {
        console.log("Authenticated User ID:", req.userId);
        console.log("Article ID to delete:", req.params.id);

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        console.log("Article Owner ID:", article.author.toString());

        if (article.author.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this article" });
        }

        await Article.deleteOne({ _id: article._id });
        res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ error: "Failed to delete article", message: error.message });
    }
};

module.exports = {
    postArticle,
    fetchAllArticles,
    fetchUserArticles,
    removeArticle,
};
