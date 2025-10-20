import requests

def test_adminuser_login():
    # Test various password combinations for adminuser
    passwords = ['admin123', 'admin', 'password', 'defaultpassword123', 'adminuser']
    
    print("Testing adminuser login credentials:")
    print("=" * 35)
    
    for password in passwords:
        try:
            login_data = {'username': 'adminuser', 'password': password}
            r = requests.post('http://localhost:8000/api/auth/login/', data=login_data)
            
            if r.status_code == 200:
                print(f"✓ SUCCESS: adminuser with password '{password}'")
                user_data = r.json()['user']
                print(f"  Role: {user_data['role']}")
                return password
            else:
                print(f"✗ FAILED: adminuser with password '{password}'")
        except Exception as e:
            print(f"✗ ERROR: adminuser with password '{password}' - {str(e)}")
    
    print("\nCould not find working credentials for adminuser")
    return None

if __name__ == "__main__":
    test_adminuser_login()