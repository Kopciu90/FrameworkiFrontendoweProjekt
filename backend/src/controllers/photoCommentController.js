const Photo = require("../models/Photo");

const addComment = async (req, res) => {
    try {
        const { photoId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Please provide content" });
        }

        const photo = await Photo.findById(photoId);

        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }

        const comment = {
            content,
            user: req.userId,
            createdAt: new Date(),
        };

        photo.comments.push(comment);

        await photo.save();

        res.status(201).json({ message: "Comment added succesfully", comment });
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment", message: error.message });
    }
};

const deleteComments = async (req, res) => {
    try {
        const { photoId, commentId } = req.params;
        const photo = await Photo.findById(photoId);

        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }

        const comment = photo.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this comment" });
        }

        photo.comments = photo.comments.filter((c) => c._id.toString() !== commentId);
        await photo.save();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete comment", message: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { photoId } = req.params;

        const photo = await Photo.findById(photoId).populate("comments.user", "username email");
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }

        res.status(200).json(photo.comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments", message: error.message });
    }
};

module.exports = {
    addComment,
    deleteComments,
    getComments,
};
