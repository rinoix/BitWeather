from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
import os

def create_app():
    app = Flask(__name__)
    
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    
    load_dotenv()
    
    app.config["WEATHER_API_KEY"] = os.getenv("WEATHER_API_KEY")
    app.config["IP_API_URL"] = os.getenv("IP_API_URL")
    
    from .routes import main
    app.register_blueprint(main)
    
    return app