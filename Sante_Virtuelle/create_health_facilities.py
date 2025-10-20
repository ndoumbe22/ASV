import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

# Import models
from sante_app.models import Hopital, Clinique, Dentiste, Pharmacie

# Create sample hospitals
print("Creating hospitals...")
hopital1, created = Hopital.objects.get_or_create(
    nom='Hôpital Principal de Dakar',
    defaults={
        'adresse': 'Avenue Georges Pompidou, Dakar',
        'telephone': '+221 33 123 45 67',
        'latitude': 14.6937,
        'longitude': -17.4440
    }
)
print(f"Hôpital Principal de Dakar: {created}")

hopital2, created = Hopital.objects.get_or_create(
    nom='Hôpital Aristide Le Dantec',
    defaults={
        'adresse': 'Rue Faustin Imbassa, Dakar',
        'telephone': '+221 33 987 65 43',
        'latitude': 14.6892,
        'longitude': -17.4428
    }
)
print(f"Hôpital Aristide Le Dantec: {created}")

# Create sample clinics
print("Creating clinics...")
clinique1, created = Clinique.objects.get_or_create(
    nom='Clinique Pasteur',
    defaults={
        'adresse': 'Rue Carnot, Dakar',
        'telephone': '+221 33 456 78 90',
        'latitude': 14.6915,
        'longitude': -17.4452
    }
)
print(f"Clinique Pasteur: {created}")

clinique2, created = Clinique.objects.get_or_create(
    nom='Clinique du Bel-Air',
    defaults={
        'adresse': 'Avenue Léopold Sédar Senghor, Dakar',
        'telephone': '+221 33 567 89 01',
        'latitude': 14.6958,
        'longitude': -17.4412
    }
)
print(f"Clinique du Bel-Air: {created}")

# Create sample dentists
print("Creating dentists...")
dentiste1, created = Dentiste.objects.get_or_create(
    nom='Cabinet Dentaire du Dr. Ndiaye',
    defaults={
        'adresse': 'Rue de Thiong, Dakar',
        'telephone': '+221 33 345 67 89',
        'latitude': 14.6880,
        'longitude': -17.4475
    }
)
print(f"Cabinet Dentaire du Dr. Ndiaye: {created}")

dentiste2, created = Dentiste.objects.get_or_create(
    nom='Centre Dentaire International',
    defaults={
        'adresse': 'Avenue Malick Sy, Dakar',
        'telephone': '+221 33 234 56 78',
        'latitude': 14.6985,
        'longitude': -17.4398
    }
)
print(f"Centre Dentaire International: {created}")

# Create sample pharmacies
print("Creating pharmacies...")
pharmacie1, created = Pharmacie.objects.get_or_create(
    nom='Pharmacie du Centre',
    defaults={
        'adresse': 'Place du Souvenir, Dakar',
        'telephone': '+221 33 111 22 33',
        'latitude': 14.6900,
        'longitude': -17.4430
    }
)
print(f"Pharmacie du Centre: {created}")

pharmacie2, created = Pharmacie.objects.get_or_create(
    nom='Pharmacie de la République',
    defaults={
        'adresse': 'Avenue Lamine Guèye, Dakar',
        'telephone': '+221 33 444 55 66',
        'latitude': 14.6970,
        'longitude': -17.4480
    }
)
print(f"Pharmacie de la République: {created}")

print(f"Total hospitals: {Hopital.objects.count()}")
print(f"Total clinics: {Clinique.objects.count()}")
print(f"Total dentists: {Dentiste.objects.count()}")
print(f"Total pharmacies: {Pharmacie.objects.count()}")
print("Health facilities data population completed!")