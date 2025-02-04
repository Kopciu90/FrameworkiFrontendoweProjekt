const express = require("express");
const { getProfile, getProfileById, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:username", getProfile);
router.get("/id/:id", getProfileById);
router.get("/profile/me", authMiddleware, getProfile);
router.put("/edit/:id", authMiddleware, updateProfile);

module.exports = router;
