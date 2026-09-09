# auth_middleware.py: Role-based route shields
from functools import wraps
from flask import session, redirect, url_for, flash, request, abort
from backend.services.translation_service import translate

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash(translate('access_denied', session.get('lang', 'en')), 'danger')
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash(translate('access_denied', session.get('lang', 'en')), 'danger')
            return redirect(url_for('auth.login', next=request.url))
        if session.get('role') != 'admin':
            flash(translate('access_denied', session.get('lang', 'en')), 'danger')
            return redirect(url_for('user.dashboard'))
        return f(*args, **kwargs)
    return decorated_function
