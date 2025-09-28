import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
  try {
    const { name, email, plainTextPassword } = req.body;

    // Check if the password exists before trying to hash it
    if (!plainTextPassword) {
      return res.status(400).send("Password is required.");
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

    // create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password, ...userData } = newUser._doc;
    res.status(201).json(userData);
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).send("Error saving user");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, plainTextPassword } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // compare plain password with stored hashed password
    // user.password → the hashed password stored in DB.
    const isMatch = await bcrypt.compare(plainTextPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid email or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // token valid for one hour
    });

    // if matched, login is successful
    const { password, ...userData } = user._doc;
    res
      .status(200)
      .json({ message: "Login Successful", user: userData, token });
  } catch (error) {
    console.error("❌ Error Loging user:", error);
    res.status(500).send("Error logging user");
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is populated by protect middleware (decoded JWT user id)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
};

// forgot password logic
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(200)
      .json({ message: "If an account is found, a reset link will be sent." });
  }

  // 1. Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token for DB storage
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const tokenExpiration = Date.now() + 3600000; // 1 hour

  // 3. Save hashed token + expiry in DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = tokenExpiration;
  await user.save();

  // 4. Create reset URL with raw token
  const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

  // 5. Send email
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Fin Track" <no-reply@yourapp.com>',
    to: user.email,
    subject: "Password Reset",
    html: `<a href="${resetURL}">Reset Password</a>`,
  });

  console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));

  res
    .status(200)
    .json({ message: "If an account is found, a reset link will be sent." });
};

// logic for password reset execution
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // 1. Hash the incoming token before comparing
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Look up user with hashed token + valid expiry
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Password reset link is invalid or has expired." });
  }

  // 3. Update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // 4. Invalidate reset token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been successfully changed." });
};
