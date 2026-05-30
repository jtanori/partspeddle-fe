import { AIAnalysisResult } from '../types';

/**
 * Service to interface with the Gemini AI vision pipeline.
 * In a real production app, this would call a server-side API route
 * that handles the Google GenAI SDK and API key securely.
 */
export const analyzeListingImage = async (imageFile: File, mode: 'vehicle' | 'component'): Promise<AIAnalysisResult> => {
    console.log(`🚀 Initiating ${mode} analysis...`);

    // Simulate API call to Gemini model
    return new Promise((resolve) => {
        setTimeout(() => {
            if (mode === 'vehicle') {
                resolve({
                    is_valid_vehicle: true,
                    completeness_grade: 'A',
                    vehicle_metrics: {
                        year: 1987,
                        make: 'Ford',
                        model: 'F-150',
                        vin: null
                    },
                    inferred_manifest: [
                        { system: 'Powertrain', part_type: 'Alternator', estimated_integrity: 'Excellent' }
                    ]
                });
            } else {
                resolve({
                    part_type: 'Alternator',
                    system: 'Electrical System',
                    category: 'Charging & Starting',
                    oem_part_number: '123-ABC-789',
                    cross_reference_numbers: ['ALT-999'],
                    machinery_compatibility: ['Ford F-Series', 'Commercial Trucks'],
                    confidence_scores: {
                        part_type_accuracy: 0.95,
                        fitment_accuracy: 0.88,
                        number_extraction_accuracy: 0.92
                    }
                });
            }
        }, 2000);
    });
};
