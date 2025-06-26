import express from "express";
import path, { dirname } from "path"; // path is a module
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

const PORT = process.env.PORT || 5003; // if environment variable ma PORT ko value xa vane tyo use garxa ra yedi xaina vane 5003 use garxa which is as a backup.

//Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
console.log(__filename); // output -> dir/chapter_2/src/server.js
//Get the directory name from the file path
const __dirname = dirname(__filename);
console.log(__dirname); // output -> dir/chapter_2/src
//Middleware
//This allows Express to parse incoming JSON data in POST or PUT requests, making it available in req.body.
app.use(express.json());

// Tells Express: "Serve anything in the /public folder as static files."
//That includes:
//HTML files
//CSS files
//JavaScript files
//Images
// http://localhost:5003/fanta.css garera browser ma acess garna milxa.
app.use(express.static(path.join(__dirname, "../public")));

// Serving up the HTML file from the public folder
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.get("/ping", (req, res) => {
  res.send("OK");
});

// ROUTES

app.use("/auth", authRoutes); // authRoutes file ma vako sab routes haru ko base path /auth hunxa
app.use("/todos", authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`server has started on ${PORT}`);
}); //
