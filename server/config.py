from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from models import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roster_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app,db)

db.init_app(app)

# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})