import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import setupAuth from "./auth.js";
import { getFormResponses } from "./google-forms.js";
import OpenAI from "openai";

// Load environment
dotenv.config();

// Initialize app
const app = express();
const PORT = 4000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Google OAuth
setupAuth(app);

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -------------------------
// GOOGLE FORMS ROUTES
// -------------------------
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
    res.status(201).json({ message: `${responses.length} responses fetched!` });
  } catch (err) {
    console.error("Failed to import form responses:", err);
    res.status(500).json({ error: "Failed to import responses" });
  }
});

// -------------------------
// OpenAI club comparison
// -------------------------
app.post("/compare-clubs", async (req, res) => {
  const { club1, club2 } = req.body;
  if (!club1 || !club2) return res.status(400).json({ error: "Both club names required" });

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

// -------------------------
// SEQUELIZE ROUTES (isolated)
// -------------------------
import db from "./models/index.js"; // Sequelize models

// Users
app.get("/users", async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await db.User.create({ username, email });
    res.status(201).json(user);
  } catch (err) {
    console.error("Failed to add user:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Proposed clubs
app.get("/proposed-clubs", async (req, res) => {
  try {
    const clubs = await db.ProposedClub.findAll();
    res.json(clubs);
  } catch (err) {
    console.error("Failed to fetch proposed clubs:", err);
    res.status(500).json({ error: "Failed to fetch proposed clubs" });
  }
});

app.delete("/proposed-clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.ProposedClub.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Proposed club not found" });
    res.json({ message: "Proposed club deleted!" });
  } catch (err) {
    console.error("Failed to delete proposed club:", err);
    res.status(500).json({ error: "Failed to delete proposed club" });
  }
});


app.get("/", (req, res) => {
  res.send("BCA Club Dashboard backend is running!");
});

// -------------------------
// Start server & sync Sequelize
// -------------------------
db.sequelize
  .sync()
  .then(() => {
    console.log("Sequelize models synced.");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("Sequelize sync failed:", err));
