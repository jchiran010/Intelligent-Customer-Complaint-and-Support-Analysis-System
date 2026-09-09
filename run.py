# run.py: Entrypoint runner for the Intelligent Customer Complaint & Support Analysis System
import os
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    # Retrieve port and host from env, defaulting to 5000 and localhost
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '127.0.0.1')
    
    print(f"Launching Intelligent Support platform at http://{host}:{port}")
    app.run(host=host, port=port, debug=True)
