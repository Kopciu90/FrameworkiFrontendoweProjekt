const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, "Please provide content"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        indedx: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const photoSchema = new Schema({
    filename: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Photo", photoSchema);
