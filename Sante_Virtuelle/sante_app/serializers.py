from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Patient, Medecin, RendezVous, Consultation, Medicament,
    Pathologie, Traitement, Constante, Mesure, Article,
    StructureDeSante, Service, Clinique, Dentiste, Hopital, Pharmacie,
    ContactFooter, ChatbotConversation, RappelMedicament, HistoriquePriseMedicament,
    Urgence, NotificationUrgence, MedicalDocument, Rating  # Added Rating
)

User = get_user_model()

# -------------------- User --------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']

# -------------------- Patient --------------------
class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested serializer

    class Meta:
        model = Patient
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'patient'
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

# -------------------- Medecin --------------------
class MedecinSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested serializer

    class Meta:
        model = Medecin
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'medecin'
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)
        medecin = Medecin.objects.create(user=user, **validated_data)
        return medecin

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = "__all__"

class RendezVousSerializer(serializers.ModelSerializer):
    medecin_nom = serializers.CharField(source="medecin.get_full_name", read_only=True)
    patient_nom = serializers.CharField(source="patient.get_full_name", read_only=True)
    original_date = serializers.DateField(read_only=True)
    original_heure = serializers.TimeField(read_only=True)

    class Meta:
        model = RendezVous
        fields = ["id", "date", "heure", "description", "statut", "medecin_nom", "patient_nom", 
                  "original_date", "original_heure", "date_creation", "date_modification"]


class PathologieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pathologie
        fields = "__all__"

class MedicamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = "__all__"

class TraitementSerializer(serializers.ModelSerializer):
    medicament_nom = serializers.CharField(source="medicament.nom", read_only=True)
    medicament_dosage = serializers.CharField(source="medicament.dosage", read_only=True)
    consultation_date = serializers.DateTimeField(source="consultation.date", read_only=True)

    class Meta:
        model = Traitement
        fields = ["id", "medicament_nom", "medicament_dosage", "posologie", "consultation_date"]

class ConstanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constante
        fields = "__all__"

class MesureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesure
        fields = "__all__"

class ArticleSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()
    auteur_specialite = serializers.SerializerMethodField()
    peut_modifier = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['slug', 'date_publication', 'date_modification', 'vues', 'valide_par', 'date_validation']

    def get_auteur_nom(self, obj):
        return f"Dr. {obj.auteur.user.first_name} {obj.auteur.user.last_name}"

    def get_auteur_specialite(self, obj):
        return obj.auteur.specialite

    def get_peut_modifier(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.role == 'medecin':
            try:
                medecin = Medecin.objects.get(user=request.user)
                return obj.auteur == medecin and obj.statut in ['brouillon', 'refuse']
            except Medecin.DoesNotExist:
                return False
        return request.user.role == 'admin'


class ArticleListSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()
    extrait_contenu = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'titre', 'slug', 'resume', 'extrait_contenu', 'image', 'auteur_nom',
                  'categorie', 'statut', 'date_publication', 'vues', 'tags']

    def get_auteur_nom(self, obj):
        return f"Dr. {obj.auteur.user.first_name} {obj.auteur.user.last_name}"

    def get_extrait_contenu(self, obj):
        # Retourner les 150 premiers caractères du contenu
        return obj.contenu[:150] + '...' if len(obj.contenu) > 150 else obj.contenu


class StructureDeSanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureDeSante
        fields = "__all__"

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class CliniqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinique
        fields = '__all__'

class DentisteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dentiste
        fields = '__all__'


class HopitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hopital
        fields = '__all__'

class PharmacieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacie
        fields = '__all__'

class ContactFooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactFooter
        fields = '__all__'


class ChatbotConversationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'historique des conversations chatbot"""
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatbotConversation
        fields = ['id', 'patient', 'patient_name', 'message_user', 'message_bot', 'timestamp', 'sentiment']
        read_only_fields = ['timestamp']
        
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"


class RappelMedicamentSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les rappels de médicaments"""
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RappelMedicament
        fields = ['id', 'patient', 'patient_name', 'medicament', 'dosage', 'frequence', 
                  'heure_rappel', 'date_debut', 'date_fin', 'actif', 'notes']
        read_only_fields = ['patient']
        
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
        
    def create(self, validated_data):
        # Automatically set the patient to the current user
        validated_data['patient'] = self.context['request'].user.patient_profile
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        # Prevent changing the patient
        validated_data.pop('patient', None)
        return super().update(instance, validated_data)


class HistoriquePriseMedicamentSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'historique des prises de médicaments"""
    rappel_medicament = serializers.CharField(source='rappel.medicament', read_only=True)
    
    class Meta:
        model = HistoriquePriseMedicament
        fields = ['id', 'rappel', 'rappel_medicament', 'date_prise', 'prise_effectuee', 'notes']
        read_only_fields = ['date_prise']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirmPassword = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "username", "password", "confirmPassword", "first_name", "last_name", "email", "telephone", "adresse", "role"]

    def validate(self, attrs):
        # Check if passwords match
        password = attrs.get('password')
        confirm_password = attrs.get('confirmPassword')
        
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        
        # Check password strength
        if password and len(password) < 8:
            raise serializers.ValidationError("Le mot de passe doit contenir au moins 8 caractères")
        
        # Check if username is unique
        username = attrs.get('username')
        if username and User.objects.filter(username=username).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé")
        
        # Check if email is unique
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé")
            
        return attrs

    def create(self, validated_data):
        # Remove confirmPassword from validated_data as it's not a model field
        validated_data.pop('confirmPassword', None)
        
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
            telephone=validated_data.get("telephone", ""),
            adresse=validated_data.get("adresse", ""),
            role=validated_data.get("role", "patient"),
        )
        return user


class UrgenceSerializer(serializers.ModelSerializer):
    patient_nom = serializers.SerializerMethodField()
    medecin_nom = serializers.SerializerMethodField()
    temps_ecoule = serializers.SerializerMethodField()

    class Meta:
        model = Urgence
        fields = '__all__'
        read_only_fields = ['score_urgence', 'priorite_automatique', 'date_creation', 'date_modification']

    def get_patient_nom(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"

    def get_medecin_nom(self, obj):
        if obj.medecin_charge:
            return f"Dr. {obj.medecin_charge.user.first_name} {obj.medecin_charge.user.last_name}"
        return None

    def get_temps_ecoule(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.date_creation
        minutes = int(delta.total_seconds() / 60)
        if minutes < 60:
            return f"{minutes} min"
        hours = int(minutes / 60)
        return f"{hours}h {minutes % 60}min"


class NotificationUrgenceSerializer(serializers.ModelSerializer):
    urgence_detail = UrgenceSerializer(source='urgence', read_only=True)

    class Meta:
        model = NotificationUrgence
        fields = '__all__'

class MedicalDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MedicalDocument
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class RatingSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les évaluations des médecins"""
    patient_name = serializers.SerializerMethodField()
    medecin_name = serializers.SerializerMethodField()
    rendez_vous_date = serializers.DateField(source='rendez_vous.date', read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'patient', 'patient_name', 'medecin', 'medecin_name', 'rendez_vous', 
                  'rendez_vous_date', 'note', 'commentaire', 'date_creation', 'date_modification']
        read_only_fields = ['patient', 'date_creation', 'date_modification']
        
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
        
    def get_medecin_name(self, obj):
        return f"Dr. {obj.medecin.user.first_name} {obj.medecin.user.last_name}"
        
    def create(self, validated_data):
        # Automatically set the patient to the current user
        validated_data['patient'] = self.context['request'].user.patient_profile
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        # Prevent changing the patient, medecin, or rendez_vous
        validated_data.pop('patient', None)
        validated_data.pop('medecin', None)
        validated_data.pop('rendez_vous', None)
        return super().update(instance, validated_data)
