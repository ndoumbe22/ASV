import requests
import json

# First, let's login to get a token
login_data = {
    'username': 'dr_sophie',
    'password': 'defaultpassword123'
}

try:
    # Login
    login_response = requests.post('http://localhost:8000/api/auth/login/', data=login_data)
    
    if login_response.status_code == 200:
        token = login_response.json()['access']
        print("Login successful!")
        print(f"Token: {token[:20]}...")
        
        # Now try to create an appointment
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        appointment_data = {
            "patient": 1,  # Assuming patient ID 1 exists
            "medecin": 1,  # Assuming doctor ID 1 exists
            "date": "2025-10-25",
            "heure": "10:30",
            "description": "Test appointment creation"
        }
        
        appointment_response = requests.post(
            'http://localhost:8000/api/rendezvous/',
            headers=headers,
            data=json.dumps(appointment_data)
        )
        
        print(f"Appointment creation status: {appointment_response.status_code}")
        if appointment_response.status_code == 201:
            print("Appointment created successfully!")
            print(appointment_response.json())
        else:
            print("Failed to create appointment")
            print(appointment_response.text)
    else:
        print("Login failed!")
        print(login_response.json())
        
except Exception as e:
    print(f"Error: {str(e)}")