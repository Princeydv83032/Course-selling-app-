import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";

export const signup = async (req, res) => {
  console.log("Incoming body:", req.body); // 👈 Step 1
  const userSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const validated = userSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      errors: validated.error.issues.map((err) => err.message),
    });
  }

  const { firstName, lastName, email, password } = validated.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Signup succeeded", user: newUser });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ error: "Error in signup" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(403).json({ error: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Don’t return password
    user.password = undefined;

    res.cookie("jwt", token, {
      httpOnly: true, // prevents JS access (XSS safe)
      secure: false, // set true in production (HTTPS)
      sameSite: "lax", // adjust to "none" if cross-site
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Error in login", error);
    res.status(500).json({ error: "Error in login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out Successfully" });
  } catch (error) {
    console.error("Error in logout", error);
    res.status(500).json({ error: "Error in logout" });
  }
};
