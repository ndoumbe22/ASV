from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sante_app import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# --------------------
# Routes API principales
# --------------------
router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'medecins', views.MedecinViewSet)
router.register(r'rendezvous', views.RendezVousViewSet)
router.register(r'consultations', views.ConsultationViewSet)
router.register(r'medicaments', views.MedicamentViewSet)
router.register(r'pathologies', views.PathologieViewSet)
router.register(r'traitements', views.TraitementViewSet)
router.register(r'constantes', views.ConstanteViewSet)
router.register(r'mesures', views.MesureViewSet)
router.register(r'articles', views.ArticleViewSet)
router.register(r'structures', views.StructureDeSanteViewSet)
router.register(r'services', views.ServiceViewSet)

# --------------------
# URLs
# --------------------
urlpatterns = [
    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Routes
    path('api/', include(router.urls)),

    # Chatbot (protégé par JWT)
    path("chatbot/", views.ChatbotAPIView.as_view(), name="chatbot-api"),
]
