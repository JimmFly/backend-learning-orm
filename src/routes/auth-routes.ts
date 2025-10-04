import express, { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma-client.js";

const router: Router = express.Router();

// Get all users (for testing purposes)
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    // Check if the username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // Insert the new user with orm
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Create a default todo for the new user
    const defaultTodos = `Welcome to your todo list! Hit the + button to add a new todo`;

    await prisma.todo.create({
      data: {
        userId: user.id,
        task: defaultTodos,
      },
    });

    // Create a JWT token for the new user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.status(201).json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    console.log("User logged in:", user, username, passwordIsValid);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Error logging in" });
  }
});

router.delete("/delete-account", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    console.log("Deleting account for user:", user, username, passwordIsValid);
    await prisma.todo.deleteMany({
      where: { userId: user.id },
    });
    await prisma.user.delete({
      where: { id: user.id },
    });
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({ message: "Error deleting account" });
  }
});

export default router;
