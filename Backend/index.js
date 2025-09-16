import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import courseRoute from "./routes/course.route.js";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// Routes
app.use("/api/v1/course", courseRoute);
app.get("/", (req, res) => res.send("Backend server is running!"));

const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URL;

const startServer = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

startServer();
