# config.py: Configuration variables loader
import os
from dotenv import load_dotenv

# Load environment variables from .env in the root directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(base_dir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_change_me_in_production')
    DB_TYPE = os.environ.get('DB_TYPE', 'sqlite').lower()
    
    # SQLite Path
    SQLITE_DB_PATH = os.environ.get('SQLITE_DB_PATH', 'database/sqlite/database.db')
    SQLITE_DB_ABS_PATH = os.path.join(base_dir, SQLITE_DB_PATH)

    # MySQL Configurations
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'yourpassword')
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'support_analysis_db')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))

    # SMTP Configurations
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USER = os.environ.get('SMTP_USER', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    SENDER_EMAIL = os.environ.get('SENDER_EMAIL', '')

    # Uploads Configurations
    UPLOAD_FOLDER = os.path.join(base_dir, 'Frontend' if os.path.exists(os.path.join(base_dir, 'Frontend')) else 'frontend', 'static', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB upload limit
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

    # Google OAuth Configurations
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'your_google_client_id')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', 'your_google_client_secret')
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', '/auth/google/callback')

