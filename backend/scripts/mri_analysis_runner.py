#!/usr/bin/env python3
"""
MRI Analysis Runner Script
Command-line interface for running MRI analysis using the deep learning model.
"""

import argparse
import sys
import os
import json
import logging
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

from services.MRIAnalysisService import MRIAnalysisService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def analyze_single_image(image_path: str, patient_id: str = None, notes: str = None):
    """
    Analyze a single MRI image.
    
    Args:
        image_path: Path to the MRI image
        patient_id: Optional patient ID
        notes: Optional notes
        
    Returns:
        Analysis result dictionary
    """
    try:
        # Initialize the MRI analysis service
        service = MRIAnalysisService()
        
        # Perform analysis
        result = service.analyze_mri(image_path, patient_id)
        
        # Generate report
        report = service.generate_report(result)
        result['report'] = report
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"Error analyzing image {image_path}: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def analyze_batch_images(image_paths: list, patient_id: str = None, notes: str = None):
    """
    Analyze multiple MRI images in batch.
    
    Args:
        image_paths: List of image file paths
        patient_id: Optional patient ID
        notes: Optional notes
        
    Returns:
        Batch analysis results
    """
    try:
        # Initialize the MRI analysis service
        service = MRIAnalysisService()
        
        # Perform batch analysis
        results = service.analyze_batch(image_paths, patient_id)
        
        return {
            'success': True,
            'data': results
        }
        
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_model_information():
    """
    Get information about the loaded model.
    
    Returns:
        Model information dictionary
    """
    try:
        # Initialize the MRI analysis service
        service = MRIAnalysisService()
        
        # Get model info
        model_info = service.get_model_info()
        
        return {
            'success': True,
            'data': model_info
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main function to handle command line arguments."""
    parser = argparse.ArgumentParser(description='MRI Analysis Runner')
    
    # Add arguments
    parser.add_argument('--image', type=str, help='Path to MRI image file')
    parser.add_argument('--images', type=str, help='Comma-separated list of image paths for batch processing')
    parser.add_argument('--batch', action='store_true', help='Enable batch processing mode')
    parser.add_argument('--patient-id', type=str, default='', help='Patient ID')
    parser.add_argument('--notes', type=str, default='', help='Additional notes')
    parser.add_argument('--model-info', action='store_true', help='Get model information')
    parser.add_argument('--output', type=str, help='Output file path for results')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        result = None
        
        if args.model_info:
            # Get model information
            result = get_model_information()
            
        elif args.batch and args.images:
            # Batch processing
            image_paths = [path.strip() for path in args.images.split(',')]
            result = analyze_batch_images(image_paths, args.patient_id, args.notes)
            
        elif args.image:
            # Single image processing
            result = analyze_single_image(args.image, args.patient_id, args.notes)
            
        else:
            parser.print_help()
            sys.exit(1)
        
        # Output result
        if result:
            if args.output:
                # Save to file
                with open(args.output, 'w') as f:
                    json.dump(result, f, indent=2)
                logger.info(f"Result saved to {args.output}")
            else:
                # Print to stdout
                print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result['success'] else 1)
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        error_result = {
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()

