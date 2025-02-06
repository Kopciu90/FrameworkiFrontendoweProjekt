const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadPhoto, getAllPhotos, getPhotoByUser, deletePhoto } = require("../controllers/photoController");
const upload = require("../middleware/uploadMiddleware");
const { addComment, deleteComments, getComments } = require("../controllers/photoCommentController");

const router = express.Router();

router.post("/", authMiddleware, upload.single("photo"), uploadPhoto);
router.get("/", getAllPhotos);
router.get("/user/:userId", getPhotoByUser);
router.delete("/:id", authMiddleware, deletePhoto);

router.get("/:photoId/comments", getComments);
router.post("/:photoId/comments", authMiddleware, addComment);
router.delete("/:photoId/comments/:commentId", authMiddleware, deleteComments);

module.exports = router;
