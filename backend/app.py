# app.py: Flask application initializer and main orchestrator
import os
from flask import Flask, session, render_template, redirect, url_for
from backend.config import Config
from backend.services.translation_service import translate

def create_app():
    # Configure Flask templates and static folders relative to this file
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static'))

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    app.config.from_object(Config)

    # Ensure uploads and reports folders exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'reports'), exist_ok=True)

    # Auto-initialize SQLite database if not present
    if Config.DB_TYPE == 'sqlite' and not os.path.exists(Config.SQLITE_DB_ABS_PATH):
        try:
            from database.init_db import init_db
            init_db()
        except Exception as e:
            print(f"Warning: Auto-init DB error: {e}")



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
