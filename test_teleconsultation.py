#!/usr/bin/env python
"""
Test script for teleconsultation functionality
"""
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')

# Setup Django
django.setup()

# Now we can import Django models and test the teleconsultation functionality
from sante_app.models import User, Patient, Medecin, Consultation, Teleconsultation

def test_teleconsultation():
    print("Testing teleconsultation functionality...")
    
    # Create test users if they don't exist
    try:
        patient_user = User.objects.get(username='test_patient')
    except User.DoesNotExist:
        patient_user = User.objects.create_user(
            username='test_patient',
            email='patient@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Patient',
            role='patient'
        )
    
    try:
        medecin_user = User.objects.get(username='test_medecin')
    except User.DoesNotExist:
        medecin_user = User.objects.create_user(
            username='test_medecin',
            email='medecin@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Medecin',
            role='medecin'
        )
    
    # Create patient and medecin profiles if they don't exist
    try:
        patient = Patient.objects.get(user=patient_user)
    except Patient.DoesNotExist:
        patient = Patient.objects.create(
            user=patient_user,
            adresse='Test Address'
        )
    
    try:
        medecin = Medecin.objects.get(user=medecin_user)
    except Medecin.DoesNotExist:
        medecin = Medecin.objects.create(
            user=medecin_user,
            specialite='Test Specialite'
        )
    
    # Create a consultation
    consultation = Consultation.objects.create(
        patient=patient,
        medecin=medecin,
        date='2025-10-27',
        heure='10:00:00',
        statut='programmee'
    )
    
    print(f"Created consultation: {consultation.numero}")
    
    # Test creating a teleconsultation
    from django.test import Client
    from rest_framework_simplejwt.tokens import RefreshToken
    import json
    
    # Create a JWT token for the patient
    refresh = RefreshToken.for_user(patient_user)
    access_token = str(refresh.access_token)
    
    # Test the teleconsultation API
    client = Client()
    
    # Test creating a teleconsultation
    response = client.post('/api/teleconsultations/', 
                          data={'consultation': consultation.numero},
                          content_type='application/json',
                          HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    print(f"Teleconsultation creation response: {response.status_code}")
    print(f"Response data: {response.json()}")
    
    if response.status_code == 201:
        teleconsultation_data = response.json()
        teleconsultation_id = teleconsultation_data['id']
        print(f"Created teleconsultation: {teleconsultation_id}")
        
        # Test generating a token
        response = client.post(f'/api/teleconsultations/{teleconsultation_id}/generate_token/', 
                              content_type='application/json',
                              HTTP_AUTHORIZATION=f'Bearer {access_token}')
        print(f"Token generation response: {response.status_code}")
        if response.status_code == 200:
            print("Token generation successful!")
            token_data = response.json()
            print(f"Token: {token_data.get('token', 'Not found')}")
        else:
            print(f"Token generation failed: {response.json()}")
    else:
        print(f"Teleconsultation creation failed: {response.json()}")

if __name__ == '__main__':
    test_teleconsultation()