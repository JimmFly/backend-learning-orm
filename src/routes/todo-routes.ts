import express, { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { type Todo, type User } from "../db.js";

const router: Router = express.Router();

// Get all todos for logged-in user
router.get("/", (req: Request & { userId?: number }, res: Response) => {
  try {
    const getTodos = db.prepare("SELECT * FROM todos WHERE user_id = ?");
    const todos = getTodos.all(req.userId) as Todo[];
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Create a new todo for logged-in user
router.post("/", (req: Request & { userId?: number }, res: Response) => {
  const { task, completed } = req.body;
  if (!task) {
    res.status(400).json({ message: "Task is required" });
    return;
  }
  try {
    const insertTodo = db.prepare(
      "INSERT INTO todos (user_id, task, completed) VALUES (?, ?, ?)"
    );
    const result = insertTodo.run(req.userId, task, completed ? 1 : 0);
    const newTodo = {
      id: result.lastInsertRowid,
      user_id: req.userId,
      task,
      completed: completed ? 1 : 0,
    };
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Error creating todo" });
  }
});

// Update a todo
router.put("/:id", (req: Request & { userId?: number }, res: Response) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  if (!task) {
    res.status(400).json({ message: "Task is required" });
    return;
  }
  try {
    const updateTodo = db.prepare(
      "UPDATE todos SET task = ?, completed = ? WHERE id = ? AND user_id = ?"
    );
    updateTodo.run(task, completed ? 1 : 0, id, req.userId);
    res.json({ message: "Todo updated" });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Error updating todo" });
  }
});

// Delete a todo
router.delete("/:id", (req: Request & { userId?: number }, res: Response) => {
  const { id } = req.params;
  try {
    const deleteTodo = db.prepare(
      "DELETE FROM todos WHERE id = ? AND user_id = ?"
    );
    deleteTodo.run(id, req.userId);
    res.json({ message: "Todo deleted" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Error deleting todo" });
  }
});

export default router;
