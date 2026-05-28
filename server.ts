import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Shared Gemini client setup (using process.env.GEMINI_API_KEY)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY_IF_ABSENT",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint: Ask doubt about a finished course
  app.post("/api/doubt", async (req, res) => {
    try {
      const { subject, professor, notes, question, recentTopics } = req.body;

      if (!subject || !question) {
        return res.status(400).json({ error: "Subject and question are required." });
      }

      const prompt = `
Context details:
- Course name: ${subject}
- Professor: ${professor || "Unknown"}
- Lecture Notes / Tasks: ${notes || "None listed"}
- Recent active context: ${recentTopics || "Standard Syllabus"}

Student's Doubt/Question:
"${question}"

Provide a clear, inspiring, and friendly academic explanation. If applicable, split it into clear sections (e.g. Concept Breakdown, Walkthrough/Example, and a quick self-test/check question to help them consolidate learning). Protect formulas or coding snippets with markdown boxes. Keep it concise enough for quick reading, but thoroughly address their query.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the 'Student Timetable Hub' Intelligent Classroom Doubt Clearing Assistant—an empathetic, highly clear, and brilliant university tutor. Help students master complicated subjects after class."
        }
      });

      res.json({ answer: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response. Make sure the GEMINI_API_KEY is configured in your secrets." });
    }
  });

  // API Health Indicator
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive" });
  });

  // Dev server setup with Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer();
