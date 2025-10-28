import requests
import json

# Test the doctor's availability endpoint with the provided token
url = "http://localhost:8000/api/medecins/mes-disponibilites/"

headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxNjQzNjkxLCJpYXQiOjE3NjE2MzY0OTEsImp0aSI6ImM3NGNlYTE3NDI3YjQyNDI4NjU0YmQ2Yzc2MGFlZTQ5IiwidXNlcl9pZCI6IjQifQ.UUYvBHoXwBkD6Cg6OwNo1BRB3NjEh_3JcRLQXmIhIxk'
}

print("Testing doctor availability endpoint:", url)
print("Headers:", headers)

try:
    response = requests.get(url, headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    response_json = response.json()
    print(f"Response: {json.dumps(response_json, indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    # Let's also try without headers to see what we get
    print("\nTrying without authentication...")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e2:
        print(f"Error without auth: {e2}")