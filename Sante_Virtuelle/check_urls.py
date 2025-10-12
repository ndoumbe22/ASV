import os
import django
from django.conf import settings
from django.urls import get_resolver

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

# Get the URL resolver
resolver = get_resolver()

# Print all URL patterns
print("URL Patterns:")
for pattern in resolver.url_patterns:
    print(f"  {pattern.pattern}")
    if hasattr(pattern, 'url_patterns'):
        for sub_pattern in pattern.url_patterns:
            print(f"    {sub_pattern.pattern}")