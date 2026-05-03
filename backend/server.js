import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Database from "@replit/database";
import path from "path";

const db = new Database();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// FIX 3: Rate limiting — max 5 requests/min per IP
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: "Too many submissions. Please wait a minute.",
  },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

app.post("/feedback", feedbackLimiter, async (req, res) => {
  let { name, email, feedback } = req.body;

  // FIX 1: Trim whitespace before validation
  name     = typeof name     === "string" ? name.trim()     : "";
  email    = typeof email    === "string" ? email.trim()    : "";
  feedback = typeof feedback === "string" ? feedback.trim() : "";

  // Required fields
  if (!name || !email || !feedback) {
    return res.status(400).json({
      success: false,
      error: "All fields are required and cannot be whitespace only.",
    });
  }

  // Email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format.",
    });
  }

  // Max length guard
  if (name.length > 100 || feedback.length > 2000) {
    return res.status(400).json({
      success: false,
      error: "Input too long. Name max 100 chars, feedback max 2000 chars.",
    });
  }

  const entry = {
    id: feedbacks.length + 1,
    name,
    email,
    feedback,
    submittedAt: new Date().toISOString(),
  };

 await db.set(`feedback_${Date.now()}`, JSON.stringify(entry));

return res.status(201).json({
  success: true,
  message: "Feedback submitted successfully!",
  data: entry,
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Server is running", totalFeedbacks: feedbacks.length });
});
  
app.get("/feedbacks", async (req, res) => {
  const keys = await db.list("feedback_");
  const all = await Promise.all(keys.map(k => db.get(k)));
  res.json({ success: true, count: all.length, data: all });
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
