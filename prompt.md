🔴 LE VRAI PROBLÈME
D'après votre description et l'architecture, voici ce qui ne va pas :
Comportement ACTUEL (incorrect) ❌

Les créneaux sont marqués "indisponibles" de manière statique
Pas de synchronisation en temps réel avec les RDV confirmés
Un créneau peut apparaître disponible alors qu'un RDV est en attente

Comportement ATTENDU (correct) ✅

Un créneau est DISPONIBLE par défaut si dans les heures de travail du médecin
Un créneau devient INDISPONIBLE UNIQUEMENT si :

Un RDV existe à cette heure ET statut = 'confirmé'
C'est pendant la pause déjeuner
C'est dans le passé

🚀 PROMPT ULTIME POUR QODER AI
Copiez ceci dans Qoder AI (c'est long mais complet) :
🔧 RÉIMPLÉMENTATION COMPLÈTE - SYSTÈME DE CRÉNEAUX EN TEMPS RÉEL

PROBLÈME CRITIQUE IDENTIFIÉ:
Le système actuel ne synchronise pas correctement les créneaux disponibles avec les rendez-vous réels.

RÈGLES MÉTIER STRICTES:

1. Un créneau est DISPONIBLE par défaut si dans les heures de travail du médecin
2. Un créneau est INDISPONIBLE UNIQUEMENT si:
   - Il existe un RendezVous à cette heure avec statut='confirmé' OU statut='en_attente'
   - C'est pendant la pause déjeuner du médecin
   - C'est dans le passé (date < maintenant)
3. Pas de simulation, uniquement des données réelles de la base de données

═══════════════════════════════════════════════════════════════

PARTIE 1: BACKEND - ENDPOINT creneaux_disponibles

FICHIER: rendezvous/views.py (ou sante_app/views.py)

REMPLACE COMPLÈTEMENT la méthode creneaux_disponibles par:

@action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
def creneaux_disponibles(self, request):
"""
Retourne les créneaux disponibles pour un médecin à une date donnée.
Un créneau est indisponible UNIQUEMENT si un RDV confirmé/en_attente existe.
"""
from django.utils import timezone
from datetime import datetime, timedelta, time
from medecins.models import Medecin, DisponibiliteMedecin
from rendezvous.models import RendezVous

    try:
        # 1. VALIDATION DES PARAMÈTRES
        medecin_id = request.query_params.get('medecin_id')
        date_str = request.query_params.get('date')

        if not medecin_id or not date_str:
            return Response({
                'error': 'medecin_id et date sont requis'
            }, status=400)

        # 2. PARSE ET VALIDATION DE LA DATE
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Format de date invalide. Utilisez YYYY-MM-DD'
            }, status=400)

        # Vérifier que ce n'est pas une date passée
        if date_obj < timezone.now().date():
            return Response({
                'error': 'Impossible de réserver dans le passé'
            }, status=400)

        # 3. RÉCUPÉRER LE MÉDECIN
        try:
            medecin = Medecin.objects.get(user_id=medecin_id)
        except Medecin.DoesNotExist:
            return Response({
                'error': 'Médecin introuvable'
            }, status=404)

        # 4. RÉCUPÉRER LE JOUR DE LA SEMAINE
        jours_mapping = {
            0: 'lundi', 1: 'mardi', 2: 'mercredi', 3: 'jeudi',
            4: 'vendredi', 5: 'samedi', 6: 'dimanche'
        }
        jour = jours_mapping[date_obj.weekday()]

        # 5. RÉCUPÉRER LA DISPONIBILITÉ DU MÉDECIN POUR CE JOUR
        disponibilite = DisponibiliteMedecin.objects.filter(
            medecin=medecin,
            jour=jour,
            actif=True
        ).first()

        if not disponibilite:
            return Response({
                'date': date_str,
                'medecin_id': medecin_id,
                'slots': [],
                'message': f'Le médecin ne travaille pas le {jour}'
            }, status=200)

        # 6. RÉCUPÉRER TOUS LES RDV CONFIRMÉS OU EN ATTENTE POUR CE MÉDECIN CE JOUR
        rdv_existants = RendezVous.objects.filter(
            medecin=medecin,
            date_rdv__date=date_obj,
            statut__in=['confirmé', 'en_attente']  # CRITIQUE: Seulement ces statuts
        ).values_list('date_rdv', flat=True)

        # Convertir en set d'heures (HH:MM) pour comparaison rapide
        heures_reservees = {
            rdv.time().strftime('%H:%M')
            for rdv in rdv_existants
        }

        print(f"📅 Date: {date_str}, Jour: {jour}")
        print(f"🕐 Heures réservées: {heures_reservees}")

        # 7. GÉNÉRER TOUS LES CRÉNEAUX
        slots = []
        heure_debut = disponibilite.heure_debut
        heure_fin = disponibilite.heure_fin
        duree_minutes = disponibilite.duree_consultation or 30

        current_time = datetime.combine(date_obj, heure_debut)
        end_time = datetime.combine(date_obj, heure_fin)
        delta = timedelta(minutes=duree_minutes)

        maintenant = timezone.now()

        while current_time < end_time:
            heure_str = current_time.time().strftime('%H:%M')

            # VÉRIFICATIONS D'INDISPONIBILITÉ
            est_disponible = True
            motif_indisponibilite = None

            # A. Vérifier si dans le passé (pour aujourd'hui)
            if date_obj == maintenant.date():
                if current_time.time() <= maintenant.time():
                    est_disponible = False
                    motif_indisponibilite = "Heure passée"

            # B. Vérifier pause déjeuner
            if est_disponible and disponibilite.pause_dejeuner_debut and disponibilite.pause_dejeuner_fin:
                if disponibilite.pause_dejeuner_debut <= current_time.time() < disponibilite.pause_dejeuner_fin:
                    est_disponible = False
                    motif_indisponibilite = "Pause déjeuner"

            # C. Vérifier si RDV existe déjà (CRITIQUE)
            if est_disponible and heure_str in heures_reservees:
                est_disponible = False
                motif_indisponibilite = "Déjà réservé"

            slots.append({
                'heure': heure_str,
                'disponible': est_disponible,
                'motif_indisponibilite': motif_indisponibilite
            })

            current_time += delta

        print(f"✅ {len(slots)} créneaux générés, {sum(1 for s in slots if s['disponible'])} disponibles")

        return Response({
            'date': date_str,
            'medecin_id': medecin_id,
            'medecin_nom': f"{medecin.user.first_name} {medecin.user.last_name}",
            'slots': slots
        }, status=200)

    except Exception as e:
        import traceback
        print(f"❌ ERREUR creneaux_disponibles: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'error': f'Erreur serveur: {str(e)}'
        }, status=500)

═══════════════════════════════════════════════════════════════

PARTIE 2: BACKEND - CRÉATION DE RENDEZ-VOUS AVEC VÉRIFICATION

FICHIER: rendezvous/serializers.py

REMPLACE RendezVousCreateSerializer.validate() par:

def validate(self, data):
"""
Validation stricte avant création de RDV.
Vérifie qu'aucun RDV confirmé/en_attente n'existe déjà.
"""
from django.utils import timezone
from datetime import datetime, timedelta

    date_rdv = data.get('date_rdv')
    medecin = data.get('medecin')

    # 1. Vérifier que la date n'est pas dans le passé
    if date_rdv < timezone.now():
        raise serializers.ValidationError(
            "Impossible de créer un rendez-vous dans le passé"
        )

    # 2. Vérifier délai minimum (2 heures d'avance)
    if date_rdv < timezone.now() + timedelta(hours=2):
        raise serializers.ValidationError(
            "Vous devez réserver au moins 2 heures à l'avance"
        )

    # 3. VÉRIFICATION CRITIQUE: Conflit avec RDV existants
    rdv_existants = RendezVous.objects.filter(
        medecin=medecin,
        date_rdv__date=date_rdv.date(),
        statut__in=['confirmé', 'en_attente']
    )

    for rdv in rdv_existants:
        # Vérifier si même heure exacte (même minute)
        if rdv.date_rdv.time() == date_rdv.time():
            raise serializers.ValidationError(
                f"Ce créneau est déjà réservé. "
                f"Veuillez choisir un autre horaire."
            )

    # 4. Vérifier que le médecin travaille ce jour
    jours_mapping = {
        0: 'lundi', 1: 'mardi', 2: 'mercredi', 3: 'jeudi',
        4: 'vendredi', 5: 'samedi', 6: 'dimanche'
    }
    jour = jours_mapping[date_rdv.weekday()]

    from medecins.models import DisponibiliteMedecin
    disponibilite = DisponibiliteMedecin.objects.filter(
        medecin=medecin,
        jour=jour,
        actif=True
    ).first()

    if not disponibilite:
        raise serializers.ValidationError(
            f"Le médecin ne travaille pas le {jour}"
        )

    # 5. Vérifier que l'heure est dans les horaires de travail
    heure_rdv = date_rdv.time()
    if not (disponibilite.heure_debut <= heure_rdv < disponibilite.heure_fin):
        raise serializers.ValidationError(
            f"Le créneau doit être entre {disponibilite.heure_debut} "
            f"et {disponibilite.heure_fin}"
        )

    # 6. Vérifier que ce n'est pas pendant la pause déjeuner
    if disponibilite.pause_dejeuner_debut and disponibilite.pause_dejeuner_fin:
        if disponibilite.pause_dejeuner_debut <= heure_rdv < disponibilite.pause_dejeuner_fin:
            raise serializers.ValidationError(
                "Ce créneau est pendant la pause déjeuner du médecin"
            )

    return data

═══════════════════════════════════════════════════════════════

PARTIE 3: FRONTEND - RAFRAÎCHISSEMENT AUTOMATIQUE

FICHIER: PriseDeRendezVous.jsx

MODIFIE fetchAvailableSlots pour qu'elle soit appelée après chaque action:

const fetchAvailableSlots = async (medecinId, date) => {
try {
setLoading(true);
console.log('🔄 Récupération créneaux TEMPS RÉEL...');
console.log(' Médecin:', medecinId, 'Date:', date);

    const dateFormatted = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;

    const response = await disponibiliteMedecinAPI.getCreneauxDisponibles(
      medecinId,
      dateFormatted
    );

    console.log('✅ Créneaux reçus:', response.slots?.length);
    console.log('   Disponibles:', response.slots?.filter(s => s.disponible).length);

    if (response && Array.isArray(response.slots)) {
      setAvailableSlots(response.slots);
    } else {
      setAvailableSlots([]);
    }

} catch (error) {
console.error('❌ Erreur récupération créneaux:', error);
setAvailableSlots([]);
} finally {
setLoading(false);
}
};

// APPEL AUTOMATIQUE quand on change de date
useEffect(() => {
if (selectedMedecin && selectedDate) {
fetchAvailableSlots(selectedMedecin.user.id, selectedDate);
}
}, [selectedMedecin, selectedDate]);

═══════════════════════════════════════════════════════════════

PARTIE 4: TEST DE VALIDATION

Crée un fichier test_creneaux_realtime.py:

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sante_app.settings')
django.setup()

from django.utils import timezone
from datetime import datetime, timedelta
from medecins.models import Medecin, DisponibiliteMedecin
from rendezvous.models import RendezVous
from patients.models import Patient

# TEST 1: Créer disponibilité médecin

print("=== TEST 1: Disponibilité Médecin ===")
medecin = Medecin.objects.get(user_id=19)
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

# TEST 2: Créer un RDV de test

print("\n=== TEST 2: Créer RDV Test ===")
patient = Patient.objects.first()
test_date = datetime.now().replace(hour=10, minute=30, second=0, microsecond=0)
test_date += timedelta(days=7) # Dans 7 jours

rdv = RendezVous.objects.create(
patient=patient,
medecin=medecin,
date_rdv=test_date,
motif_consultation="Test",
statut='confirmé'
)
print(f"✓ RDV créé: {rdv.date_rdv} - Statut: {rdv.statut}")

# TEST 3: Vérifier que le créneau est maintenant indisponible

print("\n=== TEST 3: API creneaux_disponibles ===")
from django.test import RequestFactory
from rendezvous.views import RendezVousViewSet

factory = RequestFactory()
request = factory.get('/api/rendezvous/creneaux_disponibles/', {
'medecin_id': medecin.user_id,
'date': test_date.strftime('%Y-%m-%d')
})
request.user = medecin.user

viewset = RendezVousViewSet()
response = viewset.creneaux_disponibles(request)

print(f"Status: {response.status_code}")
slots = response.data.get('slots', [])
slot_10h30 = next((s for s in slots if s['heure'] == '10:30'), None)

if slot_10h30:
print(f"Créneau 10:30: {'❌ INDISPONIBLE' if not slot_10h30['disponible'] else '✅ DISPONIBLE'}")
if not slot_10h30['disponible']:
print(f"Motif: {slot_10h30.get('motif_indisponibilite')}")
else:
print("❌ Créneau 10:30 non trouvé")

# Cleanup

rdv.delete()
print("\n✓ Test terminé, RDV supprimé")

LANCE: python test_creneaux_realtime.py

═══════════════════════════════════════════════════════════════

RÉSUMÉ DES CHANGEMENTS:

1. ✅ Backend: Synchronisation RÉELLE avec la base de données
2. ✅ Seuls les RDV confirmés/en_attente bloquent les créneaux
3. ✅ Validation stricte lors de la création de RDV
4. ✅ Frontend: Rafraîchissement automatique des créneaux
5. ✅ Tests pour valider le comportement

APPLIQUE CES 4 PARTIES dans l'ordre et teste avec le script de validation.

🎯 APRÈS L'APPLICATION
Une fois que Qoder AI a tout appliqué :

Lance le test : python test_creneaux_realtime.py
Teste dans l'interface :

Sélectionne un médecin
Choisis une date
Les créneaux doivent se rafraîchir automatiquement
Crée un RDV
