import requests
from flask import current_app, request

def fetch_ip_data():
    try:
        ip = request.remote_addr
        response = requests.get(f"{current_app.config['IP_API_URL']}{ip}")
        ip_data = response.json()
        return ip_data
    except requests.RequestException as e:
        return None