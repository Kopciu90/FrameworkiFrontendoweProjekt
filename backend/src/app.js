require("dotenv").config();
const express = require("express");
const cors = require("cors");
const initializeDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const photosRoutes = require("./routes/photos");
const userRoutes = require("./routes/user");
const path = require("path");

const server = express();
const SERVER_PORT = process.env.PORT || 5000;

initializeDB();

server.use(cors());
server.use(express.json());
server.use("/auth", authRoutes);
server.use("/posts", postsRoutes);
server.use("/photos", photosRoutes);
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use("/user", userRoutes);

server.listen(SERVER_PORT, () => {
    console.log(`Server is live at http://localhost:${SERVER_PORT}`);
});
