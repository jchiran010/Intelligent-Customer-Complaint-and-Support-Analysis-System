# admin_routes.py: Administrative operations, KPI telemetry, and user management
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from backend.middleware.auth_middleware import admin_required
from backend.utils.db_helper import query_db, execute_query
from backend.services.translation_service import translate

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    lang = session.get('lang', 'en')

    # KPI stats
    total_users = query_db("SELECT COUNT(id) as count FROM users WHERE role = 'user'", one=True)['count']
    total_complaints = query_db("SELECT COUNT(id) as count FROM complaints", one=True)['count']
    pending = query_db("SELECT COUNT(id) as count FROM complaints WHERE status = 'pending'", one=True)['count']
    in_progress = query_db("SELECT COUNT(id) as count FROM complaints WHERE status = 'in_progress'", one=True)['count']
    resolved = query_db("SELECT COUNT(id) as count FROM complaints WHERE status = 'resolved'", one=True)['count']
    high_priority = query_db("SELECT COUNT(id) as count FROM complaints WHERE (priority = 'high' OR priority = 'critical')", one=True)['count']

    # CSAT Score: Average feedback rating from resolved complaints
    csat_row = query_db("SELECT AVG(feedback_rating) as avg_rating FROM complaints WHERE status = 'resolved' AND feedback_rating IS NOT NULL", one=True)
    csat_score = round((csat_row['avg_rating'] * 20), 1) if csat_row and csat_row['avg_rating'] else 0.0

    # Average Resolution Time (in hours)
    # We use SQLite's julianday to calculate differences
    res_time_row = query_db("""
        SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours 
        FROM complaints 
        WHERE status = 'resolved' AND resolved_at IS NOT NULL
    """, one=True)
    avg_res_time = round(res_time_row['avg_hours'], 1) if res_time_row and res_time_row['avg_hours'] else 0.0

    # Top Complaint Category
    top_cat_row = query_db("""
        SELECT cat.name_en, cat.name_ta, COUNT(c.id) as count 
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        GROUP BY c.category_id
        ORDER BY count DESC
        LIMIT 1
    """, one=True)
    top_category = (top_cat_row['name_en'] if lang == 'en' else top_cat_row['name_ta']) if top_cat_row else 'N/A'

    # Charts data: Category distribution
    cat_distribution = query_db("""
        SELECT cat.name_en, cat.name_ta, COUNT(c.id) as count 
        FROM categories cat
        LEFT JOIN complaints c ON cat.id = c.category_id
        GROUP BY cat.id
    """)

    # Charts data: Priority distribution
    priority_distribution = query_db("""
        SELECT priority, COUNT(id) as count 
        FROM complaints 
        GROUP BY priority
    """)

    # Charts data: Trend last 7 days
    # (SQLite dates support)
    trends = query_db("""
        SELECT date(created_at) as date, COUNT(id) as count 
        FROM complaints 
        WHERE created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date ASC
    """)

    stats = {
        'total_users': total_users,
        'total_complaints': total_complaints,
        'pending': pending,
        'in_progress': in_progress,
        'resolved': resolved,
        'high_priority': high_priority,
        'csat_score': csat_score,
        'avg_res_time': avg_res_time,
        'top_category': top_category
    }

    return render_template(
        'admin/dashboard.html', 
        stats=stats,
        cat_distribution=cat_distribution,
        priority_distribution=priority_distribution,
        trends=trends
    )

@admin_bp.route('/users')
@admin_required
def users():
    users_list = query_db("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC")
    return render_template('admin/users.html', users=users_list)

@admin_bp.route('/users/<int:user_id>/toggle', methods=['POST'])
@admin_required
def toggle_user(user_id):
    user = query_db("SELECT is_active FROM users WHERE id = ?", (user_id,), one=True)
    if user:
        new_status = 0 if user['is_active'] else 1
        execute_query("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
        flash("User status updated successfully.", 'success')
    return redirect(url_for('admin.users'))

@admin_bp.route('/categories', methods=['GET', 'POST'])
@admin_required
def categories():
    lang = session.get('lang', 'en')
    if request.method == 'POST':
        name_en = request.form.get('name_en')
        name_ta = request.form.get('name_ta')
        description = request.form.get('description')

        if not name_en or not name_ta:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('admin.categories'))

        execute_query(
            "INSERT INTO categories (name_en, name_ta, description) VALUES (?, ?, ?)",
            (name_en, name_ta, description)
        )
        flash("Category added successfully.", 'success')
        return redirect(url_for('admin.categories'))

    categories_list = query_db("SELECT * FROM categories ORDER BY id ASC")
    return render_template('admin/categories.html', categories=categories_list)

@admin_bp.route('/categories/<int:cat_id>/delete', methods=['POST'])
@admin_required
def delete_category(cat_id):
    # Verify if category is used in complaints
    usage = query_db("SELECT COUNT(id) as count FROM complaints WHERE category_id = ?", (cat_id,), one=True)
    if usage['count'] > 0:
        flash("Cannot delete category. It is associated with existing complaints.", 'danger')
    else:
        execute_query("DELETE FROM categories WHERE id = ?", (cat_id,))
        flash("Category deleted successfully.", 'success')
    return redirect(url_for('admin.categories'))

@admin_bp.route('/analytics')
@admin_required
def analytics():
    # Performance telemetry page
    # Fetch distribution stats and resolution charts
    csat_distribution = query_db("""
        SELECT feedback_rating as rating, COUNT(id) as count 
        FROM complaints 
        WHERE status = 'resolved' AND feedback_rating IS NOT NULL 
        GROUP BY feedback_rating
    """)

    cat_stats = query_db("""
        SELECT cat.name_en, cat.name_ta, 
               COUNT(c.id) as total,
               SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved,
               AVG(CASE WHEN c.status = 'resolved' AND c.resolved_at IS NOT NULL THEN (julianday(c.resolved_at) - julianday(c.created_at)) * 24 ELSE NULL END) as avg_hours
        FROM categories cat
        LEFT JOIN complaints c ON cat.id = c.category_id
        GROUP BY cat.id
    """)

    return render_template('admin/analytics.html', csat_distribution=csat_distribution, cat_stats=cat_stats)

@admin_bp.route('/settings', methods=['GET', 'POST'])
@admin_required
def settings():
    return render_template('admin/settings.html')

@admin_bp.route('/reports')
@admin_required
def reports():
    categories_list = query_db("SELECT * FROM categories ORDER BY id ASC")
    return render_template('admin/reports.html', categories=categories_list)


