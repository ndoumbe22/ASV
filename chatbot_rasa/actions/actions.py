# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


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

        # Lecture du fichier JSON
        rendez_vous_file = "rendez_vous.json"
        if os.path.exists(rendez_vous_file):
            try:
                with open(rendez_vous_file, "r", encoding="utf-8") as f:
                    rendez_vous = json.load(f)
            except json.JSONDecodeError:
                rendez_vous = []
        else:
            rendez_vous = []

        # Vérifier si un rendez-vous existe déjà pour ce user à cette date/heure
        for rdv in rendez_vous:
            if rdv["user_id"] == user_id and rdv["date"] == date and rdv["heure"] == heure:
                dispatcher.utter_message(
                    text=f"⚠️ Vous avez déjà un rendez-vous prévu le {date} à {heure}."
                )
                return []

        # Ajouter le nouveau rendez-vous
        nouveau_rdv = {
            "user_id": user_id,
            "date": date,
            "heure": heure
        }
        rendez_vous.append(nouveau_rdv)

        # Sauvegarde
        with open(rendez_vous_file, "w", encoding="utf-8") as f:
            json.dump(rendez_vous, f, ensure_ascii=False, indent=4)

        dispatcher.utter_message(
            text=f"✅ Votre rendez-vous a été enregistré pour le {date} à {heure}."
        )

        return [SlotSet("date", date), SlotSet("heure", heure)]
    

class ActionListerRendezVous(Action):
    def name(self) -> Text:
        return "action_lister_rendez_vous"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        user_id = tracker.sender_id  # identifiant unique de l'utilisateur

        # Charger les rendez-vous depuis le fichier JSON
        try:
            with open("rendez_vous.json", "r", encoding="utf-8") as f:
                rendez_vous = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            rendez_vous = []

        # Filtrer les rendez-vous de cet utilisateur
        mes_rdv = [rdv for rdv in rendez_vous if rdv["user_id"] == user_id]

        if not mes_rdv:
            dispatcher.utter_message(text="📭 Vous n’avez aucun rendez-vous enregistré.")
        else:
            rdv_text = "\n".join([f"- {rdv['date']} à {rdv['heure']}" for rdv in mes_rdv])
            dispatcher.utter_message(text=f"📅 Voici vos rendez-vous enregistrés :\n{rdv_text}")

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



