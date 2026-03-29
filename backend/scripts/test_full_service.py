import sys
import os
import logging
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.FPDFService import FPDFService

# Setup logging
logging.basicConfig(level=logging.INFO)

try:
    service = FPDFService()
    
    # Dummy data
    report_data = {
        'analysis_id': 'test-123',
        'patient_info': {'name': 'John Doe', 'id': 'P-123', 'age': '30', 'gender': 'Male'},
        'prediction': {
            'predicted_class': 'Normal',
            'confidence': 0.99,
            'disease_info': {'description': 'Healthy'},
            'recommendations': ['Sleep well']
        },
        'doctor_comments': {'notes': 'All good'},
        'heatmap_image': None
    }
    
    pdf_path = service.generate_pdf_report(report_data)
    print(f"SUCCESS: PDF created at {pdf_path}")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
