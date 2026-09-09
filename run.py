# run.py: Entrypoint runner for the Intelligent Customer Complaint & Support Analysis System
import os
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    # Retrieve port and host from env, defaulting to 5000 and 0.0.0.0 (all interfaces)
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print("=" * 60)
    print(f"Server live at:")
    print(f"  Local:    http://127.0.0.1:{port}/")
    print(f"  Network:  http://localhost:{port}/")
    print("=" * 60)
    
    app.run(host=host, port=port, debug=False, threaded=True)
