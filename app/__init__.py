from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.root_path, 'balancebuddy.db')
    db.init_app(app)

    with app.app_context():
        db.create_all()

    from . import routes
    app.register_blueprint(routes.bp)

    return app
