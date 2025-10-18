import User from "../models/User.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ UPDATE PROFILE (name, onboarding, etc.)
// export const updateProfile = async (req, res) => {
//   try {
//     // console.log("REQ.USER =>", req.user);
//     // console.log("REQ.BODY =>", req.body);
//     const { name } = req.body;

//     if (!name) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Name is required" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       { name },
//       { new: true }
//     ).select("-password");

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware attaches user
    const {
      name,
      displayName,
      currency, // <-- important: persist this
      theme,
      notifyMonthlySummary,
      notifyBudgetAlerts,
    } = req.body;

    const update = {};

    if (typeof name !== "undefined") update.name = name;
    if (typeof displayName !== "undefined") update.displayName = displayName;
    if (typeof currency !== "undefined") update.currency = currency;
    if (typeof theme !== "undefined") update.theme = theme;
    if (typeof notifyMonthlySummary !== "undefined")
      update.notifyMonthlySummary = notifyMonthlySummary;
    if (typeof notifyBudgetAlerts !== "undefined")
      update.notifyBudgetAlerts = notifyBudgetAlerts;

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      select: "-password",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message,
    });
  }
};

// 🔐 CHANGE PASSWORD
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // ✅ Get fresh user from DB with password
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // ✅ Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Password Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/profile/delete
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Optional: You can also delete related data like user’s transactions, etc.
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting account.",
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload_stream(
      { folder: "avatars", resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res
            .status(500)
            .json({ success: false, message: "Upload failed" });
        }

        // Save URL to user
        const user = await User.findByIdAndUpdate(
          req.user._id,
          { avatarUrl: result.secure_url },
          { new: true, select: "-password" }
        );

        return res.json({
          success: true,
          message: "Avatar updated successfully",
          user,
        });
      }
    );

    // Pipe the file buffer
    uploadResponse.end(req.file.buffer);
  } catch (err) {
    console.error("Avatar Update Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during avatar update",
    });
  }
};
