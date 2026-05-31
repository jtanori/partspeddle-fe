import { AIAnalysisResult } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Service to interface with the secure Next.js API route handler for Gemini vision pipeline.
 */
export const analyzeListingImage = async (imageFile: File, mode: 'vehicle' | 'component'): Promise<AIAnalysisResult> => {
    console.log(`🚀 Initiating secure AI analysis for ${mode}...`);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session for AI analysis.');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mode', mode);

    const response = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('AI analysis pipeline failed.');
    }

    return response.json();
};
