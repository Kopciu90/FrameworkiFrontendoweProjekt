const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createAccount = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingAccount = await User.findOne({ email });

        if (existingAccount) return res.status(400).json({ message: "Email already in use!" });

        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = await Account.create({ username, email, password: encryptedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account successfully created" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed, please try again" });
    }
};

const authenticateUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const account = await Account.findOne({ email });

        if (!account) {
            return res.status(401).json({ error: "Authentication failed: Account not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Authentication failed: Incorrect password" });
        }

        const accessToken = jwt.sign({ userId: account._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ token: accessToken });
    } catch (error) {
        res.status(500).json({ error: "Login failed, please try again" });
    }
};

module.exports = { createAccount, authenticateUser };
