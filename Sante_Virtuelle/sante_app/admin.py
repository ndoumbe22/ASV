from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Patient, Medecin, Consultation, RendezVous,
    Pathologie, Medicament, Traitement,
    Constante, Mesure, Article,
    StructureDeSante, Service, User
)

# -------------------- Patient --------------------
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("user", "get_first_name", "get_last_name", "user_email", "adresse")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    list_select_related = ("user",)

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = "Prénom"

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = "Nom"

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"


# -------------------- Médecin --------------------
@admin.register(Medecin)
class MedecinAdmin(admin.ModelAdmin):
    list_display = ("user", "get_first_name", "get_last_name", "user_email", "specialite", "disponibilite")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "specialite")
    list_filter = ("specialite", "disponibilite")
    list_select_related = ("user",)

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = "Prénom"

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = "Nom"

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"


# -------------------- Consultation --------------------
@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("numero", "date", "heure", "patient", "medecin")
    search_fields = ("patient__user__first_name", "patient__user__last_name", "medecin__user__first_name", "medecin__user__last_name")
    list_filter = ("date", "medecin")
    list_select_related = ("patient__user", "medecin__user")


# -------------------- Rendez-vous --------------------
@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ("numero", "date", "heure", "patient", "medecin")
    search_fields = ("patient__user__first_name", "patient__user__last_name", "medecin__user__first_name", "medecin__user__last_name")
    list_filter = ("date", "medecin")
    list_select_related = ("patient__user", "medecin__user")


# -------------------- Pathologie --------------------
@admin.register(Pathologie)
class PathologieAdmin(admin.ModelAdmin):
    list_display = ("nom", "description", "disponibilite")
    search_fields = ("nom", "description")
    list_filter = ("disponibilite",)


# -------------------- Médicaments --------------------
@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):
    list_display = ("nom", "dosage")
    search_fields = ("nom",)


# -------------------- Traitement --------------------
@admin.register(Traitement)
class TraitementAdmin(admin.ModelAdmin):
    list_display = ("id_traitement", "consultation", "medicament", "posologie")
    search_fields = ("medicament__nom", "consultation__patient__user__first_name", "consultation__patient__user__last_name")
    list_filter = ("consultation",)


# -------------------- Constantes --------------------
@admin.register(Constante)
class ConstanteAdmin(admin.ModelAdmin):
    list_display = ("id", "nom_constante")
    search_fields = ("nom_constante",)


# -------------------- Mesures --------------------
@admin.register(Mesure)
class MesureAdmin(admin.ModelAdmin):
    list_display = ("id_mesure", "constante", "valeur", "unite", "consultation")
    search_fields = ("constante__nom_constante",)
    list_filter = ("constante",)


# -------------------- Articles --------------------
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("titre", "date_de_publication", "medecin")
    search_fields = ("titre", "contenu", "medecin__user__first_name", "medecin__user__last_name")
    list_filter = ("date_de_publication",)
    list_select_related = ("medecin__user",)


# -------------------- Structures de Santé --------------------
@admin.register(StructureDeSante)
class StructureDeSanteAdmin(admin.ModelAdmin):
    list_display = ("nom", "adresse")
    search_fields = ("nom", "adresse")


# -------------------- Services --------------------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("nom_service", "responsable", "structure")
    search_fields = ("nom_service", "responsable")
    list_filter = ("structure",)


# -------------------- User Admin --------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('username',)