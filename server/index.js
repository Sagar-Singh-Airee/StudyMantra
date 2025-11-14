// server/index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 4000;

if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not set in server/.env");
  process.exit(1);
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Main assistant endpoint with multiple capabilities
app.post("/api/ask", async (req, res) => {
  try {
    const { message = "", selectedText = "", mode = "explain" } = req.body;

    let systemPrompt = "You are StudyMantra's friendly AI study assistant. Provide clear, concise, and helpful responses.";
    let userPrompt = message;

    // Different modes for different features
    switch(mode) {
      case "explain":
        userPrompt = `Explain this concept clearly: "${selectedText}"\n\nUser's question: ${message}`;
        break;
      
      case "summarize":
        userPrompt = `Provide a concise summary of: "${selectedText}"`;
        break;
      
      case "examples":
        userPrompt = `Give 3 practical examples of: "${selectedText}"`;
        break;
      
      case "definition":
        userPrompt = `Define this term and explain its significance: "${selectedText}"`;
        break;
      
      case "simplify":
        userPrompt = `Explain this in simple terms as if to a beginner: "${selectedText}"`;
        break;
      
      case "questions":
        userPrompt = `Generate 3 thought-provoking follow-up questions about: "${selectedText}"`;
        break;
      
      case "flashcard":
        userPrompt = `Create a flashcard with front (question/term) and back (answer/definition) for: "${selectedText}". Format as JSON: {"front": "...", "back": "..."}`;
        break;
      
      case "memory":
        userPrompt = `Provide a memory technique or mnemonic to remember: "${selectedText}"`;
        break;
    }

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!openaiResp.ok) {
      const txt = await openaiResp.text();
      console.error("OpenAI error:", openaiResp.status, txt);
      return res.status(502).json({ error: "OpenAI error", details: txt });
    }

    const data = await openaiResp.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate an answer.";

    return res.json({ reply, mode });
  } catch (err) {
    console.error("Server /api/ask error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Generate AI quiz endpoint
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { text, numQuestions = 10, difficulty = "medium" } = req.body;

    if (!text || text.length < 100) {
      return res.status(400).json({ error: "Text too short for quiz generation" });
    }

    const systemPrompt = `You are an expert quiz generator. Create engaging, educational quiz questions based on the provided text.`;
    
    const userPrompt = `Create ${numQuestions} quiz questions from this text with ${difficulty} difficulty level.

Text: ${text.substring(0, 3000)}

Generate a mix of question types:
- Multiple choice (60%)
- True/False (20%)
- Fill in the blank (20%)

Return ONLY valid JSON array with this exact format:
[
  {
    "type": "multiple-choice",
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation why A is correct",
    "difficulty": "easy|medium|hard",
    "topic": "main topic"
  },
  {
    "type": "true-false",
    "question": "Statement to evaluate",
    "correctAnswer": "true",
    "explanation": "Why this is true/false"
  },
  {
    "type": "fill-blank",
    "question": "Text with _____ blank",
    "correctAnswer": "answer word",
    "explanation": "Context explanation"
  }
]`;

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!openaiResp.ok) {
      const txt = await openaiResp.text();
      console.error("OpenAI quiz error:", openaiResp.status, txt);
      return res.status(502).json({ error: "OpenAI error" });
    }

    const data = await openaiResp.json();
    let content = data.choices?.[0]?.message?.content ?? "[]";
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || content.match(/(\[[\s\S]*\])/);
    
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    const questions = JSON.parse(content);
    
    return res.json({ questions });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return res.status(500).json({ error: "Quiz generation failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI Assistant Server running on http://localhost:${PORT}`);
});