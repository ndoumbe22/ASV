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
    StructureDeSante, Service, Hopital, Clinique, Dentiste,Pharmacie
)
from .serializers import (
    PatientSerializer, MedecinSerializer, RendezVousSerializer,
    ConsultationSerializer, MedicamentSerializer,
    PathologieSerializer, TraitementSerializer, ConstanteSerializer,
    MesureSerializer, ArticleSerializer, StructureDeSanteSerializer,
    ServiceSerializer
)
from .permissions import (
    IsAdmin, IsMedecin, IsPatient,
    IsOwnerPatient, IsOwnerRendezVous, IsOwnerConsultation,
    IsAdminOrReadOnly
)
from django.shortcuts import render, redirect


from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import (
    Patient, Medecin, RendezVous, Consultation, Medicament,
    Pathologie, Traitement, Constante, Mesure, Article,
    StructureDeSante, Service, ContactFooter
)
from .serializers import (
    PatientSerializer, MedecinSerializer, RendezVousSerializer,
    ConsultationSerializer, MedicamentSerializer,
    PathologieSerializer, TraitementSerializer, ConstanteSerializer,
    MesureSerializer, ArticleSerializer, StructureDeSanteSerializer,
    ServiceSerializer, ContactFooterSerializer
)

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer
from django.utils.timezone import now
from django.shortcuts import get_object_or_404

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



# --------------------
# Chatbot (Rasa)
# --------------------
class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "")
        if not message:
            return Response({"error": "Aucun message fourni"}, status=400)

        rasa_url = "http://localhost:5005/webhooks/rest/webhook"
        payload = {
            "sender": str(request.user.id),
            "message": message
        }

        try:
            response = requests.post(rasa_url, json=payload)
            response_data = response.json()
            return Response({"responses": response_data})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Vue frontend 

def accueil(request):
    return render(request, "accueil.html")

def medecins(request):
    return render(request, "medecins.html")

def pharmacies(request):
    return render(request, "pharmacies.html")

def hopitaux(request):
    return render(request, "hopitaux.html")

def dentistes(request):
    return render(request, "dentistes.html")

def cliniques(request):
    return render(request, "cliniques.html")

def consultation(request):
    return render(request, "consultation.html")

def rendez_vous(request):
    return render(request, "rendez_vous.html")

def qui_sommes_nous(request):
    return render(request, "qui_sommes_nous.html")

def medecin_generaliste(request):
    return render(request, "medecin_generaliste.html")

def medecin_specialiste(request):
    return render(request, "medecin_specialiste.html")

def connexion(request):
    return render(request, "connexion.html")




def hopitaux_list(request):
    hopitaux = Hopital.objects.all()
    return render(request, "hopitaux_list.html", {"hopitaux": hopitaux})


def cliniques_list(request):
    cliniques = Clinique.objects.all()
    return render(request, "cliniques_list.html", {"cliniques": cliniques})

def dentistes_list(request):
    dentistes = Dentiste.objects.all()
    return render(request, "dentistes_list.html", {"dentistes": dentistes})

def pharmacies_list(request):
    pharmacies = Pharmacie.objects.all()
    return render(request, "pharmacies_list.html", {"pharmacies": pharmacies})


# Les formulaires de recherche pour les listes 

def pharmacies_list(request):
    query = request.GET.get("q")
    if query:
        pharmacies = Pharmacie.objects.filter(nom__icontains=query)
    else:
        pharmacies = Pharmacie.objects.all()
    return render(request, "pharmacies_list.html", {"pharmacies": pharmacies})


def hopitaux_list(request):
    query = request.GET.get("q")
    if query:
        hopitaux = Hopital.objects.filter(nom__icontains=query)
    else:
        hopitaux = Hopital.objects.all()
    return render(request, "hopitaux_list.html", {"hopitaux": hopitaux})


def cliniques_list(request):
    query = request.GET.get("q")
    if query:
        cliniques = Clinique.objects.filter(nom__icontains=query)
    else:
        cliniques = Clinique.objects.all()
    return render(request, "cliniques_list.html", {"cliniques": cliniques})


def dentistes_list(request):
    query = request.GET.get("q")
    if query:
        dentistes = Dentiste.objects.filter(nom__icontains=query)
    else:
        dentistes = Dentiste.objects.all()
    return render(request, "dentistes_list.html", {"dentistes": dentistes})


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
            user = serializer.save()  # 🔹 Profil Patient/Medecin créé automatiquement par signals
            return Response({"message": "Utilisateur créé avec succès"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --------------------
# Connexion
# --------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            # Détection automatique admin
            role = user.role
            if user.is_superuser or user.is_staff:
                role = "admin"

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": role,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            })

        return Response({"error": "Identifiants invalides"}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def upcoming_appointments(request):
    patient = request.user  # on suppose que user = patient
    today = now().date()

    rdvs = RendezVous.objects.filter(
        patient=patient,
        date__gte=today
    ).order_by("date", "heure")

    serializer = RendezVousSerializer(rdvs, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_medications(request):
    patient = request.user  # on suppose que user = patient

    traitements = Traitement.objects.filter(
        consultation__patient=patient
    ).order_by("-consultation__date")

    serializer = TraitementSerializer(traitements, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, pk):
    rdv = get_object_or_404(RendezVous, pk=pk, patient=request.user)
    rdv.statut = "CANCELLED"
    rdv.save()
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

    rdv.date = new_date
    rdv.heure = new_heure
    rdv.statut = "RESCHEDULED"
    rdv.save()
    return Response({"message": "Rendez-vous reprogrammé avec succès"}, status=status.HTTP_200_OK)