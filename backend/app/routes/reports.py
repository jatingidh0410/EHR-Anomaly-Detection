"""
Reports Routes - Dynamic PDF Generation
"""
from flask import Blueprint, jsonify, send_file
import logging
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.database import db

logger = logging.getLogger(__name__)
reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/live', methods=['GET'])
def download_live_report():
    """Generate and download a live PDF report"""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        normal_style = styles["Normal"]
        
        elements = []
        
        # 1. Header
        elements.append(Paragraph("EHR Anomaly Detection System - Security Report", title_style))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
        elements.append(Spacer(1, 24))
        
        # 2. System Statistics
        stats = db.get_stats()
        elements.append(Paragraph("System Health Overview", styles["Heading2"]))
        elements.append(Spacer(1, 12))
        
        stats_data = [
            ["Metric", "Value"],
            ["System Status", "Operational"],
            ["Total Threats Detected", str(stats.get('total_threats', 0))],
            ["Threats Today", str(stats.get('threats_today', 0))],
            ["Model Accuracy", f"{stats.get('model_accuracy', 0)*100:.1f}%"],
            ["Avg. Confidence Score", f"{stats.get('avg_confidence', 0)*100:.1f}%"]
        ]
        
        t = Table(stats_data, colWidths=[200, 200])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 24))
        
        # 3. Recent Threats Table
        elements.append(Paragraph("Recent Critical Alerts (Last 10)", styles["Heading2"]))
        elements.append(Spacer(1, 12))
        
        threats = db.get_recent_threats(10)
        if threats:
            threat_data = [["ID", "Time", "Type", "Risk", "Source IP"]]
            for t in threats:
                threat_data.append([
                    str(t.get('id', '')),
                    str(t.get('timestamp', '')[:19]), # Truncate microseconds
                    "THREAT" if t.get('threat_type') == 1 else "Safe",
                    f"{t.get('confidence', 0)*100:.0f}%",
                    t.get('source_ip', 'Unknown')
                ])
                
            t2 = Table(threat_data, colWidths=[40, 140, 80, 60, 120])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
            ]))
            elements.append(t2)
        else:
            elements.append(Paragraph("No recent threats recorded.", normal_style))
            
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'EHR_Security_Report_{datetime.now().strftime("%Y%m%d")}.pdf'
        )
        
    except Exception as e:
        logger.error(f"PDF Generation error: {e}")
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/<report_id>', methods=['GET'])
def download_report(report_id):
    """Legacy endpoint - redirect to live"""
    return download_live_report()
