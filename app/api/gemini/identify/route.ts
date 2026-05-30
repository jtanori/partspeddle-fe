import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client securely via backend environment keys
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define the structural validation schema for Mode A (Vehicle-Level Asset Ingestion)
const vehicleSchema = {
  type: "object",
  properties: {
    is_valid_vehicle: { 
      type: "boolean", 
      description: "True if an automobile, light truck, commercial vehicle frame, or agricultural machinery chassis is identified." 
    },
    completeness_grade: { 
      type: "string", 
      enum: ["A", "B", "C", "D", "F"],
      description: "Grade reflecting the overall remaining structural integrity and present body panels of the donor vehicle frame." 
    },
    vehicle_metrics: {
      type: "object",
      properties: {
        year: { type: "integer" },
        make: { type: "string" },
        model: { type: "string" },
        vin: { type: "string", nullable: true, description: "Extracted VIN string from windshield plate or door jamb stamps if legible." }
      },
      required: ["year", "make", "model"]
    },
    inferred_manifest: {
      type: "array",
      description: "A baseline structural manifest list of major high-value components projected to be salvageable based on visual evaluation.",
      items: {
        type: "object",
        properties: {
          system: { type: "string", description: "e.g., Powertrain, Electrical System, Body Panels, Cooling System" },
          part_type: { type: "string", description: "e.g., Alternator, Steering Column, Radiator, Front Fender" },
          estimated_integrity: { type: "string", enum: ["Excellent", "Used OEM", "Damaged"] }
        },
        required: ["system", "part_type", "estimated_integrity"]
      }
    }
  },
  required: ["is_valid_vehicle", "completeness_grade", "vehicle_metrics", "inferred_manifest"]
};

// Define the structural validation schema for Mode B (Single-Component Ingestion)
const componentSchema = {
  type: "object",
  properties: {
    part_type: { type: "string", description: "The core localized part classification, e.g., Hydraulic Pump, Starter Motor, Brake Caliper." },
    system: { type: "string", description: "The higher structural system grouping, e.g., Powertrain, Brake System, Suspension." },
    category: { type: "string", description: "Marketplace taxonomy sorting group." },
    oem_part_number: { type: "string", nullable: true, description: "Clean string of any extracted casting marks, stamps, or sticker item numbers." },
    cross_reference_numbers: {
      type: "array",
      items: { type: "string" },
      description: "Alternative standard catalog interchange markers derived from the part shape."
    },
    machinery_compatibility: {
      type: "array",
      items: { type: "string" },
      description: "List of vehicles, truck line variants, or farm/agricultural machinery frames where this item can be cross-bolted."
    },
    confidence_scores: {
      type: "object",
      properties: {
        part_type_accuracy: { type: "number", description: "Floating value between 0.00 and 1.00 indicating visual certainty." },
        fitment_accuracy: { type: "number", description: "Floating value between 0.00 and 1.00 indicating catalog application match trust." },
        number_extraction_accuracy: { type: "number", description: "Floating value between 0.00 and 1.00 reflecting optical reading confidence." }
      },
      required: ["part_type_accuracy", "fitment_accuracy", "number_extraction_accuracy"]
    }
  },
  required: ["part_type", "system", "category", "cross_reference_numbers", "machinery_compatibility", "confidence_scores"]
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY credential parameter.' }, { status: 500 });
    }

    // Read incoming multi-part raw streams from web API runtime context directly into memory
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const mode = formData.get('mode') as 'vehicle' | 'component' | null;

    if (!imageFile || !mode) {
      return NextResponse.json({ error: 'Missing mandatory request fields: image or intake mode.' }, { status: 400 });
    }

    // Extract binary array sequence directly to memory buffers safely for Fly.io execution
    const bytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    // Structure image asset block payload matching Gemini requirements
    const genAiImageContent = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    };

    let prompt = '';
    let validationSchema;

    // Tailor processing configurations based on user entry pipeline choices
    if (mode === 'vehicle') {
      prompt = `Analyze this automotive yard asset image. Classify the vehicle model framework, determine overall body completeness grading, read legible badging or VIN strings, and predict system component availability based on structural damage visibility.`;
      validationSchema = vehicleSchema;
    } else {
      prompt = `Perform macro object analysis on this isolated component. Determine structural part category classification, extract engineering numbers/stamps, and output compatibility application arrays for automotive or industrial machinery.`;
      validationSchema = componentSchema;
    }

    // Use fast gemini-2.0-flash for field operations processing
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: validationSchema as any,
      }
    });

    const result = await model.generateContent([prompt, genAiImageContent]);
    const textOutput = result.response.text();

    return NextResponse.json(JSON.parse(textOutput));

  } catch (error: any) {
    console.error('❌ Ingestion Processing failure:', error);
    return NextResponse.json({ error: error.message || 'Internal pipeline processing breakdown.' }, { status: 500 });
  }
}
