import requests
from flask import current_app

def fetch_ip_data(ip):
    responce = requests.get(f"{current_app.config["IP_API_URL"]}{ip}")
    ip_data = responce.json()
    return ip_data