import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth-routes.js";
import todoRoutes from "./routes/todo-routes.js";
import authMiddleware from "./middleware/auth-middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current module
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
// This middleware serves static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Route to serve the HTML file
app.get("/", (req, res) => {
  const pathToHtml = path.join(__dirname, "public", "index.html");
  res.sendFile(pathToHtml);
});

// Routes
app.use("/auth", authRoutes);
app.use("/todos", authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
