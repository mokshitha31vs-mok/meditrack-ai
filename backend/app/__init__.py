import os
from flask import Flask, send_from_directory
from config import Config
from app.extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.prescriptions import prescriptions_bp
    from app.routes.medications import medications_bp
    from app.routes.reminders import reminders_bp
    from app.routes.appointments import appointments_bp
    from app.routes.medicines import medicines_bp
    from app.routes.pharmacies import pharmacies_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.deliveries import deliveries_bp
    from app.routes.admin import admin_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.doctor import doctor_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(prescriptions_bp)
    app.register_blueprint(medications_bp)
    app.register_blueprint(reminders_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(medicines_bp)
    app.register_blueprint(pharmacies_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(deliveries_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(doctor_bp)

    # Serve uploads
    @app.route('/api/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'app': 'MediTrack AI'}, 200

    return app
