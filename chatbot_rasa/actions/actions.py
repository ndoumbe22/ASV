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
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


class ActionRepondreMaladie(Action):
    def name(self) -> Text:
        return "action_repondre_maladie"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        maladie_slot = tracker.get_slot("maladie")
        user_text = tracker.latest_message.get('text', '').lower()

        maladie = None
        if maladie_slot:
            maladie = maladie_slot.lower()
        else:
            if "paludisme" in user_text:
                maladie = "paludisme"
            elif "grippe" in user_text:
                maladie = "grippe"
            elif "diabete" in user_text or "diabète" in user_text:
                maladie = "diabete"
            elif "covid" in user_text:
                maladie = "covid"
            elif "tuberculose" in user_text:
                maladie = "tuberculose"

        if maladie == "paludisme":
            dispatcher.utter_message(response="utter_symptome_paludisme")
        elif maladie == "grippe":
            dispatcher.utter_message(response="utter_symptome_grippe")
        elif maladie == "diabete":
            dispatcher.utter_message(response="utter_symptome_diabete")
        elif maladie == "covid":
            dispatcher.utter_message(response="utter_symptome_covid")
        elif maladie == "tuberculose":
            dispatcher.utter_message(response="utter_symptome_tuberculose")
        elif maladie is None:
            dispatcher.utter_message(response="utter_symptome_generique")
        else:
            dispatcher.utter_message(response="utter_symptome_autre")

        return []
    
class ActionRepondreSymptome(Action):

    def name(self) -> Text:
        return "action_repondre_symptome"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        maladie = tracker.get_slot("maladie")

        if maladie:
            if maladie.lower() == "grippe":
                dispatcher.utter_message(text="Les symptômes de la grippe incluent : fièvre, toux, maux de tête, fatigue, courbatures.")
            elif maladie.lower() == "paludisme":
                dispatcher.utter_message(text="Les symptômes du paludisme incluent : fièvre élevée, frissons, sueurs, maux de tête, nausées.")
            else:
                dispatcher.utter_message(text=f"Je n'ai pas encore d'information sur la maladie {maladie}.")
        else:
            dispatcher.utter_message(text="Pouvez-vous préciser la maladie ?")

        return []
    

class ActionPrendreRendezVous(Action):
    def name(self) -> Text:
        return "action_prendre_rendez_vous"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        date = tracker.get_slot("date")
        heure = tracker.get_slot("heure")
        user_id = tracker.sender_id  # Identifiant unique de l'utilisateur

        if not date or not heure:
            dispatcher.utter_message(text="Pouvez-vous préciser la date et l’heure du rendez-vous ?")
            return []

        # Lecture du fichier JSON
        try:
            with open("rendez_vous.json", "r", encoding="utf-8") as f:
                rendez_vous = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
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
        with open("rendez_vous.json", "w", encoding="utf-8") as f:
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



