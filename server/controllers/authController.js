import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { name, email, plainTextPassword } = req.body;

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

    res.status(201).json(newUser);
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
    // if matched, login is successful
    res.status(200).json({ message: "Login Successful", user });
  } catch (error) {
    console.error("❌ Error Loging user:", error);
    res.status(500).send("Error logging user");
  }
};
