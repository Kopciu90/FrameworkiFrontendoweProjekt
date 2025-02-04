const Image = require("../models/Photo");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { details } = req.body;

        const newImage = await Image.create({
            filename: req.file.filename,
            description: details,
            user: req.userId,
        });

        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ error: "Failed to upload image", message: error.message });
    }
};

const fetchAllImages = async (req, res) => {
    try {
        const allImages = await Image.find().populate("user", "username email");
        res.status(200).json(allImages);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve images" });
    }
};

const fetchImagesByUser = async (req, res) => {
    try {
        const userImages = await Image.find({ user: req.params.userId }).populate("user", "username email");
        res.status(200).json(userImages);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve images" });
    }
};

const removeImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        if (image.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to remove this image" });
        }

        await Image.deleteOne({ _id: image._id });
        res.status(200).json({ message: "Image removed successfully" });
    } catch (error) {
        console.error("Error removing image:", error);
        res.status(500).json({ error: "Failed to remove image", message: error.message });
    }
};

module.exports = {
    uploadImage,
    fetchAllImages,
    fetchImagesByUser,
    removeImage,
};
