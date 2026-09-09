# report_routes.py: Compilation and download of PDF and CSV reports
from flask import Blueprint, request, send_file, session, redirect, url_for, flash
from backend.middleware.auth_middleware import login_required, admin_required
from backend.utils.db_helper import query_db, get_db_connection
from backend.services.report_service import generate_csv_report, generate_pdf_report
import io

report_bp = Blueprint('report', __name__, url_prefix='/report')

@report_bp.route('/admin/export')
@admin_required
def admin_export():
    file_format = request.args.get('format', 'csv').lower()
    category = request.args.get('category', '')
    priority = request.args.get('priority', '')
    status = request.args.get('status', '')
    
    # Base Query
    query = """
        SELECT c.*, u.name as user_name, u.email as user_email, cat.name_en as category_name
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE 1=1
    """
    params = []
    
    if category:
        query += " AND c.category_id = ?"
        params.append(category)
    if priority:
        query += " AND c.priority = ?"
        params.append(priority)
    if status:
        query += " AND c.status = ?"
        params.append(status)
        
    query += " ORDER BY c.created_at DESC"
    data = query_db(query, params)
    
    if file_format == 'pdf':
        # Compile summary stats for PDF header
        total = len(data)
        resolved = sum(1 for c in data if c['status'] == 'resolved')
        pending = sum(1 for c in data if c['status'] == 'pending')
        in_progress = sum(1 for c in data if c['status'] == 'in_progress')
        high_critical = sum(1 for c in data if c['priority'] in ['high', 'critical'])
        
        ratings = [c['feedback_rating'] for c in data if c['feedback_rating'] is not None]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
        
        stats = {
            'total': total,
            'resolved': resolved,
            'pending': pending,
            'in_progress': in_progress,
            'high_critical': high_critical,
            'avg_rating': avg_rating
        }
        
        pdf_buffer = generate_pdf_report(data, stats)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"Support_Report_Admin_{session.get('user_id')}.pdf"
        )
    else:
        # Default to CSV
        csv_buffer = generate_csv_report(data)
        return send_file(
            csv_buffer,
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"Support_Report_Admin_{session.get('user_id')}.csv"
        )

@report_bp.route('/user/ticket/<int:complaint_id>/pdf')
@login_required
def user_export_ticket(complaint_id):
    user_id = session['user_id']
    
    # Load complaint details
    complaint = query_db("""
        SELECT c.*, u.name as user_name, u.email as user_email, cat.name_en as category_name
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = ?
    """, (complaint_id,), one=True)
    
    if not complaint:
        flash("Complaint not found.", 'danger')
        return redirect(url_for('user.dashboard'))
        
    # User restriction check
    if session.get('role') != 'admin' and complaint['user_id'] != user_id:
        flash("Unauthorized access.", 'danger')
        return redirect(url_for('user.dashboard'))
        
    # Format single complaint into the structure report_service expects
    data = [complaint]
    
    stats = {
        'total': 1,
        'resolved': 1 if complaint['status'] == 'resolved' else 0,
        'pending': 1 if complaint['status'] == 'pending' else 0,
        'in_progress': 1 if complaint['status'] == 'in_progress' else 0,
        'high_critical': 1 if complaint['priority'] in ['high', 'critical'] else 0,
        'avg_rating': complaint['feedback_rating'] or 0.0
    }
    
    pdf_buffer = generate_pdf_report(data, stats)
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"Complaint_Report_{complaint['ticket_id']}.pdf"
    )
