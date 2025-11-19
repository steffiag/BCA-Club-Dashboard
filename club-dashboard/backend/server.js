// imports
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// app setup
const app = express();
app.use(cors());
app.use(express.json()); // allows JSON body parsing

// --- MySQL Connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "appuser",          // ← MySQL username
  password: "password123",  // ←  MySQL password (for this type of user - "appuser")
  database: "my_app"        // ←  schema/database name 
});

// testing MySQL connection
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

// --- ROUTES ---

// General Route: http://localhost:4000
// This just prevents the "Cannot GET /" error from apearing
// since this route doesn't do anything 
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// READ Route: Get all users -> users currently = 
// username: club name
// email: club leader's email
// for context of our actual app
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// WRITE Route: Add a new user
app.post("/users", (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Missing username or email" });
  }

  const sql = "INSERT INTO users (username, email) VALUES (?, ?)";

  db.query(sql, [username, email], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ error: "Insert failed" });
    }

    res.json({ message: "User added", id: result.insertId });
  });
});

// delete route - not needed for plumbing but adding so we can use in the future
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "User deleted" });
  });
});

// --- Start Server ---
app.listen(4000, () => {
  console.log("Backend server running on http://localhost:4000");
});
