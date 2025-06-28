import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/ping", (req, res) => {
  res.send("OK");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.use("/auth", authRoutes);
app.use("/todos", authMiddleware, todoRoutes);

// Run migrations then start server
console.log("Running Prisma migrations...");
exec("npx prisma migrate deploy", (err, stdout, stderr) => {
  if (err) {
    console.error("Migration error:", err.message);
    process.exit(1); // Exit if migrations fail
    return;
  }
  console.log("Migration output:", stdout || stderr);

  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
