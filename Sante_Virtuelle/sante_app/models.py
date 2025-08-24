from django.db import models
from django.contrib.auth.models import AbstractUser

# -------------------- Patient --------------------
class Patient(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    adresse = models.TextField()
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.prenom} {self.nom}"


# -------------------- Médecin --------------------
class Medecin(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    disponibilite = models.BooleanField(default=True)
    email = models.EmailField(unique=True)
    specialite = models.CharField(max_length=100)

    def __str__(self):
        return f"Dr {self.prenom} {self.nom} ({self.specialite})"


# -------------------- Consultation --------------------
class Consultation(models.Model):
    numero = models.AutoField(primary_key=True)
    date = models.DateField()
    heure = models.TimeField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="consultations")
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="consultations")

    def __str__(self):
        return f"Consultation {self.numero} - {self.patient}"


# -------------------- Rendez-vous --------------------
class RendezVous(models.Model):
    numero = models.AutoField(primary_key=True)
    description = models.TextField()
    date = models.DateField()
    heure = models.TimeField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="rendezvous")
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="rendezvous")
    medicaments = models.ManyToManyField("Medicament", related_name="rendezvous", blank=True)

    def __str__(self):
        return f"RDV {self.numero} - {self.patient}"



# -------------------- Pathologie --------------------
class Pathologie(models.Model):
    nom = models.CharField(max_length=150)
    description = models.TextField()
    disponibilite = models.BooleanField(default=True)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    patients = models.ManyToManyField(Patient, related_name="pathologies")
    medecins = models.ManyToManyField(Medecin, related_name="pathologies")

    def __str__(self):
        return self.nom


# -------------------- Médicaments & Traitements --------------------
class Medicament(models.Model):
    nom = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)

    def __str__(self):
        return self.nom


class Traitement(models.Model):
    id_traitement = models.AutoField(primary_key=True)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="traitements")
    medicament = models.ForeignKey(Medicament, on_delete=models.CASCADE, related_name="traitements")
    posologie = models.TextField()

    def __str__(self):
        return f"Traitement {self.id_traitement} - {self.medicament.nom}"


# -------------------- Constantes & Mesures --------------------
class Constante(models.Model):
    nom_constante = models.CharField(max_length=100)

    def __str__(self):
        return self.nom_constante


class Mesure(models.Model):
    id_mesure = models.AutoField(primary_key=True)
    valeur = models.FloatField()
    unite = models.CharField(max_length=20)
    constante = models.ForeignKey(Constante, on_delete=models.CASCADE, related_name="mesures")
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="mesures")

    def __str__(self):
        return f"{self.constante.nom_constante}: {self.valeur} {self.unite}"


# -------------------- Articles --------------------
class Article(models.Model):
    id_article = models.AutoField(primary_key=True)
    titre = models.CharField(max_length=200)
    date_de_publication = models.DateField(auto_now_add=True)
    contenu = models.TextField()
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="articles")

    def __str__(self):
        return self.titre


# -------------------- Structures & Services --------------------
class StructureDeSante(models.Model):
    nom = models.CharField(max_length=150)
    adresse = models.TextField()

    def __str__(self):
        return self.nom


class Service(models.Model):
    id_service = models.AutoField(primary_key=True)
    nom_service = models.CharField(max_length=100)
    description = models.TextField()
    responsable = models.CharField(max_length=100)
    structure = models.ForeignKey(StructureDeSante, on_delete=models.CASCADE, related_name="services")

    def __str__(self):
        return self.nom_service



class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrateur'),
        ('medecin', 'Médecin'),
        ('patient', 'Patient'),
    )
    role = models.CharField(max_length=20, choices=ROLES, default='patient')

    def __str__(self):
        return f"{self.username} ({self.role})"
