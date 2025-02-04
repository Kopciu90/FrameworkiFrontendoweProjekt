const express = require("express");
const router = express.Router();
const { createAccount, authenticateUser } = require("../controllers/authController");

router.post("/register", createAccount);
router.post("/login", authenticateUser);

module.exports = router;
