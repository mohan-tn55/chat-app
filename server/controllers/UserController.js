import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Sign up new User
export const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }
    
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Token generation helper
    const token = generateToken(newUser._id);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      userData: userResponse,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("SignUp Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Controller to Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    
    if (!userData) {
      return res.status(400).json({ success: false, message: "User not found" });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = generateToken(userData._id);
    
    const userResponse = userData.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      userData: userResponse,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Controller to check authentication status
export const checkAuth = (req, res) => {
  // req.user is populated by the protectRoute middleware
  res.status(200).json({ success: true, user: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    // Build update object dynamically to avoid overwriting with null/undefined
    let updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (fullName !== undefined) updateData.fullName = fullName;

    // Handle Profile Picture upload to Cloudinary
    if (profilePic && profilePic.startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "chat_app_profiles"
        });
        updateData.profilePic = uploadResponse.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary Upload Error:", cloudErr.message);
        return res.status(400).json({ success: false, message: "Image upload failed" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData }, 
      { new: true }
    ).select("-password");

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("UpdateProfile Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};