import requests
from flask import current_app

def fetch_ip_data(ip):
    try:
        response = requests.get(f"{current_app.config['IP_API_URL']}{ip}")
        ip_data = response.json()
        return ip_data
    except requests.RequestException as e:
        return {'status': 'fail', 'message': str(e)}