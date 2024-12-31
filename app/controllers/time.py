import requests
from flask import request, jsonify, current_app
from datetime import datetime
import pytz
from app.controllers.utils import fetch_ip_data

def fetch_time_data():
    try:
        response = requests.get(f"{current_app.config['TIME_API_URL']}", timeout=10)
        print(request.remote_addr)
        time_data = response.json()
        time_str = time_data["datetime"]
    except requests.exceptions.Timeout:
        raise Exception("The request timed out")
    except Exception as e:
        ip_data = fetch_ip_data()
        timezone = ip_data.get("timezone", "UTC")
        
        try:
            tz = pytz.timezone(timezone)
            now = datetime.now(tz)
        except Exception as e:
            now = datetime.now(pytz.UTC)
            
        time_str = now.strftime("%Y-%m-%dT%H:%M:%S%z")
        
    return jsonify({"datetime" : time_str})