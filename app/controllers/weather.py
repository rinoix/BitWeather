import requests
from flask import request, jsonify, current_app
from app.controllers.utils import fetch_ip_data

def fetch_weather_data():
    ip_data = fetch_ip_data(request.headers.get('Cf-Connecting-Ip'))

    if ip_data.get("status") == "fail":
        lat, lon = 35.6895, 139.6917  # 東京
    else:
        lat = ip_data.get("lat") or ip_data.get("latitude")
        lon = ip_data.get("lon") or ip_data.get("longitude")
        if not lat or not lon:
            lat, lon = 35.6895, 139.6917

    try:
        weather_url = (
            f"https://api.openweathermap.org/data/2.5/weather?"
            f"lat={lat}&lon={lon}"
            f"&appid={current_app.config['WEATHER_API_KEY']}&units=metric&lang=ja"
        )

        response = requests.get(weather_url, timeout=5)
        response.raise_for_status()
        weather_data = response.json()

        weather_main = weather_data["weather"][0]["main"]
        weather_city = weather_data.get("name")
        weather_description = weather_data["weather"][0]["description"]
        weather_temp = weather_data["main"]["temp"]

    except Exception as e:
        weather_main = None
        weather_city = None
        weather_description = None
        weather_temp = None

    return jsonify({
        "weather": weather_main,
        "weatherCity": weather_city,
        "weatherDescription": weather_description,
        "temp": weather_temp
    })