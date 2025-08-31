from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrateur'),
        ('medecin', 'Médecin'),
        ('patient', 'Patient'),
    )
    role = models.CharField(max_length=20, choices=ROLES, default='patient')

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    class Meta :
        db_table = 'utilisateur'

# -------------------- Patient --------------------
class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    adresse = models.TextField()

    class Meta :
        db_table = 'Patient'


    def __str__(self):
        return f"Patient: {self.user.first_name} {self.user.last_name}"

# -------------------- Médecin --------------------
class Medecin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='medecin_profile')
    disponibilite = models.BooleanField(default=True)

    specialite = models.CharField(max_length=100)

    class Meta :
        db_table = 'Medecin'

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} ({self.specialite})"

# -------------------- Consultation --------------------
class Consultation(models.Model):
    numero = models.AutoField(primary_key=True)
    date = models.DateField()
    heure = models.TimeField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="consultations")
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="consultations")
    rendez_vous = models.OneToOneField('RendezVous', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Consultation {self.numero} - {self.patient}"
    
    class Meta :
        db_table = 'Consultation'


# -------------------- Rendez-vous --------------------
class RendezVous(models.Model):
    numero = models.AutoField(primary_key=True)
    description = models.TextField()
    date = models.DateField()
    heure = models.TimeField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="rendezvous")
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="rendezvous")


    def __str__(self):
        return f"RDV {self.numero} - {self.patient}"
    
    class Meta :
        db_table = 'RendezVous'



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
    
    class Meta :
        db_table = 'Pathologie'


# -------------------- Médicaments & Traitements --------------------
class Medicament(models.Model):
    nom = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)

    def __str__(self):
        return self.nom
    
    class Meta :
        db_table = 'Medicament'


class Traitement(models.Model):
    id_traitement = models.AutoField(primary_key=True)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="traitements")
    medicament = models.ForeignKey(Medicament, on_delete=models.CASCADE, related_name="traitements")
    posologie = models.TextField()

    def __str__(self):
        return f"Traitement {self.id_traitement} - {self.medicament.nom}"
    
    class Meta :
        db_table = 'Traitement'


# -------------------- Constantes & Mesures --------------------
class Constante(models.Model):
    nom_constante = models.CharField(max_length=100)

    def __str__(self):
        return self.nom_constante
    
    class Meta :
        db_table = 'Constante'
    

    

class Mesure(models.Model):
    id_mesure = models.AutoField(primary_key=True)
    valeur = models.FloatField()
    unite = models.CharField(max_length=20)
    constante = models.ForeignKey(Constante, on_delete=models.CASCADE, related_name="mesures")
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="mesures")

    def __str__(self):
        return f"{self.constante.nom_constante}: {self.valeur} {self.unite}"
    
    class Meta :
        db_table = 'Mesure'


# -------------------- Articles --------------------
class Article(models.Model):
    id_article = models.AutoField(primary_key=True)
    titre = models.CharField(max_length=200)
    date_de_publication = models.DateField(auto_now_add=True)
    contenu = models.TextField()
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name="articles")

    def __str__(self):
        return self.titre
    

    class Meta :
        db_table = 'Article'
    

    
    
# -------------------- Structures & Services --------------------
class StructureDeSante(models.Model):
    nom = models.CharField(max_length=150)
    adresse = models.TextField()

    def __str__(self):
        return self.nom
    
    class Meta :
        db_table = 'StructureDeSante'


class Service(models.Model):
    id_service = models.AutoField(primary_key=True)
    nom_service = models.CharField(max_length=100)
    description = models.TextField()
    responsable = models.CharField(max_length=100)
    structure = models.ForeignKey(StructureDeSante, on_delete=models.CASCADE, related_name="services")

    def __str__(self):
        return self.nom_service
    
    class Meta :
        db_table = 'Service'
    