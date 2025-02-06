const express = require("express");
const { getUserProfile, updateUserProfile, getUserProfileById } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:username", getUserProfile);
router.get("/id/:id", getUserProfileById);
router.get("/profile/me", authMiddleware, getUserProfile);
router.put("/edit/:id", authMiddleware, updateUserProfile);

module.exports = router;
