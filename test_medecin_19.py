import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

from django.contrib.auth import get_user_model
from sante_app.models import Medecin, DisponibiliteMedecin
from datetime import date, time, timedelta

User = get_user_model()

# 1. Vérifier user 19
print("=== VÉRIFICATION USER 19 ===")
try:
    user = User.objects.get(id=19)
    print(f"✓ User trouvé: {user.username} (role: {user.role})")
    
    # Vérifier lien medecin
    if hasattr(user, 'medecin'):
        medecin = user.medecin
        print(f"✓ Medecin ID: {medecin.id}")
        print(f"  Spécialité: {medecin.specialite}")
    else:
        print("✗ PAS D'OBJET MEDECIN!")
        # Trouver le bon medecin
        medecins = Medecin.objects.filter(user_id=19)
        if medecins.exists():
            print(f"  Mais trouvé via filter: {medecins.first().id}")
        sys.exit(1)
        
except User.DoesNotExist:
    print("✗ User 19 n'existe pas!")
    sys.exit(1)

# 2. Vérifier disponibilités du médecin
print("\n=== DISPONIBILITÉS MÉDECIN 19 ===")
dispos = DisponibiliteMedecin.objects.filter(medecin__user_id=19)
print(f"Nombre: {dispos.count()}")

print("\n=== CRÉATION DISPONIBILITÉ MARDI SI NÉCESSAIRE ===")
# Vérifier s'il y a déjà une disponibilité pour mardi
dispo_mardi = dispos.filter(jour='mardi').first()
if not dispo_mardi:
    print("⚠️ Aucune disponibilité mardi! Création...")
    # Récupérer l'objet medecin
    medecin_obj = Medecin.objects.filter(user_id=19).first()
    if not medecin_obj:
        print("✗ Impossible de trouver l'objet Medecin")
        sys.exit(1)
    
    DisponibiliteMedecin.objects.create(
        medecin=medecin_obj,
        jour='mardi',
        heure_debut=time(9, 0),
        heure_fin=time(17, 0),
        duree_consultation=30,
        pause_dejeuner_debut=time(12, 0),
        pause_dejeuner_fin=time(14, 0),
        actif=True
    )
    print("✓ Disponibilité mardi créée")
    dispos = DisponibiliteMedecin.objects.filter(medecin__user_id=19)
else:
    print("✓ Disponibilité mardi déjà présente")

for d in dispos:
    print(f"  {d.jour}: {d.heure_debut}-{d.heure_fin}")

# 3. Test génération créneaux pour 2025-10-28 (mardi)
print("\n=== TEST CRÉNEAUX 2025-10-28 ===")
test_date = date(2025, 10, 28)
print(f"Jour de la semaine: {test_date.strftime('%A')}")

dispo_mardi = dispos.filter(jour='mardi', actif=True).first()
if dispo_mardi:
    print("✓ Disponibilité mardi trouvée")
    try:
        slots = dispo_mardi.generate_time_slots(test_date)
        print(f"✓ Créneaux générés: {len(slots)}")
        print(f"  Premier: {slots[0] if slots else 'Aucun'}")
        print(f"  Dernier: {slots[-1] if slots else 'Aucun'}")
    except Exception as e:
        print(f"✗ Erreur génération: {e}")
        import traceback
        traceback.print_exc()
else:
    print("✗ Pas de disponibilité mardi active")

# 4. Test API endpoint direct
print("\n=== TEST ENDPOINT API ===")
from django.test import RequestFactory
from sante_app.views import RendezVousViewSet

factory = RequestFactory()
request = factory.get('/api/rendezvous/creneaux_disponibles/', {
    'medecin_id': '19',  # User ID, not Medecin ID
    'date': '2025-10-28'
})
request.user = user

viewset = RendezVousViewSet()
try:
    response = viewset.creneaux_disponibles(request)
    print(f"Status: {response.status_code}")
    if hasattr(response, 'data'):
        print(f"Data: {response.data}")
    else:
        print(f"Response: {response}")
except Exception as e:
    print(f"✗ Erreur: {e}")
    import traceback
    traceback.print_exc()