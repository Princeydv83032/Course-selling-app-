import express from "express";
import { login, logout, signup } from "../controllers/user.controller.js";
const router = express.Router();
router.post(
  "/signup",
  (req, res, next) => {
    console.log("✅ /signup route hit");
    next();
  },
  signup
);

router.post("/login", login);
router.get("/logout", logout);
export default router;
