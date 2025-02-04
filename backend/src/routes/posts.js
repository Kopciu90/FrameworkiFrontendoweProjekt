const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { fetchAllArticles, fetchUserArticles, postArticle, removeArticle } = require("../controllers/postController");
const { postComment, removeComment, fetchComments } = require("../controllers/postCommentHandlerController");

const router = express.Router();

router.get("/", fetchAllArticles);
router.get("/user/:userId", fetchUserArticles);
router.post("/", authMiddleware, postArticle);
router.delete("/:id", authMiddleware, removeArticle);

router.get("/:postId/comments", fetchComments);
router.post("/:postId/comments", authMiddleware, postComment);
router.delete("/:postId/comments/:commentId", authMiddleware, removeComment);

module.exports = router;
