import dotenv from "dotenv";
dotenv.config(); // make sure env vars are loaded

export default {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  CLOUD_NAME: process.env.cloud_name,
  API_KEY: process.env.api_key,
  API_SECRET: process.env.api_secret,
  JWT_SECRET: process.env.JWT_SECRET, // ✅ clearer name
};
