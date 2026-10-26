import os
from app import create_app
from seed import seed_database

app = create_app()

if __name__ == '__main__':
    # Auto-initialize database & seed data if database file does not exist
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'meditrack.db')
    if not os.path.exists(db_path):
        print("[Flask Startup] Database not found. Initializing and seeding...")
        seed_database()

    print("[Flask Startup] MediTrack AI Backend running on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
