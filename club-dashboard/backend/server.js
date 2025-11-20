import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import setupAuth from "./auth.js";
import { getFormResponses } from "./google-forms.js";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 4000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "bca-club-dashboard",
});

db.connect((err) => {
  if (err) return console.error("MySQL connection error:", err);
  console.log("Connected to MySQL database!");
});

setupAuth(app);

app.get("/form-responses", async (req, res) => {
  const formId = "1K2a3Akdr75XpojqzEyMLBP9IHx4fS6lMZYtRps-ngZo";
  try {
    const responses = await getFormResponses(formId);
    res.json(responses);
  } catch (err) {
    console.error("Error fetching form responses:", err);
    res.status(500).json({ error: "Failed to fetch form responses" });
  }
});

app.post("/import-form-responses", async (req, res) => {
  const formId = "1K2a3Akdr75XpojqzEyMLBP9IHx4fS6lMZYtRps-ngZo";

  try {
    const responses = await getFormResponses(formId);

    if (!responses.length) {
      return res.status(200).json({ message: "No responses to import" });
    }

    const insertPromises = responses.map((r) => {
      const clubName = r.answers?.["44b6c6ef"]?.textAnswers?.answers[0]?.value || "N/A";
      const leaderEmail = r.answers?.["15bd187a"]?.textAnswers?.answers[0]?.value || "N/A";

      return new Promise((resolve, reject) => {
        const sql = "INSERT INTO proposed_clubs (club_name, leader_email) VALUES (?, ?)";
        db.query(sql, [clubName, leaderEmail], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    await Promise.all(insertPromises);
    res.status(201).json({ message: "Proposed clubs imported!" });
  } catch (err) {
    console.error("Failed to import form responses:", err);
    res.status(500).json({ error: "Failed to import responses" });
  }
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch users" });
    res.json(results);
  });
});

app.post("/users", (req, res) => {
  const { username, email } = req.body;
  const sql = "INSERT INTO users (username, email) VALUES (?, ?)";
  db.query(sql, [username, email], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add user" });
    res.json({ message: "User added", id: result.insertId });
  });
});

app.delete("/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete user" });
    res.json({ message: "User deleted" });
  });
});

app.get("/proposed-clubs", (req, res) => {
  const sql = "SELECT * FROM proposed_clubs";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch proposed clubs" });
    res.json(results);
  });
});

app.delete("/proposed-clubs/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM proposed_clubs WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete proposed club:", err);
      return res.status(500).json({ error: "Failed to delete proposed club" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proposed club not found" });
    }
    res.json({ message: "Proposed club deleted!" });
  });
});


app.post("/compare-clubs", async (req, res) => {
  const { club1, club2 } = req.body;
  if (!club1 || !club2) {
    return res.status(400).json({ error: "Both club names are required" });
  }
  try {
    const prompt = `On a scale from 0 to 100, rate how similar these two club names are: "${club1}" and "${club2}". Respond with just the number.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const score = completion.choices[0].message.content.trim();
    res.json({ score });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Failed to get similarity score" });
  }
});

app.get("/", (req, res) => {
  res.send("BCA Club Dashboard backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
