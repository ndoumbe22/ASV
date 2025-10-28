import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Sante_Virtuelle'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sante_Virtuelle.settings')
django.setup()

from django.utils import timezone
from datetime import datetime, timedelta
from sante_app.models import Medecin, DisponibiliteMedecin, RendezVous, Patient
from django.contrib.auth import get_user_model

User = get_user_model()

# TEST 1: Créer disponibilité médecin

print("=== TEST 1: Disponibilité Médecin ===")
try:
    medecin_user = User.objects.get(id=19)
    medecin, created = Medecin.objects.get_or_create(user=medecin_user)
    dispo, created = DisponibiliteMedecin.objects.get_or_create(
        medecin=medecin,
        jour='mercredi',
        defaults={
            'heure_debut': '09:00',
            'heure_fin': '17:00',
            'duree_consultation': 30,
            'pause_dejeuner_debut': '12:00',
            'pause_dejeuner_fin': '14:00',
            'actif': True
        }
    )
    print(f"✓ Disponibilité: {dispo.jour} {dispo.heure_debut}-{dispo.heure_fin}")
except Exception as e:
    print(f"❌ Erreur lors de la création de la disponibilité: {e}")

# TEST 2: Créer un RDV de test

print("\n=== TEST 2: Créer RDV Test ===")
rdv = None
try:
    # Get a patient user
    patient_user = User.objects.filter(role='patient').first()
    if not patient_user:
        print("❌ Aucun patient trouvé dans la base de données")
    else:
        test_date = datetime.now().replace(hour=10, minute=30, second=0, microsecond=0)
        test_date += timedelta(days=7)  # Dans 7 jours

        # Extract date and time separately
        test_date_only = test_date.date()
        test_time_only = test_date.time()

        rdv = RendezVous.objects.create(
            patient=patient_user,
            medecin=medecin_user,
            date=test_date_only,
            heure=test_time_only,
            description="Test",
            statut='CONFIRMED'
        )
        print(f"✓ RDV créé: {rdv.date} {rdv.heure} - Statut: {rdv.statut}")
except Exception as e:
    print(f"❌ Erreur lors de la création du RDV: {e}")
    import traceback
    traceback.print_exc()

# TEST 3: Vérifier que le créneau est maintenant indisponible

print("\n=== TEST 3: API creneaux_disponibles ===")
try:
    from django.test import RequestFactory
    from sante_app.views import RendezVousViewSet

    factory = RequestFactory()
    request = factory.get('/api/rendezvous/creneaux_disponibles/', {
        'medecin_id': medecin_user.id,
        'date': test_date.strftime('%Y-%m-%d')
    })
    request.user = medecin_user

    viewset = RendezVousViewSet()
    response = viewset.creneaux_disponibles(request)

    print(f"Status: {response.status_code}")
    if hasattr(response, 'data'):
        slots = response.data.get('slots', [])
        slot_10h30 = next((s for s in slots if s['heure'] == '10:30'), None)

        if slot_10h30:
            print(f"Créneau 10:30: {'❌ INDISPONIBLE' if not slot_10h30['disponible'] else '✅ DISPONIBLE'}")
            if not slot_10h30['disponible']:
                print(f"Motif: {slot_10h30.get('motif_indisponibilite')}")
        else:
            print("❌ Créneau 10:30 non trouvé")
    else:
        print("❌ Réponse sans données")
except Exception as e:
    print(f"❌ Erreur lors du test de l'API: {e}")
    import traceback
    traceback.print_exc()

# Cleanup
try:
    if rdv:
        rdv.delete()
        print("\n✓ Test terminé, RDV supprimé")
    else:
        print("\n⚠️ Aucun RDV à supprimer")
except Exception as e:
    print(f"❌ Erreur lors du nettoyage: {e}")