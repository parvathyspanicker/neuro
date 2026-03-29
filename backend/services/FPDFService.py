#!/usr/bin/env python3
"""
Ultra-Simple PDF Report Generation Service using fpdf2.
This creates the most basic, compatible PDF files possible.
"""

import logging
import os
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from fpdf import FPDF

logger = logging.getLogger(__name__)

class FPDFService:
    """Ultra-simple service for generating basic PDF reports using fpdf2."""
    
    def __init__(self):
        """Initialize the fpdf service."""
        self.reports_dir = Path('reports/pdf')
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path('reports/temp')
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_pdf_report(self, report_data: Dict[str, Any]) -> str:
        """
        Generate a comprehensive PDF report from MRI analysis results using fpdf2.
        
        Args:
            report_data: The complete report data dictionary including patient info
            
        Returns:
            Path to the generated PDF file
        """
        try:
            # Extract main data sections
            patient_info = report_data.get('patient_info', {})
            prediction = report_data.get('prediction', {})
            doctor_comments = report_data.get('doctor_comments', {})
            heatmap_url = report_data.get('heatmap_image')
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            analysis_id = report_data.get('analysis_id', 'unknown')[:8]
            filename = f"MRI_Report_{analysis_id}_{timestamp}.pdf"
            filepath = self.reports_dir / filename
            
            logger.info(f"Generating fpdf2 report: {filename}")
            
            # Create PDF with fpdf2
            pdf = FPDF()
            pdf.add_page()
            
            # --- Header ---
            pdf.set_font("Helvetica", "B", 20)
            pdf.cell(0, 10, "NEUROCARE AI", 0, 1, "C")
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, "MRI ANALYSIS REPORT", 0, 1, "C")
            pdf.ln(5)
            
            # Line separator
            pdf.line(10, 35, 200, 35)
            
            # --- Patient & Report Information ---
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 8, "PATIENT DETAILS", 0, 1)
            pdf.set_font("Helvetica", "", 11)
            
            # Patient Info Grid
            pdf.cell(95, 7, f"Name: {patient_info.get('name', 'N/A')}", 0, 0)
            pdf.cell(95, 7, f"Report ID: {analysis_id}", 0, 1)
            
            pdf.cell(95, 7, f"Patient ID: {patient_info.get('id', 'N/A')}", 0, 0)
            pdf.cell(95, 7, f"Date: {datetime.now().strftime('%B %d, %Y')}", 0, 1)
            
            pdf.cell(95, 7, f"Age/Gender: {patient_info.get('age', 'N/A')} / {patient_info.get('gender', 'N/A')}", 0, 0)
            pdf.cell(95, 7, f"Scan Type: {report_data.get('scan_type', 'Brain MRI')}", 0, 1)
            
            pdf.ln(5)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(5)

            # --- Primary Diagnosis ---
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_fill_color(240, 240, 240)
            pdf.cell(0, 10, "  PRIMARY DIAGNOSIS", 0, 1, 'L', True)
            pdf.ln(2)
            
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(40, 8, "Result:", 0, 0)
            pdf.set_font("Helvetica", "B", 12)
            
            # Color code result if possible (text only in standard PDF)
            result_text = prediction.get('predicted_class', 'Unknown')
            pdf.cell(0, 8, result_text, 0, 1)
            
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(40, 7, "Confidence:", 0, 0)
            pdf.cell(0, 7, f"{prediction.get('confidence', 0):.1%}", 0, 1)
            
            pdf.cell(40, 7, "Severity:", 0, 0)
            pdf.cell(0, 7, f"{prediction.get('severity', 'N/A')}", 0, 1)
            
            pdf.cell(40, 7, "Stage:", 0, 0)
            pdf.cell(0, 7, f"{prediction.get('stage', 'N/A')}", 0, 1)
            pdf.ln(5)

            # --- Heatmap Image ---
            if heatmap_url and heatmap_url != 'Unknown':
                pdf.set_font("Helvetica", "B", 14)
                pdf.cell(0, 10, "  MRI HEATMAP ANALYSIS", 0, 1, 'L', True)
                pdf.ln(2)
                
                try:
                    # Download image if it's a URL
                    image_path = None
                    if heatmap_url.startswith('http'):
                        image_filename = f"heatmap_{analysis_id}.jpg"
                        image_path = self.temp_dir / image_filename
                        urllib.request.urlretrieve(heatmap_url, image_path)
                    elif os.path.exists(heatmap_url):
                        image_path = heatmap_url
                        
                    if image_path:
                        # Center the image
                        img_width = 120
                        x_pos = (210 - img_width) / 2
                        pdf.image(str(image_path), x=x_pos, w=img_width)
                        pdf.ln(5)
                        
                        # Clean up temp file if we downloaded it
                        if heatmap_url.startswith('http') and os.path.exists(image_path):
                            os.remove(image_path)
                except Exception as e:
                    logger.error(f"Failed to embed heatmap: {e}")
                    pdf.set_font("Helvetica", "I", 10)
                    pdf.cell(0, 10, "(Heatmap image could not be loaded)", 0, 1, 'C')

            # --- Clinical Findings ---
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "  CLINICAL FINDINGS", 0, 1, 'L', True)
            pdf.ln(2)
            
            pdf.set_font("Helvetica", "", 11)
            disease_info = prediction.get('disease_info', {})
            description = disease_info.get('description', 'No specific description available.')
            pdf.multi_cell(0, 6, description)
            pdf.ln(3)

            # Brain Regions Affected
            regions = prediction.get('brain_regions_affected', [])
            if regions:
                pdf.set_font("Helvetica", "B", 11)
                pdf.cell(0, 7, "Brain Regions Affected:", 0, 1)
                pdf.set_font("Helvetica", "", 11)
                pdf.multi_cell(0, 6, ", ".join(regions))
                pdf.ln(3)

            # --- Doctor's Notes & Recommendations ---
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "  DOCTOR'S NOTES & RECOMMENDATIONS", 0, 1, 'L', True)
            pdf.ln(2)
            
            if doctor_comments:
                notes = doctor_comments.get('notes')
                if notes:
                    pdf.set_font("Helvetica", "B", 11)
                    pdf.cell(0, 7, "Notes:", 0, 1)
                    pdf.set_font("Helvetica", "", 11)
                    pdf.multi_cell(0, 6, notes)
                    pdf.ln(2)
                
                prescription = doctor_comments.get('prescription')
                if prescription:
                    pdf.set_font("Helvetica", "B", 11)
                    pdf.cell(0, 7, "Prescription / Treatment Plan:", 0, 1)
                    pdf.set_font("Helvetica", "", 11)
                    pdf.multi_cell(0, 6, prescription)
                    pdf.ln(2)

            # Standard Recommendations
            recommendations = prediction.get('recommendations', [])
            if recommendations:
                pdf.set_font("Helvetica", "B", 11)
                pdf.cell(0, 7, "General Recommendations:", 0, 1)
                pdf.set_font("Helvetica", "", 11)
                for rec in recommendations:
                    pdf.cell(5, 6, "-", 0, 0)
                    pdf.multi_cell(0, 6, rec)
            
            pdf.ln(10)
            
            # --- Disclaimer ---
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(0, 6, "DISCLAIMER", 0, 1)
            pdf.set_font("Helvetica", "I", 9)
            disclaimer = ("This AI-generated report is for screening assistance only. "
                         "It does NOT constitute a final medical diagnosis. "
                         "Please consult a certified neurologist or radiologist for validation.")
            pdf.multi_cell(0, 5, disclaimer)
            
            # --- Footer ---
            pdf.set_y(-20)
            pdf.set_font("Helvetica", "I", 8)
            pdf.cell(0, 10, f"Generated by NeuroCare AI on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 0, 'C')

            # Save PDF
            pdf.output(str(filepath))
            
            logger.info(f"fpdf2 report generated successfully: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Error generating fpdf2 report: {e}")
            raise

# Global service instance
_fpdf_service = None

def get_fpdf_service() -> FPDFService:
    """Get or create the global fpdf service instance."""
    global _fpdf_service
    if _fpdf_service is None:
        _fpdf_service = FPDFService()
    return _fpdf_service
