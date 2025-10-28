import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

from sante_app.models import Medecin, DisponibiliteMedecin
from datetime import time, date

# Test 1: Vérifier médecin (utilisons le premier disponible)
print("=== Test 1: Vérifier médecin ===")
try:
    # Get the first available doctor
    medecin = Medecin.objects.first()
    if medecin:
        print(f"✓ Médecin trouvé: {medecin.user.username} (ID: {medecin.id})")
        print(f"  Prénom: {medecin.user.first_name}")
        print(f"  Nom: {medecin.user.last_name}")
        print(f"  Spécialité: {medecin.specialite}")
        medecin_id = medecin.id
    else:
        print("✗ Aucun médecin trouvé dans la base de données")
        medecin_id = None
except Exception as e:
    print(f"✗ Erreur médecin: {e}")
    medecin_id = None

# Test 2: Vérifier disponibilités
print("\n=== Test 2: Vérifier disponibilités ===")
try:
    if medecin_id:
        dispos = DisponibiliteMedecin.objects.filter(medecin__id=medecin_id)
        print(f"Disponibilités trouvées: {dispos.count()}")
        for d in dispos:
            print(f"  - {d.jour}: {d.heure_debut} - {d.heure_fin} (Durée: {d.duree_consultation} min)")
            if d.pause_dejeuner_debut and d.pause_dejeuner_fin:
                print(f"    Pause déjeuner: {d.pause_dejeuner_debut} - {d.pause_dejeuner_fin}")
            print(f"    Actif: {d.actif}")
    else:
        print("✗ Impossible de vérifier les disponibilités: aucun médecin disponible")
        dispos = []
except Exception as e:
    print(f"✗ Erreur lors de la récupération des disponibilités: {e}")
    dispos = []

# Test 3: Créer une disponibilité test si aucune n'existe
print("\n=== Test 3: Création disponibilité test ===")
try:
    if medecin_id and len(dispos) == 0:
        print("⚠️ Aucune disponibilité! Création test...")
        # First check if medecin exists
        try:
            medecin = Medecin.objects.get(id=medecin_id)
            DisponibiliteMedecin.objects.create(
                medecin=medecin,
                jour='mardi',
                heure_debut=time(9, 0),
                heure_fin=time(17, 0),
                duree_consultation=30,
                pause_dejeuner_debut=time(12, 0),
                pause_dejeuner_fin=time(14, 0),
                actif=True
            )
            print("✓ Disponibilité test créée")
            # Refresh dispos list
            dispos = DisponibiliteMedecin.objects.filter(medecin__id=medecin_id)
        except Medecin.DoesNotExist:
            print(f"✗ Impossible de créer disponibilité: médecin ID {medecin_id} n'existe pas")
    elif medecin_id:
        print("✓ Disponibilités déjà présentes")
    else:
        print("✗ Impossible de créer disponibilité: aucun médecin disponible")
except Exception as e:
    print(f"✗ Erreur lors de la création de disponibilité: {e}")

# Test 4: Tester génération créneaux
print("\n=== Test 4: Test génération créneaux ===")
try:
    if medecin_id:
        dispo = DisponibiliteMedecin.objects.filter(medecin__id=medecin_id, actif=True).first()
        if dispo:
            # Test with a Monday date to match the doctor's availability
            # Use a future date to avoid past date filtering
            from datetime import datetime, timedelta
            today = datetime.now().date()
            # Find next Monday
            days_ahead = 0 - today.weekday()  # Monday is 0
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            test_date = today + timedelta(days_ahead)
            print(f"Test pour: {test_date}")
            print(f"Jour de la semaine: {test_date.strftime('%A')}")
            
            # Vérifier si le jour correspond
            jours_fr = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
            jour_correspondant = jours_fr[test_date.weekday()]
            print(f"Jour correspondant en français: {jour_correspondant}")
            print(f"Disponibilité du médecin: {dispo.jour}")
            
            # Appelle generate_time_slots si existe
            if hasattr(dispo, 'generate_time_slots'):
                slots = dispo.generate_time_slots(test_date)
                print(f"Créneaux générés: {len(slots)}")
                for slot in slots[:5]:  # Afficher les 5 premiers créneaux
                    print(f"  - {slot}")
                if len(slots) > 5:
                    print(f"  ... et {len(slots) - 5} autres créneaux")
            else:
                print("✗ Méthode generate_time_slots non trouvée")
        else:
            print(f"✗ Aucune disponibilité active trouvée pour le médecin ID {medecin_id}")
    else:
        print("✗ Impossible de tester la génération de créneaux: aucun médecin disponible")
except Exception as e:
    print(f"✗ Erreur lors du test de génération de créneaux: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Fin des tests ===")