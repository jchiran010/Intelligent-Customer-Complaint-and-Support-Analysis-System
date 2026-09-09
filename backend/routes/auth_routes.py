# auth_routes.py: Login, registration, password hashing, and Google OAuth operations
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from backend.utils.db_helper import query_db, execute_query
from backend.utils.email_helper import send_email
from backend.services.translation_service import translate

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
@auth_bp.route('/auth/register', methods=['GET', 'POST'])
def register():
    lang = session.get('lang', 'en')
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        mobile = request.form.get('mobile')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if not name or not email or not password or not confirm_password:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('auth.register'))

        if password != confirm_password:
            flash(translate('error_match', lang), 'danger')
            return redirect(url_for('auth.register'))

        # Check if email exists
        existing_user = query_db("SELECT id FROM users WHERE email = ?", (email,), one=True)
        if existing_user:
            flash("Email already registered. Please sign in.", 'warning')
            return redirect(url_for('auth.register'))

        # Insert user
        password_hash = generate_password_hash(password)
        try:
            execute_query(
                "INSERT INTO users (name, email, password_hash, mobile, role, is_active, language, theme) VALUES (?, ?, ?, ?, 'user', 1, ?, 'dark')",
                (name, email, password_hash, mobile, lang)
            )
            # Send welcome email
            subject = "Welcome to Support Analysis System!" if lang == 'en' else "ஆதரவு பகுப்பாய்வு முறைமைக்கு உங்களை வரவேற்கிறோம்!"
            body_html = f"<h3>Hello {name},</h3><p>Your account has been successfully created. You can now log in and submit complaints.</p>"
            send_email(email, subject, body_html, f"Hello {name}, your account is created successfully.")
            
            flash(translate('register_success', lang), 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            flash(f"Error during registration: {str(e)}", 'danger')

    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
@auth_bp.route('/auth/login', methods=['GET', 'POST'])
def login():
    lang = session.get('lang', 'en')
    if 'user_id' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('user.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('auth.login'))

        user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
        if user and user['password_hash'] and check_password_hash(user['password_hash'], password):
            if not user['is_active']:
                flash("Your account has been deactivated. Please contact support.", 'danger')
                return redirect(url_for('auth.login'))

            # Setup session
            session['user_id'] = user['id']
            session['name'] = user['name']
            session['email'] = user['email']
            session['role'] = user['role']
            session['lang'] = user['language'] or 'en'
            session['theme'] = user['theme'] or 'dark'

            flash(translate('login_success', session['lang']), 'success')
            if user['role'] == 'admin':
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('user.dashboard'))
        else:
            flash(translate('login_failed', lang), 'danger')

    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    lang = session.get('lang', 'en')
    session.clear()
    session['lang'] = lang # retain language preference
    return redirect(url_for('auth.login'))

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
@auth_bp.route('/auth/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    lang = session.get('lang', 'en')
    if request.method == 'POST':
        email = request.form.get('email')
        if not email:
            flash(translate('field_required', lang), 'danger')
            return redirect(url_for('auth.forgot_password'))

        user = query_db("SELECT id, name FROM users WHERE email = ?", (email,), one=True)
        if user:
            # Generate dummy password reset link
            reset_url = request.url_root + "reset-password-token-123456"
            subject = "Password Reset Request" if lang == 'en' else "கடவுச்சொல் மீட்டமைப்பு கோரிக்கை"
            body_html = f"<h3>Hello {user['name']},</h3><p>Click the link below to reset your password:</p><p><a href='{reset_url}'>{reset_url}</a></p>"
            send_email(email, subject, body_html, f"Hello, click here to reset password: {reset_url}")
            
        # Display success regardless of email existence for security reasons (don't leak registered emails)
        flash("If that email is registered, we have sent password reset instructions.", 'info')
        return redirect(url_for('auth.login'))

    return render_template('auth/forgot_password.html')

# Google OAuth Integration Routes
@auth_bp.route('/login/google')
def google_login():
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI')
    
    # If credentials are not configured, perform developer mock authentication bypass
    if not client_id or client_id == 'your_google_client_id':
        flash("Google OAuth bypass active (Add real credentials to .env file for OAuth flow)", "info")
        return redirect(url_for('auth.google_callback', code='mock_code_123'))

    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
    )
    return redirect(google_auth_url)

@auth_bp.route('/auth/google/callback')
def google_callback():
    code = request.args.get('code')
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    client_secret = current_app.config.get('GOOGLE_CLIENT_SECRET')
    redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI')

    email = None
    name = "Google User"
    google_id = None

    # Handle developer bypass mode
    if not client_id or client_id == 'your_google_client_id' or code == 'mock_code_123':
        email = "google_demo@support.com"
        name = "Google Demo User"
        google_id = "google_123456789"
    else:
        # Real OAuth token exchange
        try:
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }
            res = requests.post(token_url, data=data, timeout=10)
            token_json = res.json()
            access_token = token_json.get('access_token')

            if access_token:
                # Fetch profile details
                user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
                headers = {'Authorization': f"Bearer {access_token}"}
                user_res = requests.get(user_info_url, headers=headers, timeout=10)
                user_info = user_res.json()

                email = user_info.get('email')
                name = user_info.get('name', 'Google User')
                google_id = user_info.get('sub')
        except Exception as e:
            flash(f"OAuth exchange error: {str(e)}. Falling back to mock session.", "warning")
            email = "google_demo@support.com"
            name = "Google Demo User"
            google_id = "google_123456789"

    if not email:
        flash("Google Authentication failed. Please verify credentials.", "danger")
        return redirect(url_for('auth.login'))

    # Query DB
    user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
    if not user:
        # Register new OAuth user
        try:
            execute_query(
                "INSERT INTO users (name, email, google_id, role, is_active, language, theme) VALUES (?, ?, ?, 'user', 1, 'en', 'dark')",
                (name, email, google_id)
            )
            user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
            # Welcome email
            send_email(email, "Welcome to Support Analysis System!", f"<h3>Hello {name},</h3><p>Your profile is created via Google sign-in.</p>")
        except Exception as e:
            flash(f"Error creating user: {str(e)}", "danger")
            return redirect(url_for('auth.login'))
    elif not user['google_id']:
        # Bind google ID to existing account
        execute_query("UPDATE users SET google_id = ? WHERE id = ?", (google_id, user['id']))
        user = query_db("SELECT * FROM users WHERE id = ?", (user['id'],), one=True)

    if not user['is_active']:
        flash("Your account has been deactivated.", "danger")
        return redirect(url_for('auth.login'))

    # Create session
    session['user_id'] = user['id']
    session['name'] = user['name']
    session['email'] = user['email']
    session['role'] = user['role']
    session['lang'] = user['language'] or 'en'
    session['theme'] = user['theme'] or 'dark'

    flash("Authenticated via Google successfully.", "success")
    if user['role'] == 'admin':
        return redirect(url_for('admin.dashboard'))
    return redirect(url_for('user.dashboard'))
