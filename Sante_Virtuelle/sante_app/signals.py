# sante_app/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Patient, Medecin, RendezVous, Consultation
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == "patient":
            Patient.objects.get_or_create(user=instance)
        elif instance.role == "medecin":
            Medecin.objects.get_or_create(user=instance, specialite="Généraliste")


@receiver(post_save, sender=RendezVous)
def create_consultation_on_appointment_confirmation(sender, instance, created, **kwargs):
    """
    Automatically create a consultation when an appointment is confirmed
    """
    logger.info(f"RendezVous post_save signal received. Instance ID: {instance.numero}, Created: {created}, Status: {instance.statut}")
    
    # Only create consultation when appointment status changes to CONFIRMED
    # and it's not a new appointment creation
    if not created and instance.statut == "CONFIRMED":
        logger.info(f"Appointment {instance.numero} is confirmed, checking for existing consultation")
        
        # Check if a consultation already exists for this appointment
        existing_consultation = Consultation.objects.filter(rendez_vous=instance).first()
        
        if not existing_consultation:
            try:
                logger.info(f"No existing consultation found for appointment {instance.numero}, creating new one")
                
                # Ensure patient and doctor profiles exist
                try:
                    patient_profile = instance.patient.patient_profile
                except Patient.DoesNotExist:
                    logger.info(f"Creating patient profile for user {instance.patient.id}")
                    patient_profile, _ = Patient.objects.get_or_create(user=instance.patient)
                
                try:
                    medecin_profile = instance.medecin.medecin_profile
                except Medecin.DoesNotExist:
                    logger.info(f"Creating medecin profile for user {instance.medecin.id}")
                    medecin_profile, _ = Medecin.objects.get_or_create(user=instance.medecin, specialite="Généraliste")
                
                # Create consultation with same date and time as appointment
                consultation = Consultation.objects.create(
                    date=instance.date,
                    heure=instance.heure,
                    patient=patient_profile,
                    medecin=medecin_profile,
                    rendez_vous=instance,
                    statut='programmee'  # Default status
                )
                logger.info(f"Successfully created consultation {consultation.numero} for appointment {instance.numero}")
            except Exception as e:
                logger.error(f"Error creating consultation for appointment {instance.numero}: {e}")
        else:
            logger.info(f"Consultation {existing_consultation.numero} already exists for appointment {instance.numero}")
    else:
        logger.info(f"Skipping consultation creation for appointment {instance.numero}. Created: {created}, Status: {instance.statut}")