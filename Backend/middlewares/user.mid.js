import jwt from "jsonwebtoken";
import config from "../config.js";

function userMiddleware(req, res, next) {
  let token;

  // 1️⃣ Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ If no header token, check cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Invalid or expired token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default userMiddleware;
