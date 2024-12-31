from flask import Blueprint, render_template
from .controllers.utils import fetch_ip_data
from .controllers.time import fetch_time_data
from .controllers.weather import fetch_weather_data

main = Blueprint('main', __name__)

@main.route("/")
def index():
    return render_template("index.html")

@main.route("/api/time")
def get_time_data():
    return fetch_time_data()

@main.route("/api/weather")
def get_weather_data():
    return fetch_weather_data()