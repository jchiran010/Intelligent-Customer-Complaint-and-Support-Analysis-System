# init_db.py: Database Initialization Script
import os
import sqlite3

def init_db():
    db_dir = os.path.join(os.path.dirname(__file__), 'sqlite')
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    db_path = os.path.join(db_dir, 'database.db')
    print(f"Initializing SQLite database at: {db_path}")

    # Remove old database if exists
    if os.path.exists(db_path):
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Read schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    # Execute schema
    cursor.executescript(schema_sql)
    print("Database tables created successfully.")

    # Read sample_data.sql
    sample_path = os.path.join(os.path.dirname(__file__), 'sample_data.sql')
    with open(sample_path, 'r', encoding='utf-8') as f:
        sample_sql = f.read()

    # Execute sample data
    cursor.executescript(sample_sql)
    print("Database seeded with sample data successfully.")

    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
