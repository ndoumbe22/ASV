from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime, time
from .models import RappelMedicament, HistoriquePriseMedicament
from .notifications import NotificationService
import logging

logger = logging.getLogger(__name__)

class MedicationReminderScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        
    def start(self):
        """Start the scheduler"""
        # Schedule the medication reminder check to run every minute
        self.scheduler.add_job(
            self.check_medication_reminders,
            CronTrigger(minute="*"),  # Run every minute
            id="medication_reminder_check",
            name="Check medication reminders",
            replace_existing=True,
        )
        
        self.scheduler.start()
        logger.info("Medication reminder scheduler started")
        
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Medication reminder scheduler stopped")
        
    def check_medication_reminders(self):
        """Check for medication reminders that need to be sent"""
        try:
            # Get current time
            now = timezone.now()
            current_time = now.time()
            
            # Get all active medication reminders for today
            reminders = RappelMedicament.objects.filter(
                actif=True,
                date_debut__lte=now.date()
            ).exclude(
                date_fin__lt=now.date()
            )
            
            for reminder in reminders:
                # Check if it's time to send the reminder
                if self._should_send_reminder(reminder, current_time):
                    self._send_medication_reminder(reminder)
                    
        except Exception as e:
            logger.error(f"Error checking medication reminders: {e}")
            
    def _should_send_reminder(self, reminder, current_time):
        """Check if it's time to send a reminder"""
        # For simplicity, we'll check if the current time is within a 1-minute window
        # of the reminder time
        reminder_time = reminder.heure_rappel
        time_diff = abs(
            current_time.hour * 60 + current_time.minute - 
            reminder_time.hour * 60 - reminder_time.minute
        )
        
        # Send reminder if within 1 minute of scheduled time
        return time_diff <= 1
        
    def _send_medication_reminder(self, reminder):
        """Send medication reminder notification"""
        try:
            # Check if we've already sent a reminder today
            today = timezone.now().date()
            existing_reminder = HistoriquePriseMedicament.objects.filter(
                rappel=reminder,
                date_prise__date=today
            ).first()
            
            # If we haven't sent a reminder today, send one
            if not existing_reminder:
                # Create a record in the history
                history_entry = HistoriquePriseMedicament.objects.create(
                    rappel=reminder,
                    prise_effectuee=False,
                    notes="Rappel envoyé"
                )
                
                # Send email notification using NotificationService
                patient = reminder.patient
                if patient.user.email:
                    NotificationService.send_medication_reminder(
                        patient,
                        reminder.medicament,
                        reminder.dosage,
                        reminder.heure_rappel
                    )
                        
        except Exception as e:
            logger.error(f"Error sending medication reminder: {e}")

# Global scheduler instance
scheduler = MedicationReminderScheduler()