# db_helper.py: Unified SQL executor for SQLite and MySQL
import sqlite3
from backend.config import Config

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    if Config.DB_TYPE == 'mysql':
        try:
            import pymysql
            conn = pymysql.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE,
                port=Config.MYSQL_PORT,
                cursorclass=pymysql.cursors.DictCursor
            )
            return conn
        except ImportError:
            raise ImportError("MySQL database requested but 'pymysql' package is not installed. Please run 'pip install pymysql' or switch config to sqlite.")
    else:
        # SQLite Connection
        import os
        os.makedirs(os.path.dirname(Config.SQLITE_DB_ABS_PATH), exist_ok=True)
        conn = sqlite3.connect(Config.SQLITE_DB_ABS_PATH)
        conn.row_factory = dict_factory
        # Enable Foreign Key constraints for SQLite
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

def execute_query(query, params=(), commit=True):
    """
    Executes a query (INSERT, UPDATE, DELETE).
    Returns the lastrowid for INSERT statements.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        if commit:
            conn.commit()
        last_id = cursor.lastrowid
        return last_id
    finally:
        conn.close()

def query_db(query, params=(), one=False):
    """
    Queries the database and returns a list of dictionaries (or a single dictionary if one=True).
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rv = cursor.fetchall()
        return (rv[0] if rv else None) if one else rv
    finally:
        conn.close()
