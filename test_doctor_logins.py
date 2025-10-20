import requests

# List of doctor usernames
doctor_usernames = [
    "dr_martin",    # Cardiologie
    "dr_bernard",   # Dermatologie
    "dr_sophie",    # Pédiatrie
    "dr_antoine",   # Dermatologie
    "dr_marie",     # Gynécologie
    "dr_jean",      # Orthopédie
    "dr_isabelle"   # Neurologie
]

# Test login for each doctor
default_password = "defaultpassword123"

print("Testing doctor logins with default password...")
print("=" * 50)

for username in doctor_usernames:
    try:
        login_data = {'username': username, 'password': default_password}
        r = requests.post('http://localhost:8000/api/auth/login/', data=login_data)
        
        if r.status_code == 200:
            print(f"✓ SUCCESS: {username} - Login successful")
        else:
            print(f"✗ FAILED: {username} - {r.json().get('error', 'Login failed')}")
    except Exception as e:
        print(f"✗ ERROR: {username} - {str(e)}")

print("\nNote: If some logins failed, those doctors may have been created by a different script")
print("      or their passwords may have been changed.")