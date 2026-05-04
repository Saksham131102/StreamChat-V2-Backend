import prisma from "../lib/prisma.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // check if password match
    if (password != confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const seedProfilePic = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        profilePic: seedProfilePic,
        isAdmin: false,
        lastLogin: new Date(),
      },
    });

    if (newUser) {
      const accessToken = generateTokenAndSetCookie(newUser.id, res);
      return res.status(201).json({
        id: newUser.id,
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
    // Handling Unique Constraint
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return res.status(400).json({ error: `${field} already exists` });
    }
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

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if(!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // update last login
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });
    
    const accessToken = generateTokenAndSetCookie(user.id, res);

    return res.status(200).json({
      id: user.id,
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

export const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    res.set("x-user-id", decoded.userId);
    return res.status(200).send();
  } catch (error) {
    return res.status(401).send();
  }
};

export const refreshToken = async (req, res) => {
  try {
    // 1. Check if token exists in cookies
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ error: "Unauthorized - No cookies provided" });
    }

    // A simple cookie parser logic since cookie-parser might not be installed, 
    // but Express req.cookies requires cookie-parser. Let's install/use it or parse manually.
    // Wait, let's just parse the cookie string to extract jwt_refreshToken safely.
    let refreshTokenVal = null;
    const cookies = cookieHeader.split("; ");
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "jwt_refreshToken") {
        refreshTokenVal = value;
        break;
      }
    }

    if (!refreshTokenVal) {
      return res.status(401).json({ error: "Unauthorized - No Refresh Token Provided" });
    }

    // 2. Verify token
    const decoded = jwt.verify(refreshTokenVal, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Refresh Token" });
    }

    // 3. Look up user to ensure they still exist (optional but secure)
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    // 4. Generate a new access token
    const newAccessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error in refreshToken controller -->", error.message);
    res.status(401).json({ error: "Unauthorized - Refresh token expired or invalid" });
  }
};
