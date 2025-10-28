import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

import requests

# Test the API endpoint
url = "http://localhost:8000/api/rendezvous/creneaux_disponibles/"
params = {
    'medecin_id': 19,
    'date': '2025-10-28'
}

print("Testing API endpoint:", url)
print("Parameters:", params)

try:
    response = requests.get(url, params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")