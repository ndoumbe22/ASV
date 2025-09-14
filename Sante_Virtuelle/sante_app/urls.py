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


urlpatterns = [
    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Routes
    path('api/', include(router.urls)),

    # Chatbot (protégé par JWT)
    path("chatbot/", views.ChatbotAPIView.as_view(), name="chatbot"),
    path('', views.accueil, name="accueil"),

    path("medecins/", views.medecins, name="medecins"),
    path("pharmacies/", views.pharmacies, name="pharmacies"),
    path("hopitaux/", views.hopitaux, name="hopitaux"),
    path("dentistes/", views.dentistes, name="dentistes"),
    path("cliniques/", views.cliniques, name="cliniques"),
    path("consultation/", views.consultation, name="consultation"),
    path("qui-sommes-nous/", views.qui_sommes_nous, name="qui_sommes_nous"),
    path('contact-footer/', views.contact_footer, name='contact_footer'),
    path('medecin_generaliste/', views.medecin_generaliste, name='medecin_generaliste'),
    path('medecin_specialiste/', views.medecin_specialiste, name='medecin_specialiste'),
]
