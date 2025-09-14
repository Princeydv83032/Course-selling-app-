import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URL;

try {
  await mongoose.connect(DB_URI);
  console.log("connected to MongoDB");
} catch (error) {
  console.log(error);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
