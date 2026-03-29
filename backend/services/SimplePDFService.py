#!/usr/bin/env python3
"""
Simplified PDF Report Generation Service for MRI Analysis Results.
Creates clean, simple PDF reports that are guaranteed to open correctly.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

logger = logging.getLogger(__name__)

class SimplePDFService:
    """Simplified service for generating clean PDF reports."""
    
    def __init__(self):
        """Initialize the simple PDF service."""
        self.reports_dir = Path('reports/pdf')
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_pdf_report(self, analysis_result: Dict[str, Any], patient_info: Optional[Dict] = None) -> str:
        """
        Generate a simple, clean PDF report from MRI analysis results.
        
        Args:
            analysis_result: The MRI analysis result dictionary
            patient_info: Optional patient information dictionary
            
        Returns:
            Path to the generated PDF file
        """
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            analysis_id = analysis_result.get('analysis_id', 'unknown')[:8]
            filename = f"MRI_Report_{analysis_id}_{timestamp}.pdf"
            filepath = self.reports_dir / filename
            
            logger.info(f"Generating simple PDF report: {filename}")
            
            # Create PDF document with simple settings
            doc = SimpleDocTemplate(
                str(filepath),
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Get styles
            styles = getSampleStyleSheet()
            
            # Build the report content
            story = []
            
            # Title
            title = Paragraph("NEUROCARE AI MRI ANALYSIS REPORT", styles['Title'])
            story.append(title)
            story.append(Spacer(1, 20))
            
            # Report information
            timestamp = datetime.fromisoformat(analysis_result['timestamp'].replace('Z', '+00:00'))
            formatted_time = timestamp.strftime('%B %d, %Y at %I:%M %p')
            
            info_text = f"""
            <b>Report ID:</b> {analysis_result.get('analysis_id', 'N/A')}<br/>
            <b>Patient ID:</b> {patient_info.get('patient_id', 'N/A') if patient_info else 'N/A'}<br/>
            <b>Date & Time:</b> {formatted_time}<br/>
            <b>Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
            """
            info_para = Paragraph(info_text, styles['Normal'])
            story.append(info_para)
            story.append(Spacer(1, 20))
            
            # Diagnosis section
            prediction = analysis_result['prediction']
            
            diagnosis_title = Paragraph("DIAGNOSIS", styles['Heading2'])
            story.append(diagnosis_title)
            
            diagnosis_text = f"""
            <b>Primary Finding:</b> {prediction['predicted_class']}<br/>
            <b>Confidence Level:</b> {prediction['confidence']:.1%}<br/>
            <b>Clinical Status:</b> {prediction.get('status', 'N/A')}<br/>
            <b>Disease Stage:</b> {prediction.get('stage', 'N/A')}<br/>
            <b>Severity Level:</b> {prediction.get('severity', 'N/A')}
            """
            diagnosis_para = Paragraph(diagnosis_text, styles['Normal'])
            story.append(diagnosis_para)
            story.append(Spacer(1, 20))
            
            # Clinical findings
            findings_title = Paragraph("CLINICAL FINDINGS", styles['Heading2'])
            story.append(findings_title)
            
            disease_info = prediction['disease_info']
            findings_text = f"""
            <b>Description:</b> {disease_info['description']}<br/><br/>
            <b>Prognosis:</b> {disease_info.get('prognosis', 'N/A')}
            """
            findings_para = Paragraph(findings_text, styles['Normal'])
            story.append(findings_para)
            story.append(Spacer(1, 20))
            
            # All predictions
            predictions_title = Paragraph("ALL PREDICTIONS", styles['Heading2'])
            story.append(predictions_title)
            
            predictions_text = ""
            for i, pred in enumerate(prediction['all_predictions'][:4], 1):
                predictions_text += f"{i}. <b>{pred['class']}</b> - {pred['confidence']:.1%}<br/>"
            
            predictions_para = Paragraph(predictions_text, styles['Normal'])
            story.append(predictions_para)
            story.append(Spacer(1, 20))
            
            # Recommendations
            recommendations_title = Paragraph("CLINICAL RECOMMENDATIONS", styles['Heading2'])
            story.append(recommendations_title)
            
            recommendations_text = ""
            for i, rec in enumerate(prediction.get('recommendations', [])[:6], 1):
                recommendations_text += f"{i}. {rec}<br/>"
            
            recommendations_para = Paragraph(recommendations_text, styles['Normal'])
            story.append(recommendations_para)
            story.append(Spacer(1, 20))
            
            # Technical details
            tech_title = Paragraph("TECHNICAL DETAILS", styles['Heading2'])
            story.append(tech_title)
            
            features = analysis_result['features']
            tech_text = f"""
            <b>Mean Intensity:</b> {features['mean_intensity']:.4f}<br/>
            <b>Texture Energy:</b> {features['texture_energy']:.2f}<br/>
            <b>Standard Deviation:</b> {features['std_intensity']:.4f}<br/>
            <b>Histogram Entropy:</b> {features['histogram_entropy']:.4f}
            """
            tech_para = Paragraph(tech_text, styles['Normal'])
            story.append(tech_para)
            story.append(Spacer(1, 20))
            
            # Important notice
            notice_title = Paragraph("IMPORTANT NOTICE", styles['Heading2'])
            story.append(notice_title)
            
            notice_text = """
            This AI analysis is for screening purposes only and should not replace professional medical diagnosis. 
            Please consult with a qualified physician for proper medical evaluation and treatment planning.<br/><br/>
            This report was generated using advanced deep learning algorithms trained on thousands of medical images. 
            Accuracy may vary based on image quality and individual patient characteristics.
            """
            notice_para = Paragraph(notice_text, styles['Normal'])
            story.append(notice_para)
            story.append(Spacer(1, 20))
            
            # Footer
            footer_text = "Generated by NeuroCare AI • Powered by Advanced Machine Learning"
            footer_para = Paragraph(footer_text, styles['Normal'])
            story.append(footer_para)
            
            # Build PDF with simple approach
            doc.build(story)
            
            logger.info(f"Simple PDF report generated successfully: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Error generating simple PDF report: {e}")
            raise

# Global service instance
_simple_pdf_service = None

def get_simple_pdf_service() -> SimplePDFService:
    """Get or create the global simple PDF service instance."""
    global _simple_pdf_service
    if _simple_pdf_service is None:
        _simple_pdf_service = SimplePDFService()
    return _simple_pdf_service

