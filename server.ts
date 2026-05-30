import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  // Removed global JSON limit to allow multipart forms
  app.use(express.json());

  // API handler configuration
  // Note: For multipart forms, use busboy or formidable in the specific route handler
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "PartsPeddle Core API online" });
  });

  // ... (rest of Gemini logic and server setup)

  // Lazy Gemini initialization to prevent startup crashes if key is missing
  let ai: GoogleGenAI | null = null;
  const getGemini = () => {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not defined");
      }
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  app.post("/api/gemini/identify", async (req, res) => {
    try {
      const { images, image } = req.body;
      const imagesArray = images || (image ? [image] : []);

      if (imagesArray.length === 0) {
        return res.status(400).json({ error: "Missing image attachments." });
      }

      // Initialize Gemini lazily
      const gemini = getGemini();

      // Prepare Gemini Multi-part payloads for all images
      const imageParts = imagesArray.map((img: string) => {
        let mimeType = "image/jpeg";
        let base64Data = img;

        if (img.startsWith("data:")) {
          const match = img.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64Data = match[2];
          }
        }

        return {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
      });

      const promptPart = {
        text: `Analyze these auto part photos (potentially from different angles) taken in a salvage yard. 
Identify the part precisely. Return a structured JSON response to draft a listing. 
Be highly accurate based on visible markings, part numbers, styling, or part type.`,
      };

      // Call Gemini 3.5 Flash server-side
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [...imageParts, promptPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggested_title: { 
                type: Type.STRING, 
                description: "High-quality marketplace title, e.g. 1987 Chevy K5 Blazer Alternator - High Output" 
              },
              system: { 
                type: Type.STRING, 
                description: "Must be exactly one of: 'Powertrain', 'Suspension & Steering', 'Brake System', 'Electrical System', 'Body & Exterior', 'Interior'" 
              },
              subsystem: { 
                type: Type.STRING, 
                description: "The specific subsystem, e.g., 'Engine System', 'Transmission System', 'Drivetrain', 'Front Suspension', 'Rear Suspension', 'Steering', 'Brake Components', 'Charging & Starting', 'Electronics', 'Doors & Glass', 'Dashboard & Controls'" 
              },
              part_type: { 
                type: Type.STRING, 
                description: "Component name, e.g. Alternator, Carburetor" 
              },
              condition: { 
                type: Type.STRING, 
                description: "Must be exactly one of: 'Excellent', 'Good', 'Fair'" 
              },
              visible_part_number: { 
                type: Type.STRING, 
                description: "The exact part number if visible in photos, e.g. AC-DELCO 334-2110" 
              },
              confidence_score: { 
                type: Type.NUMBER, 
                description: "Confidence (0-1)" 
              },
              estimated_price_range: { 
                type: Type.ARRAY, 
                items: { type: Type.INTEGER },
                description: "Range [min, max] in integers" 
              },
              fitment_notes: { 
                type: Type.STRING, 
                description: "Compatibility details like 'Appears compatible with GM 10SI/12SI series'" 
              },
              suggested_description: { 
                type: Type.STRING, 
                description: "Sales description including wear and yard authenticity." 
              },
              // Keep legacy fields for backward compatibility with frontend if needed or mapping
              make: { type: Type.STRING },
              model: { type: Type.STRING },
              years: { type: Type.STRING },
              engine: { type: Type.STRING }
            },
            required: [
              "suggested_title", "system", "subsystem", "part_type", "condition", 
              "visible_part_number", "confidence_score", "estimated_price_range", 
              "fitment_notes", "suggested_description", "make", "model", "years", "engine"
            ]
          }
        }
      });

      const extractedText = response.text;
      if (!extractedText) {
        throw new Error("Empty response from Gemini.");
      }

      const cleanJson = JSON.parse(extractedText.trim());
      return res.json(cleanJson);

    } catch (error: any) {
      console.error("Gemini Scan Error:", error);
      res.status(500).json({ error: error?.message || "Failed to identify auto part." });
    }
  });

  // Setup Vite development middleware OR static built asset hosting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PartsPeddle] Server listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
