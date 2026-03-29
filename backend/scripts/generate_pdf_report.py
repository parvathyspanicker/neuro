#!/usr/bin/env python3
"""
PDF Report Generation Script
Called by the Node.js API to generate professional PDF reports.
"""

import sys
import json
import argparse
import logging
from pathlib import Path

# Add the parent directory to the path to import services
sys.path.append(str(Path(__file__).parent.parent))

from services.FPDFService import get_fpdf_service
from services.MRIAnalysisService import get_mri_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main function to generate PDF report."""
    parser = argparse.ArgumentParser(description='Generate PDF report for MRI analysis')
    parser.add_argument('--data-file', required=True, help='Path to JSON file containing report data')
    
    args = parser.parse_args()
    
    try:
        # Load data from file
        with open(args.data_file, 'r') as f:
            report_data = json.load(f)
            
        logger.info(f"Generating PDF report for analysis ID: {report_data.get('analysis_id')}")
        
        # Get services
        pdf_service = get_fpdf_service()
        
        # Generate PDF report
        pdf_path = pdf_service.generate_pdf_report(report_data)
        
        # Return success result
        result = {
            'success': True,
            'pdf_path': pdf_path,
            'analysis_id': report_data.get('analysis_id'),
            'user_id': report_data.get('patient_info', {}).get('id')
        }
        
        print(json.dumps(result))
        logger.info(f"PDF report generated successfully: {pdf_path}")
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {e}")
        result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(result))
        sys.exit(1)

def load_analysis_result(analysis_id):
    """
    Load analysis result by ID.
    In a real implementation, this would load from a database.
    For demo purposes, we'll create a sample result.
    """
    try:
        # This is a demo implementation
        # In production, you would load from a database or cache
        sample_result = {
            'analysis_id': analysis_id,
            'timestamp': '2025-10-21T08:00:00Z',
            'prediction': {
                'predicted_class': 'Normal Brain Scan',
                'confidence': 0.95,
                'stage': 'Normal',
                'status': 'HEALTHY',
                'status_icon': '✅',
                'status_color': '#28a745',
                'severity': 'None',
                'disease_info': {
                    'description': 'Normal brain anatomy with no pathological findings detected. All brain structures appear within normal limits.',
                    'clinical_findings': 'No evidence of mass lesions, hemorrhage, infarction, or other abnormal findings',
                    'prognosis': 'Excellent',
                    'stages': ['Normal'],
                    'brain_regions': ['All regions normal'],
                    'severity': 'None',
                    'treatment': ['No treatment required'],
                    'prognosis': 'Excellent'
                },
                'all_predictions': [
                    {'class': 'Normal Brain Scan', 'confidence': 0.95, 'index': 3, 'status': 'Normal'},
                    {'class': 'Glioma (Primary Brain Tumor)', 'confidence': 0.03, 'index': 2, 'status': 'Low Risk'},
                    {'class': 'Meningioma', 'confidence': 0.01, 'index': 0, 'status': 'Very Low Risk'},
                    {'class': 'Pituitary Adenoma', 'confidence': 0.01, 'index': 1, 'status': 'Very Low Risk'}
                ],
                'recommendations': [
                    'Continue routine health monitoring',
                    'Maintain healthy lifestyle habits including regular exercise',
                    'Schedule annual neurological examination',
                    'Consider follow-up MRI in 2-3 years as per physician discretion'
                ],
                'next_steps': [
                    'Continue current health regimen',
                    'Schedule routine annual physical examination',
                    'Maintain brain-healthy lifestyle choices'
                ],
                'patient_instructions': [
                    'No immediate medical intervention required',
                    'Continue all current medications as prescribed',
                    'Contact healthcare provider if any new neurological symptoms develop'
                ],
                'brain_regions_affected': ['All regions normal'],
                'treatment_options': ['No treatment required, Regular follow-up as needed']
            },
            'features': {
                'mean_intensity': 0.3406,
                'std_intensity': 0.2454,
                'texture_energy': 8842.43,
                'histogram_entropy': -429480.5185
            },
            'model_info': {
                'primary_model_path': 'models/trained_models/mri_cnn_model.keras',
                'primary_input_shape': [224, 224, 3],
                'primary_num_classes': 4,
                'primary_class_names': ['meningioma', 'pituitary', 'glioma', 'normal']
            }
        }
        
        return sample_result
        
    except Exception as e:
        logger.error(f"Error loading analysis result: {e}")
        return None

if __name__ == '__main__':
    main()
