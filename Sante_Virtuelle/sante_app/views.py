from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests

from .models import (
    Patient, Medecin, RendezVous, Consultation, Medicament,
    Pathologie, Traitement, Constante, Mesure, Article,
    StructureDeSante, Service
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
from django.shortcuts import render


# --------------------
# Patients
# --------------------
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == "admin":
                return Patient.objects.all()
            elif user.role == "patient":
                return Patient.objects.filter(user=user)  # filtrer par relation OneToOneField
        return Patient.objects.none()

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAdmin()]  # Seul l'admin peut créer un patient
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerPatient() | IsAdmin()]
        return [IsAuthenticated()]

# --------------------
# Médecins
# --------------------
class MedecinViewSet(viewsets.ModelViewSet):
    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == "admin":
                return Medecin.objects.all()
            elif user.role == "medecin":
                return Medecin.objects.filter(user=user)  # filtrer par relation OneToOneField
        return Medecin.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

# --------------------
# Rendez-vous
# --------------------
class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == "admin":
                return RendezVous.objects.all()
            elif user.role == "medecin":
                return RendezVous.objects.filter(medecin=user)
            elif user.role == "patient":
                return RendezVous.objects.filter(patient=user)
        return RendezVous.objects.none()

    def get_permissions(self):
        if self.action in ['create']:
            return [IsPatient()]
        elif self.action in ['update', 'partial_update']:
            return [IsMedecin() | IsAdmin()]
        elif self.action in ['destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

# --------------------
# Consultations
# --------------------
class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == "admin":
                return Consultation.objects.all()
            elif user.role == "medecin":
                return Consultation.objects.filter(medecin=user)
            elif user.role == "patient":
                return Consultation.objects.filter(patient=user)
        return Consultation.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsMedecin() | IsAdmin()]
        elif self.action in ['destroy']:
            return [IsAdmin()]
        return [IsAuthenticated(), IsOwnerConsultation()]

# --------------------
# Médicaments
# --------------------
class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer
    permission_classes = [IsAdminOrReadOnly]

# --------------------
# Pathologies
# --------------------
class PathologieViewSet(viewsets.ModelViewSet):
    queryset = Pathologie.objects.all()
    serializer_class = PathologieSerializer
    permission_classes = [IsAdminOrReadOnly]

# --------------------
# Traitements
# --------------------
class TraitementViewSet(viewsets.ModelViewSet):
    queryset = Traitement.objects.all()
    serializer_class = TraitementSerializer
    permission_classes = [IsMedecin | IsAdmin]

# --------------------
# Constantes
# --------------------
class ConstanteViewSet(viewsets.ModelViewSet):
    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer
    permission_classes = [IsMedecin | IsAdmin]

# --------------------
# Mesures
# --------------------
class MesureViewSet(viewsets.ModelViewSet):
    queryset = Mesure.objects.all()
    serializer_class = MesureSerializer
    permission_classes = [IsMedecin | IsAdmin]

# --------------------
# Articles
# --------------------
class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]

# --------------------
# Structures de santé
# --------------------
class StructureDeSanteViewSet(viewsets.ModelViewSet):
    queryset = StructureDeSante.objects.all()
    serializer_class = StructureDeSanteSerializer
    permission_classes = [IsAdminOrReadOnly]

# --------------------
# Services
# --------------------
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

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

def qui_sommes_nous(request):
    return render(request, "qui_sommes_nous.html")