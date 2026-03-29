#!/usr/bin/env python3
"""
Professional PDF Report Generation Service for MRI Analysis Results.
Generates hospital-grade PDF reports with professional formatting.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.platypus import Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

logger = logging.getLogger(__name__)

class PDFReportService:
    """Service for generating professional PDF reports from MRI analysis results."""
    
    def __init__(self):
        """Initialize the PDF report service."""
        self.reports_dir = Path('reports/pdf')
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
        # Professional color scheme
        self.colors = {
            'primary': HexColor('#2c3e50'),      # Dark blue-gray
            'secondary': HexColor('#3498db'),    # Blue
            'success': HexColor('#27ae60'),      # Green
            'warning': HexColor('#f39c12'),      # Orange
            'danger': HexColor('#e74c3c'),       # Red
            'info': HexColor('#17a2b8'),         # Cyan
            'light': HexColor('#ecf0f1'),        # Light gray
            'dark': HexColor('#2c3e50'),         # Dark gray
            'white': HexColor('#ffffff'),        # White
            'text': HexColor('#2c3e50'),         # Dark text
            'muted': HexColor('#7f8c8d')         # Muted text
        }
        
        # Initialize styles
        self.styles = self._create_styles()
        
    def _create_styles(self):
        """Create professional paragraph styles for the PDF."""
        styles = getSampleStyleSheet()
        
        # Title style
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=self.colors['secondary'],
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=12,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold'
        ))
        
        # Body text style
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            textColor=self.colors['text'],
            fontName='Helvetica',
            alignment=TA_JUSTIFY
        ))
        
        # Status style
        styles.add(ParagraphStyle(
            name='StatusText',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            textColor=self.colors['white'],
            fontName='Helvetica-Bold',
            alignment=TA_CENTER
        ))
        
        # Footer style
        styles.add(ParagraphStyle(
            name='FooterText',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.colors['muted'],
            fontName='Helvetica',
            alignment=TA_CENTER
        ))
        
        return styles
    
    def generate_pdf_report(self, analysis_result: Dict[str, Any], patient_info: Optional[Dict] = None) -> str:
        """
        Generate a professional PDF report from MRI analysis results.
        
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
            
            logger.info(f"Generating PDF report: {filename}")
            
            # Create PDF document
            doc = SimpleDocTemplate(
                str(filepath),
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build the report content
            story = []
            
            # Add header
            story.extend(self._create_header(analysis_result, patient_info))
            
            # Add diagnosis section
            story.extend(self._create_diagnosis_section(analysis_result))
            
            # Add clinical findings section
            story.extend(self._create_clinical_findings_section(analysis_result))
            
            # Add predictions section
            story.extend(self._create_predictions_section(analysis_result))
            
            # Add recommendations section
            story.extend(self._create_recommendations_section(analysis_result))
            
            # Add technical details section
            story.extend(self._create_technical_details_section(analysis_result))
            
            # Add footer
            story.extend(self._create_footer())
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF report generated successfully: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {e}")
            raise
    
    def _create_header(self, analysis_result: Dict, patient_info: Optional[Dict]) -> list:
        """Create the PDF header section."""
        elements = []
        
        # Title
        title = Paragraph("🏥 NEUROCARE AI MRI ANALYSIS REPORT", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 20))
        
        # Subtitle
        subtitle = Paragraph("Advanced Deep Learning Medical Imaging Analysis", self.styles['CustomSubtitle'])
        elements.append(subtitle)
        elements.append(Spacer(1, 30))
        
        # Report information table
        timestamp = datetime.fromisoformat(analysis_result['timestamp'].replace('Z', '+00:00'))
        formatted_time = timestamp.strftime('%B %d, %Y at %I:%M %p')
        
        report_data = [
            ['Report ID:', analysis_result.get('analysis_id', 'N/A')],
            ['Patient ID:', patient_info.get('patient_id', 'N/A') if patient_info else 'N/A'],
            ['Date & Time:', formatted_time],
            ['AI Model Version:', 'NeuroCare AI v2.1'],
            ['Report Generated:', datetime.now().strftime('%B %d, %Y at %I:%M %p')]
        ]
        
        report_table = Table(report_data, colWidths=[2*inch, 4*inch])
        report_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.colors['light']),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), self.colors['white']),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['muted'])
        ]))
        
        elements.append(report_table)
        elements.append(Spacer(1, 30))
        
        return elements
    
    def _create_diagnosis_section(self, analysis_result: Dict) -> list:
        """Create the diagnosis section."""
        elements = []
        
        # Section header
        header = Paragraph("DIAGNOSIS", self.styles['SectionHeader'])
        elements.append(header)
        
        prediction = analysis_result['prediction']
        status_icon = prediction.get('status_icon', '🔍')
        status = prediction.get('status', 'UNDER REVIEW')
        status_color = self._get_status_color(prediction.get('status_color', '#6c757d'))
        
        # Diagnosis table
        diagnosis_data = [
            ['Primary Finding:', f"{status_icon} {prediction['predicted_class']}"],
            ['Confidence Level:', f"{prediction['confidence']:.1%} ({self._get_confidence_level(prediction['confidence'])})"],
            ['Clinical Status:', f"<font color='{status_color}'>{status}</font>"],
            ['Disease Stage:', prediction.get('stage', 'N/A')],
            ['Severity Level:', prediction.get('severity', 'N/A')]
        ]
        
        diagnosis_table = Table(diagnosis_data, colWidths=[2*inch, 4*inch])
        diagnosis_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.colors['light']),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (1, 0), (1, -1), self.colors['white']),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['muted'])
        ]))
        
        elements.append(diagnosis_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_clinical_findings_section(self, analysis_result: Dict) -> list:
        """Create the clinical findings section."""
        elements = []
        
        # Section header
        header = Paragraph("CLINICAL FINDINGS", self.styles['SectionHeader'])
        elements.append(header)
        
        prediction = analysis_result['prediction']
        disease_info = prediction['disease_info']
        
        # Clinical findings content
        description = Paragraph(f"<b>Description:</b> {disease_info['description']}", self.styles['CustomBody'])
        elements.append(description)
        elements.append(Spacer(1, 12))
        
        if 'clinical_findings' in disease_info:
            findings = Paragraph(f"<b>Clinical Observations:</b> {disease_info['clinical_findings']}", self.styles['CustomBody'])
            elements.append(findings)
            elements.append(Spacer(1, 12))
        
        if 'prognosis' in disease_info:
            prognosis = Paragraph(f"<b>Prognosis:</b> {disease_info['prognosis']}", self.styles['CustomBody'])
            elements.append(prognosis)
            elements.append(Spacer(1, 12))
        
        # Brain regions affected
        regions = prediction.get('brain_regions_affected', ['N/A'])
        regions_text = Paragraph(f"<b>Brain Regions Affected:</b> {', '.join(regions)}", self.styles['CustomBody'])
        elements.append(regions_text)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_predictions_section(self, analysis_result: Dict) -> list:
        """Create the predictions section."""
        elements = []
        
        # Section header
        header = Paragraph("ALL PREDICTIONS", self.styles['SectionHeader'])
        elements.append(header)
        
        prediction = analysis_result['prediction']
        all_predictions = prediction['all_predictions']
        
        # Predictions table
        predictions_data = [['Rank', 'Diagnosis', 'Confidence', 'Status']]
        
        for i, pred in enumerate(all_predictions[:4], 1):
            status = pred.get('status', '')
            predictions_data.append([
                str(i),
                pred['class'],
                f"{pred['confidence']:.1%}",
                status
            ])
        
        predictions_table = Table(predictions_data, colWidths=[0.5*inch, 3*inch, 1*inch, 1.5*inch])
        predictions_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['white']),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors['white']),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.colors['text']),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['muted'])
        ]))
        
        elements.append(predictions_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_recommendations_section(self, analysis_result: Dict) -> list:
        """Create the recommendations section."""
        elements = []
        
        # Section header
        header = Paragraph("CLINICAL RECOMMENDATIONS", self.styles['SectionHeader'])
        elements.append(header)
        
        prediction = analysis_result['prediction']
        
        # Recommendations
        recommendations = prediction.get('recommendations', [])
        for i, rec in enumerate(recommendations[:6], 1):
            rec_text = Paragraph(f"{i}. {rec}", self.styles['CustomBody'])
            elements.append(rec_text)
            elements.append(Spacer(1, 8))
        
        elements.append(Spacer(1, 12))
        
        # Next steps if available
        if 'next_steps' in prediction:
            next_header = Paragraph("NEXT STEPS", self.styles['SectionHeader'])
            elements.append(next_header)
            
            next_steps = prediction['next_steps']
            for i, step in enumerate(next_steps[:4], 1):
                step_text = Paragraph(f"{i}. {step}", self.styles['CustomBody'])
                elements.append(step_text)
                elements.append(Spacer(1, 8))
            
            elements.append(Spacer(1, 12))
        
        # Patient instructions if available
        if 'patient_instructions' in prediction:
            instructions_header = Paragraph("PATIENT INSTRUCTIONS", self.styles['SectionHeader'])
            elements.append(instructions_header)
            
            instructions = prediction['patient_instructions']
            for i, instruction in enumerate(instructions[:4], 1):
                instruction_text = Paragraph(f"{i}. {instruction}", self.styles['CustomBody'])
                elements.append(instruction_text)
                elements.append(Spacer(1, 8))
            
            elements.append(Spacer(1, 12))
        
        return elements
    
    def _create_technical_details_section(self, analysis_result: Dict) -> list:
        """Create the technical details section."""
        elements = []
        
        # Section header
        header = Paragraph("TECHNICAL DETAILS", self.styles['SectionHeader'])
        elements.append(header)
        
        features = analysis_result['features']
        prediction = analysis_result['prediction']
        
        # Technical details table
        tech_data = [
            ['Mean Intensity:', f"{features['mean_intensity']:.4f}"],
            ['Texture Energy:', f"{features['texture_energy']:.2f}"],
            ['Standard Deviation:', f"{features['std_intensity']:.4f}"],
            ['Histogram Entropy:', f"{features['histogram_entropy']:.4f}"],
            ['Treatment Options:', ', '.join(prediction.get('treatment_options', ['N/A']))]
        ]
        
        tech_table = Table(tech_data, colWidths=[2*inch, 4*inch])
        tech_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.colors['light']),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (1, 0), (1, -1), self.colors['white']),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['muted'])
        ]))
        
        elements.append(tech_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_footer(self) -> list:
        """Create the footer section."""
        elements = []
        
        # Important notice
        notice_header = Paragraph("IMPORTANT NOTICE", self.styles['SectionHeader'])
        elements.append(notice_header)
        
        notice_text = Paragraph(
            "⚠️ This AI analysis is for screening purposes only and should not replace professional medical diagnosis. "
            "Please consult with a qualified physician for proper medical evaluation and treatment planning.<br/><br/>"
            "🔬 This report was generated using advanced deep learning algorithms trained on thousands of medical images. "
            "Accuracy may vary based on image quality and individual patient characteristics.",
            self.styles['CustomBody']
        )
        elements.append(notice_text)
        elements.append(Spacer(1, 20))
        
        # Footer
        footer_text = Paragraph(
            "Generated by NeuroCare AI • Powered by Advanced Machine Learning",
            self.styles['FooterText']
        )
        elements.append(footer_text)
        
        return elements
    
    def _add_page_number(self, canvas_obj, doc):
        """Add page numbers to the PDF."""
        page_num = canvas_obj.getPageNumber()
        text = f"Page {page_num}"
        canvas_obj.setFont('Helvetica', 9)
        canvas_obj.setFillColor(self.colors['muted'])
        canvas_obj.drawRightString(500, 30, text)
    
    def _get_status_color(self, hex_color: str) -> str:
        """Convert hex color to RGB format for PDF."""
        try:
            color = HexColor(hex_color)
            return f"rgb({color.red:.0f}, {color.green:.0f}, {color.blue:.0f})"
        except:
            return hex_color
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get confidence level description."""
        if confidence > 0.8:
            return "High Confidence"
        elif confidence > 0.6:
            return "Moderate Confidence"
        else:
            return "Low Confidence"

# Global service instance
_pdf_service = None

def get_pdf_service() -> PDFReportService:
    """Get or create the global PDF service instance."""
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PDFReportService()
    return _pdf_service
