const Post = require("../models/Post");

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Please provide content" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = {
            content,
            user: req.userId,
            createdAt: new Date(),
        };

        post.comments.push(comment);

        await post.save();

        res.status(201).json({ message: "Comment added succesfully", comment });
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment", message: error.message });
    }
};

const deleteComments = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this comment" });
        }

        post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
        await post.save();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete comment", message: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId).populate("comments.user", "username email");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json(post.comments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments", message: error.message });
    }
};

module.exports = {
    addComment,
    deleteComments,
    getComments,
};
