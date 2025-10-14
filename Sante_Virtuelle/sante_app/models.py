from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.utils import timezone
# Importer les fonctions de chiffrement
from .encryption import encrypt_field, decrypt_field

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrateur'),
        ('medecin', 'Médecin'),
        ('patient', 'Patient'),
    )
    role = models.CharField(max_length=20, choices=ROLES, default="patient")
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    
    def get_full_name(self):
        """Return the full name of the user."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username
    
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
    
    # Ajouter des champs pour les données chiffrées
    notes_chiffrees = models.TextField(blank=True, verbose_name="Notes chiffrées")
    diagnostic_chiffre = models.TextField(blank=True, verbose_name="Diagnostic chiffré")

    def set_notes_securisees(self, notes):
        """Définir des notes avec chiffrement"""
        self.notes_chiffrees = encrypt_field(notes)

    def get_notes_securisees(self):
        """Récupérer les notes déchiffrées"""
        return decrypt_field(self.notes_chiffrees)

    def set_diagnostic_securise(self, diagnostic):
        """Définir un diagnostic avec chiffrement"""
        self.diagnostic_chiffre = encrypt_field(diagnostic)

    def get_diagnostic_securise(self):
        """Récupérer le diagnostic déchiffré"""
        return decrypt_field(self.diagnostic_chiffre)

    def __str__(self):
        return f"Consultation {self.numero} - {self.patient}"
    
    class Meta :
        db_table = 'Consultation'


# -------------------- Rendez-vous --------------------
class RendezVous(models.Model):
    numero = models.AutoField(primary_key=True)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rdv_patient")
    medecin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rdv_medecin")
    date = models.DateField()
    heure = models.TimeField()
    description = models.TextField(blank=True, null=True)

    STATUT_CHOICES = [
        ("CONFIRMED", "Confirmé"),
        ("CANCELLED", "Annulé"),
        ("RESCHEDULED", "Reprogrammé"),
        ("PENDING", "En attente"),
        ("TERMINE", "Terminé"),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="PENDING")
    
    # Track rescheduling history
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    # Original appointment details for rescheduling tracking
    original_date = models.DateField(null=True, blank=True)
    original_heure = models.TimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # If this is the first time saving and it's being rescheduled, store original details
        if self.statut == "RESCHEDULED" and not self.original_date and self.numero:
            # Get the original appointment details
            original = RendezVous.objects.get(numero=self.numero)
            if not self.original_date:
                self.original_date = original.date
                self.original_heure = original.heure
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient.username} - {self.date} {self.heure}"
    
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
    """Articles de santé rédigés par les médecins"""
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('en_attente', 'En attente de validation'),
        ('valide', 'Validé'),
        ('refuse', 'Refusé'),
        ('desactive', 'Désactivé'),
    ]

    CATEGORIE_CHOICES = [
        ('prevention', 'Prévention'),
        ('nutrition', 'Nutrition'),
        ('maladies', 'Maladies'),
        ('bien_etre', 'Bien-être'),
        ('grossesse', 'Grossesse'),
        ('pediatrie', 'Pédiatrie'),
        ('geriatrie', 'Gériatrie'),
        ('autre', 'Autre'),
    ]

    # Contenu
    titre = models.CharField(max_length=200, verbose_name="Titre")
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    contenu = models.TextField(verbose_name="Contenu")
    resume = models.TextField(max_length=500, verbose_name="Résumé")
    image = models.ImageField(upload_to='articles/', blank=True, null=True)

    # Relations
    auteur = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='articles')
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES, default='autre')
    tags = models.CharField(max_length=200, blank=True)

    # Modération
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon')
    valide_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles_valides')
    date_validation = models.DateTimeField(null=True, blank=True)
    commentaire_moderation = models.TextField(blank=True)

    # Métadonnées
    date_publication = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    vues = models.IntegerField(default=0)

    class Meta:
        ordering = ['-date_publication']
        verbose_name = "Article de Santé"
        verbose_name_plural = "Articles de Santé"
        db_table = 'Article'

    def __str__(self):
        return self.titre

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titre)
            # S'assurer que le slug est unique
            original_slug = self.slug
            counter = 1
            while Article.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def incrementer_vues(self):
        self.vues += 1
        self.save(update_fields=['vues'])

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


# Le formulaire dans le footer
class MessageContact(models.Model):
    nom = models.CharField(max_length=150)
    email = models.EmailField()
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.sujet}"
    

class Hopital(models.Model):
    nom = models.CharField(max_length=200)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    site_web = models.URLField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.nom


class Clinique(models.Model):
    nom = models.CharField(max_length=200)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.nom


class Dentiste(models.Model):
    nom = models.CharField(max_length=200)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    cabinet = models.CharField(max_length=150, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.nom


class Pharmacie(models.Model):
    nom = models.CharField(max_length=200)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    ouvert_24h = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.nom


class ContactFooter(models.Model):
    nom = models.CharField(max_length=150)
    email = models.EmailField()
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.sujet}"


class ChatbotConversation(models.Model):
    """Historique des conversations avec le chatbot"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='conversations')
    message_user = models.TextField(verbose_name="Message utilisateur")
    message_bot = models.TextField(verbose_name="Réponse chatbot")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Date/Heure")
    sentiment = models.CharField(max_length=20, blank=True, null=True, verbose_name="Sentiment")

    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Chat avec {self.patient.user.username} - {self.timestamp}"


class RappelMedicament(models.Model):
    """Rappels de prise de médicaments"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='rappels_medicaments')
    medicament = models.CharField(max_length=100, verbose_name="Nom du médicament")
    dosage = models.CharField(max_length=50, verbose_name="Dosage")
    frequence = models.CharField(max_length=50, verbose_name="Fréquence")
    heure_rappel = models.TimeField(verbose_name="Heure du rappel")
    date_debut = models.DateField(verbose_name="Date de début")
    date_fin = models.DateField(verbose_name="Date de fin", null=True, blank=True)
    actif = models.BooleanField(default=True, verbose_name="Rappel actif")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes supplémentaires")

    class Meta:
        verbose_name = "Rappel médicament"
        verbose_name_plural = "Rappels médicaments"
        ordering = ['heure_rappel']
        
    def __str__(self):
        return f"{self.medicament} - {self.patient.user.username}"


class HistoriquePriseMedicament(models.Model):
    """Historique de prise des médicaments"""
    rappel = models.ForeignKey(RappelMedicament, on_delete=models.CASCADE, related_name='historique_prises')
    date_prise = models.DateTimeField(auto_now_add=True, verbose_name="Date de prise")
    prise_effectuee = models.BooleanField(default=False, verbose_name="Prise effectuée")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Historique prise médicament"
        verbose_name_plural = "Historiques prises médicaments"
        ordering = ['-date_prise']
        
    def __str__(self):
        return f"{self.rappel.medicament} - {self.date_prise.strftime('%d/%m/%Y %H:%M')}"

# -------------------- Audit Logs --------------------
class AuditLog(models.Model):
    """Journal d'audit des actions sensibles"""
    ACTION_CHOICES = [
        ('create', 'Création'),
        ('read', 'Lecture'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('export', 'Export de données'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Log d'Audit"
        verbose_name_plural = "Logs d'Audit"
        db_table = 'AuditLog'

    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name} - {self.timestamp}"


def log_action(user, action, model_name, object_id=None, details=None, request=None):
    """Helper pour créer un log d'audit"""
    ip_address = None
    user_agent = ''

    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:300]

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )

# -------------------- Urgences --------------------
class Urgence(models.Model):
    """Signalements d'urgences médicales"""
    PRIORITE_CHOICES = [
        ('faible', 'Faible'),
        ('moyenne', 'Moyenne'),
        ('elevee', 'Élevée'),
        ('critique', 'Critique'),
    ]

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('prise_en_charge', 'Prise en charge'),
        ('resolue', 'Résolue'),
        ('annulee', 'Annulée'),
    ]

    # Patient
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='urgences')

    # Description
    type_urgence = models.CharField(max_length=100, verbose_name="Type d'urgence")
    description = models.TextField(verbose_name="Description détaillée")
    symptomes = models.TextField(verbose_name="Symptômes")

    # Localisation
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    adresse = models.CharField(max_length=300, blank=True)

    # Priorisation
    priorite = models.CharField(max_length=20, choices=PRIORITE_CHOICES, default='moyenne')
    priorite_automatique = models.CharField(max_length=20, choices=PRIORITE_CHOICES, blank=True)
    score_urgence = models.IntegerField(default=0, help_text="Score calculé automatiquement")

    # Statut et prise en charge
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    medecin_charge = models.ForeignKey(Medecin, on_delete=models.SET_NULL, null=True, blank=True, related_name='urgences_prises_en_charge')
    date_prise_en_charge = models.DateTimeField(null=True, blank=True)

    # Contact
    telephone_contact = models.CharField(max_length=20, verbose_name="Téléphone de contact")
    personne_contact = models.CharField(max_length=100, blank=True, verbose_name="Nom de la personne à contacter")

    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    notes_medecin = models.TextField(blank=True, verbose_name="Notes du médecin")

    class Meta:
        ordering = ['-priorite', '-date_creation']
        verbose_name = "Urgence"
        verbose_name_plural = "Urgences"
        db_table = 'Urgence'

    def __str__(self):
        return f"Urgence {self.type_urgence} - {self.patient.user.username} ({self.priorite})"

    def calculer_score_urgence(self):
        """Calculer automatiquement le score d'urgence basé sur les mots-clés"""
        score = 0
        mots_cles_critiques = [
            'infarctus', 'avc', 'hémorragie', 'accident', 'inconscient',
            'difficulté respirer', 'douleur poitrine', 'paralysie'
        ]
        mots_cles_elevees = [
            'fièvre élevée', 'vomissements', 'diarrhée', 'douleur intense',
            'saignement', 'chute', 'brûlure'
        ]

        description_lower = (self.description + ' ' + self.symptomes).lower()

        for mot in mots_cles_critiques:
            if mot in description_lower:
                score += 10

        for mot in mots_cles_elevees:
            if mot in description_lower:
                score += 5

        self.score_urgence = score

        # Déterminer la priorité automatique
        if score >= 20:
            self.priorite_automatique = 'critique'
        elif score >= 10:
            self.priorite_automatique = 'elevee'
        elif score >= 5:
            self.priorite_automatique = 'moyenne'
        else:
            self.priorite_automatique = 'faible'

        return score

    def save(self, *args, **kwargs):
        # Calculer le score automatiquement
        if not self.pk:  # Nouvelle urgence
            self.calculer_score_urgence()
            if not self.priorite or self.priorite == 'moyenne':
                self.priorite = self.priorite_automatique
        super().save(*args, **kwargs)


class NotificationUrgence(models.Model):
    """Notifications envoyées aux médecins pour les urgences"""
    urgence = models.ForeignKey(Urgence, on_delete=models.CASCADE, related_name='notifications')
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='notifications_urgences')
    date_envoi = models.DateTimeField(auto_now_add=True)
    lue = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_envoi']
        verbose_name = "Notification Urgence"
        verbose_name_plural = "Notifications Urgences"
        db_table = 'NotificationUrgence'

    def __str__(self):
        return f"Notification pour Dr. {self.medecin.user.username} - {self.urgence.type_urgence}"

# -------------------- Medical Documents --------------------
class MedicalDocument(models.Model):
    """Documents médicaux partagés"""
    rendez_vous = models.ForeignKey(RendezVous, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='medical_documents/%Y/%m/')
    document_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} - {self.rendez_vous}"

    class Meta:
        db_table = 'MedicalDocument'
        ordering = ['-uploaded_at']

# -------------------- Ratings & Reviews --------------------
class Rating(models.Model):
    """Évaluations des médecins par les patients"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ratings')
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='ratings')
    rendez_vous = models.OneToOneField(RendezVous, on_delete=models.CASCADE, related_name='rating')
    note = models.IntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name="Note (1-5)")
    commentaire = models.TextField(blank=True, verbose_name="Commentaire")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('patient', 'rendez_vous')
        ordering = ['-date_creation']
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"
        db_table = 'Rating'

    def __str__(self):
        return f"Évaluation de {self.patient.user.username} pour Dr. {self.medecin.user.username} - {self.note}/5"
