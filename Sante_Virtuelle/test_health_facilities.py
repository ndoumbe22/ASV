import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

# Import the view function
from sante_app.views import health_facilities

# Create a mock request object
from django.http import HttpRequest
request = HttpRequest()
request.method = 'GET'

# Call the function
response = health_facilities(request)
print(f"Status code: {response.status_code}")
print(f"Response data: {response.data}")