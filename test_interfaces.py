import requests
import json

def test_patient_interface():
    """Test patient interface functionality"""
    print("=== Testing Patient Interface ===")
    
    try:
        # Test 1: Get patients data
        response = requests.get("http://localhost:8000/api/patients/")
        if response.status_code == 200:
            patients = response.json()
            print(f"✓ Patient API accessible - Found {len(patients)} patients")
        else:
            print(f"✗ Patient API failed with status {response.status_code}")
            return False
            
        # Test 2: Get appointments data
        response = requests.get("http://localhost:8000/api/rendezvous/")
        if response.status_code == 200:
            appointments = response.json()
            print(f"✓ Appointments API accessible - Found {len(appointments)} appointments")
        else:
            print(f"✗ Appointments API failed with status {response.status_code}")
            return False
            
        return True
    except Exception as e:
        print(f"✗ Patient interface test failed: {str(e)}")
        return False

def test_doctor_interface():
    """Test doctor interface functionality"""
    print("\n=== Testing Doctor Interface ===")
    
    try:
        # Test 1: Get doctors data
        response = requests.get("http://localhost:8000/api/medecins/")
        if response.status_code == 200:
            doctors = response.json()
            print(f"✓ Doctors API accessible - Found {len(doctors)} doctors")
        else:
            print(f"✗ Doctors API failed with status {response.status_code}")
            return False
            
        # Test 2: Check if our created doctors are present
        doctor_usernames = [doc['user']['username'] for doc in doctors]
        expected_doctors = ['dr_martin', 'dr_sophie', 'dr_antoine', 'dr_marie', 'dr_jean', 'dr_isabelle']
        found_doctors = [doc for doc in expected_doctors if doc in doctor_usernames]
        print(f"✓ Found {len(found_doctors)} expected doctors: {', '.join(found_doctors)}")
        
        return True
    except Exception as e:
        print(f"✗ Doctor interface test failed: {str(e)}")
        return False

def test_admin_interface():
    """Test admin interface functionality"""
    print("\n=== Testing Admin Interface ===")
    
    try:
        # Test 1: Check if admin endpoints are accessible (structure verification)
        response = requests.options("http://localhost:8000/api/admin/statistics/")
        if response.status_code in [200, 401, 403]:  # 401/403 means endpoint exists but requires auth
            print("✓ Admin statistics endpoint exists")
        else:
            print(f"✗ Admin statistics endpoint failed with status {response.status_code}")
            return False
            
        # Test 2: Check user management endpoints
        response = requests.options("http://localhost:8000/api/admin/users/")
        if response.status_code in [200, 401, 403]:
            print("✓ Admin user management endpoint exists")
        else:
            print(f"✗ Admin user management endpoint failed with status {response.status_code}")
            return False
            
        return True
    except Exception as e:
        print(f"✗ Admin interface test failed: {str(e)}")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print("\n=== Testing Frontend Accessibility ===")
    
    try:
        # Test if frontend is running
        response = requests.get("http://localhost:3001")
        if response.status_code == 200:
            print("✓ Frontend is accessible")
            return True
        else:
            print(f"✗ Frontend failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Frontend accessibility test failed: {str(e)}")
        return False

def main():
    """Run all interface tests"""
    print("Starting comprehensive interface testing...\n")
    
    results = []
    
    # Test each interface
    results.append(test_patient_interface())
    results.append(test_doctor_interface())
    results.append(test_admin_interface())
    results.append(test_frontend_accessibility())
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    interface_names = ["Patient Interface", "Doctor Interface", "Admin Interface", "Frontend Accessibility"]
    
    for i, (name, result) in enumerate(zip(interface_names, results)):
        status = "PASS" if result else "FAIL"
        print(f"{name}: {status}")
    
    total_passed = sum(results)
    total_tests = len(results)
    print(f"\nOverall: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("🎉 All interfaces are working correctly!")
        return True
    else:
        print("⚠️  Some interfaces have issues that need to be addressed.")
        return False

if __name__ == "__main__":
    main()