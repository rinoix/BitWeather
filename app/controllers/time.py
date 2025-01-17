import requests
from flask import request, jsonify, current_app
from datetime import datetime
import pytz
from app.controllers.utils import fetch_ip_data

def fetch_time_data():
    try:
        raw_ip = request.headers.get('Cf-Connecting-Ip')
        if not raw_ip:
            raw_ip = request.remote_addr
        
        response = requests.get(f"{current_app.config['TIME_API_URL']}{raw_ip}", timeout=10)
        time_data = response.json()
        time_str = time_data["datetime"]
    except requests.exceptions.Timeout:
        raise Exception("The request timed out")
    except Exception as e:
        ip_data = fetch_ip_data(request.headers.get('Cf-Connecting-Ip'))
        timezone = ip_data.get("timezone", "UTC")
        
        try:
            tz = pytz.timezone(timezone)
            now = datetime.now(tz)
        except Exception as e:
            now = datetime.now(pytz.UTC)
            
        time_str = now.strftime("%Y-%m-%dT%H:%M:%S%z")
        
    return jsonify({"datetime" : time_str})