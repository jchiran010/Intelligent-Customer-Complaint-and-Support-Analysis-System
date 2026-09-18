# app.py: Flask application initializer and main orchestrator
import os
from flask import Flask, session, render_template, redirect, url_for
from backend.config import Config
from backend.services.translation_service import translate

def resolve_dir(base_path, *subpaths):
    """Resolve directory path with case-insensitivity support for Linux/Unix and Windows."""
    p1 = os.path.abspath(os.path.join(base_path, *subpaths))
    if os.path.exists(p1):
        return p1
    p2 = os.path.abspath(os.path.join(base_path, *[s.capitalize() if i == 0 else s for i, s in enumerate(subpaths)]))
    if os.path.exists(p2):
        return p2
    p3 = os.path.abspath(os.path.join(base_path, *[s.lower() if i == 0 else s for i, s in enumerate(subpaths)]))
    if os.path.exists(p3):
        return p3
    return p1

def create_app():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    template_dir = resolve_dir(base_dir, 'Frontend', 'templates')
    static_dir = resolve_dir(base_dir, 'Frontend', 'static')

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    app.config.from_object(Config)

    # Enable ProxyFix to preserve reverse proxy headers (Render, Heroku, Cloudflare, etc.)
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # Ensure uploads and reports folders exist (with fallback for serverless read-only filesystems)
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    except Exception as e:
        print(f"Notice: Could not create upload folder ({e}), fallback to /tmp/uploads")
        app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
        try:
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        except Exception:
            pass

    try:
        os.makedirs(getattr(Config, 'REPORTS_FOLDER', os.path.join(base_dir, 'reports')), exist_ok=True)
    except Exception:
        try:
            os.makedirs('/tmp/reports', exist_ok=True)
        except Exception:
            pass

    # Auto-initialize SQLite database if not present
    if Config.DB_TYPE == 'sqlite' and not os.path.exists(Config.SQLITE_DB_ABS_PATH):
        try:
            bundled_db = os.path.join(base_dir, 'database', 'sqlite', 'database.db')
            if os.path.exists(bundled_db) and os.path.abspath(bundled_db) != os.path.abspath(Config.SQLITE_DB_ABS_PATH):
                import shutil
                try:
                    os.makedirs(os.path.dirname(Config.SQLITE_DB_ABS_PATH), exist_ok=True)
                except Exception:
                    pass
                shutil.copy2(bundled_db, Config.SQLITE_DB_ABS_PATH)
                print(f"Copied bundled SQLite database to: {Config.SQLITE_DB_ABS_PATH}")
            else:
                from database.init_db import init_db
                init_db(Config.SQLITE_DB_ABS_PATH)
        except Exception as e:
            print(f"Warning: Auto-init DB error: {e}")
            try:
                from database.init_db import init_db
                init_db(Config.SQLITE_DB_ABS_PATH)
            except Exception as e2:
                print(f"Fatal DB init error: {e2}")

    # Route to serve uploads across local and serverless environments
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    @app.route('/static/uploads/<path:filename>')
    def serve_custom_uploads(filename):
        upload_dir = app.config.get('UPLOAD_FOLDER', '/tmp/uploads')
        if os.path.exists(os.path.join(upload_dir, filename)):
            return send_from_directory(upload_dir, filename)
        fallback_dir = os.path.join(static_dir, 'uploads')
        if os.path.exists(os.path.join(fallback_dir, filename)):
            return send_from_directory(fallback_dir, filename)
        return render_template('common/error.html', error_code=404), 404

    # Inject translations and themes globally to Jinja templates
    @app.context_processor
    def utility_processor():
        def t(key):
            return translate(key, session.get('lang', 'en'))
        return {
            't': t,
            'current_theme': session.get('theme', 'dark'),
            'current_lang': session.get('lang', 'en'),
            'current_user': session.get('name', '')
        }

    # Register blueprints
    from backend.routes.auth_routes import auth_bp
    from backend.routes.user_routes import user_bp
    from backend.routes.admin_routes import admin_bp
    from backend.routes.complaint_routes import complaint_bp
    from backend.routes.notification_routes import notification_bp
    from backend.routes.report_routes import report_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(complaint_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(report_bp)

    # Root route for Splash Screen
    @app.route('/')
    def index():
        return render_template('common/splash.html')

    # Quick redirect to auth login
    @app.route('/login-redirect')
    def login_redirect():
        if 'user_id' in session:
            if session.get('role') == 'admin':
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('user.dashboard'))
        return redirect(url_for('auth.login'))

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('common/error.html', error_code=404), 404

    @app.errorhandler(500)
    def internal_error(e):
        return render_template('common/error.html', error_code=500), 500

    return app

if __name__ == '__main__':
    app = create_app()
    # Host on 0.0.0.0 for external access testing
    app.run(host='0.0.0.0', port=5000, debug=True)
