import fs from "fs";
import path from "path";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import process from "process";

const usersFile = path.join(process.cwd(), "src", "Data", "users.json");
const JWT_SECRET = "Secrectkey";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

// Define Zod schemas
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50);

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30);

const emailSchema = z.string().email("Invalid email");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain at least one special character",
  });

const signupSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Helper to read users
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
};

// Helper to write users
const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// ✅ SIGNUP CONTROLLER
export const signup = (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      const formatted = result.error.format();
      return res.status(400).json({ success: false, errors: formatted });
    }

    const { name, username, email, password } = result.data;

    const users = readUsers();

    const alreadyExists = users.some(
      (user) => user.username === username || user.email === email
    );
    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "User with that username or email already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      id: Date.now(),
      name,
      username,
      email,
      password: hashedPassword,
      userType: "buyer",
      reviews: [],
      products: [],
      cart: [],
      wishlist: [],
    };

    users.push(newUser);
    writeUsers(users);

    // Generate token
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        type: newUser.userType,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Signup successful!",
      tokens: {
        access: token,
      },
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ LOGIN CONTROLLER
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Both username and password are required." });
  }

  try {
    const users = readUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        type: user.userType || "buyer",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;

    res.status(200).json({
      message: "Login successful",
      user: userData,
      tokens: {
        access: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
