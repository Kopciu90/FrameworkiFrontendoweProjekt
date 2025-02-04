const multer = require("multer");
const path = require("path");

// Configure file storage
const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads/");
    },
    filename: (req, file, callback) => {
        const timestamp = Date.now() + "-" + Math.round(Math.random() * 1e9);
        callback(null, `${timestamp}-${file.originalname}`);
    },
});

// File filter to allow only image formats
const imageFilter = (req, file, callback) => {
    const allowedFormats = /jpeg|jpg|png|gif/;
    const isValidExtension = allowedFormats.test(path.extname(file.originalname).toLowerCase());
    const isValidMimetype = allowedFormats.test(file.mimetype);

    if (isValidExtension && isValidMimetype) {
        return callback(null, true);
    } else {
        callback(new Error("Only image files are allowed"));
    }
};

const imageUpload = multer({
    storage: fileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter,
});

module.exports = imageUpload;
