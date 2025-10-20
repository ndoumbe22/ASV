# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions

import requests
import json
import os 
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

import json
import os 
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Base des maladies connues avec prévention
maladies_connues = {
    "paludisme": ["utiliser des moustiquaires", "éviter les zones à risque", "prendre des répulsifs"],
    "grippe": ["se laver les mains régulièrement", "éviter le contact avec les malades", "vaccination annuelle"],
    "diabète": ["avoir une alimentation équilibrée", "faire du sport régulièrement", "surveiller sa glycémie"],
    "covid": ["porter un masque dans les lieux publics", "se laver souvent les mains", "vaccination recommandée"],
    "tuberculose": ["éviter les lieux confinés avec des malades", "se faire dépister", "vaccination BCG"],
    "diarrhée": ["Se laver les mains régulièrement avec de l'eau et du savon (surtout avant de manger et après être allé aux toilettes)", "Laver soigneusement les fruits et légumes avant de les consommer", "Boire de l'eau potable (préférer de l'eau filtrée, bouillie ou en bouteille scellée)", "Bien cuire les aliments (éviter les viandes/poissons crus ou insuffisamment cuits)", "Éviter les aliments mal conservés ou vendus dans de mauvaises conditions d'hygiène"]
}

class ActionRepondreMaladie(Action):

    def name(self) -> Text:
        return "action_repondre_maladie"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        maladie = next(tracker.get_latest_entity_values("maladie"), None)

        if maladie:
            maladie = maladie.lower()
            if maladie in maladies_connues:
                preventions = ", ".join(maladies_connues[maladie])
                dispatcher.utter_message(text=f"Pour {maladie}, il est conseillé de consulter un médecin. "
                                              f"Voici quelques mesures de prévention : {preventions}.")
            else:
                dispatcher.utter_message(text="Je n'ai pas encore d'informations sur cette maladie. "
                                              "Je suis encore en apprentissage et je prendrai en compte cette nouvelle information pour l'avenir.")
        else:
            dispatcher.utter_message(text="Je n'ai pas encore d'informations sur cette maladie. "
                                              "Je suis encore en apprentissage et je prendrai en compte cette nouvelle information pour l'avenir.")

        return []

    

class ActionPrendreRendezVous(Action):
    def name(self) -> Text:
        return "action_prendre_rendez_vous"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Récupération des slots
        date = tracker.get_slot("date")
        heure = tracker.get_slot("heure")
        user_id = tracker.sender_id

        # Si date ou heure manquante, on demande à l'utilisateur
        if not date:
            dispatcher.utter_message(text="Pouvez-vous préciser la date du rendez-vous ?")
            return []
        if not heure:
            dispatcher.utter_message(text="Pouvez-vous préciser l’heure du rendez-vous ?")
            return []

        # Intégration avec le backend Django
        try:
            # Make API call to Django backend to create appointment
            django_api_url = "http://localhost:8000/api/rendezvous/"
            appointment_data = {
                "patient": user_id,  # This should be the patient ID in the Django system
                "date": date,
                "heure": heure,
                "statut": "PENDING"
            }
            
            # In a real implementation, you would need to authenticate with the Django API
            # For now, we'll make a POST request without authentication
            response = requests.post(django_api_url, json=appointment_data)
            
            if response.status_code == 201:
                dispatcher.utter_message(
                    text=f"✅ Votre rendez-vous a été enregistré pour le {date} à {heure}. Il est synchronisé avec votre compte."
                )
            else:
                # If API call fails, provide an error message
                dispatcher.utter_message(
                    text=f"❌ Une erreur s'est produite lors de l'enregistrement de votre rendez-vous. Veuillez réessayer plus tard."
                )
        except Exception as e:
            # Handle any exceptions during the API call
            dispatcher.utter_message(
                text=f"❌ Une erreur s'est produite lors de la connexion au système. Veuillez réessayer plus tard."
            )

        return [SlotSet("date", date), SlotSet("heure", heure)]
    

class ActionListerRendezVous(Action):
    def name(self) -> Text:
        return "action_lister_rendez_vous"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_id = tracker.sender_id  # identifiant unique de l'utilisateur

        # Make API call to Django backend to get appointments
        try:
            django_api_url = f"http://localhost:8000/api/rendezvous/?patient={user_id}"
            response = requests.get(django_api_url)
            
            if response.status_code == 200:
                rendez_vous = response.json()
                
                # Filter appointments for this user
                mes_rdv = [rdv for rdv in rendez_vous if str(rdv.get("patient")) == user_id]
                
                if not mes_rdv:
                    dispatcher.utter_message(text="📭 Vous n’avez aucun rendez-vous enregistré dans le système.")
                else:
                    rdv_text = "\n".join([f"- {rdv['date']} à {rdv['heure']}" for rdv in mes_rdv])
                    dispatcher.utter_message(text=f"📅 Voici vos rendez-vous enregistrés dans le système :\n{rdv_text}")
            else:
                dispatcher.utter_message(text="📭 Vous n’avez aucun rendez-vous enregistré dans le système.")
        except Exception as e:
            # Handle any exceptions during the API call
            dispatcher.utter_message(text="📭 Vous n’avez aucun rendez-vous enregistré dans le système.")

        return []
    

class ActionInfoApplication(Action):
    def name(self):
        return "action_info_application"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text=(
            "📌 Cette application permet de :\n"
            "- Gérer les maladies et leurs symptômes\n"
            "- Enregistrer des rendez-vous médicaux\n"
            "- Aider les utilisateurs avec des informations de santé\n"
            "- Servir de support pour le personnel médical"
        ))
        return []



class ActionDonnerSymptome(Action):
    def name(self) -> Text:
        return "action_donner_symptome"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Ici tu pourrais enregistrer les symptômes ou proposer un diagnostic
        dispatcher.utter_message(text="Merci pour vos symptômes. Voulez-vous que je propose un rendez-vous avec un médecin ?")
        return []


class ActionDemanderMedicament(Action):
    def name(self) -> Text:
        return "action_demander_medicament"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Ici tu pourrais appeler une base de données ou API
        dispatcher.utter_message(text="Je peux suggérer du paracétamol pour les douleurs et la fièvre. Mais consultez un médecin avant de prendre un traitement.")
        return []


class ActionAjouterRappelMedicament(Action):
    def name(self) -> Text:
        return "action_ajouter_rappel_medicament"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Récupération des slots
        medicament = tracker.get_slot("medicament")
        dosage = tracker.get_slot("dosage")
        heure_rappel = tracker.get_slot("heure")
        frequence = tracker.get_slot("frequence") or "quotidienne"
        user_id = tracker.sender_id

        # Si les informations sont manquantes, on demande à l'utilisateur
        if not medicament:
            dispatcher.utter_message(text="Quel médicament souhaitez-vous ajouter à vos rappels ?")
            return []
        if not dosage:
            dispatcher.utter_message(text="Quel est le dosage de ce médicament ?")
            return []
        if not heure_rappel:
            dispatcher.utter_message(text="À quelle heure souhaitez-vous recevoir le rappel ?")
            return []

        # Intégration avec le backend Django pour les rappels de médicaments
        try:
            # Make API call to Django backend to create medication reminder
            django_api_url = "http://localhost:8000/api/medication-reminders/"
            reminder_data = {
                "patient": user_id,
                "medicament": medicament,
                "dosage": dosage,
                "heure_rappel": heure_rappel,
                "frequence": frequence,
                "date_debut": "2023-01-01",  # Default start date
                "actif": True
            }
            
            # In a real implementation, you would need to authenticate with the Django API
            response = requests.post(django_api_url, json=reminder_data)
            
            if response.status_code == 201:
                dispatcher.utter_message(
                    text=f"✅ Le rappel pour {medicament} ({dosage}) à {heure_rappel} a été enregistré avec succès."
                )
            else:
                # If API call fails, provide an error message
                dispatcher.utter_message(
                    text=f"❌ Une erreur s'est produite lors de l'enregistrement du rappel. Veuillez réessayer plus tard."
                )
        except Exception as e:
            # Handle any exceptions during the API call
            dispatcher.utter_message(
                text=f"❌ Une erreur s'est produite lors de la connexion au système. Veuillez réessayer plus tard."
            )

        return [SlotSet("medicament", medicament), SlotSet("dosage", dosage), SlotSet("heure", heure_rappel)]


class ActionListerRappelsMedicament(Action):
    def name(self) -> Text:
        return "action_lister_rappels_medicament"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_id = tracker.sender_id  # identifiant unique de l'utilisateur

        # Make API call to Django backend to get medication reminders
        try:
            django_api_url = f"http://localhost:8000/api/medication-reminders/"
            response = requests.get(django_api_url)
            
            if response.status_code == 200:
                rappels = response.json()
                
                # Filter reminders for this user
                mes_rappels = [rappel for rappel in rappels if str(rappel.get("patient")) == user_id]
                
                if not mes_rappels:
                    dispatcher.utter_message(text="📭 Vous n’avez aucun rappel de médicament enregistré.")
                else:
                    rappel_text = "\n".join([f"- {rappel['medicament']} ({rappel['dosage']}) à {rappel['heure_rappel']}" for rappel in mes_rappels])
                    dispatcher.utter_message(text=f"💊 Voici vos rappels de médicaments :\n{rappel_text}")
            else:
                dispatcher.utter_message(text="📭 Vous n’avez aucun rappel de médicament enregistré.")
        except Exception as e:
            # Handle any exceptions during the API call
            dispatcher.utter_message(text="📭 Vous n’avez aucun rappel de médicament enregistré.")

        return []