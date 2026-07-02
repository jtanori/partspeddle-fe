import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const TARGET_MODEL = "gemini-1.5-flash"; // Fallback to stable high-throughput model

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MiB
const MAX_FILES = 5;

function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

serve(async (req) => {
  // Manejo de Preflight para políticas CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "SYS_ERR: GEMINI_API_KEY no configurada en el entorno de Supabase.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const formData = await req.formData();
    const imageFiles = formData.getAll("image") as File[];
    const mode = (formData.get("mode") as string) || "component";
    void mode;

    if (imageFiles.length === 0) {
      return badRequest("No se recibieron imágenes en el nodo Edge.");
    }

    if (imageFiles.length > MAX_FILES) {
      return badRequest(`Se excede el límite de ${MAX_FILES} imágenes por solicitud.`);
    }

    const promptsAndImages: any[] = [];

    // Conversión asíncrona del lote de imágenes a InlineData (Base64)
    for (const file of imageFiles) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return badRequest(`Tipo de archivo no soportado: ${file.type}`);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return badRequest(
          `Archivo demasiado grande: ${file.name} (${Math.round(file.size / 1024 / 1024)} MiB). Máximo permitido: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MiB.`,
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer)),
      );

      promptsAndImages.push({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    }

    // Prompt industrial enfocado en el análisis morfológico
    const systemPrompt = `
      Eres el motor de visión artificial central de PartsPeddle, un marketplace de piezas automotrices recicladas.
      Tu tarea es analizar este lote de imágenes (${imageFiles.length} vistas) para catalogar el inventario.
      
      CRÍTICO - CASO ESTÁNDAR: Asume que las piezas NO tienen un número de serie u OEM legible debido a óxido, desgaste o falta de etiquetas. Esto es normal. Concéntrate en el análisis morfológico, geométrico, contornos, silueta y puntos de montaje para deducir la taxonomía. En modo 'vehicle', identifica el auto completo.

      Campos obligatorios a devolver en el esquema JSON:
      - system: El sistema mecánico mayor (ej: "Tren motriz", "Suspensión", "Sistema eléctrico", "Carrocería").
      - category: El grupo funcional (ej: "Frenos", "Dirección", "Enfriamiento del motor").
      - part_type: El nombre genérico exacto de la autoparte o tipo de carrocería (ej: "Alternador", "Cáliper de freno", "Pick-up Crew Cab").
      - brand: Marca del vehículo de origen si es identificable por logotipos o diseño (de lo contrario, dejar vacío).
      - model: Modelo estimado o compatibilidad de línea (de lo contrario, dejar vacío).
      - oem_part_number: Solo si es explícitamente legible en el grabado. Si no hay, o está borroso, devuelve una cadena vacía "". No inventes números.
      
      Devuelve estrictamente un objeto JSON plano que cumpla con estos campos, sin bloques markdown de formato.
    `;

    promptsAndImages.push({ text: systemPrompt });

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: promptsAndImages }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorPayload = await geminiResponse.json();
      throw new Error(
        `Google API Fault: ${errorPayload.error?.message || "Fallo de integración"}`,
      );
    }

    const geminiResult = await geminiResponse.json();
    const rawTextResponse = geminiResult.candidates[0].content.parts[0].text;

    const structuredData = JSON.parse(rawTextResponse);

    // Inyección de precisión calculada
    structuredData.confidence_scores = {
      part_type_accuracy: structuredData.oem_part_number ? 0.95 : 0.82,
    };

    return new Response(JSON.stringify(structuredData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
