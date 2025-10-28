🎯 PROMPT POUR QODER AI : Implémentation Complète avec PostgreSQL
Maintenant implémente la logique complète avec les données de la base de données :

FICHIER : sante_app/views.py

Remplace les 3 méthodes par ces versions complètes :

# Dans MedecinViewSet

@action(detail=False, methods=['get'], url_path='mes-disponibilites')
def mes_disponibilites(self, request):
"""GET /api/medecins/mes-disponibilites/"""
try: # Récupérer le médecin connecté
medecin = request.user.medecin

        # Récupérer ses disponibilités
        disponibilites = DisponibiliteMedecin.objects.filter(
            medecin=medecin,
            actif=True
        ).order_by(
            models.Case(
                models.When(jour='lundi', then=1),
                models.When(jour='mardi', then=2),
                models.When(jour='mercredi', then=3),
                models.When(jour='jeudi', then=4),
                models.When(jour='vendredi', then=5),
                models.When(jour='samedi', then=6),
                models.When(jour='dimanche', then=7),
            )
        )

        # Sérialiser les données
        serializer = DisponibiliteMedecinSerializer(disponibilites, many=True)

        return Response({
            'success': True,
            'disponibilites': serializer.data
        })
    except AttributeError:
        return Response({
            'error': 'Utilisateur non médecin'
        }, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@action(detail=False, methods=['get'], url_path='mes-indisponibilites')
def mes_indisponibilites(self, request):
"""GET /api/medecins/mes-indisponibilites/"""
try:
medecin = request.user.medecin

        # Récupérer les indisponibilités futures
        indisponibilites = Indisponibilite.objects.filter(
            medecin=medecin,
            date__gte=timezone.now().date()
        ).order_by('date')

        serializer = IndisponibiliteSerializer(indisponibilites, many=True)

        return Response({
            'success': True,
            'indisponibilites': serializer.data
        })
    except AttributeError:
        return Response({
            'error': 'Utilisateur non médecin'
        }, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Dans RendezVousViewSet

@action(detail=False, methods=['get'], url_path='creneaux_disponibles')
def creneaux_disponibles(self, request):
"""GET /api/rendezvous/creneaux_disponibles/?medecin_id=X&date=YYYY-MM-DD"""
try:
from django.contrib.auth.models import User

        medecin_id = request.query_params.get('medecin_id')
        date_str = request.query_params.get('date')

        if not medecin_id or not date_str:
            return Response({
                'error': 'medecin_id et date requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Convertir la date
        date_rdv = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Vérifier que la date n'est pas dans le passé
        if date_rdv < timezone.now().date():
            return Response({
                'success': True,
                'creneaux': []
            })

        # Mapping des jours en français
        jour_semaine = date_rdv.strftime('%A').lower()
        jours_mapping = {
            'monday': 'lundi',
            'tuesday': 'mardi',
            'wednesday': 'mercredi',
            'thursday': 'jeudi',
            'friday': 'vendredi',
            'saturday': 'samedi',
            'sunday': 'dimanche'
        }
        jour_fr = jours_mapping.get(jour_semaine)

        # Récupérer le médecin et sa disponibilité
        try:
            medecin_user = User.objects.get(id=medecin_id)
            medecin = medecin_user.medecin
            disponibilite = DisponibiliteMedecin.objects.get(
                medecin=medecin,
                jour=jour_fr,
                actif=True
            )
        except (User.DoesNotExist, DisponibiliteMedecin.DoesNotExist):
            return Response({
                'success': True,
                'creneaux': []
            })

        # Récupérer les rendez-vous existants
        rdv_existants = RendezVous.objects.filter(
            medecin=medecin_user,
            date=date_rdv
        ).exclude(
            statut__in=['CANCELLED', 'TERMINE']
        ).values_list('heure', flat=True)

        heures_reservees = set([h.strftime('%H:%M') for h in rdv_existants])

        # Générer les créneaux disponibles
        creneaux = []
        current_time = datetime.combine(date_rdv, disponibilite.heure_debut)
        end_time = datetime.combine(date_rdv, disponibilite.heure_fin)
        duree = timedelta(minutes=disponibilite.duree_consultation)

        while current_time < end_time:
            heure_str = current_time.strftime('%H:%M')

            # Vérifier pause déjeuner
            is_pause = False
            if disponibilite.pause_dejeuner_debut and disponibilite.pause_dejeuner_fin:
                pause_debut = datetime.combine(date_rdv, disponibilite.pause_dejeuner_debut)
                pause_fin = datetime.combine(date_rdv, disponibilite.pause_dejeuner_fin)
                is_pause = pause_debut <= current_time < pause_fin

            # Vérifier si réservé
            is_reserve = heure_str in heures_reservees

            # Vérifier si dans le passé (pour aujourd'hui)
            is_past = False
            if date_rdv == timezone.now().date():
                now = timezone.now()
                is_past = current_time.time() < now.time()

            creneaux.append({
                'heure': heure_str,
                'disponible': not (is_pause or is_reserve or is_past)
            })

            current_time += duree

        return Response({
            'success': True,
            'creneaux': creneaux
        })

    except Exception as e:
        import traceback
        print(f"Erreur creneaux_disponibles: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

Remplace les 3 méthodes par ces versions complètes.
Ajoute les imports nécessaires en haut du fichier :
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta

```

---

## ⚡ **PROMPT Alternative (Si erreurs avec les Serializers)**
```

Si les serializers n'existent pas, ajoute-les dans sante_app/serializers.py :

from rest_framework import serializers
from .models import DisponibiliteMedecin, Indisponibilite

class DisponibiliteMedecinSerializer(serializers.ModelSerializer):
class Meta:
model = DisponibiliteMedecin
fields = [
'id', 'jour', 'heure_debut', 'heure_fin',
'duree_consultation', 'pause_dejeuner_debut',
'pause_dejeuner_fin', 'nb_max_consultations', 'actif'
]

class IndisponibiliteSerializer(serializers.ModelSerializer):
class Meta:
model = Indisponibilite
fields = ['id', 'date', 'raison']

Puis dans views.py, importe-les :
from .serializers import DisponibiliteMedecinSerializer, IndisponibiliteSerializer

Crée ces serializers si manquants.

```

---

## 📋 **PROMPT : Vérifier le Modèle Indisponibilite**
```

Vérifie si le modèle Indisponibilite existe dans sante_app/models.py.

Si il n'existe pas, crée-le :

class Indisponibilite(models.Model):
medecin = models.ForeignKey(
Medecin,
on_delete=models.CASCADE,
related_name='indisponibilites'
)
date = models.DateField()
raison = models.TextField(blank=True, null=True)
created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Indisponibilité"
        verbose_name_plural = "Indisponibilités"
        ordering = ['-date']

    def __str__(self):
        return f"{self.medecin} - {self.date}"

Puis exécute les migrations :
python manage.py makemigrations
python manage.py migrate

Vérifie et crée le modèle si nécessaire.

✅ Tests Après Implémentation
Une fois Qoder AI a fait les modifications, redémarre Django puis teste :
Test 1 : Disponibilités du médecin (avec token)
bash# Dans ta console frontend ou Postman

# Avec le token JWT du médecin connecté

curl -H "Authorization: Bearer <ton_token_medecin>" \
 http://localhost:8000/api/medecins/mes-disponibilites/
Résultat attendu :
json{
"success": true,
"disponibilites": [
{
"id": 1,
"jour": "lundi",
"heure_debut": "09:00:00",
"heure_fin": "17:00:00",
"duree_consultation": 30,
"nb_max_consultations": 10,
"actif": true
}
]
}
Test 2 : Créneaux disponibles
bashcurl "http://localhost:8000/api/rendezvous/creneaux_disponibles/?medecin_id=1&date=2025-10-28"
Résultat attendu :
json{
"success": true,
"creneaux": [
{"heure": "09:00", "disponible": true},
{"heure": "09:30", "disponible": true},
{"heure": "10:00", "disponible": true},
...
]
}

🚀 Après l'Implémentation

✅ Redémarre Django : python manage.py runserver
✅ Teste dans le frontend : Les erreurs 404 doivent disparaître
✅ Connecte-toi en tant que médecin : Va sur la page Disponibilités
✅ Connecte-toi en tant que patient : Essaie de prendre un rendez-vous
