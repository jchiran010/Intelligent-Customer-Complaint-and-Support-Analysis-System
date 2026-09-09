# complaint_routes.py: Ticket creation, real-time AI scanning, timeline, and feedback rating
import os
import random
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.utils import secure_filename
from backend.middleware.auth_middleware import login_required
from backend.utils.db_helper import query_db, execute_query
from backend.services.intelligent_service import analyze_complaint
from backend.services.translation_service import translate
from backend.utils.email_helper import send_email

complaint_bp = Blueprint('complaint', __name__, url_prefix='/complaint')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'pdf'}

def generate_ticket_id():
    while True:
        num = random.randint(100000, 999999)
        ticket_id = f"TKT-{num}"
        # Check uniqueness
        exists = query_db("SELECT id FROM complaints WHERE ticket_id = ?", (ticket_id,), one=True)
        if not exists:
            return ticket_id

@complaint_bp.route('/submit', methods=['GET', 'POST'])
@login_required
def submit():
    lang = session.get('lang', 'en')
    user_id = session['user_id']
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        category_id = request.form.get('category_id')
        priority = request.form.get('priority', 'medium')

        if not title or not description or not category_id:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('complaint.submit'))

        # File upload logic
        attachment_path = None
        if 'attachment' in request.files:
            file = request.files['attachment']
            if file and file.filename != '':
                if allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Add unique prefix
                    unique_filename = f"{int(datetime.now().timestamp())}_{filename}"
                    
                    # Ensure UPLOAD_FOLDER exists
                    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                    
                    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(save_path)
                    attachment_path = f"uploads/{unique_filename}"
                else:
                    flash("Invalid file format. Allowed formats: PNG, JPG, JPEG, PDF", 'danger')
                    return redirect(url_for('complaint.submit'))

        # Generate ticket details
        ticket_id = generate_ticket_id()
        
        try:
            # Insert complaint
            complaint_id = execute_query(
                """INSERT INTO complaints 
                   (ticket_id, user_id, category_id, title, description, priority, status, attachment_path) 
                   VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)""",
                (ticket_id, user_id, category_id, title, description, priority, attachment_path)
            )

            # Insert initial timeline log
            execute_query(
                """INSERT INTO complaint_timeline 
                   (complaint_id, status, title_en, title_ta, description_en, description_ta, updated_by) 
                   VALUES (?, 'pending', 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', ?, ?, ?)""",
                (
                    complaint_id, 
                    f"Ticket {ticket_id} has been registered in the system.", 
                    f"டிக்கெட் {ticket_id} கணினியில் பதிவு செய்யப்பட்டுள்ளது.", 
                    user_id
                )
            )

            # Create notification for User
            execute_query(
                """INSERT INTO notifications 
                   (user_id, title_en, title_ta, message_en, message_ta, type) 
                   VALUES (?, 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', ?, ?, 'ticket_created')""",
                (
                    user_id, 
                    f"Your complaint has been submitted successfully. Ticket ID is {ticket_id}.", 
                    f"உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. டிக்கெட் ஐடி {ticket_id} ஆகும்.",
                )
            )

            # Email user
            subject = f"Complaint Submitted - {ticket_id}" if lang == 'en' else f"புகார் சமர்ப்பிக்கப்பட்டது - {ticket_id}"
            body_html = f"""
            <h3>Hello {session['name']},</h3>
            <p>Your complaint has been registered with Ticket ID <b>{ticket_id}</b>.</p>
            <p><b>Subject:</b> {title}</p>
            <p><b>Description:</b> {description}</p>
            <p>Our support team will review it shortly.</p>
            """
            send_email(session['email'], subject, body_html, f"Ticket {ticket_id} has been submitted successfully.")

            flash(f"Complaint submitted successfully! Ticket ID: {ticket_id}", 'success')
            return redirect(url_for('complaint.my_complaints'))
        except Exception as e:
            flash(f"Error submitting complaint: {str(e)}", 'danger')

    categories = query_db("SELECT * FROM categories ORDER BY id ASC")
    return render_template('user/submit_complaint.html', categories=categories)

@complaint_bp.route('/my-complaints')
@login_required
def my_complaints():
    user_id = session['user_id']
    complaints_list = query_db("""
        SELECT c.*, cat.name_en as cat_en, cat.name_ta as cat_ta
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    """, (user_id,))
    return render_template('user/my_complaints.html', complaints=complaints_list)

@complaint_bp.route('/list')
@login_required
def list_all():
    # Route for admin to view complaints
    if session.get('role') != 'admin':
        return redirect(url_for('complaint.my_complaints'))

    # Load categories for filters
    categories = query_db("SELECT * FROM categories ORDER BY id ASC")

    # Fetch variables for filtering
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '')
    priority = request.args.get('priority', '')
    status = request.args.get('status', '')

    query = """
        SELECT c.*, u.name as user_name, u.email as user_email, cat.name_en as cat_en, cat.name_ta as cat_ta
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (c.ticket_id LIKE ? OR u.name LIKE ? OR c.title LIKE ? OR c.description LIKE ?)"
        like_search = f"%{search}%"
        params.extend([like_search, like_search, like_search, like_search])

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
    complaints_list = query_db(query, params)

    return render_template(
        'admin/complaints.html', 
        complaints=complaints_list, 
        categories=categories,
        filters={'search': search, 'category': category, 'priority': priority, 'status': status}
    )

@complaint_bp.route('/details/<int:complaint_id>')
@login_required
def details(complaint_id):
    lang = session.get('lang', 'en')
    
    # Load complaint details
    complaint = query_db("""
        SELECT c.*, u.name as user_name, u.email as user_email, cat.name_en as cat_en, cat.name_ta as cat_ta
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = ?
    """, (complaint_id,), one=True)

    if not complaint:
        flash("Complaint not found.", 'danger')
        return redirect(url_for('user.dashboard'))

    # Security check: users can only view their own complaints
    if session.get('role') != 'admin' and complaint['user_id'] != session['user_id']:
        flash(translate('access_denied', lang), 'danger')
        return redirect(url_for('user.dashboard'))

    # Load timeline logs
    timeline = query_db("""
        SELECT t.*, u.name as updated_by_name
        FROM complaint_timeline t
        JOIN users u ON t.updated_by = u.id
        WHERE t.complaint_id = ?
        ORDER BY t.created_at ASC
    """, (complaint_id,))

    # Load categories for editing (if admin)
    categories = query_db("SELECT * FROM categories ORDER BY id ASC")

    return render_template(
        'user/complaint_details.html' if session.get('role') != 'admin' else 'admin/complaint_details.html',
        complaint=complaint,
        timeline=timeline,
        categories=categories
    )

@complaint_bp.route('/details/<int:complaint_id>/update', methods=['POST'])
@login_required
def update(complaint_id):
    if session.get('role') != 'admin':
        flash("Access Denied.", 'danger')
        return redirect(url_for('user.dashboard'))

    lang = session.get('lang', 'en')
    status = request.form.get('status')
    priority = request.form.get('priority')
    category_id = request.form.get('category_id')
    update_note = request.form.get('update_note', '')

    complaint = query_db("SELECT * FROM complaints WHERE id = ?", (complaint_id,), one=True)
    if not complaint:
        flash("Complaint not found.", 'danger')
        return redirect(url_for('admin.dashboard'))

    try:
        resolved_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S') if status == 'resolved' else None
        
        # Update details
        execute_query(
            """UPDATE complaints 
               SET status = ?, priority = ?, category_id = ?, resolved_at = COALESCE(?, resolved_at), updated_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (status, priority, category_id, resolved_at, complaint_id)
        )

        # Log timeline
        status_titles_en = {
            'pending': 'Ticket Status Reset to Pending',
            'in_progress': 'Ticket Assigned & In Progress',
            'under_review': 'Ticket Placed Under Review',
            'resolved': 'Resolution Provided',
            'closed': 'Ticket Closed'
        }
        status_titles_ta = {
            'pending': 'டிக்கெட் நிலை நிலுவையில் உள்ளதாக மாற்றப்பட்டது',
            'in_progress': 'டிக்கெட் ஒதுக்கப்பட்டு செயல்பாட்டில் உள்ளது',
            'under_review': 'டிக்கெட் மதிப்பீட்டிற்கு வைக்கப்பட்டுள்ளது',
            'resolved': 'தீர்வு வழங்கப்பட்டுள்ளது',
            'closed': 'டிக்கெட் மூடப்பட்டது'
        }
        
        title_en = status_titles_en.get(status, "Status Updated")
        title_ta = status_titles_ta.get(status, "நிலை புதுப்பிக்கப்பட்டது")
        
        note_en = update_note or f"Ticket status changed to {status.replace('_', ' ').capitalize()}."
        note_ta = update_note or f"டிக்கெட் நிலை {status.replace('_', ' ').capitalize()} ஆக மாற்றப்பட்டுள்ளது."

        execute_query(
            """INSERT INTO complaint_timeline 
               (complaint_id, status, title_en, title_ta, description_en, description_ta, updated_by) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (complaint_id, status, title_en, title_ta, note_en, note_ta, session['user_id'])
        )

        # Notify user
        execute_query(
            """INSERT INTO notifications 
               (user_id, title_en, title_ta, message_en, message_ta, type) 
               VALUES (?, ?, ?, ?, ?, 'status_change')""",
            (
                complaint['user_id'],
                f"Complaint Status Update: {complaint['ticket_id']}",
                f"புகார் நிலை புதுப்பிப்பு: {complaint['ticket_id']}",
                f"Your complaint status has been updated to {status.replace('_', ' ').capitalize()}.",
                f"உங்கள் புகார் நிலை {status.replace('_', ' ').capitalize()} ஆக புதுப்பிக்கப்பட்டுள்ளது."
            )
        )

        # Email user about status change
        user = query_db("SELECT email, name FROM users WHERE id = ?", (complaint['user_id'],), one=True)
        if user:
            subject = f"Status Update - {complaint['ticket_id']}"
            body_html = f"""
            <h3>Hello {user['name']},</h3>
            <p>Your ticket <b>{complaint['ticket_id']}</b> status has been updated to <b>{status.replace('_', ' ').capitalize()}</b>.</p>
            <p><b>Update Details:</b> {note_en}</p>
            """
            send_email(user['email'], subject, body_html, f"Ticket {complaint['ticket_id']} status updated to {status}.")

        flash("Ticket updated successfully.", 'success')
    except Exception as e:
        flash(f"Error updating ticket: {str(e)}", 'danger')

    return redirect(url_for('complaint.details', complaint_id=complaint_id))

@complaint_bp.route('/details/<int:complaint_id>/feedback', methods=['POST'])
@login_required
def feedback(complaint_id):
    user_id = session['user_id']
    rating = request.form.get('rating')
    comments = request.form.get('comments', '')

    complaint = query_db("SELECT * FROM complaints WHERE id = ? AND user_id = ?", (complaint_id, user_id), one=True)
    if not complaint:
        flash("Unauthorized or ticket not found.", 'danger')
        return redirect(url_for('user.dashboard'))

    try:
        execute_query(
            "UPDATE complaints SET feedback_rating = ?, feedback_comments = ?, status = 'closed' WHERE id = ?",
            (rating, comments, complaint_id)
        )
        
        # Log to timeline
        execute_query(
            """INSERT INTO complaint_timeline 
               (complaint_id, status, title_en, title_ta, description_en, description_ta, updated_by) 
               VALUES (?, 'closed', 'Feedback Submitted & Ticket Closed', 'கருத்து சமர்ப்பிக்கப்பட்டு டிக்கெட் மூடப்பட்டது', ?, ?, ?)""",
            (
                complaint_id, 
                f"User submitted rating {rating}/5 with comments.", 
                f"பயனர் 5க்கு {rating} மதிப்பீட்டுடன் கருத்தை சமர்ப்பித்துள்ளார்.", 
                user_id
            )
        )

        flash("Thank you for your feedback! Ticket closed.", 'success')
    except Exception as e:
        flash(f"Error submitting feedback: {str(e)}", 'danger')

    return redirect(url_for('complaint.details', complaint_id=complaint_id))

@complaint_bp.route('/api/analyze', methods=['POST'])
def api_analyze():
    """
    Real-time text scanner to predict ticket category and priority.
    """
    data = request.get_json() or {}
    text = data.get('text') or data.get('description', '')
    analysis = analyze_complaint(text)
    if 'category_id' in analysis:
        analysis['predicted_category_id'] = analysis['category_id']
    return jsonify(analysis)
