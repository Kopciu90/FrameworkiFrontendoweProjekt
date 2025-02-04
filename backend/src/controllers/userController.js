const Profile = require("../models/User");
const Article = require("../models/Post");
const Image = require("../models/Photo");
const encryptor = require("bcrypt");

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;

        let profile;

        if (username) {
            profile = await Profile.findOne({ username }).select("-password");
        } else {
            profile = await Profile.findById(req.userId).select("-password");
        }

        if (!profile) {
            return res.status(404).json({ error: "User not found" });
        }

        const articles = await Article.find({ author: profile._id });
        const images = await Image.find({ author: profile._id });

        res.status(200).json({ profile, articles, images });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile", message: error.message });
    }
};

const getProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findById(id).select("-password");

        if (!profile) {
            return res.status(404).json({ error: "User not found" });
        }

        const articles = await Article.find({ author: profile._id });
        const images = await Image.find({ author: profile._id });

        res.status(200).json({ profile, articles, images });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile", message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, email, password } = req.body;

        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (password) updates.password = await encryptor.hash(password, 10);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields provided for update" });
        }

        const updatedProfile = await Profile.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

        if (!updatedProfile) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile", message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getProfileById,
};
