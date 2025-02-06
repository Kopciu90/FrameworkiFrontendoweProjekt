const Photo = require("../models/Photo");

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { description } = req.body;

        const photo = await Photo.create({
            filename: req.file.filename,
            description,
            user: req.userId,
        });

        res.status(201).json(photo);
    } catch (error) {
        res.status(500).json({ error: "Failed to upload photo", message: error.message });
    }
};

const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photo.find().populate("user", "username email");
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch photos" });
    }
};

const getPhotoByUser = async (req, res) => {
    try {
        const photos = await Photo.find({ user: req.params.userId }).populate("user", "username email");
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch photos" });
    }
};

const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }

        if (photo.user.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized to delete this photo" });
        }

        await Photo.deleteOne({ _id: photo._id });
        res.status(200).json({ message: "Photo deleted successfully" });
    } catch (error) {
        console.error("Error deleting photo:", error); // Log the error
        res.status(500).json({ error: "Failed to delete photo", message: error.message });
    }
};

module.exports = {
    uploadPhoto,
    getAllPhotos,
    getPhotoByUser,
    deletePhoto,
};
