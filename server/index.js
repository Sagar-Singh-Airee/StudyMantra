// server/index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // ok even on node18+, works consistently
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());              // allow requests from frontend
app.use(express.json());      // parse JSON bodies

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 4000;

if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not set in server/.env");
  process.exit(1);
}

// simple health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// main assistant endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { message = "", selectedText = "" } = req.body;

    const prompt = `
You are StudyMantra's friendly study assistant. Answer concisely and clearly.

User question:
${message}

Context (selected text):
${selectedText || "(none)"}
`;

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",    // change if you need a different model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    if (!openaiResp.ok) {
      const txt = await openaiResp.text();
      console.error("OpenAI error:", openaiResp.status, txt);
      return res.status(502).json({ error: "OpenAI error", details: txt });
    }

    const data = await openaiResp.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate an answer.";

    return res.json({ reply });
  } catch (err) {
    console.error("Server /api/ask error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`AI Assistant Server listening on http://localhost:${PORT}`);
});
