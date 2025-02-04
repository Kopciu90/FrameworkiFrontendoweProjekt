const Article = require("../models/Post");

const postComment = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Please provide comment text" });
        }

        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        const newComment = {
            content: text,
            user: req.userId,
            createdAt: new Date(),
        };

        article.comments.push(newComment);

        await article.save();

        res.status(201).json({ message: "Comment added successfully", newComment });
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment", message: error.message });
    }
};

const removeComment = async (req, res) => {
    try {
        const { articleId, commentId } = req.params;
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        const commentToDelete = article.comments.id(commentId);

        if (!commentToDelete) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (commentToDelete.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to remove this comment" });
        }

        article.comments = article.comments.filter((c) => c._id.toString() !== commentId);
        await article.save();

        res.status(200).json({ message: "Comment removed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove comment", message: error.message });
    }
};

const fetchComments = async (req, res) => {
    try {
        const { articleId } = req.params;

        const article = await Article.findById(articleId).populate("comments.user", "username email");
        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.status(200).json(article.comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve comments", message: error.message });
    }
};

module.exports = {
    postComment,
    removeComment,
    fetchComments,
};
