const Image = require("../models/Photo");

const postComment = async (req, res) => {
    try {
        const { imageId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Please provide comment content" });
        }

        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        const newComment = {
            text,
            author: req.userId,
            timestamp: new Date(),
        };

        image.comments.push(newComment);
        await image.save();

        res.status(201).json({ message: "Comment added successfully", newComment });
    } catch (error) {
        res.status(500).json({ error: "Could not add comment", message: error.message });
    }
};

const removeComment = async (req, res) => {
    try {
        const { imageId, commentId } = req.params;
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        const comment = image.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.author.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this comment" });
        }

        image.comments = image.comments.filter((c) => c._id.toString() !== commentId);
        await image.save();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Could not delete comment", message: error.message });
    }
};

const fetchComments = async (req, res) => {
    try {
        const { imageId } = req.params;

        const image = await Image.findById(imageId).populate("comments.author", "username email");
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        res.status(200).json(image.comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments", message: error.message });
    }
};

module.exports = {
    postComment,
    removeComment,
    fetchComments,
};
