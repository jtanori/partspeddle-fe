import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Admin Client (Bypass RLS safely on server)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ""
);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  // Middleware for large AI/Image payloads
  app.use(express.json({ limit: '10mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "PartsPeddle Core API online" });
  });

  // Lazy Gemini initialization
  let ai: GoogleGenAI | null = null;
  const getGemini = () => {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not defined");
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  };

  /**
   * AI Identification Pipeline (Gemini 2.0 Flash)
   */
  app.post("/api/gemini/identify", async (req, res) => {
    try {
      const { images, image, mode } = req.body;
      const imagesArray = images || (image ? [image] : []);

      if (imagesArray.length === 0) {
        return res.status(400).json({ error: "Missing image attachments." });
      }

      const gemini = getGemini();
      console.log('DEBUG: Gemini instance structure:', Object.keys(gemini));
      console.log('DEBUG: Gemini models:', gemini.models);
      
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
          inlineData: { mimeType, data: base64Data },
        };
      });

      const prompt = mode === 'vehicle' 
        ? `Analyze this automotive yard asset image. Classify the vehicle model framework, determine overall body completeness grading, read legible badging or VIN strings, and predict system component availability based on structural damage visibility.`
        : `Perform macro object analysis on this isolated component. Determine structural part category classification, extract engineering numbers/stamps, and output compatibility application arrays for automotive or industrial machinery.`;

      const validationSchema = mode === 'vehicle' ? {
        type: Type.OBJECT,
        properties: {
          is_valid_vehicle: { type: Type.BOOLEAN },
          completeness_grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
          vehicle_metrics: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              make: { type: Type.STRING },
              model: { type: Type.STRING },
              vin: { type: Type.STRING }
            },
            required: ["year", "make", "model"]
          },
          inferred_manifest: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                system: { type: Type.STRING },
                part_type: { type: Type.STRING },
                estimated_integrity: { type: Type.STRING, enum: ["Excellent", "Used OEM", "Damaged"] }
              },
              required: ["system", "part_type", "estimated_integrity"]
            }
          }
        },
        required: ["is_valid_vehicle", "completeness_grade", "vehicle_metrics", "inferred_manifest"]
      } : {
        type: Type.OBJECT,
        properties: {
          part_type: { type: Type.STRING },
          system: { type: Type.STRING },
          category: { type: Type.STRING },
          oem_part_number: { type: Type.STRING },
          cross_reference_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
          machinery_compatibility: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence_scores: {
            type: Type.OBJECT,
            properties: {
              part_type_accuracy: { type: Type.NUMBER },
              fitment_accuracy: { type: Type.NUMBER },
              number_extraction_accuracy: { type: Type.NUMBER }
            },
            required: ["part_type_accuracy", "fitment_accuracy", "number_extraction_accuracy"]
          }
        },
        required: ["part_type", "system", "category", "cross_reference_numbers", "machinery_compatibility", "confidence_scores"]
      };

      const result = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [prompt, ...imageParts],
        config: {
          responseMimeType: "application/json",
          responseSchema: validationSchema,
        }
      });
      
      return res.json(JSON.parse(result.text()));


    } catch (error: any) {
      console.error("Gemini Scan Error:", error);
      res.status(500).json({ error: error?.message || "Failed to identify auto part." });
    }
  });

  /**
   * Secure Profile Update Pipeline
   */
  app.post("/api/seller/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Missing authorization context.' });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) return res.status(401).json({ error: 'Unauthorized session window.' });

      const { yardName, whatsappNumber, location, email } = req.body;

      // XSS & Markup Sanitization
      const sanitizedName = yardName?.replace(/<\/?[^>]+(>|$)/g, "") || 'Unnamed Yard';

      // Atomic update across users and seller_profiles
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ email, full_name: sanitizedName })
        .eq('id', user.id);
      
      if (userError) throw userError;

      const { data, error: sellerError } = await supabaseAdmin
        .from('seller_profiles')
        .update({ 
          business_name: sanitizedName, 
          location, 
          whatsapp: whatsappNumber,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (sellerError) throw sellerError;

      return res.json({
        success: true,
        profile: {
          id: data.id,
          name: data.business_name,
          location: data.location,
          whatsapp: data.whatsapp,
          email: email,
          status: data.verification_status
        }
      });

    } catch (error: any) {
      console.error('🚨 Core System Failure:', error.message);
      return res.status(500).json({ error: 'Internal server synchronization error.' });
    }
  });

  // Placeholder for Logo Upload (Requires multipart middleware like multer)
  app.post("/api/seller/upload-logo", async (req, res) => {
    res.status(501).json({ error: "Multipart upload requires additional server configuration (e.g. multer)." });
  });

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
    console.log(`[PartsPeddle] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
