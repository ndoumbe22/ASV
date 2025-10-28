import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

from django.contrib.auth import get_user_model
from sante_app.permissions import IsMedecin
from django.http import HttpRequest
from rest_framework.request import Request

User = get_user_model()

# Test user 19 permissions
print("=== TESTING PERMISSIONS FOR USER 19 ===")
try:
    user = User.objects.get(id=19)
    print(f"✓ User found: {user.username}")
    print(f"Role: {user.role}")
    print(f"Is authenticated: {user.is_authenticated}")
    print(f"Is active: {user.is_active}")
    
    # Create a mock request
    http_request = HttpRequest()
    http_request.user = user
    request = Request(http_request)
    
    # Debug the permission check manually
    print(f"User is_authenticated: {user.is_authenticated}")
    print(f"User role: {user.role}")
    print(f"Role comparison: {user.role == 'medecin'}")
    
    # Test IsMedecin permission
    permission = IsMedecin()
    has_permission = permission.has_permission(request, None)
    print(f"IsMedecin permission: {has_permission}")
    
    # Manual check
    manual_check = user.is_authenticated and user.role == "medecin"
    print(f"Manual permission check: {manual_check}")
    
    if has_permission:
        print("✓ User 19 has proper permissions as a medecin")
    else:
        print("✗ User 19 does not have medecin permissions")
        
except User.DoesNotExist:
    print("✗ User 19 does not exist!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()