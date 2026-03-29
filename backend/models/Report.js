const mongoose = require('mongoose');

// Report Schema
const reportSchema = new mongoose.Schema({
    analysis_id: { type: String, required: true },
    scan_date: { type: Date, required: true },
    scan_type: { type: String, default: 'Brain MRI' },
    status: { type: String, default: 'Analyzed' },
    predicted_result: { type: String, required: true },
    confidence: { type: Number, default: 0 },
    disease_info: { type: Object, default: {} },
    stage: { type: String, default: 'Unknown' },
    severity: { type: String, default: 'Unknown' },
    brain_regions_affected: { type: [String], default: [] },
    findings: { type: [Object], default: [] },
    treatment_options: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    next_steps: { type: [String], default: [] },
    patient_instructions: { type: [String], default: [] },
    uploaded_file: { type: String, default: 'Unknown' },
    image_path: { type: String, default: null },
    user_id: { type: String, default: 'guest' },
    doctor_comments: {
        notes: { type: String, default: 'AI analysis completed successfully.' },
        prescription: { type: String, default: 'Consult with your doctor for treatment options.' },
        suggested_tests: { type: [String], default: ['Follow-up MRI in 6 months'] }
    },
    lifestyle_suggestions: {
        exercise: { type: String, default: '30 minutes of moderate exercise daily' },
        diet: { type: String, default: 'Maintain a balanced diet rich in omega-3 fatty acids' },
        posture: { type: String, default: 'Maintain proper posture and take regular breaks' }
    },
    next_appointment: { type: Date, default: null },
    heatmap_image: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
