from rest_framework import serializers
from .models import (
    Patient, Medecin, Consultation, RendezVous,
    Pathologie, Medicament, Traitement,
    Constante, Mesure, Article,
    StructureDeSante, Service, User 
)

# -------------------- User --------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# -------------------- Patient --------------------
class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested serializer

    class Meta:
        model = Patient
        fields = ('id', 'user', 'adresse')

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
        fields = ('id', 'user', 'specialite', 'disponibilite')

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
    medicaments = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Medicament.objects.all()
    )

    class Meta:
        model = RendezVous
        fields = "__all__"


class PathologieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pathologie
        fields = "__all__"

class MedicamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = "__all__"

class TraitementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traitement
        fields = "__all__"

class ConstanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constante
        fields = "__all__"

class MesureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesure
        fields = "__all__"

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"

class StructureDeSanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureDeSante
        fields = "__all__"

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


