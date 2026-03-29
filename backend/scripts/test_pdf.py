from fpdf import FPDF
import datetime

try:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(200, 10, txt="Welcome to NeuroCare", ln=1, align="C")
    pdf.cell(200, 10, txt="This is a test PDF generated on " + str(datetime.datetime.now()), ln=1, align="C")
    pdf.output("d:/neuro/neurocare/backend/reports/pdf/test_output.pdf")
    print("PDF generated successfully")
except Exception as e:
    print(f"Error: {e}")
