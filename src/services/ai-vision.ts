import { AIAnalysisResult } from '../types';

/**
 * Service to interface with the Gemini AI vision pipeline.
 */
export const analyzeListingImage = async (imageFile: File, mode: 'vehicle' | 'component'): Promise<AIAnalysisResult> => {
    console.log(`🚀 Initiating live AI analysis for ${mode}...`);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mode', mode);

    const response = await fetch('/api/gemini/identify', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('AI analysis pipeline failed.');
    }

    return response.json();
};
