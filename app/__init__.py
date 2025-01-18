from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    app = Flask(__name__)
    
    load_dotenv()
    
    app.config["WEATHER_API_KEY"] = os.getenv("WEATHER_API_KEY")
    app.config["IP_API_URL"] = os.getenv("IP_API_URL")
    app.config["TIME_API_URL"] = os.getenv("TIME_API_URL")
    
    from .routes import main
    app.register_blueprint(main)
    
    return app