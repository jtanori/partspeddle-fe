import { AIAnalysisResult } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Service to interface with the secure Next.js API route handler for Gemini vision pipeline.
 */
export const analyzeListingImage = async (imageFile: File, mode: 'vehicle' | 'component'): Promise<AIAnalysisResult> => {
    console.log(`🚀 Initiating secure AI analysis for ${mode}...`);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session for AI analysis.');

    const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });

    const response = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image, mode }),
    });


    if (!response.ok) {
        throw new Error('AI analysis pipeline failed.');
    }

    return response.json();
};
