from django.contrib import admin
from .models import (
    Patient, Medecin, Consultation, RendezVous,
    Pathologie, Medicament, Traitement,
    Constante, Mesure, Article,
    StructureDeSante, Service
)


# -------------------- Patient --------------------
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("nom", "prenom", "email", "telephone")
    search_fields = ("nom", "prenom", "email")
    list_filter = ("adresse",)


# -------------------- Médecin --------------------
@admin.register(Medecin)
class MedecinAdmin(admin.ModelAdmin):
    list_display = ("nom", "prenom", "specialite", "email", "disponibilite")
    search_fields = ("nom", "prenom", "specialite", "email")
    list_filter = ("specialite", "disponibilite")


# -------------------- Consultation --------------------
@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("numero", "date", "heure", "patient", "medecin")
    search_fields = ("patient__nom", "medecin__nom")
    list_filter = ("date", "medecin")


# -------------------- Rendez-vous --------------------
@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ("numero", "date", "heure", "patient", "medecin")
    search_fields = ("patient__nom", "medecin__nom")
    list_filter = ("date", "medecin")


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
    search_fields = ("medicament__nom", "consultation__patient__nom")
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
    search_fields = ("titre", "contenu", "medecin__nom")
    list_filter = ("date_de_publication",)


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
