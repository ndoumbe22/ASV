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
router.register(r'consultation-messages', views.ConsultationMessageViewSet)
router.register(r'teleconsultations', views.TeleconsultationViewSet)
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
router.register(r'medical-documents', views.MedicalDocumentViewSet)  # Added MedicalDocumentViewSet
router.register(r'disponibilites-medecin', views.DisponibiliteMedecinViewSet)
router.register(r'indisponibilites-medecin', views.IndisponibiliteMedecinViewSet)


urlpatterns = [
    # JWT Auth
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("appointments/upcoming/", views.upcoming_appointments, name="upcoming_appointments"),
    path("appointments/history/", views.appointment_history, name="appointment_history"),
    path("appointments/<int:pk>/cancel/", views.cancel_appointment, name="cancel_appointment"),
    path("appointments/<int:pk>/reschedule/", views.reschedule_appointment, name="reschedule_appointment"),
    path("appointments/<int:pk>/propose-reschedule/", views.propose_reschedule, name="propose_reschedule"),
    path("medications/", views.patient_medications, name="patient_medications"),

    # API Routes (removed the 'api/' prefix since it's already included in the main urls.py)
    path('', include(router.urls)),

    # Chatbot (protégé par JWT)
    path("chatbot/", views.ChatbotAPIView.as_view(), name="chatbot"),
    path("chatbot/history/", views.ChatbotAPIView.as_view(), name="chatbot_history"),

    # Medication Reminders
    path("medication-reminders/", views.medication_reminders, name="medication_reminders"),
    path("medication-reminders/<int:pk>/", views.medication_reminder_detail, name="medication_reminder_detail"),
    path("medication-history/", views.medication_history, name="medication_history"),
    path("medication-history/<int:pk>/mark-taken/", views.mark_medication_taken, name="mark_medication_taken"),

    # Admin Dashboard
    path('admin/statistics/', views.admin_statistics, name='admin-statistics'),
    path('admin/users/', views.admin_users_list, name='admin-users-list'),
    path('admin/users/create/', views.admin_create_user, name='admin-create-user'),
    path('admin/users/<int:user_id>/', views.admin_update_user, name='admin-update-user'),
    path('admin/users/<int:user_id>/toggle-status/', views.admin_toggle_user_status, name='admin-toggle-user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin-delete-user'),

    # Health Facilities for Geolocation
    path('health-facilities/', views.health_facilities, name='health-facilities'),
    path('health-facilities/nearby/', views.nearby_health_facilities, name='nearby-health-facilities'),

    # Auth routes
    path('auth/register/', RegisterView.as_view(), name="register"),
    path('auth/login/', LoginView.as_view(), name="login"),

    # === ARTICLES PUBLICS ===
    path('api/articles/', views.articles_publics, name='articles-publics'),
    path('api/articles/<slug:slug>/', views.article_detail_public, name='article-detail-public'),

    # === ARTICLES MÉDECINS ===
    path('api/medecin/articles/', views.articles_medecin, name='medecin-articles'),
    path('api/medecin/articles/<int:pk>/', views.article_medecin_detail, name='medecin-article-detail'),
    path('api/medecin/articles/<int:pk>/soumettre/', views.article_soumettre_validation, name='article-soumettre'),

    # === ARTICLES ADMIN ===
    path('api/admin/articles/', views.articles_admin_list, name='admin-articles-list'),
    path('api/admin/articles/<int:pk>/', views.article_admin_detail, name='admin-article-detail'),
    path('api/admin/articles/<int:pk>/valider/', views.article_valider, name='article-valider'),
    path('api/admin/articles/<int:pk>/refuser/', views.article_refuser, name='article-refuser'),
    path('api/admin/articles/<int:pk>/desactiver/', views.article_desactiver, name='article-desactiver'),
    path('api/admin/articles/statistics/', views.articles_statistics, name='articles-statistics'),
    
    # === URGENCES PATIENT ===
    path('api/patient/urgences/', views.urgences_patient, name='patient-urgences'),

    # === URGENCES MÉDECIN ===
    path('api/medecin/urgences/', views.urgences_medecin, name='medecin-urgences'),
    path('api/medecin/urgences/<int:pk>/prendre-en-charge/', views.urgence_prendre_en_charge, name='urgence-prendre-en-charge'),
    path('api/medecin/urgences/<int:pk>/resoudre/', views.urgence_resoudre, name='urgence-resoudre'),
    path('api/medecin/notifications-urgences/', views.notifications_urgences_medecin, name='notifications-urgences'),
    path('api/medecin/notifications-urgences/<int:pk>/lue/', views.notification_marquer_lue, name='notification-lue'),

    # === URGENCES ADMIN ===
    path('api/admin/urgences/dashboard/', views.urgences_admin_dashboard, name='admin-urgences-dashboard'),
    
    # === EXPORT DONNÉES RGPD ===
    path('export-mes-donnees/', views.export_mes_donnees, name='export-donnees'),
    
    # === VALIDATION RENDEZ-VOUS & ÉVALUATIONS ===
    path('appointments/<int:pk>/validate/', views.validate_appointment, name='validate-appointment'),
    path('appointments/<int:pk>/rating/', views.get_appointment_rating, name='get-appointment-rating'),
    
    # === DOCTOR APPOINTMENT MANAGEMENT ===
    path('appointments/<int:pk>/doctor-reschedule/', views.doctor_reschedule_appointment, name='doctor-reschedule-appointment'),
    
    # === ADMIN APPOINTMENT MANAGEMENT ===
    path('admin/appointments/', views.admin_appointments_list, name='admin-appointments-list'),
    path('admin/appointments/<int:pk>/validate/', views.admin_validate_appointment, name='admin-validate-appointment'),
    path('admin/appointments/<int:pk>/cancel/', views.admin_cancel_appointment, name='admin-cancel-appointment'),
    path('admin/appointments/<int:pk>/reschedule/', views.admin_reschedule_appointment, name='admin-reschedule-appointment'),
    path('admin/appointments/statistics/', views.admin_appointments_statistics, name='admin-appointments-statistics'),
    
    # === ADMIN CHATBOT MANAGEMENT ===
    path('admin/chatbot/knowledge-base/', views.admin_chatbot_knowledge_base, name='admin-chatbot-knowledge-base'),
    path('admin/chatbot/knowledge-base/create/', views.admin_create_chatbot_entry, name='admin-create-chatbot-entry'),
    path('admin/chatbot/knowledge-base/<int:pk>/update/', views.admin_update_chatbot_entry, name='admin-update-chatbot-entry'),
    path('admin/chatbot/knowledge-base/<int:pk>/delete/', views.admin_delete_chatbot_entry, name='admin-delete-chatbot-entry'),
    path('admin/chatbot/statistics/', views.admin_chatbot_statistics, name='admin-chatbot-statistics'),
    
    # === SEARCH FUNCTIONALITY ===
    path('search/', views.search, name='search'),
    
    # === MESSAGING FUNCTIONALITY ===
    path('messages/conversations/', views.get_conversations, name='get-conversations'),
    path('messages/conversations/create/', views.create_conversation, name='create-conversation'),
    path('messages/conversations/<int:conversation_id>/messages/', views.get_messages, name='get-messages'),
    path('messages/send/', views.send_message, name='send-message'),
    path('messages/<int:message_id>/mark-read/', views.mark_message_as_read, name='mark-message-read'),
    path('messages/unread-count/', views.get_unread_count, name='get-unread-count'),
]