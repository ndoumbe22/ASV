import requests
import json

# Test the original user
url = "http://localhost:8000/api/auth/login/"
data = {
    "username": "testlogin",
    "password": "testpassword"
}

headers = {
    "Content-Type": "application/json"
}

print("Testing testlogin user:")
try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Authentication successful!")
        response_data = response.json()
        print(f"Username: {response_data['user']['username']}")
        print(f"Role: {response_data['user']['role']}")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test the new user
data2 = {
    "username": "testuser2",
    "password": "testpass123"
}

print("Testing testuser2 user:")
try:
    response = requests.post(url, data=json.dumps(data2), headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Authentication successful!")
        response_data = response.json()
        print(f"Username: {response_data['user']['username']}")
        print(f"Role: {response_data['user']['role']}")
        print(f"Name: {response_data['user']['first_name']} {response_data['user']['last_name']}")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")