import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Lazy Gemini initialization
let ai: GoogleGenAI | null = null;
const getGemini = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

export async function POST(req: NextRequest) {
  try {
    const { images, image, mode } = await req.json();
    const imagesArray = images || (image ? [image] : []);

    if (imagesArray.length === 0) {
      return NextResponse.json({ error: 'Missing image attachments.' }, { status: 400 });
    }

    const gemini = getGemini();

    const imageParts = imagesArray.map((img: string) => {
      let mimeType = 'image/jpeg';
      let base64Data = img;

      if (img.startsWith('data:')) {
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

    const prompt =
      mode === 'vehicle'
        ? `Analyze this automotive yard asset image. Classify the vehicle model framework, determine overall body completeness grading, read legible badging or VIN strings, and predict system component availability based on structural damage visibility.`
        : `Perform macro object analysis on this isolated component. Determine structural part category classification, extract engineering numbers/stamps, and output compatibility application arrays for automotive or industrial machinery.`;

    const validationSchema =
      mode === 'vehicle'
        ? {
            type: Type.OBJECT,
            properties: {
              is_valid_vehicle: { type: Type.BOOLEAN },
              completeness_grade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'] },
              vehicle_metrics: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  make: { type: Type.STRING },
                  model: { type: Type.STRING },
                  vin: { type: Type.STRING },
                },
                required: ['year', 'make', 'model'],
              },
              inferred_manifest: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    system: { type: Type.STRING },
                    part_type: { type: Type.STRING },
                    estimated_integrity: {
                      type: Type.STRING,
                      enum: ['Excellent', 'Used OEM', 'Damaged'],
                    },
                  },
                  required: ['system', 'part_type', 'estimated_integrity'],
                },
              },
            },
            required: [
              'is_valid_vehicle',
              'completeness_grade',
              'vehicle_metrics',
              'inferred_manifest',
            ],
          }
        : {
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
                  number_extraction_accuracy: { type: Type.NUMBER },
                },
                required: ['part_type_accuracy', 'fitment_accuracy', 'number_extraction_accuracy'],
              },
            },
            required: [
              'part_type',
              'system',
              'category',
              'cross_reference_numbers',
              'machinery_compatibility',
              'confidence_scores',
            ],
          };

    const result = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [prompt, ...imageParts],
      config: {
        responseMimeType: 'application/json',
        responseSchema: validationSchema,
      },
    });

    const responseText = result.text;
    if (!responseText) {
      return NextResponse.json({ error: 'Gemini returned an empty response.' }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error('Gemini Scan Error:', error);
    return NextResponse.json({ error: 'Failed to identify auto part.' }, { status: 500 });
  }
}
