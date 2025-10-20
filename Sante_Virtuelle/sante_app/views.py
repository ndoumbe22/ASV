from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from .forms import MessageContactForm
from django.contrib import messages
from .serializers import CliniqueSerializer, DentisteSerializer, HopitalSerializer, PharmacieSerializer, RendezVousSerializer, TraitementSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes

from .models import (
    Patient, Medecin, RendezVous, Consultation, Medicament,
    Pathologie, Traitement, Constante, Mesure, Article,
    StructureDeSante, Service, Hopital, Clinique, Dentiste,Pharmacie,
    ChatbotConversation, ContactFooter, MedicalDocument, ChatbotKnowledgeBase  # Added MedicalDocument and ChatbotKnowledgeBase
)
from .serializers import (
    PatientSerializer, MedecinSerializer, RendezVousSerializer,
    ConsultationSerializer, MedicamentSerializer,
    PathologieSerializer, TraitementSerializer, ConstanteSerializer,
    MesureSerializer, ArticleSerializer, StructureDeSanteSerializer,
    ServiceSerializer, ContactFooterSerializer, ChatbotConversationSerializer,
    MedicalDocumentSerializer, ChatbotKnowledgeBaseSerializer, RendezVousCreateSerializer  # Added MedicalDocumentSerializer and ChatbotKnowledgeBaseSerializer
)

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
import os
from django.conf import settings
from django.http import HttpResponse
import logging
from .notifications import NotificationService

# Add these imports for admin statistics
from django.db.models import Count, Q
from datetime import date, timedelta
from .models import log_action  # Added for audit logging

logger = logging.getLogger(__name__)

from .models import log_action  # Added for audit logging

logger = logging.getLogger(__name__)

# --------------------
# Patients
# --------------------
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_queryset(self):
        return Patient.objects.all()

    def get_permissions(self):
        # rendre accessible en lecture seule publiquement
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Médecins
# --------------------
class MedecinViewSet(viewsets.ModelViewSet):
    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer

    def get_queryset(self):
        return Medecin.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Rendez-vous
# --------------------
class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer

    def get_queryset(self):
        return RendezVous.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RendezVousCreateSerializer
        return RendezVousSerializer
    
    def perform_create(self, serializer):
        # Auto-assign patient from authenticated user if not provided
        if not serializer.validated_data.get('patient'):
            serializer.save(patient=self.request.user)
        else:
            serializer.save()
        
        # Send notification to the doctor
        from .notifications import NotificationService
        try:
            # Get the appointment instance after saving
            appointment = serializer.instance
            NotificationService.send_appointment_request_notification(appointment)
        except Exception as e:
            print(f"Error sending appointment notification: {e}")

# --------------------
# Consultations
# --------------------
class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer

    def get_queryset(self):
        return Consultation.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Médicaments
# --------------------
class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer

    def get_queryset(self):
        return Medicament.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Pathologies
# --------------------
class PathologieViewSet(viewsets.ModelViewSet):
    queryset = Pathologie.objects.all()
    serializer_class = PathologieSerializer

    def get_queryset(self):
        return Pathologie.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Traitements
# --------------------
class TraitementViewSet(viewsets.ModelViewSet):
    queryset = Traitement.objects.all()
    serializer_class = TraitementSerializer

    def get_queryset(self):
        return Traitement.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Constantes
# --------------------
class ConstanteViewSet(viewsets.ModelViewSet):
    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer

    def get_queryset(self):
        return Constante.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Mesures
# --------------------
class MesureViewSet(viewsets.ModelViewSet):
    queryset = Mesure.objects.all()
    serializer_class = MesureSerializer

    def get_queryset(self):
        return Mesure.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Articles
# --------------------
class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    def get_queryset(self):
        return Article.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Structures de santé
# --------------------
class StructureDeSanteViewSet(viewsets.ModelViewSet):
    queryset = StructureDeSante.objects.all()
    serializer_class = StructureDeSanteSerializer

    def get_queryset(self):
        return StructureDeSante.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

# --------------------
# Services
# --------------------
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_queryset(self):
        return Service.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
class CliniqueViewSet(viewsets.ModelViewSet):
    queryset = Clinique.objects.all()
    serializer_class = CliniqueSerializer
    permission_classes = [AllowAny]


class DentisteViewSet(viewsets.ModelViewSet):
    queryset = Dentiste.objects.all()
    serializer_class = DentisteSerializer
    permission_classes = [AllowAny]


class HopitalViewSet(viewsets.ModelViewSet):
    queryset = Hopital.objects.all()
    serializer_class = HopitalSerializer
    permission_classes = [AllowAny]


class PharmacieViewSet(viewsets.ModelViewSet):
    queryset = Pharmacie.objects.all()
    serializer_class = PharmacieSerializer
    permission_classes = [AllowAny]


class ContactFooterViewSet(viewsets.ModelViewSet):
    queryset = ContactFooter.objects.all()
    serializer_class = ContactFooterSerializer
    permission_classes = [AllowAny]


# -------------------- Medical Documents --------------------
class MedicalDocumentViewSet(viewsets.ModelViewSet):
    queryset = MedicalDocument.objects.all()
    serializer_class = MedicalDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'medecin':
            # Doctors can see documents for their appointments
            return MedicalDocument.objects.filter(
                rendez_vous__medecin=user
            )
        else:
            # Patients can see documents they uploaded or that were shared with them
            return MedicalDocument.objects.filter(
                Q(uploaded_by=user) | Q(rendez_vous__patient=user)
            )

    def perform_create(self, serializer):
        # Save the appointment
        appointment = serializer.save()
        
        # Send notification to the doctor
        from .notifications import NotificationService
        try:
            # Additional validation to ensure we're only sending to one specific doctor
            if hasattr(appointment, 'medecin') and appointment.medecin and hasattr(appointment.medecin, 'user'):
                NotificationService.send_appointment_request_notification(appointment)
            else:
                print(f"❌ Erreur: Aucun médecin associé au rendez-vous {getattr(appointment, 'numero', 'N/A')}")
        except Exception as e:
            print(f"Error sending appointment notification: {e}")

# --------------------
# Chatbot (Rasa)
# --------------------
class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "")
        if not message:
            return Response({"error": "Aucun message fourni"}, status=400)

        # Get or create patient profile
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient non trouvé"}, status=400)

        rasa_url = "http://localhost:5005/webhooks/rest/webhook"
        payload = {
            "sender": str(request.user.id),
            "message": message
        }

        try:
            response = requests.post(rasa_url, json=payload)
            response_data = response.json()
            
            # Extract bot response
            bot_response = ""
            if response_data and isinstance(response_data, list) and len(response_data) > 0:
                bot_response = response_data[0].get("text", "Désolé, je n'ai pas compris.")
            else:
                bot_response = "Désolé, je n'ai pas compris."
            
            # Save conversation to database
            conversation = ChatbotConversation.objects.create(
                patient=patient,
                message_user=message,
                message_bot=bot_response
            )
            
            return Response({"responses": response_data})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
            
    def get(self, request):
        """Get chatbot conversation history for the authenticated patient"""
        try:
            patient = request.user.patient_profile
            conversations = ChatbotConversation.objects.filter(patient=patient).order_by('timestamp')
            serializer = ChatbotConversationSerializer(conversations, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient non trouvé"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


User = get_user_model()

# Inscription
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()

        # Empêcher l'inscription en tant qu'admin via frontend
        if data.get("role") == "admin":
            return Response(
                {"error": "Vous ne pouvez pas vous inscrire en tant qu'administrateur."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Par défaut "patient" si non spécifié
        if not data.get("role"):
            data["role"] = "patient"

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            try:
                user = serializer.save()  # 🔹 Profil Patient/Medecin créé automatiquement par signals
                
                # Send welcome email
                NotificationService.send_welcome_email(user)
                
                return Response({
                    "message": "Utilisateur créé avec succès",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": f"Erreur lors de la création de l'utilisateur: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --------------------
# Connexion
# --------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            logger.info(f"Tentative de connexion pour: {username}")
            
            if not username or not password:
                return Response(
                    {'error': 'Le nom d\'utilisateur et le mot de passe sont requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Authentifier l'utilisateur
            user = authenticate(username=username, password=password)
            
            if user is None:
                logger.warning(f"Échec d'authentification pour: {username}")
                return Response(
                    {'error': 'Identifiants incorrects'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.is_active:
                return Response(
                    {'error': 'Ce compte est désactivé. Veuillez contacter l\'administrateur.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Récupérer le profil selon le rôle
            profile_data = None
            if hasattr(user, 'patient_profile'):
                profile_data = {
                    'id': user.patient_profile.id,
                    'adresse': getattr(user.patient_profile, 'adresse', '')
                }
            elif hasattr(user, 'medecin_profile'):
                profile_data = {
                    'id': user.medecin_profile.id,
                    'specialite': getattr(user.medecin_profile, 'specialite', '')
                }
            
            logger.info(f"Connexion réussie pour: {username}")
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': getattr(user, 'email', ''),
                    'first_name': getattr(user, 'first_name', ''),
                    'last_name': getattr(user, 'last_name', ''),
                    'role': getattr(user, 'role', 'patient'),
                    'is_active': user.is_active,
                    'profile': profile_data
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur lors de la connexion: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Erreur serveur lors de la connexion. Veuillez réessayer plus tard.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def upcoming_appointments(request):
    patient = request.user  # on suppose que user = patient
    today = now().date()

    rdvs = RendezVous.objects.filter(
        patient=patient,
        date__gte=today
    ).exclude(
        statut__in=["CANCELLED", "TERMINE"]
    ).order_by("date", "heure")

    serializer = RendezVousSerializer(rdvs, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_medications(request):
    """Récupérer les rappels de médicaments du patient (avec audit)"""
    try:
        patient = Patient.objects.get(user=request.user)
        
        # LOG D'AUDIT
        log_action(
            user=request.user,
            action='read',
            model_name='MedicationReminders',
            object_id=patient.id,
            details={'patient': patient.user.username},
            request=request
        )
        
        rappels = RappelMedicament.objects.filter(patient=patient, actif=True)
        serializer = RappelMedicamentSerializer(rappels, many=True)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient non trouvé'}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, pk):
    rdv = get_object_or_404(RendezVous, pk=pk, patient=request.user)
    old_status = rdv.statut
    rdv.statut = "CANCELLED"
    rdv.save()
    
    # Send cancellation notification
    if old_status != "CANCELLED":
        NotificationService.send_appointment_cancellation(rdv)
    
    return Response({"message": "Rendez-vous annulé avec succès"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reschedule_appointment(request, pk):
    rdv = get_object_or_404(RendezVous, pk=pk, patient=request.user)
    new_date = request.data.get("date")
    new_heure = request.data.get("heure")

    if not new_date or not new_heure:
        return Response({"error": "Veuillez fournir une nouvelle date et heure"},
                        status=status.HTTP_400_BAD_REQUEST)

    # Store old values for notification
    old_date = rdv.date
    old_heure = rdv.heure

    rdv.date = new_date
    rdv.heure = new_heure
    old_status = rdv.statut
    rdv.statut = "RESCHEDULED"
    rdv.save()

    # Send reschedule notification
    if old_status != "RESCHEDULED":
        NotificationService.send_appointment_reschedule(rdv, old_date, old_heure)

    return Response({"message": "Rendez-vous reprogrammé avec succès"}, status=status.HTTP_200_OK)


# --------------------
# Medication Reminder APIs
# --------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medication_reminders(request):
    """Get or create medication reminders for the authenticated patient"""
    try:
        patient = request.user.patient_profile
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        # Get all medication reminders for the patient
        reminders = RappelMedicament.objects.filter(patient=patient).order_by('heure_rappel')
        serializer = RappelMedicamentSerializer(reminders, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new medication reminder
        serializer = RappelMedicamentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medication_reminder_detail(request, pk):
    """Get, update, or delete a specific medication reminder"""
    try:
        patient = request.user.patient_profile
        reminder = get_object_or_404(RappelMedicament, pk=pk, patient=patient)
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        serializer = RappelMedicamentSerializer(reminder)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RappelMedicamentSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        reminder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medication_history(request):
    """Get medication history for the authenticated patient"""
    try:
        patient = request.user.patient_profile
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get all medication history for the patient
    history = HistoriquePriseMedicament.objects.filter(
        rappel__patient=patient
    ).select_related('rappel').order_by('-date_prise')
    
    serializer = HistoriquePriseMedicamentSerializer(history, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_medication_taken(request, pk):
    """Mark a medication as taken"""
    try:
        patient = request.user.patient_profile
        history_entry = get_object_or_404(HistoriquePriseMedicament, pk=pk, rappel__patient=patient)
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update the history entry
    history_entry.prise_effectuee = True
    history_entry.notes = request.data.get('notes', 'Pris par le patient')
    history_entry.save()
    
    serializer = HistoriquePriseMedicamentSerializer(history_entry)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_statistics(request):
    """Statistiques pour le dashboard admin"""
    # Vérifier que l'utilisateur est admin
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    stats = {
        'total_users': User.objects.count(),
        'total_patients': Patient.objects.count(),
        'total_medecins': Medecin.objects.count(),
        'total_rendez_vous': RendezVous.objects.count(),
        'rendez_vous_today': RendezVous.objects.filter(date=today).count(),
        'rendez_vous_week': RendezVous.objects.filter(date__gte=week_ago).count(),
        'rendez_vous_month': RendezVous.objects.filter(date__gte=month_ago).count(),
        'rendez_vous_by_status': RendezVous.objects.values('statut').annotate(count=Count('id')),
        'new_users_week': User.objects.filter(date_joined__gte=week_ago).count(),
        'new_users_month': User.objects.filter(date_joined__gte=month_ago).count(),
        'total_consultations': Consultation.objects.count(),
        'total_pathologies': Pathologie.objects.count(),
        'total_medicaments': Medicament.objects.count(),
    }

    return Response(stats)

# ========== ARTICLES PUBLICS ==========

@api_view(['GET'])
def articles_publics(request):
    """Liste des articles validés (accès public)"""
    articles = Article.objects.filter(statut='valide').order_by('-date_publication')

    # Filtres optionnels
    categorie = request.GET.get('categorie')
    search = request.GET.get('search')

    if categorie and categorie != 'all':
        articles = articles.filter(categorie=categorie)

    if search:
        from django.db.models import Q
        articles = articles.filter(
            Q(titre__icontains=search) |
            Q(contenu__icontains=search) |
            Q(tags__icontains=search) |
            Q(resume__icontains=search)
        )

    serializer = ArticleListSerializer(articles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def article_detail_public(request, slug):
    """Détail d'un article public"""
    try:
        article = Article.objects.get(slug=slug, statut='valide')
        article.incrementer_vues()
        serializer = ArticleSerializer(article, context={'request': request})
        return Response(serializer.data)
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)


# ========== ARTICLES MÉDECINS ==========

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def articles_medecin(request):
    """Gestion des articles par les médecins"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
    except Medecin.DoesNotExist:
        return Response({'error': 'Profil médecin non trouvé'}, status=404)

    if request.method == 'GET':
        # Récupérer tous les articles du médecin
        statut = request.GET.get('statut', 'all')
        articles = Article.objects.filter(auteur=medecin)

        if statut != 'all':
            articles = articles.filter(statut=statut)

        articles = articles.order_by('-date_modification')
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Créer un nouvel article
        data = request.data.copy()
        data['auteur'] = medecin.id

        serializer = ArticleSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            article = serializer.save()
            return Response(ArticleSerializer(article, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def article_medecin_detail(request, pk):
    """Détail/modification/suppression d'un article par le médecin"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
        article = Article.objects.get(pk=pk, auteur=medecin)
    except Medecin.DoesNotExist:
        return Response({'error': 'Profil médecin non trouvé'}, status=404)
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé ou non autorisé'}, status=404)

    if request.method == 'GET':
        serializer = ArticleSerializer(article, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        if article.statut not in ['brouillon', 'refuse']:
            return Response({'error': 'Seuls les brouillons et articles refusés peuvent être modifiés'}, status=400)

        serializer = ArticleSerializer(article, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        if article.statut != 'brouillon':
            return Response({'error': 'Seuls les brouillons peuvent être supprimés'}, status=400)
        article.delete()
        return Response({'message': 'Article supprimé avec succès'}, status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_soumettre_validation(request, pk):
    """Soumettre un article pour validation par l'admin"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
        article = Article.objects.get(pk=pk, auteur=medecin)
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)

    if article.statut not in ['brouillon', 'refuse']:
        return Response({'error': 'Cet article ne peut pas être soumis'}, status=400)

    # Vérifier que les champs obligatoires sont remplis
    if not article.titre or not article.contenu or not article.resume:
        return Response({'error': 'Veuillez remplir tous les champs obligatoires'}, status=400)

    article.statut = 'en_attente'
    article.save()

    return Response({
        'message': 'Article soumis pour validation avec succès',
        'statut': article.statut
    })


# ========== ARTICLES ADMIN (Modération) ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def articles_admin_list(request):
    """Liste de tous les articles pour modération (admin uniquement)"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    statut = request.GET.get('statut', 'all')
    articles = Article.objects.all().order_by('-date_modification')

    if statut != 'all':
        articles = articles.filter(statut=statut)

    serializer = ArticleListSerializer(articles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def article_admin_detail(request, pk):
    """Détail d'un article pour modération"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    try:
        article = Article.objects.get(pk=pk)
        serializer = ArticleSerializer(article, context={'request': request})
        return Response(serializer.data)
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_valider(request, pk):
    """Valider un article (admin)"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    try:
        article = Article.objects.get(pk=pk)

        if article.statut not in ['en_attente', 'refuse', 'desactive']:
            return Response({'error': 'Cet article ne peut pas être validé'}, status=400)

        article.statut = 'valide'
        article.valide_par = request.user
        from django.utils import timezone
        article.date_validation = timezone.now()
        article.commentaire_moderation = request.data.get('commentaire', '')
        article.save()

        return Response({
            'message': 'Article validé avec succès',
            'statut': article.statut
        })
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_refuser(request, pk):
    """Refuser un article (admin)"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    commentaire = request.data.get('commentaire')
    if not commentaire:
        return Response({'error': 'Le commentaire est obligatoire pour refuser un article'}, status=400)

    try:
        article = Article.objects.get(pk=pk)

        article.statut = 'refuse'
        article.valide_par = request.user
        from django.utils import timezone
        article.date_validation = timezone.now()
        article.commentaire_moderation = commentaire
        article.save()

        return Response({
            'message': 'Article refusé',
            'statut': article.statut
        })
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_desactiver(request, pk):
    """Désactiver un article publié (admin)"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    try:
        article = Article.objects.get(pk=pk)

        if article.statut != 'valide':
            return Response({'error': 'Seuls les articles validés peuvent être désactivés'}, status=400)

        article.statut = 'desactive'
        article.commentaire_moderation = request.data.get('commentaire', 'Article désactivé')
        article.save()

        return Response({
            'message': 'Article désactivé',
            'statut': article.statut
        })
    except Article.DoesNotExist:
        return Response({'error': 'Article non trouvé'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def articles_statistics(request):
    """Statistiques des articles pour le dashboard admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    from django.db.models import Count, Sum
    stats = {
        'total': Article.objects.count(),
        'brouillons': Article.objects.filter(statut='brouillon').count(),
        'en_attente': Article.objects.filter(statut='en_attente').count(),
        'valides': Article.objects.filter(statut='valide').count(),
        'refuses': Article.objects.filter(statut='refuse').count(),
        'desactives': Article.objects.filter(statut='desactive').count(),
        'total_vues': Article.objects.filter(statut='valide').aggregate(total=Sum('vues'))['total'] or 0,
        'par_categorie': list(Article.objects.filter(statut='valide').values('categorie').annotate(count=Count('id')))
    }

    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Liste tous les utilisateurs pour l'admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    users = User.objects.all().order_by('-date_joined')
    data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': getattr(user, 'role', 'patient'),  # Default to 'patient' if role not set
        'is_active': user.is_active,
        'date_joined': user.date_joined
    } for user in users]

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    """Créer un nouvel utilisateur par l'admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    try:
        # Create user with provided data
        user_data = request.data.copy()
        
        # Check if username already exists
        if User.objects.filter(username=user_data.get('username')).exists():
            return Response({'error': 'Ce nom d\'utilisateur est déjà utilisé'}, status=400)
            
        # Check if email already exists
        if User.objects.filter(email=user_data.get('email')).exists():
            return Response({'error': 'Cet email est déjà utilisé'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=user_data.get('username'),
            password=user_data.get('password'),
            email=user_data.get('email'),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            role=user_data.get('role', 'patient'),
            is_active=user_data.get('is_active', True)
        )
        
        # Create profile based on role
        if user.role == 'patient':
            Patient.objects.get_or_create(user=user, defaults={'adresse': user_data.get('adresse', '')})
        elif user.role == 'medecin':
            Medecin.objects.get_or_create(user=user, defaults={
                'specialite': user_data.get('specialite', 'Généraliste'),
                'disponibilite': user_data.get('disponibilite', True)
            })
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'Erreur lors de la création de l\'utilisateur: {str(e)}'}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """Mettre à jour un utilisateur par l'admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        
        # Prevent admin from modifying another admin
        if user.role == 'admin' and user.id != request.user.id:
            return Response({'error': 'Impossible de modifier un autre administrateur'}, status=400)
        
        # Update user fields
        user_data = request.data
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)
        user.username = user_data.get('username', user.username)
        
        # Only allow role change if it's not an admin
        if user.role != 'admin':
            user.role = user_data.get('role', user.role)
        
        # Update active status
        user.is_active = user_data.get('is_active', user.is_active)
        
        # Save user
        user.save()
        
        # Update profile based on role
        if user.role == 'patient':
            patient, created = Patient.objects.get_or_create(user=user)
            if 'adresse' in user_data:
                patient.adresse = user_data['adresse']
                patient.save()
        elif user.role == 'medecin':
            medecin, created = Medecin.objects.get_or_create(user=user)
            if 'specialite' in user_data:
                medecin.specialite = user_data['specialite']
            if 'disponibilite' in user_data:
                medecin.disponibilite = user_data['disponibilite']
            medecin.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)
    except Exception as e:
        return Response({'error': f'Erreur lors de la mise à jour de l\'utilisateur: {str(e)}'}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_toggle_user_status(request, user_id):
    """Activer/désactiver un utilisateur"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user.role == 'admin' and user.id != request.user.id:
            return Response({'error': 'Impossible de modifier un autre administrateur'}, status=400)
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f'Utilisateur {"activé" if user.is_active else "désactivé"}',
            'is_active': user.is_active
        })
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Supprimer un utilisateur"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user.role == 'admin':
            return Response({'error': 'Impossible de supprimer un administrateur'}, status=400)
        user.delete()
        return Response({'message': 'Utilisateur supprimé'}, status=204)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_facilities(request):
    """Liste de tous les centres de santé pour la carte"""
    facilities = []

    # Récupérer les hôpitaux
    hopitaux = Hopital.objects.all()
    for hopital in hopitaux:
        facilities.append({
            'id': f'hopital_{hopital.id}',
            'nom': hopital.nom,
            'type': 'hopital',
            'adresse': getattr(hopital, 'adresse', ''),
            'latitude': float(getattr(hopital, 'latitude', 14.6928)),
            'longitude': float(getattr(hopital, 'longitude', -17.4467)),
            'telephone': getattr(hopital, 'telephone', ''),
            'horaires': getattr(hopital, 'horaires', ''),
        })

    # Récupérer les cliniques
    cliniques = Clinique.objects.all()
    for clinique in cliniques:
        facilities.append({
            'id': f'clinique_{clinique.id}',
            'nom': clinique.nom,
            'type': 'clinique',
            'adresse': getattr(clinique, 'adresse', ''),
            'latitude': float(getattr(clinique, 'latitude', 14.6928)),
            'longitude': float(getattr(clinique, 'longitude', -17.4467)),
            'telephone': getattr(clinique, 'telephone', ''),
            'horaires': getattr(clinique, 'horaires', ''),
        })

    # Récupérer les pharmacies
    pharmacies = Pharmacie.objects.all()
    for pharmacie in pharmacies:
        facilities.append({
            'id': f'pharmacie_{pharmacie.id}',
            'nom': pharmacie.nom,
            'type': 'pharmacie',
            'adresse': getattr(pharmacie, 'adresse', ''),
            'latitude': float(getattr(pharmacie, 'latitude', 14.6928)),
            'longitude': float(getattr(pharmacie, 'longitude', -17.4467)),
            'telephone': getattr(pharmacie, 'telephone', ''),
            'horaires': getattr(pharmacie, 'horaires', ''),
        })

    # Récupérer les dentistes
    dentistes = Dentiste.objects.all()
    for dentiste in dentistes:
        facilities.append({
            'id': f'dentiste_{dentiste.id}',
            'nom': dentiste.nom,
            'type': 'dentiste',
            'adresse': getattr(dentiste, 'adresse', ''),
            'latitude': float(getattr(dentiste, 'latitude', 14.6928)),
            'longitude': float(getattr(dentiste, 'longitude', -17.4467)),
            'telephone': getattr(dentiste, 'telephone', ''),
            'horaires': getattr(dentiste, 'horaires', ''),
        })

    return Response(facilities)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_health_facilities(request):
    """Liste des centres de santé à proximité d'une position donnée"""
    try:
        lat = float(request.GET.get('lat', 14.6937))
        lng = float(request.GET.get('lng', -17.444))
        radius = float(request.GET.get('radius', 10))  # Rayon en km, par défaut 10km
    except ValueError:
        return Response({'error': 'Paramètres de localisation invalides'}, status=400)
    
    # Fonction pour calculer la distance entre deux points (formule de Haversine)
    def calculate_distance(lat1, lon1, lat2, lon2):
        from math import radians, cos, sin, asin, sqrt
        # Convertir les degrés en radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Formule de Haversine
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Rayon de la Terre en km
        return c * r
    
    # Récupérer tous les centres de santé
    facilities = []
    
    # Récupérer les hôpitaux
    hopitaux = Hopital.objects.all()
    for hopital in hopitaux:
        if hopital.latitude and hopital.longitude:
            distance = calculate_distance(lat, lng, float(hopital.latitude), float(hopital.longitude))
            if distance <= radius:
                facilities.append({
                    'id': f'hopital_{hopital.id}',
                    'nom': hopital.nom,
                    'type': 'hopital',
                    'adresse': getattr(hopital, 'adresse', ''),
                    'latitude': float(hopital.latitude),
                    'longitude': float(hopital.longitude),
                    'telephone': getattr(hopital, 'telephone', ''),
                    'horaires': getattr(hopital, 'horaires', ''),
                    'distance': round(distance, 2)
                })

    # Récupérer les cliniques
    cliniques = Clinique.objects.all()
    for clinique in cliniques:
        if clinique.latitude and clinique.longitude:
            distance = calculate_distance(lat, lng, float(clinique.latitude), float(clinique.longitude))
            if distance <= radius:
                facilities.append({
                    'id': f'clinique_{clinique.id}',
                    'nom': clinique.nom,
                    'type': 'clinique',
                    'adresse': getattr(clinique, 'adresse', ''),
                    'latitude': float(clinique.latitude),
                    'longitude': float(clinique.longitude),
                    'telephone': getattr(clinique, 'telephone', ''),
                    'horaires': getattr(clinique, 'horaires', ''),
                    'distance': round(distance, 2)
                })

    # Récupérer les pharmacies
    pharmacies = Pharmacie.objects.all()
    for pharmacie in pharmacies:
        if pharmacie.latitude and pharmacie.longitude:
            distance = calculate_distance(lat, lng, float(pharmacie.latitude), float(pharmacie.longitude))
            if distance <= radius:
                facilities.append({
                    'id': f'pharmacie_{pharmacie.id}',
                    'nom': pharmacie.nom,
                    'type': 'pharmacie',
                    'adresse': getattr(pharmacie, 'adresse', ''),
                    'latitude': float(pharmacie.latitude),
                    'longitude': float(pharmacie.longitude),
                    'telephone': getattr(pharmacie, 'telephone', ''),
                    'horaires': getattr(pharmacie, 'horaires', ''),
                    'distance': round(distance, 2)
                })

    # Récupérer les dentistes
    dentistes = Dentiste.objects.all()
    for dentiste in dentistes:
        if dentiste.latitude and dentiste.longitude:
            distance = calculate_distance(lat, lng, float(dentiste.latitude), float(dentiste.longitude))
            if distance <= radius:
                facilities.append({
                    'id': f'dentiste_{dentiste.id}',
                    'nom': dentiste.nom,
                    'type': 'dentiste',
                    'adresse': getattr(dentiste, 'adresse', ''),
                    'latitude': float(dentiste.latitude),
                    'longitude': float(dentiste.longitude),
                    'telephone': getattr(dentiste, 'telephone', ''),
                    'horaires': getattr(dentiste, 'horaires', ''),
                    'distance': round(distance, 2)
                })
    
    # Trier par distance
    facilities.sort(key=lambda x: x['distance'])
    
    return Response(facilities)

# ========== URGENCES PATIENT ==========

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def urgences_patient(request):
    """Gestion des urgences pour les patients"""
    if request.user.role != 'patient':
        return Response({'error': 'Accès réservé aux patients'}, status=403)

    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Profil patient non trouvé'}, status=404)

    if request.method == 'GET':
        urgences = Urgence.objects.filter(patient=patient).order_by('-date_creation')
        serializer = UrgenceSerializer(urgences, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['patient'] = patient.id

        serializer = UrgenceSerializer(data=data)
        if serializer.is_valid():
            urgence = serializer.save()

            # Envoyer notifications aux médecins disponibles
            notifier_medecins_urgence(urgence)

            # Envoyer email au patient
            from .notifications import NotificationService
            NotificationService.send_urgence_confirmation(urgence)

            return Response(UrgenceSerializer(urgence).data, status=201)
        return Response(serializer.errors, status=400)


def notifier_medecins_urgence(urgence):
    """Envoyer des notifications aux médecins disponibles"""
    # Récupérer les médecins disponibles (vous pouvez affiner la logique)
    medecins = Medecin.objects.filter(disponibilite='disponible')[:5]  # Top 5

    for medecin in medecins:
        NotificationUrgence.objects.create(
            urgence=urgence,
            medecin=medecin
        )

        # Envoyer email au médecin
        from .notifications import NotificationService
        NotificationService.send_urgence_notification_medecin(urgence, medecin)


# ========== URGENCES MÉDECIN ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def urgences_medecin(request):
    """Liste des urgences pour les médecins"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
    except Medecin.DoesNotExist:
        return Response({'error': 'Profil médecin non trouvé'}, status=404)

    statut = request.GET.get('statut', 'en_attente')

    if statut == 'mes_prises_en_charge':
        urgences = Urgence.objects.filter(medecin_charge=medecin)
    else:
        urgences = Urgence.objects.filter(statut=statut)

    urgences = urgences.order_by('-priorite', '-date_creation')
    serializer = UrgenceSerializer(urgences, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def urgence_prendre_en_charge(request, pk):
    """Prendre en charge une urgence"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
        urgence = Urgence.objects.get(pk=pk)
    except Medecin.DoesNotExist:
        return Response({'error': 'Profil médecin non trouvé'}, status=404)
    except Urgence.DoesNotExist:
        return Response({'error': 'Urgence non trouvée'}, status=404)

    if urgence.statut != 'en_attente':
        return Response({'error': 'Cette urgence a déjà été prise en charge'}, status=400)

    urgence.statut = 'prise_en_charge'
    urgence.medecin_charge = medecin
    urgence.date_prise_en_charge = timezone.now()
    urgence.save()

    # Notifier le patient
    from .notifications import NotificationService
    NotificationService.send_urgence_prise_en_charge(urgence)

    return Response({
        'message': 'Urgence prise en charge',
        'urgence': UrgenceSerializer(urgence).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def urgence_resoudre(request, pk):
    """Marquer une urgence comme résolue"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
        urgence = Urgence.objects.get(pk=pk, medecin_charge=medecin)
    except Urgence.DoesNotExist:
        return Response({'error': 'Urgence non trouvée ou non autorisée'}, status=404)

    urgence.statut = 'resolue'
    urgence.notes_medecin = request.data.get('notes', '')
    urgence.save()

    return Response({
        'message': 'Urgence marquée comme résolue',
        'urgence': UrgenceSerializer(urgence).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_urgences_medecin(request):
    """Récupérer les notifications d'urgences pour un médecin"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
    except Medecin.DoesNotExist:
        return Response({'error': 'Profil médecin non trouvé'}, status=404)

    # Notifications non lues en premier
    notifications = NotificationUrgence.objects.filter(
        medecin=medecin
    ).order_by('lue', '-date_envoi')[:20]

    serializer = NotificationUrgenceSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_marquer_lue(request, pk):
    """Marquer une notification comme lue"""
    if request.user.role != 'medecin':
        return Response({'error': 'Accès réservé aux médecins'}, status=403)

    try:
        medecin = Medecin.objects.get(user=request.user)
        notification = NotificationUrgence.objects.get(pk=pk, medecin=medecin)

        notification.lue = True
        notification.date_lecture = timezone.now()
        notification.save()

        return Response({'message': 'Notification marquée comme lue'})
    except NotificationUrgence.DoesNotExist:
        return Response({'error': 'Notification non trouvée'}, status=404)


# ========== URGENCES ADMIN ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def urgences_admin_dashboard(request):
    """Dashboard des urgences pour l'admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    stats = {
        'total': Urgence.objects.count(),
        'en_attente': Urgence.objects.filter(statut='en_attente').count(),
        'prise_en_charge': Urgence.objects.filter(statut='prise_en_charge').count(),
        'resolues': Urgence.objects.filter(statut='resolue').count(),
        'critiques': Urgence.objects.filter(priorite='critique', statut__in=['en_attente', 'prise_en_charge']).count(),
        'par_priorite': list(Urgence.objects.values('priorite').annotate(count=models.Count('id'))),
        'temps_moyen_prise_en_charge': 'À calculer',  # TODO
    }

    # Urgences récentes
    urgences_recentes = Urgence.objects.all().order_by('-date_creation')[:10]

    return Response({
        'statistics': stats,
        'urgences_recentes': UrgenceSerializer(urgences_recentes, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consultation_dossier_medical(request, patient_id):
    """Consulter un dossier médical (avec audit)"""
    try:
        patient = Patient.objects.get(id=patient_id)

        # LOG D'AUDIT
        log_action(
            user=request.user,
            action='read',
            model_name='DossierMedical',
            object_id=patient_id,
            details={'patient': patient.user.username},
            request=request
        )

        return Response({'message': 'Dossier médical consulté'})

    except Patient.DoesNotExist:
        return Response({'error': 'Patient non trouvé'}, status=404)


# ========== EXPORT DONNÉES RGPD ==========

import json
from django.http import HttpResponse

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_mes_donnees(request):
    """Exporter toutes les données de l'utilisateur (RGPD)"""
    user = request.user

    # Collecter toutes les données
    data = {
        'utilisateur': {
            'username': user.username,
            'email': user.email,
            'prenom': user.first_name,
            'nom': user.last_name,
            'role': user.role,
            'date_inscription': user.date_joined.isoformat(),
        }
    }

    # Si patient
    if user.role == 'patient':
        try:
            patient = Patient.objects.get(user=user)
            data['patient'] = {
                'adresse': patient.adresse,
            }

            # Rendez-vous
            rendez_vous = RendezVous.objects.filter(patient=patient)
            data['rendez_vous'] = list(rendez_vous.values())

            # Consultations
            consultations = Consultation.objects.filter(patient=patient)
            data['consultations'] = list(consultations.values())

        except Patient.DoesNotExist:
            pass

    # LOG D'AUDIT
    log_action(
        user=user,
        action='export',
        model_name='UserData',
        details={'export_type': 'full'},
        request=request
    )

    # Créer le fichier JSON
    response = HttpResponse(
        json.dumps(data, indent=2, ensure_ascii=False, default=str),
        content_type='application/json'
    )
    response['Content-Disposition'] = f'attachment; filename="mes_donnees_assistosante.json"'

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def appointment_history(request):
    """Get appointment history for the authenticated patient"""
    patient = request.user
    rdvs = RendezVous.objects.filter(
        patient=patient
    ).exclude(
        statut="PENDING"
    ).order_by("-date", "-heure")

    serializer = RendezVousSerializer(rdvs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def propose_reschedule(request, pk):
    """Patient proposes a new date/time for an appointment"""
    try:
        rdv = RendezVous.objects.get(pk=pk, patient=request.user)
        
        # Check if appointment can be rescheduled
        if rdv.statut in ["CANCELLED"]:
            return Response({"error": "Impossible de reprogrammer un rendez-vous annulé"}, status=400)
        
        # Get proposed new date and time
        new_date = request.data.get("new_date")
        new_heure = request.data.get("new_heure")
        reason = request.data.get("reason", "")
        
        if not new_date or not new_heure:
            return Response({"error": "Veuillez fournir une nouvelle date et heure"}, status=400)
        
        # Create a rescheduling request (doesn't change the original appointment yet)
        # In a real implementation, you might want to create a separate model for rescheduling requests
        # For now, we'll update the appointment with a special status
        
        # Store original details if not already stored
        if not rdv.original_date:
            rdv.original_date = rdv.date
            rdv.original_heure = rdv.heure
            
        # Update with proposed new date/time
        rdv.date = new_date
        rdv.heure = new_heure
        rdv.statut = "RESCHEDULED"
        rdv.description = f"Demande de reprogrammation: {reason}" if reason else rdv.description
        rdv.save()
        
        # Send notification to the doctor about the rescheduling request
        NotificationService.send_reschedule_request(rdv)
        
        serializer = RendezVousSerializer(rdv)
        return Response(serializer.data)
        
    except RendezVous.DoesNotExist:
        return Response({"error": "Rendez-vous non trouvé"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# -------------------- Ratings & Reviews --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_appointment(request, pk):
    """Valider un rendez-vous terminé et créer une évaluation"""
    try:
        patient = request.user.patient_profile
        rdv = get_object_or_404(RendezVous, pk=pk, patient=request.user)
        
        # Vérifier que le rendez-vous est terminé
        if rdv.statut != "CONFIRMED":
            return Response({"error": "Seuls les rendez-vous confirmés peuvent être validés"}, status=400)
            
        # Marquer le rendez-vous comme terminé
        rdv.statut = "TERMINE"
        rdv.save()
        
        # Créer ou mettre à jour l'évaluation
        note = request.data.get('note')
        commentaire = request.data.get('commentaire', '')
        
        if note is not None:
            # Vérifier que la note est valide (1-5)
            if not isinstance(note, int) or note < 1 or note > 5:
                return Response({"error": "La note doit être un entier entre 1 et 5"}, status=400)
                
            # Créer ou mettre à jour l'évaluation
            rating_data = {
                'medecin': rdv.medecin.id,
                'rendez_vous': rdv.id,
                'note': note,
                'commentaire': commentaire
            }
            
            # Vérifier si une évaluation existe déjà
            try:
                rating = Rating.objects.get(patient=patient, rendez_vous=rdv)
                # Mettre à jour l'évaluation existante
                for key, value in rating_data.items():
                    setattr(rating, key, value)
                rating.save()
                serializer = RatingSerializer(rating)
            except Rating.DoesNotExist:
                # Créer une nouvelle évaluation
                serializer = RatingSerializer(data=rating_data, context={'request': request})
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Send notification to the doctor about the new rating
            NotificationService.send_rating_notification(rdv.medecin, note, commentaire)
            
            return Response({
                "message": "Rendez-vous validé et évaluation enregistrée avec succès",
                "rating": serializer.data
            })
        else:
            return Response({
                "message": "Rendez-vous validé avec succès"
            })
            
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_appointment_rating(request, pk):
    """Récupérer l'évaluation d'un rendez-vous"""
    try:
        patient = request.user.patient_profile
        rdv = get_object_or_404(RendezVous, pk=pk, patient=request.user)
        
        try:
            rating = Rating.objects.get(patient=patient, rendez_vous=rdv)
            serializer = RatingSerializer(rating)
            return Response(serializer.data)
        except Rating.DoesNotExist:
            return Response({"message": "Aucune évaluation trouvée pour ce rendez-vous"}, status=404)
            
    except Patient.DoesNotExist:
        return Response({"error": "Profil patient non trouvé"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- Search Functionality --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """Global search across doctors, patients, articles, and appointments"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response({
            'doctors': [],
            'patients': [],
            'articles': [],
            'appointments': []
        })
    
    # Search doctors
    doctors = Medecin.objects.filter(
        Q(user__first_name__icontains=query) |
        Q(user__last_name__icontains=query) |
        Q(specialite__icontains=query)
    )[:10]
    
    doctors_data = []
    for doctor in doctors:
        doctors_data.append({
            'id': doctor.id,
            'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
            'specialty': doctor.specialite,
            'rating': 4.5  # In a real implementation, this would be calculated from ratings
        })
    
    # Search patients (only for authenticated users with proper permissions)
    patients_data = []
    if request.user.is_authenticated and request.user.role in ['medecin', 'admin']:
        patients = Patient.objects.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query)
        )[:10]
        
        for patient in patients:
            patients_data.append({
                'id': patient.id,
                'name': f"{patient.user.first_name} {patient.user.last_name}",
                'age': 30,  # In a real implementation, this would be calculated
                'lastVisit': '2023-10-15'  # In a real implementation, this would be from actual data
            })
    
    # Search articles
    articles = Article.objects.filter(
        Q(titre__icontains=query) |
        Q(contenu__icontains=query) |
        Q(resume__icontains=query) |
        Q(tags__icontains=query)
    ).filter(statut='valide')[:10]
    
    articles_data = []
    for article in articles:
        articles_data.append({
            'id': article.id,
            'title': article.titre,
            'excerpt': article.resume,
            'author': f"Dr. {article.auteur.user.first_name} {article.auteur.user.last_name}",
            'date': article.date_publication.strftime('%Y-%m-%d') if article.date_publication else '',
            'views': article.vues
        })
    
    # Search appointments (only for authenticated users)
    appointments_data = []
    if request.user.is_authenticated:
        appointments = RendezVous.objects.filter(
            Q(patient__first_name__icontains=query) |
            Q(patient__last_name__icontains=query) |
            Q(medecin__first_name__icontains=query) |
            Q(medecin__last_name__icontains=query)
        )
        
        # Filter by user role
        if request.user.role == 'patient':
            appointments = appointments.filter(patient=request.user)
        elif request.user.role == 'medecin':
            appointments = appointments.filter(medecin=request.user)
        # Admin can see all appointments
        
        appointments = appointments[:10]
        
        for appointment in appointments:
            appointments_data.append({
                'id': appointment.id,
                'patient': f"{appointment.patient.first_name} {appointment.patient.last_name}",
                'doctor': f"Dr. {appointment.medecin.first_name} {appointment.medecin.last_name}",
                'specialty': getattr(appointment.medecin.medecin_profile, 'specialite', '') if hasattr(appointment.medecin, 'medecin_profile') else '',
                'date': appointment.date.strftime('%Y-%m-%d') if appointment.date else '',
                'time': appointment.heure.strftime('%H:%M') if appointment.heure else '',
                'status': appointment.get_statut_display()
            })
    
    return Response({
        'doctors': doctors_data,
        'patients': patients_data,
        'articles': articles_data,
        'appointments': appointments_data
    })


# -------------------- Messaging Functionality --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get all conversations for the current user"""
    conversations = request.user.conversations.all()
    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
    """Get all messages for a specific conversation"""
    try:
        conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
        messages = conversation.messages.all()
        
        # Mark messages as read (except those sent by the current user)
        for message in messages:
            if message.sender != request.user and not message.is_read:
                message.mark_as_read()
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation non trouvée"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    """Create a new conversation"""
    try:
        recipient_id = request.data.get('recipient_id')
        subject = request.data.get('subject', 'Nouvelle conversation')
        
        if not recipient_id:
            return Response({"error": "ID du destinataire requis"}, status=400)
        
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({"error": "Destinataire non trouvé"}, status=404)
        
        # Check if conversation already exists between these two users
        existing_conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=recipient
        ).distinct()
        
        if existing_conversation.exists():
            conversation = existing_conversation.first()
        else:
            # Create new conversation
            conversation = Conversation.objects.create(subject=subject)
            conversation.participants.add(request.user, recipient)
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a new message"""
    try:
        conversation_id = request.data.get('conversation_id')
        content = request.data.get('content')
        
        if not conversation_id or not content:
            return Response({"error": "ID de conversation et contenu requis"}, status=400)
        
        try:
            conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation non trouvée"}, status=404)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_message_as_read(request, message_id):
    """Mark a message as read"""
    try:
        message = Message.objects.get(id=message_id, conversation__participants=request.user)
        message.mark_as_read()
        return Response({"message": "Message marqué comme lu"})
    except Message.DoesNotExist:
        return Response({"error": "Message non trouvé"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get unread messages count for the current user"""
    unread_count = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    
    return Response({"unread_count": unread_count})


# -------------------- Admin Appointment Management --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_appointments_list(request):
    """List all appointments for admin dashboard"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)

    # Get all appointments with related data
    appointments = RendezVous.objects.select_related('patient', 'medecin').all().order_by('-date_creation')
    
    # Apply filters if provided
    status = request.GET.get('status')
    if status:
        appointments = appointments.filter(statut=status)
    
    date_from = request.GET.get('date_from')
    if date_from:
        appointments = appointments.filter(date__gte=date_from)
        
    date_to = request.GET.get('date_to')
    if date_to:
        appointments = appointments.filter(date__lte=date_to)
    
    serializer = RendezVousSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_validate_appointment(request, pk):
    """Validate an appointment by admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    try:
        appointment = RendezVous.objects.get(pk=pk)
        
        # Only validate confirmed appointments
        if appointment.statut != 'CONFIRMED':
            return Response({'error': 'Seuls les rendez-vous confirmés peuvent être validés'}, status=400)
        
        appointment.statut = 'TERMINE'
        appointment.save()
        
        return Response({
            'message': 'Rendez-vous validé avec succès',
            'appointment': RendezVousSerializer(appointment).data
        })
    except RendezVous.DoesNotExist:
        return Response({'error': 'Rendez-vous non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_cancel_appointment(request, pk):
    """Cancel an appointment by admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    try:
        appointment = RendezVous.objects.get(pk=pk)
        
        # Store old status for notification
        old_status = appointment.statut
        appointment.statut = 'CANCELLED'
        appointment.save()
        
        # Send cancellation notification if not already cancelled
        if old_status != 'CANCELLED':
            NotificationService.send_appointment_cancellation(appointment)
        
        return Response({
            'message': 'Rendez-vous annulé avec succès',
            'appointment': RendezVousSerializer(appointment).data
        })
    except RendezVous.DoesNotExist:
        return Response({'error': 'Rendez-vous non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reschedule_appointment(request, pk):
    """Reschedule an appointment by admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    try:
        appointment = RendezVous.objects.get(pk=pk)
        new_date = request.data.get('date')
        new_time = request.data.get('heure')
        
        if not new_date or not new_time:
            return Response({'error': 'Date et heure requises pour reprogrammer'}, status=400)
        
        # Store old values for notification
        old_date = appointment.date
        old_time = appointment.heure
        old_status = appointment.statut
        
        # Update appointment
        appointment.date = new_date
        appointment.heure = new_time
        appointment.statut = 'RESCHEDULED'
        appointment.save()
        
        # Send reschedule notification if not already rescheduled
        if old_status != 'RESCHEDULED':
            NotificationService.send_appointment_reschedule(appointment, old_date, old_time)
        
        return Response({
            'message': 'Rendez-vous reprogrammé avec succès',
            'appointment': RendezVousSerializer(appointment).data
        })
    except RendezVous.DoesNotExist:
        return Response({'error': 'Rendez-vous non trouvé'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_appointments_statistics(request):
    """Get appointment statistics for admin dashboard"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    from django.db.models import Count
    from datetime import date, timedelta
    
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    stats = {
        'total_appointments': RendezVous.objects.count(),
        'today_appointments': RendezVous.objects.filter(date=today).count(),
        'week_appointments': RendezVous.objects.filter(date__gte=week_ago).count(),
        'month_appointments': RendezVous.objects.filter(date__gte=month_ago).count(),
        'appointments_by_status': list(RendezVous.objects.values('statut').annotate(count=Count('id'))),
        'confirmed_appointments': RendezVous.objects.filter(statut='CONFIRMED').count(),
        'cancelled_appointments': RendezVous.objects.filter(statut='CANCELLED').count(),
        'rescheduled_appointments': RendezVous.objects.filter(statut='RESCHEDULED').count(),
        'pending_appointments': RendezVous.objects.filter(statut='PENDING').count(),
        'completed_appointments': RendezVous.objects.filter(statut='TERMINE').count(),
    }
    
    return Response(stats)


# -------------------- Admin Chatbot Management --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_chatbot_knowledge_base(request):
    """Get all chatbot knowledge base entries for admin"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    entries = ChatbotKnowledgeBase.objects.all().order_by('-created_at')
    serializer = ChatbotKnowledgeBaseSerializer(entries, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_chatbot_entry(request):
    """Create a new chatbot knowledge base entry"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    serializer = ChatbotKnowledgeBaseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_chatbot_entry(request, pk):
    """Update a chatbot knowledge base entry"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    try:
        entry = ChatbotKnowledgeBase.objects.get(pk=pk)
    except ChatbotKnowledgeBase.DoesNotExist:
        return Response({'error': 'Entrée non trouvée'}, status=404)
    
    serializer = ChatbotKnowledgeBaseSerializer(entry, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_chatbot_entry(request, pk):
    """Delete a chatbot knowledge base entry"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    try:
        entry = ChatbotKnowledgeBase.objects.get(pk=pk)
        entry.delete()
        return Response({'message': 'Entrée supprimée avec succès'}, status=status.HTTP_204_NO_CONTENT)
    except ChatbotKnowledgeBase.DoesNotExist:
        return Response({'error': 'Entrée non trouvée'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_chatbot_statistics(request):
    """Get chatbot statistics for admin dashboard"""
    if request.user.role != 'admin':
        return Response({'error': 'Accès réservé aux administrateurs'}, status=403)
    
    from django.db.models import Count
    
    # Get top questions from conversation history
    top_questions = ChatbotConversation.objects.values('message_user').annotate(
        count=Count('message_user')
    ).order_by('-count')[:10]
    
    stats = {
        'total_conversations': ChatbotConversation.objects.count(),
        'total_users': ChatbotConversation.objects.values('patient').distinct().count(),
        'avg_response_time': '2.3s',  # This would need to be calculated in a real implementation
        'top_questions': [
            {'question': item['message_user'], 'count': item['count']} 
            for item in top_questions
        ]
    }
    
    return Response(stats)
