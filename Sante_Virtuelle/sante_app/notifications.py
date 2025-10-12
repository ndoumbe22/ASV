from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime, timedelta

class NotificationService:
    """Service de notifications par email (gratuit)"""

    @staticmethod
    def send_appointment_confirmation(rendez_vous):
        """Envoyer confirmation de rendez-vous"""
        patient = rendez_vous.patient
        medecin = rendez_vous.medecin

        subject = f"✅ Rendez-vous confirmé - AssitoSanté"
        message = f"""
Bonjour {patient.user.first_name},

Votre rendez-vous a été confirmé :

📅 Date : {rendez_vous.date.strftime('%d/%m/%Y')}
⏰ Heure : {rendez_vous.heure.strftime('%H:%M')}
👨‍⚕️ Médecin : Dr. {medecin.user.first_name} {medecin.user.last_name}
📍 Lieu : À déterminer

Merci d'arriver 10 minutes avant l'heure prévue.

Cordialement,
L'équipe AssitoSanté
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [patient.user.email],
                fail_silently=False,
            )
            print(f"✅ Email de confirmation envoyé à {patient.user.email}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email : {e}")

    @staticmethod
    def send_appointment_cancellation(rendez_vous):
        """Envoyer annulation de rendez-vous"""
        patient = rendez_vous.patient
        medecin = rendez_vous.medecin

        subject = f"❌ Rendez-vous annulé - AssitoSanté"
        message = f"""
Bonjour {patient.user.first_name},

Votre rendez-vous du {rendez_vous.date.strftime('%d/%m/%Y')} à {rendez_vous.heure.strftime('%H:%M')} avec Dr. {medecin.user.first_name} {medecin.user.last_name} a été annulé.

Veuillez nous contacter pour reprogrammer un nouveau rendez-vous.

Cordialement,
L'équipe AssitoSanté
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [patient.user.email],
                fail_silently=False,
            )
            print(f"✅ Email d'annulation envoyé à {patient.user.email}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email : {e}")

    @staticmethod
    def send_appointment_reschedule(rendez_vous, old_date, old_time):
        """Envoyer reprogrammation de rendez-vous"""
        patient = rendez_vous.patient
        medecin = rendez_vous.medecin

        subject = f"📅 Rendez-vous reprogrammé - AssitoSanté"
        message = f"""
Bonjour {patient.user.first_name},

Votre rendez-vous a été reprogrammé :

📅 Ancienne date : {old_date.strftime('%d/%m/%Y')} à {old_time.strftime('%H:%M')}
📅 Nouvelle date : {rendez_vous.date.strftime('%d/%m/%Y')} à {rendez_vous.heure.strftime('%H:%M')}
👨‍⚕️ Médecin : Dr. {medecin.user.first_name} {medecin.user.last_name}

Merci d'arriver 10 minutes avant l'heure prévue.

Cordialement,
L'équipe AssitoSanté
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [patient.user.email],
                fail_silently=False,
            )
            print(f"✅ Email de reprogrammation envoyé à {patient.user.email}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email : {e}")

    @staticmethod
    def send_welcome_email(user):
        """Envoyer email de bienvenue"""
        subject = f"🎉 Bienvenue sur AssitoSanté"
        message = f"""
Bonjour {user.first_name},

Bienvenue sur AssitoSanté ! Votre compte a été créé avec succès.

Vous pouvez maintenant :
- Prendre des rendez-vous médicaux
- Consulter votre historique médical
- Recevoir des rappels de médicaments
- Discuter avec notre assistant médical

Cordialement,
L'équipe AssitoSanté
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            print(f"✅ Email de bienvenue envoyé à {user.email}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email : {e}")

    @staticmethod
    def send_medication_reminder(patient, medicament, dosage, horaire):
        """Envoyer rappel de prise de médicament"""
        subject = f"💊 Rappel de prise de médicament - {medicament}"
        message = f"""
Bonjour {patient.user.first_name},

C'est l'heure de prendre votre médicament :

💊 Médicament : {medicament}
📏 Dosage : {dosage}
⏰ Heure : {horaire.strftime('%H:%M')}

Merci de bien vouloir prendre votre médicament comme prescrit.

Cordialement,
L'équipe AssitoSanté
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [patient.user.email],
                fail_silently=False,
            )
            print(f"✅ Rappel de médicament envoyé à {patient.user.email}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi du rappel de médicament : {e}")

    @staticmethod
    def send_urgence_confirmation(urgence):
        """Confirmer la réception de l'urgence au patient"""
        subject = "🚨 Urgence reçue - AssitoSanté"
        message = f"""
Bonjour {urgence.patient.user.first_name},

Votre signalement d'urgence a bien été reçu.

Type : {urgence.type_urgence}
Priorité : {urgence.get_priorite_display()}
Heure de signalement : {urgence.date_creation.strftime('%H:%M')}

Nos médecins ont été notifiés et vont vous contacter rapidement.

EN CAS D'URGENCE VITALE, COMPOSEZ LE 15 (SAMU) IMMÉDIATEMENT.

Équipe AssitoSanté
        """

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [urgence.patient.user.email])
            return True
        except Exception as e:
            print(f"Erreur envoi email : {e}")
            return False

    @staticmethod
    def send_urgence_notification_medecin(urgence, medecin):
        """Notifier un médecin d'une urgence"""
        subject = f"🚨 URGENCE {urgence.get_priorite_display().upper()} - AssitoSanté"
        message = f"""
Dr. {medecin.user.first_name},

NOUVELLE URGENCE SIGNALÉE

Patient : {urgence.patient.user.first_name} {urgence.patient.user.last_name}
Type : {urgence.type_urgence}
Priorité : {urgence.get_priorite_display()}
Score : {urgence.score_urgence}/100

Symptômes : {urgence.symptomes[:200]}

Téléphone : {urgence.telephone_contact}
Heure : {urgence.date_creation.strftime('%H:%M')}

Connectez-vous pour prendre en charge cette urgence.

AssitoSanté
        """

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [medecin.user.email])
            return True
        except Exception as e:
            print(f"Erreur envoi email médecin : {e}")
            return False

    @staticmethod
    def send_urgence_prise_en_charge(urgence):
        """Notifier le patient de la prise en charge"""
        subject = "✅ Urgence prise en charge"
        message = f"""
Bonjour {urgence.patient.user.first_name},

Votre urgence a été prise en charge par :

{urgence.medecin_nom}
Spécialité : {urgence.medecin_charge.specialite}

Le médecin va vous contacter sous peu au {urgence.telephone_contact}.

Équipe AssitoSanté
        """

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [urgence.patient.user.email])
            return True
        except Exception as e:
            print(f"Erreur envoi email : {e}")
            return False
