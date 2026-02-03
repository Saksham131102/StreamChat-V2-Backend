import User from "../model/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // check if password match
    if (password != confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // checking whether a user with same username exists in database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const field = existingUser.username === username ? "username" : "email";
      return res.status(400).json({ error: `${field} already exists` });
    }

    const seedProfilePic = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      profilePic: seedProfilePic,
      isAdmin: false,
      lastLogin: new Date(),
    });

    if (newUser) {
      await newUser.save();
      const accessToken = generateTokenAndSetCookie(newUser._id, res);
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: seedProfilePic,
        isAdmin: newUser.isAdmin,
        accessToken,
      });
    } else {
      return res
        .status(400)
        .json({ error: "Failed to create user. Try again!!!" });
    }
  } catch (error) {
    console.log("Error in signup controller --> ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user & include password (since select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    // Verify user exists and password is correct
    // We use a generic error message to prevent "User Enumeration" attacks
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update audit fields (last login)
    await User.findByIdAndUpdate(
      user._id,
      { lastLogin: new Date() },
      { new: true },
    );

    // Generate tokens
    const accessToken = generateTokenAndSetCookie(user._id, res);

    // Return user data
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } catch (error) {
    console.error("Error in login controller --> ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt_refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
