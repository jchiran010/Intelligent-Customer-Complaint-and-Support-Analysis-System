# report_service.py: Exporters for CSV and PDF summaries
import io
import csv
from datetime import datetime

def generate_csv_report(data):
    """
    Generates a CSV report from database complaint records.
    Returns a bytes buffer of the CSV.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        'Ticket ID', 'Customer Name', 'Customer Email', 'Category', 
        'Subject', 'Priority', 'Status', 'CSAT Rating', 'Feedback Comments', 
        'Resolved Date', 'Submitted Date'
    ])
    
    for row in data:
        writer.writerow([
            row.get('ticket_id'),
            row.get('user_name'),
            row.get('user_email'),
            row.get('category_name'),
            row.get('title'),
            row.get('priority').capitalize() if row.get('priority') else '',
            row.get('status').replace('_', ' ').capitalize() if row.get('status') else '',
            row.get('feedback_rating') or 'N/A',
            row.get('feedback_comments') or '',
            row.get('resolved_at') or 'N/A',
            row.get('created_at')
        ])
    
    buffer = io.BytesIO()
    buffer.write(output.getvalue().encode('utf-8'))
    buffer.seek(0)
    return buffer

def generate_pdf_report(data, stats):
    """
    Generates a professional PDF report from complaint records and summary statistics.
    Returns a bytes buffer of the PDF.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
    except ImportError:
        # Fallback if ReportLab is not available
        buffer = io.BytesIO()
        buffer.write(b"ReportLab library not installed. Cannot generate PDF.")
        buffer.seek(0)
        return buffer

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=36, 
        leftMargin=36, 
        topMargin=36, 
        bottomMargin=36
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_navy = colors.HexColor('#0F172A')
    c_blue = colors.HexColor('#1E3A8A')
    c_primary = colors.HexColor('#2563EB')
    c_light = colors.HexColor('#F8FAFC')
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_navy,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_blue,
        spaceBefore=10,
        spaceAfter=10
    )
    
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10
    )
    
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10
    )

    # Document Header
    story.append(Paragraph("Customer Support & Complaint Analysis Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Scope: System Summary", subtitle_style))
    
    # KPI Grid - Summary Statistics
    story.append(Paragraph("System Key Performance Indicators (KPIs)", section_heading))
    
    stats_data = [
        [
            Paragraph("<b>Total Complaints:</b>", cell_style), Paragraph(str(stats.get('total', 0)), cell_bold),
            Paragraph("<b>Resolved Tickets:</b>", cell_style), Paragraph(str(stats.get('resolved', 0)), cell_bold)
        ],
        [
            Paragraph("<b>Pending Tickets:</b>", cell_style), Paragraph(str(stats.get('pending', 0)), cell_bold),
            Paragraph("<b>In Progress:</b>", cell_style), Paragraph(str(stats.get('in_progress', 0)), cell_bold)
        ],
        [
            Paragraph("<b>Critical & High:</b>", cell_style), Paragraph(str(stats.get('high_critical', 0)), cell_bold),
            Paragraph("<b>Avg. CSAT Rating:</b>", cell_style), Paragraph(f"{stats.get('avg_rating', 0.0):.1f} / 5.0", cell_bold)
        ]
    ]
    
    stats_table = Table(stats_data, colWidths=[130, 130, 130, 130])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    
    story.append(stats_table)
    story.append(Spacer(1, 15))
    
    # Complaints List
    story.append(Paragraph("Recent Complaints Details", section_heading))
    
    # Table headers
    comp_headers = [
        Paragraph("<b>Ticket ID</b>", cell_bold),
        Paragraph("<b>Category</b>", cell_bold),
        Paragraph("<b>Subject</b>", cell_bold),
        Paragraph("<b>Priority</b>", cell_bold),
        Paragraph("<b>Status</b>", cell_bold),
        Paragraph("<b>CSAT</b>", cell_bold),
        Paragraph("<b>Date</b>", cell_bold)
    ]
    
    comp_table_data = [comp_headers]
    
    for row in data:
        comp_table_data.append([
            Paragraph(row.get('ticket_id', ''), cell_style),
            Paragraph(row.get('category_name', ''), cell_style),
            Paragraph(row.get('title', '')[:30] + ('...' if len(row.get('title', '')) > 30 else ''), cell_style),
            Paragraph(row.get('priority', '').capitalize(), cell_style),
            Paragraph(row.get('status', '').replace('_', ' ').capitalize(), cell_style),
            Paragraph(str(row.get('feedback_rating') or '-'), cell_style),
            Paragraph(row.get('created_at', '')[:10], cell_style)
        ])
        
    comp_table = Table(comp_table_data, colWidths=[65, 85, 150, 50, 60, 40, 70])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_blue),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        # Alternate backgrounds
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light]),
    ]))
    
    # Set text color of headers in reportlab table
    for i in range(len(comp_headers)):
        comp_headers[i].style.textColor = colors.white
        
    story.append(comp_table)
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
