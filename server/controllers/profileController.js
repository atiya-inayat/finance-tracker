import User from "../models/User.js";
import bcrypt from "bcrypt";

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
  // Will implement soon
};

//-------------------------------------------------

// controllers/profileController.js
// import User from "../models/User.js";
// import bcrypt from "bcrypt";

// // GET /profile/me
// export const getProfile = async (req, res) => {
//   try {
//     // req.user is set by authMiddleware (without password)
//     const user = await User.findById(req.user.id).select("-password").lean();
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("getMe error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // PUT /profile/update
// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     // Only accept allowed fields
//     const allowed = [
//       "name",
//       "displayName",
//       "currency",
//       "theme",
//       "notifyMonthlySummary",
//       "notifyBudgetAlerts",
//     ];
//     const payload = {};
//     allowed.forEach((k) => {
//       if (typeof req.body[k] !== "undefined") payload[k] = req.body[k];
//     });

//     // Validate currency (optional: only allow supported codes)
//     if (payload.currency && typeof payload.currency === "string") {
//       payload.currency = payload.currency.toUpperCase();
//       // Optionally, you could validate against a list of supported currencies.
//     }

//     const user = await User.findByIdAndUpdate(userId, payload, { new: true })
//       .select("-password")
//       .lean();
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("updateProfile error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // PUT /profile/password
// export const updatePassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     if (!oldPassword || !newPassword)
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing passwords" });

//     const user = await User.findById(req.user.id).select("+password");
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     const match = await bcrypt.compare(oldPassword, user.password);
//     if (!match)
//       return res
//         .status(400)
//         .json({ success: false, message: "Current password is incorrect" });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     await user.save();

//     res.json({ success: true, message: "Password changed" });
//   } catch (err) {
//     console.error("changePassword error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // PUT /profile/avatar (simple placeholder)
// // You might already have an upload handler; if so keep that.
// // This version expects file handling middleware (e.g., multer) that sets req.file.
// export const updateAvatar = async (req, res) => {
//   try {
//     // req.file.path or req.file.location (depending on storage) should contain URL
//     const avatarUrl =
//       req.file?.location || req.file?.path || req.body?.avatarUrl;
//     if (!avatarUrl)
//       return res
//         .status(400)
//         .json({ success: false, message: "No avatar provided" });

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { avatarUrl },
//       { new: true }
//     )
//       .select("-password")
//       .lean();
//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("updateAvatar error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // DELETE /profile/delete
// export const deleteAccount = async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);
//     // optionally delete related user data (transactions, budgets)
//     res.json({ success: true, message: "Account deleted" });
//   } catch (err) {
//     console.error("deleteProfile error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };
