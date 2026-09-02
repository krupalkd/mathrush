import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Adaptive Puzzle Generator Endpoint
app.post("/api/ai/generate-puzzle", async (req, res) => {
  try {
    const { category, difficulty, userAccuracy, avgTimeSeconds, userLevel } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback algorithmic generation response flag
      return res.json({
        fallback: true,
        message: "Gemini API key not configured, using built-in generator.",
      });
    }

    const prompt = `Generate a single creative, engaging, and mathematically rigorous puzzle for a math game called MathRush.
Target Audience: Age 13+ (everyone).
Category: ${category || "General Math & Logic"} (options: arithmetic, sequence, logic, equation, balance, speed).
Difficulty Level: ${difficulty || "Medium"} (User Level: ${userLevel || 10}, accuracy: ${userAccuracy || 75}%, avg speed: ${avgTimeSeconds || 15}s).
Ensure the question is clear, the answer is exact (integer or short clean number/string), and provide 4 multiple-choice options with exactly 1 correct answer.
Also provide a 1-sentence hint and a clear 2-3 step explanation.`;

    const generateWithModel = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The mathematical puzzle or equation string, formatted cleanly (e.g. '8 + 8 ÷ 8 × 8 − 8 = ?' or sequence '3, 9, 27, 81, ?')",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4 multiple choice options as strings (e.g. ['8', '16', '0', '64'])",
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The exact matching correct answer from the options array",
              },
              hint: {
                type: Type.STRING,
                description: "A clever 1-sentence hint without spoiling the final number",
              },
              explanation: {
                type: Type.STRING,
                description: "Clear step-by-step mathematical solution breakdown",
              },
              timeLimitSeconds: {
                type: Type.INTEGER,
                description: "Recommended countdown seconds (15 to 45)",
              },
              category: {
                type: Type.STRING,
                description: "Category name (Arithmetic, Sequences, Logic, BODMAS, Algebra)",
              },
            },
            required: ["question", "options", "correctAnswer", "hint", "explanation", "timeLimitSeconds", "category"],
          },
        },
      });
    };

    let response;
    try {
      response = await generateWithModel("gemini-3.7-flash");
    } catch (primaryErr) {
      // If primary model is unavailable or overloaded (e.g. 503 spike), fallback to flash-lite
      try {
        response = await generateWithModel("gemini-3.1-flash-lite");
      } catch (secondaryErr) {
        // Return fallback flag cleanly so client seamlessly serves procedural puzzle
        return res.json({
          fallback: true,
          message: "AI service temporarily unavailable, fallback procedural puzzle active.",
        });
      }
    }

    const text = response?.text?.trim();
    if (!text) {
      return res.json({ fallback: true });
    }

    const puzzle = JSON.parse(text);
    return res.json({ puzzle, fallback: false });
  } catch (error) {
    return res.json({
      fallback: true,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

// AI Step-by-Step Explanation / Math Coach
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        explanation: `Correct answer is ${correctAnswer}. Work step-by-step following standard arithmetic rules and sequence patterns.`,
        fallback: true,
      });
    }

    const prompt = `You are the friendly AI Math Coach in the MathRush game.
Question: "${question}"
User's submitted answer: "${userAnswer}"
Correct answer: "${correctAnswer}"

Give a 2-3 sentence encouraging, crystal-clear explanation of why ${correctAnswer} is correct and how to solve it in under 10 seconds with mental math tricks.`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });
      responseText = response.text?.trim() || "";
    } catch (primaryErr) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
        });
        responseText = fallbackResponse.text?.trim() || "";
      } catch (secondaryErr) {
        responseText = "";
      }
    }

    return res.json({
      explanation: responseText || `The correct answer is ${correctAnswer}. Work step-by-step to calculate accurately.`,
      fallback: !responseText,
    });
  } catch (error) {
    return res.json({
      explanation: `The correct answer is ${req.body.correctAnswer}.`,
      fallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MathRush server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
