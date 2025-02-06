const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost, getAllPosts, getPostsByUser, deletePost } = require("../controllers/postsController");
const { addComment, deleteComments, getComments } = require("../controllers/postCommentController");

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", authMiddleware, createPost);
router.delete("/:id", authMiddleware, deletePost);
router.get("/user/:userId", getPostsByUser);

router.get("/:postId/comments", getComments);
router.post("/:postId/comments", authMiddleware, addComment);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComments);

module.exports = router;
