import requests
from flask import request, jsonify, current_app
from app.controllers.utils import fetch_ip_data

def fetch_weather_data():
    ip_data = fetch_ip_data(request.remote_addr)
    
    if ip_data.get("status") == "fail":
        city = "Tokyo"
    else:
        city = ip_data.get("city", None)
    
    try:
        weather_url = (
            f"http://api.openweathermap.org/data/2.5/weather?q={city}"
            f"&appid={current_app.config['WEATHER_API_KEY']}&units=metric&lang=ja"
        )
        weather_responce = requests.get(weather_url)
        weather_data = weather_responce.json()
        weather_main = weather_data["weather"][0]["main"]
        weather_description = weather_data["weather"][0]["description"]
        weather_temp = weather_data["main"]["temp"]
    except Exception as e:
        weather_main = None
        weather_description = None
        weather_temp = None
        
    return jsonify({
        "weather" : weather_main,
        "weatherDescription" : weather_description,
        "temp" : weather_temp
    })