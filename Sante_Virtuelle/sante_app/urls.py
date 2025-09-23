from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sante_app import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import CliniqueViewSet, DentisteViewSet, HopitalViewSet, PharmacieViewSet, ContactFooterViewSet, RegisterView, LoginView


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
router.register(r'cliniques', CliniqueViewSet)
router.register(r'dentistes', DentisteViewSet)
router.register(r'hopitaux', HopitalViewSet)
router.register(r'pharmacies', PharmacieViewSet)
router.register(r'contact_footer', ContactFooterViewSet)


urlpatterns = [
    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Routes
    path('api/', include(router.urls)),

    # Chatbot (protégé par JWT)
    path("chatbot/", views.ChatbotAPIView.as_view(), name="chatbot"),
    path('', views.accueil, name="accueil"),


    path("consultation/", views.consultation, name="consultation"),
    path("connecter/", views.connexion, name="connecter"),
    path("rendez_vous/", views.rendez_vous, name="rendez_vous"),
    path("qui-sommes-nous/", views.qui_sommes_nous, name="qui_sommes_nous"),

    path('medecin_generaliste/', views.medecin_generaliste, name='medecin_generaliste'),
    path('medecin_specialiste/', views.medecin_specialiste, name='medecin_specialiste'),
    path("medecins/", views.medecins, name="medecins"),

    path("hopitaux/", views.hopitaux_list, name="hopitaux_list"),
    path("cliniques/", views.cliniques_list, name="cliniques_list"),
    path("dentistes/", views.dentistes_list, name="dentistes_list"),
    path("pharmacies/", views.pharmacies_list, name="pharmacies_list"),

    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    
]
