const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadImage, fetchAllImages, fetchImagesByUser, removeImage } = require("../controllers/photoController");
const upload = require("../middleware/uploadMiddleware");
const { postComment, removeComment, fetchComments } = require("../controllers/photoCommentHandlerController");

const router = express.Router();

router.post("/", authMiddleware, upload.single("photo"), uploadImage);
router.get("/", fetchAllImages);
router.get("/user/:userId", fetchImagesByUser);
router.delete("/:id", authMiddleware, removeImage);

router.get("/:photoId/comments", fetchComments);
router.post("/:photoId/comments", authMiddleware, postComment);
router.delete("/:photoId/comments/:commentId", authMiddleware, removeComment);

module.exports = router;
