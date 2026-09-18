# api/index.py: Serverless function entrypoint for Vercel
import sys
import os

# Ensure the root directory of the application is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import create_app

app = create_app()

# WSGI handler
handler = app

if __name__ == '__main__':
    app.run()
