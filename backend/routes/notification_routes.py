# notification_routes.py: Real-time telemetry, badge updates and mark-as-read operations
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from backend.middleware.auth_middleware import login_required
from backend.utils.db_helper import query_db, execute_query

notification_bp = Blueprint('notification', __name__, url_prefix='/notification')

@notification_bp.route('/')
@login_required
def index():
    user_id = session['user_id']
    notifications_list = query_db("""
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    """, (user_id,))
    
    # Mark them all as read when they view notifications page
    execute_query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
    
    return render_template('user/notifications.html', notifications=notifications_list)

@notification_bp.route('/api/unread_count')
@login_required
def unread_count():
    user_id = session['user_id']
    count_row = query_db("SELECT COUNT(id) as count FROM notifications WHERE user_id = ? AND is_read = 0", (user_id,), one=True)
    count = count_row['count'] if count_row else 0
    
    # Fetch recent unread notifications details for dropdown
    recent_unread = query_db("""
        SELECT id, title_en, title_ta, created_at FROM notifications 
        WHERE user_id = ? AND is_read = 0 
        ORDER BY created_at DESC 
        LIMIT 3
    """, (user_id,))
    
    return jsonify({
        'status': 'success',
        'count': count,
        'recent': recent_unread
    })

@notification_bp.route('/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_read(notification_id):
    user_id = session['user_id']
    execute_query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notification_id, user_id))
    return jsonify({'status': 'success'})
