import requests
from flask import current_app

def fetch_ip_data(ip):
    try:
        responce = requests.get(f"{current_app.config["IP_API_URL"]}{ip}")
        ip_data = responce.json()
        return ip_data
    except requests.RequestException as e:
        return None