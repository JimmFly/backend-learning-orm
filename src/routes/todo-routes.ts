import express, { Router, type Request, type Response } from "express";
import prisma from "../prisma-client.ts";

const router: Router = express.Router();

// Get all todos for logged-in user
router.get("/", async (req: Request & { userId?: number }, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
    });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Create a new todo for logged-in user
router.post("/", async (req: Request & { userId?: number }, res: Response) => {
  const { task, completed } = req.body;
  if (!req.userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!task) {
    res.status(400).json({ message: "Task is required" });
    return;
  }
  try {
    const newTodo = await prisma.todo.create({
      data: {
        userId: req.userId,
        task,
        completed: !!completed,
      },
    });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Error creating todo" });
  }
});

// Update a todo
router.put(
  "/:id",
  async (req: Request & { userId?: number }, res: Response) => {
    const { id } = req.params;
    const { task, completed } = req.body;
    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!task) {
      res.status(400).json({ message: "Task is required" });
      return;
    }
    try {
      const updateTodo = await prisma.todo.update({
        where: { id: Number(id), userId: req.userId },
        data: { task, completed: !!completed },
      });
      res.json(updateTodo);
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ message: "Error updating todo" });
    }
  }
);

// Delete a todo
router.delete(
  "/:id",
  async (req: Request & { userId?: number }, res: Response) => {
    const { id } = req.params;
    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    try {
      await prisma.todo.delete({
        where: { id: Number(id), userId: req.userId },
      });
      res.json({ message: "Todo deleted" });
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ message: "Error deleting todo" });
    }
  }
);

export default router;
