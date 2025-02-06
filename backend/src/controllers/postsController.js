const Post = require("../models/Post");

const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.create({
            title,
            content,
            user: req.userId,
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: "Failed to create post", message: error.message });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "username email").populate("comments.user", "username email");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

const getPostsByUser = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId }).populate("user", "username email");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }

        await Post.deleteOne({ _id: post._id });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error); // Log the error
        res.status(500).json({ error: "Failed to delete post", message: error.message });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostsByUser,
    deletePost,
};
