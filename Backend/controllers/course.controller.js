import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/purchase.model.js";
export const createCourse = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const image = req.files.image;

    const allowedFormat = ["image/png", "image/jpeg"];
    if (!allowedFormat.includes(image.mimetype)) {
      return res.status(400).json({
        error: "Invalid file format. Only png and jpg are allowed",
      });
    }

    // Upload to Cloudinary
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloud_response || cloud_response.error) {
      return res
        .status(400)
        .json({ error: "Error uploading file to cloudinary" });
    }

    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      },
    };

    const course = await Course.create(courseData);
    res.json({ message: "Course created successfully", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: "Error creating course" });
  }
};

export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, price, image } = req.body;
  try {
    const course = await Course.updateOne(
      {
        _id: courseId,
      },
      {
        title,
        description,
        price,
        image: {
          public_id: image?.public_id,
          url: image?.url,
        },
      }
    );
    res.status(201).json({ message: "Course update successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in course updating" });
    console.log("Error in course updating", error);
  }
};

export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findByIdAndDelete({
      _id: courseId,
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course delete successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in course deleting" });
    console.log("Error in course deleting", error);
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(201).json({ courses });
  } catch (error) {
    res.status(500).json({ errors: "Error in getting course" });
    console.log("error to get courses", error);
  }
};

export const courseDetails = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ course });
  } catch (error) {
    res.status(500).json({ error: "Error in getting course details" });
    console.log("Error in course details".error);
  }
};

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ error: "User has already purchased this ourse" });
    }
    const newPurchase = new Purchase({ userId, courseId });
    await newPurchase.save();
    return res
      .status(400)
      .json({ message: "Course purchased successfully", newPurchase });
  } catch (error) {
    res.status(500).json({ errors: "Error in course buying" });
    console.log("Error in course buying", error);
  }
};
