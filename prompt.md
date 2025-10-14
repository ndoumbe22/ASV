📝 PROMPTS PAR FONCTIONNALITÉ
PATIENT - Gérer les Rendez-vous

1. Prendre Rendez-vous
   Implémente la prise de rendez-vous patient dans AssitoSanté.

BACKEND:

- Endpoint: POST /api/rendezvous/create/
- Modèle: RendezVous (patient, medecin, date, heure, motif)
- Permission: IsPatient
- Validation: date future, médecin disponible, pas de doublon

FRONTEND:

- Interface: interface_patient/components/RendezVous/PrendreRendezVous.jsx
- Formulaire avec:
  - Sélection médecin (filtre par spécialité)
  - Calendrier date/heure
  - Champ motif consultation
  - Bouton confirmer
- Affiche disponibilités du médecin en temps réel
- Notification succès après création

WORKFLOW:

1. Patient sélectionne spécialité médicale
2. Liste médecins disponibles s'affiche
3. Patient choisit médecin et voit son calendrier
4. Patient sélectionne créneau disponible
5. Patient entre motif consultation
6. Confirmation et notification

INTÉGRATION:

- Appel API avec axios et token JWT
- Gestion erreurs (médecin non disponible, créneau déjà pris)
- Redirection vers liste rendez-vous après succès

2. Suivre les Rendez-vous
   Implémente le suivi des rendez-vous patient dans AssitoSanté.

BACKEND:

- Endpoint: GET /api/rendezvous/patient/list/
- Retourne rendez-vous du patient connecté
- Filtres: status (en_attente, confirme, annule, termine)
- Tri par date décroissante

FRONTEND:

- Interface: interface_patient/components/RendezVous/MesRendezVous.jsx
- Affichage en cards/tableau avec:
  - Photo et nom médecin
  - Date et heure
  - Statut (badge coloré)
  - Actions (annuler, reporter, valider)
- Onglets: À venir / Passés / Annulés
- Filtre par date et médecin

FEATURES:

- Compteur de rendez-vous par statut
- Badge notification pour rendez-vous proches (24h)
- Bouton "Rejoindre téléconsultation" si applicable
- Télécharger ordonnance si disponible

DESIGN:

- Cards responsive Bootstrap/Tailwind
- Couleurs: vert (confirmé), jaune (en attente), rouge (annulé), gris (terminé)

3. Reporter un Rendez-vous
   Implémente le report de rendez-vous patient dans AssitoSanté.

BACKEND:

- Endpoint: PUT /api/rendezvous/{id}/reporter/
- Permission: IsOwnerRendezVous
- Validation: nouvelle date future, disponibilité médecin
- Change statut à "reporte_en_attente"
- Notification au médecin

FRONTEND:

- Interface: interface_patient/components/RendezVous/ReporterRendezVous.jsx
- Modal avec:
  - Affichage rendez-vous actuel
  - Calendrier nouvelles dates disponibles
  - Champ raison du report
  - Boutons Annuler/Confirmer
- Message avertissement: "En attente validation médecin"

WORKFLOW:

1. Patient clique "Reporter" sur un rendez-vous
2. Modal s'ouvre avec calendrier
3. Patient sélectionne nouvelle date
4. Patient entre raison (optionnel)
5. Système vérifie disponibilité
6. Rendez-vous passe en "reporte_en_attente"
7. Médecin reçoit notification

RÈGLES:

- Minimum 24h avant rendez-vous actuel
- Maximum 2 reports par rendez-vous

4. Annuler un Rendez-vous
   Implémente l'annulation de rendez-vous patient dans AssitoSanté.

BACKEND:

- Endpoint: PUT /api/rendezvous/{id}/annuler/
- Permission: IsOwnerRendezVous
- Change statut à "annule"
- Sauvegarde raison annulation
- Notification au médecin
- Libère le créneau

FRONTEND:

- Interface: interface_patient/components/RendezVous/AnnulerRendezVous.jsx
- Modal confirmation avec:
  - Message avertissement
  - Champ raison annulation (requis)
  - Checkbox "Je comprends les conséquences"
  - Boutons Retour/Confirmer annulation

SÉCURITÉ:

- Confirmation double (modal + bouton)
- Message si < 24h: "Frais d'annulation peuvent s'appliquer"
- Log de l'annulation avec timestamp

NOTIFICATION:

- Email/SMS médecin
- Message dans système de messagerie interne

5. Valider un Rendez-vous Terminé
   Implémente la validation de rendez-vous terminé patient dans AssitoSanté.

BACKEND:

- Endpoint: POST /api/rendezvous/{id}/valider/
- Permission: IsOwnerRendezVous
- Validation: statut = "termine"
- Optionnel: note et commentaire patient
- Crée/met à jour avis médecin

FRONTEND:

- Interface: interface_patient/components/RendezVous/ValiderRendezVous.jsx
- Formulaire avec:
  - Résumé rendez-vous
  - Note étoiles (1-5)
  - Commentaire sur consultation
  - Bouton "Valider et noter"
- Affiche ordonnance si disponible
- Option télécharger documents consultation

AFTER VALIDATION:

- Badge "Validé" sur rendez-vous
- Avis visible sur profil médecin
- Option prendre nouveau rendez-vous

PATIENT - Localisation Centres de Santé
Implémente la visualisation des centres de santé avec géolocalisation dans AssitoSanté.

BACKEND:

- Endpoint: GET /api/centres-sante/list/
- Endpoint: GET /api/centres-sante/nearby/?lat={lat}&lng={lng}&radius={km}
- Modèle: CentreSante (nom, adresse, type, latitude, longitude, telephone)
- Retourne: liste centres avec distance calculée

FRONTEND:

- Interface: interface_patient/components/CentresSante/LocaliserCentres.jsx
- Intégration carte (Leaflet ou Google Maps):
  - Markers pour chaque centre
  - Popup avec infos centre (nom, adresse, distance, téléphone)
  - Bouton "Obtenir itinéraire"
- Panneau latéral liste centres
- Filtre par type (hôpital, clinique, pharmacie)
- Géolocalisation automatique utilisateur

FEATURES:

- Bouton "Localiser ma position"
- Calcul distance depuis position user
- Tri par proximité
- Icônes différentes par type centre
- Click marker → zoom + highlight liste

LIBRAIRIES:

- react-leaflet ou @react-google-maps/api
- axios pour API calls
- navigator.geolocation pour position user

DESIGN:

- Split screen: carte 60% / liste 40%
- Responsive: stack vertical sur mobile

PATIENT - Dossier Médical
Implémente l'envoi de dossier médical patient dans AssitoSanté.

BACKEND:

- Endpoint: POST /api/dossiers-medicaux/upload/
- Endpoint: GET /api/dossiers-medicaux/patient/{id}/
- Modèle: DossierMedical (patient, titre, fichier, date_upload, partage_avec)
- Permission: IsPatient
- Validation: types fichiers (PDF, JPG, PNG), max 10MB
- Storage: AWS S3 ou local media folder

FRONTEND:

- Interface: interface_patient/components/DossierMedical/EnvoyerDossier.jsx
- Formulaire upload:
  - Drag & drop zone
  - Input file multiple
  - Preview fichiers
  - Titre/description document
  - Sélection médecin destinataire
  - Bouton "Envoyer"
- Liste dossiers envoyés avec:
  - Nom fichier
  - Date envoi
  - Partagé avec (médecin)
  - Actions (télécharger, supprimer)

SÉCURITÉ:

- Validation MIME type côté backend
- Scan antivirus si possible
- URL signée temporaire pour téléchargement
- Encryption fichiers sensibles

NOTIFICATIONS:

- Email médecin quand dossier partagé
- Confirmation upload pour patient

PATIENT - Chatbot
Implémente l'intégration chatbot Rasa pour patients dans AssitoSanté.

BACKEND:

- Endpoint: POST /api/chatbot/message/
- Intégration Rasa webhook
- Sauvegarde historique conversations
- Endpoint: GET /api/chatbot/history/ (dernières conversations)

FRONTEND:

- Interface: interface_patient/components/Chatbot/ChatbotWidget.jsx
- Widget chat flottant (coin bas droit):
  - Toggle ouvrir/fermer
  - Zone messages scrollable
  - Input message avec Enter to send
  - Bouton "Urgence" redirect SOS
- Design:
  - Bulles messages (patient: bleu droite, bot: gris gauche)
  - Avatar bot
  - Typing indicator quand bot répond
  - Historique conversations

FEATURES:

- Quick replies (boutons réponses rapides)
- Suggestions questions fréquentes
- Détection urgence → propose SOS
- Support emojis et formatage texte
- Badge notification non lu

INTÉGRATION RASA:

- Appel API Rasa après chaque message patient
- Parse réponse bot et affiche
- Gestion intents (symptomes, rendez-vous, médicaments)
- Fallback: "Je ne comprends pas, voulez-vous parler à un humain?"

PERSISTANCE:

- Sauvegarde conversation en DB
- Restaure historique au rechargement

PATIENT - Rappels Rendez-vous
Implémente le système de rappels rendez-vous automatiques dans AssitoSanté.

BACKEND:

- Tâche Celery: check_upcoming_appointments (s'exécute chaque heure)
- Endpoint: GET /api/rendezvous/rappels/
- Logique: envoie rappel 24h avant rendez-vous
- Notifications: Email + SMS + Push
- Modèle: RappelRendezVous (rendezvous, date_envoi, type, envoye)

FRONTEND:

- Interface: interface_patient/components/Parametres/GererRappels.jsx
- Paramètres rappels:
  - Toggle activer/désactiver rappels
  - Choix canaux (Email, SMS, Push notification)
  - Choix timing (24h, 2h, 30min avant)
  - Historique rappels envoyés
- Notification in-app temps réel:
  - Badge sur icône cloche
  - Liste rappels dans dropdown
  - Click → redirect rendez-vous

CELERY TASK (Backend):

````python
@shared_task
def send_appointment_reminders():
    tomorrow = timezone.now() + timedelta(hours=24)
    appointments = RendezVous.objects.filter(
        date_heure__range=[tomorrow - timedelta(hours=1), tomorrow],
        statut='confirme',
        rappel_envoye=False
    )
    for rdv in appointments:
        send_email_reminder(rdv)
        send_sms_reminder(rdv)
        rdv.rappel_envoye = True
        rdv.save()
FRONTEND NOTIFICATION:

WebSocket connection pour notifications temps réel
Toast notification apparaît
Son notification (optionnel)


---

### **PATIENT - Rappels Médicaments**
Implémente le système de rappels de prise de médicaments dans AssitoSanté.
BACKEND:

Endpoint: POST /api/medicaments/rappels/create/
Endpoint: GET /api/medicaments/rappels/list/
Endpoint: PUT /api/medicaments/rappels/{id}/marquer-pris/
Modèle: RappelMedicament (patient, nom_medicament, dosage, frequence, heures, date_debut, date_fin, actif)
Tâche Celery: check_medication_reminders (chaque 15min)

FRONTEND:

Interface: interface_patient/components/Medicaments/GererRappels.jsx
Formulaire création rappel:

Nom médicament (autocomplete si ordonnance existe)
Dosage
Fréquence (quotidien, 2x/jour, 3x/jour, personnalisé)
Heures de prise (time pickers)
Durée traitement (date début/fin)
Instructions spéciales


Liste rappels actifs:

Card par médicament
Prochaine prise affichée
Historique prises (calendrier)
Toggle activer/désactiver
Bouton modifier/supprimer



NOTIFICATIONS:

Push notification à l'heure exacte
Son + vibration
Action "Pris" ou "Reporter 30min"
Si non marqué pris: relance après 15min

TRACKING:

Statistiques observance (% prises à l'heure)
Graphique historique prises
Alerte si oublis fréquents

WIDGET DASHBOARD:

Card "Médicaments aujourd'hui"
Liste prochaines prises avec countdown
Bouton rapide "Marquer comme pris"


---

### **MÉDECIN - Rédiger Articles Santé**
Implémente la rédaction d'articles de santé par médecins dans AssitoSanté.
BACKEND:

Endpoint: POST /api/articles/create/
Endpoint: GET /api/articles/medecin/list/
Endpoint: PUT /api/articles/{id}/update/
Endpoint: DELETE /api/articles/{id}/delete/
Modèle: Article (titre, contenu, auteur, categorie, statut, date_publication, image_couverture)
Permission: IsMedecin
Statuts: brouillon, en_attente_validation, publie, rejete

FRONTEND:

Interface: interface_medecin/components/Articles/ReDigerArticle.jsx
Éditeur riche (React Quill ou TinyMCE):

Formatage texte (gras, italique, listes)
Insertion images
Insertion liens
Headings H2, H3


Formulaire:

Titre article (max 150 caractères)
Catégorie (dropdown: Cardiologie, Pédiatrie, etc.)
Image couverture (upload)
Contenu (éditeur riche)
Tags (multi-select)
Boutons: "Sauvegarder brouillon", "Soumettre validation"



FEATURES:

Auto-save brouillon (chaque 30s)
Preview article avant soumission
Compteur mots
SEO: meta description, slug URL
Liste articles avec filtres (statut, date, catégorie)
Actions: Éditer, Dupliquer, Supprimer

WORKFLOW:

Médecin écrit article
Sauvegarde brouillon (visible que par lui)
Soumet pour validation (statut → en_attente_validation)
Admin valide/rejette
Si validé → statut publie, visible patients
Notification médecin du résultat

DESIGN:

Interface clean type Medium/Substack
Preview mode split screen


---

### **MÉDECIN - Gérer Rendez-vous**
Implémente la gestion des rendez-vous pour médecins dans AssitoSanté.
BACKEND:

Endpoint: GET /api/rendezvous/medecin/list/
Endpoint: PUT /api/rendezvous/{id}/confirmer/
Endpoint: PUT /api/rendezvous/{id}/refuser/
Endpoint: PUT /api/rendezvous/{id}/terminer/
Permission: IsMedecin
Filtres: statut, date, patient

FRONTEND:

Interface: interface_medecin/components/RendezVous/GererRendezVous.jsx
Vue calendrier (react-big-calendar):

Affichage rendez-vous par jour/semaine/mois
Code couleur par statut
Click rendez-vous → modal détails


Onglets:

En attente validation (badge compteur)
Confirmés aujourd'hui
À venir
Historique



CARD RENDEZ-VOUS:

Photo + nom patient
Date/heure
Motif consultation
Statut
Actions selon statut:

En attente: Confirmer / Refuser
Confirmé: Commencer consultation / Annuler
Terminé: Voir compte-rendu



MODAL DÉTAILS:

Infos patient (âge, allergies, antécédents)
Historique consultations avec ce patient
Dossiers médicaux partagés
Zone notes médecin
Boutons: Confirmer/Refuser, Télécharger dossier

DISPONIBILITÉS:

Section "Mes disponibilités"
Calendrier configurer heures travail
Gestion absences/congés
Créneaux personnalisés (15min, 30min, 1h)

NOTIFICATIONS:

Badge nouveau rendez-vous demandé
Son notification en temps réel


---

### **ADMIN - Gérer Comptes Utilisateurs**
Implémente la gestion complète des comptes utilisateurs par admin dans AssitoSanté.
BACKEND:

Endpoints existants:

GET /api/admin/users/
POST /api/admin/users/create/
PUT /api/admin/users/{id}/
PUT /api/admin/users/{id}/toggle-status/
DELETE /api/admin/users/{id}/delete/


Permission: IsAdmin
Filtres: rôle, statut (actif/inactif), date inscription

FRONTEND:

Interface: interface_admin/components/Utilisateurs/GererUtilisateurs.jsx
Tableau utilisateurs (React Table ou DataGrid):

Colonnes: ID, Nom, Email, Rôle, Téléphone, Statut, Date inscription, Actions
Tri sur toutes colonnes
Recherche globale
Filtres: Rôle (tous/patient/médecin/admin), Statut (actif/inactif)
Pagination (50 par page)


Actions par ligne:

Icône œil: Voir détails
Icône crayon: Modifier
Toggle switch: Activer/Désactiver
Icône poubelle: Supprimer



MODAL CRÉER UTILISATEUR:

Formulaire:

Prénom, Nom
Email (unique)
Téléphone
Adresse
Rôle (select)
Si Médecin: Spécialité, Disponibilité
Mot de passe temporaire (auto-généré)
Checkbox "Envoyer email bienvenue"


Validation:

Email format valide
Téléphone format Sénégal
Champs requis



MODAL MODIFIER UTILISATEUR:

Même formulaire création
Champs pré-remplis
Option "Réinitialiser mot de passe"
Historique modifications

FEATURES:

Export liste utilisateurs (CSV, Excel)
Statistiques: Total users, Par rôle, Actifs/Inactifs, Nouveaux ce mois
Graphique évolution inscriptions
Logs actions admin (qui a modifié quoi quand)

SÉCURITÉ:

Confirmation suppression (modal double confirm)
Impossible supprimer son propre compte
Log toutes actions admin


---

### **ADMIN - Paramétrer Chatbot**
Implémente la configuration du chatbot Rasa par admin dans AssitoSanté.
BACKEND:

Endpoint: GET /api/admin/chatbot/config/
Endpoint: PUT /api/admin/chatbot/config/update/
Endpoint: POST /api/admin/chatbot/train/
Endpoint: GET /api/admin/chatbot/conversations/
Modèle: ChatbotConfig (message_bienvenue, fallback_message, seuil_confiance, actif)

FRONTEND:

Interface: interface_admin/components/Chatbot/ParametrerChatbot.jsx
Section Configuration Générale:

Toggle activer/désactiver chatbot
Textarea message bienvenue
Textarea message fallback (incompréhension)
Slider seuil confiance (0-100%)
Select langue (français)


Section Intents & Responses:

Liste intents Rasa
Pour chaque intent: éditer réponses
Ajouter exemples phrases déclencheurs
Bouton "Entraîner modèle"


Section Questions Fréquentes:

Liste FAQ
Ajouter/Modifier/Supprimer FAQ
Question + Réponse + Tags


Section Monitoring:

Tableau conversations récentes
Statistiques: Nb conversations, Intent le plus utilisé, Taux incompréhension
Graphique usage dans le temps
Filtrer conversations par date/intent



ENTRAÎNEMENT:

Bouton "Réentraîner modèle Rasa"
Modal avec barre progression
Message succès/erreur
Log historique entraînements

FEATURES:

Test chatbot en live (widget intégré)
Export conversations pour analyse
Détection patterns erreurs fréquentes
Suggestions amélioration automatiques

INTÉGRATION RASA:

Appel API Rasa Admin pour update config
Trigger réentraînement via endpoint Rasa


---

### **ADMIN - Gérer Articles**
Implémente la modération des articles de santé par admin dans AssitoSanté.
BACKEND:

Endpoint: GET /api/admin/articles/list/
Endpoint: PUT /api/admin/articles/{id}/valider/
Endpoint: PUT /api/admin/articles/{id}/rejeter/
Endpoint: PUT /api/admin/articles/{id}/desactiver/
Endpoint: DELETE /api/admin/articles/{id}/
Permission: IsAdmin
Filtres: statut, auteur, catégorie, date

FRONTEND:

Interface: interface_admin/components/Articles/ModererArticles.jsx
Onglets:

En attente validation (badge compteur)
Publiés
Rejetés
Désactivés


Card par article:

Image couverture
Titre
Auteur (nom médecin)
Catégorie
Date soumission
Statut (badge coloré)
Actions: Voir, Valider, Rejeter, Désactiver, Supprimer



MODAL VALIDATION:

Preview article complet
Checklist qualité:

Informations médicales exactes
Sources citées
Pas de promotion commerciale
Langue correcte
Images appropriées


Textarea commentaires admin (optionnel)
Boutons: Valider / Rejeter / Modifier puis valider

WORKFLOW:

Médecin soumet article (statut: en_attente_validation)
Admin reçoit notification
Admin review article
Admin valide → statut publie, visible patients, notification médecin
Admin rejette → statut rejete, commentaire raison, notification médecin
Médecin peut ré-éditer et resoumettre

FEATURES:

Recherche articles (titre, contenu, auteur)
Filtres multiples (catégorie + statut + date)
Statistiques: Total articles, En attente, Publiés ce mois
Export liste articles
Historique modifications avec author tracking

DÉSACTIVATION:

Toggle rapide actif/inactif
Article désactivé non visible patients mais pas supprimé
Raison désactivation (dropdown)


---

### **ADMIN - Gérer Rendez-vous Globaux**
Implémente la gestion administrative de tous les rendez-vous dans AssitoSanté.
BACKEND:

Endpoint: GET /api/admin/rendezvous/list/
Endpoint: PUT /api/admin/rendezvous/{id}/valider/
Endpoint: PUT /api/admin/rendezvous/{id}/annuler/
Endpoint: PUT /api/admin/rendezvous/{id}/reporter/
Endpoint: GET /api/admin/rendezvous/stats/
Permission: IsAdmin
Filtres avancés: patient, médecin, statut, date range, centre santé

FRONTEND:

Interface: interface_admin/components/RendezVous/GererRendezVousGlobal.jsx
Dashboard statistiques:

Total rendez-vous ce mois
En attente validation
Confirmés aujourd'hui
Taux annulation
Graphique évolution rendez-vous


Tableau rendez-vous:

Colonnes: ID, Patient, Médecin, Date/Heure, Statut, Actions
Filtres: Statut, Date range, Médecin, Patient
Recherche patient/médecin
Code couleur par statut


Actions:

Voir détails
Valider rendez-vous en attente
Annuler avec raison
Reporter (choisir nouvelle date)
Envoyer rappel manuel



MODAL DÉTAILS:

Infos complètes patient et médecin
Historique ce rendez-vous (créé, modifié, reporté...)
Motif consultation
Notes administratives
Actions admin

GESTION CONFLITS:

Détection créneaux chevauchants
Alerte si médecin double bookant
Résolution assistée

RAPPORTS:

Export rendez-vous période (Excel/PDF)
Statistiques par médecin
Taux no-show par patient
Performance système

NOTIFICATIONS ADMIN:

Alerte rendez-vous non confirmés > 48h
Alerte annulations fréquentes patient
Problèmes détectés automatiquement


---

### **VISITEUR - Créer Compte**
Implémente l'inscription des visiteurs dans AssitoSanté.
BACKEND:

Endpoint existant: POST /api/auth/register/
Validation: email unique, password strength, téléphone format Sénégal
Envoi email vérification
Création profil automatique selon rôle

FRONTEND:

Page: pages/auth/Register.jsx (hors interfaces rôles)
Formulaire inscription:

Prénom, Nom
Email (validation format)
Téléphone (format +221...)
Adresse
Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre)
Confirmer mot de passe
Checkbox "J'accepte CGU et Politique confidentialité"
Select "Je suis" (Patient / Professionnel de santé)
Si Professionnel: Champ spécialité
Bouton "S'inscrire"


Validation temps réel:

Email déjà utilisé
Mots de passe correspondent
Format téléphone
Indicateur force mot de passe


Lien "Déjà un compte ? Se connecter"

APRÈS INSCRIPTION:

Redirection page confirmation
Message "Email vérification envoyé à {email}"
Bouton "Renvoyer email" (cooldown 60s)
Explications étapes suivantes

EMAIL VÉRIFICATION:

Template email avec lien activation
Lien expire après 24h
Click lien → compte activé
Redirection login avec message succès

SÉCURITÉ:

Rate limiting inscription (5 tentatives/heure par IP)
Captcha si tentatives multiples
Password hashing bcrypt
Validation CSRF token


---

### **VISITEUR - Consulter Articles**
Implémente la consultation publique des articles de santé dans AssitoSanté.
BACKEND:

Endpoint: GET /api/articles/public/
Retourne articles avec statut "publie"
Filtres: catégorie, auteur, date, tags
Pagination: 12 articles par page
Tri: récent, populaire, alphabétique

FRONTEND:

Page: pages/public/Articles.jsx
Hero section:

Titre "Articles de Santé"
Barre recherche
Filtres: Toutes catégories / Cardiologie / Pédiatrie / etc.


Grid articles (cards 3 colonnes desktop, 1 mobile):

Image couverture
Catégorie (badge)
Titre article
Extrait (150 caractères)
Auteur (nom + photo médecin)
Date publication
Temps lecture estimé
Bouton "Lire plus"


Sidebar:

Articles populaires (top 5)
Catégories avec compteur
Tags cloud
Widget "Rejoignez AssitoSanté"



PAGE ARTICLE DÉTAIL:

Route: /articles/{slug}
Layout:

Image couverture fullwidth
Titre H1
Auteur card (photo, nom, spécialité, bouton "Prendre RDV")
Date publication + Temps lecture
Boutons partage (Facebook, Twitter, WhatsApp,


RéessayerClaude n'a pas encore la capacité d'exécuter le code qu'il génère.MContinuer  Boutons partage (Facebook, Twitter, WhatsApp, copier lien)
  * Contenu article (formaté HTML propre)
  * Tags article
  * Section "Articles similaires" (3 suggestions)
  * Zone commentaires (si connecté) ou CTA connexion
- Sticky sidebar:
  * Sommaire article (links vers H2/H3)
  * Auteur info
  * CTA "Besoin d'un avis médical ? Prendre RDV"

SEO:
- Meta tags dynamiques (title, description, image OG)
- Schema.org markup pour articles médicaux
- URL slug propre (titre-article-123)

DESIGN:
- Typographie lisible (18px, line-height 1.7)
- Images responsive lazy loading
- Dark mode support
- Print-friendly CSS

VISITEUR - Localiser Services Santé
Implémente la carte publique des services de santé dans AssitoSanté.

BACKEND:
- Endpoint: GET /api/public/centres-sante/
- Pas d'authentification requise
- Retourne tous centres santé publics
- Filtres: type (hôpital/clinique/pharmacie), région

FRONTEND:
- Page: pages/public/LocaliserServices.jsx
- Layout fullscreen carte:
  * Carte interactive (Leaflet) 100vh
  * Panneau recherche overlay (top-left):
    - Input recherche par nom/adresse
    - Filtres: Type centre, Ouvert maintenant
    - Bouton "Ma position"
  * Panneau liste résultats (left sidebar collapsible):
    - Cards centres avec distance
    - Click card → zoom carte
  * Markers carte:
    - Rouge: Hôpitaux
    - Bleu: Cliniques
    - Vert: Pharmacies
  * Popup marker:
    - Nom centre
    - Adresse
    - Téléphone (click to call)
    - Horaires
    - Bouton "Itinéraire" (ouvre Google Maps)

FEATURES:
- Géolocalisation auto avec permission user
- Calcul distance depuis position user
- Cluster markers si zoom out
- Bouton "Liste/Carte" toggle mobile
- Filtrer centres ouverts maintenant (check horaires)

DESIGN:
- UI moderne type Google Maps
- Loading skeleton pendant chargement
- Responsive mobile (carte fullscreen, liste drawer bottom)
- Icônes custom par type centre

SANS CONNEXION REQUISE:
- Visiteurs peuvent utiliser sans compte
- CTA subtle "Créer compte pour plus de fonctionnalités"

VISITEUR - Se Connecter
Implémente la connexion utilisateurs dans AssitoSanté.

BACKEND:
- Endpoint existant: POST /api/auth/login/
- Retourne JWT tokens + user data
- Validation compte actif

FRONTEND:
- Page: pages/auth/Login.jsx
- Formulaire connexion:
  * Email
  * Mot de passe (toggle show/hide)
  * Checkbox "Se souvenir de moi"
  * Bouton "Se connecter"
  * Lien "Mot de passe oublié ?"
  * Lien "Pas de compte ? S'inscrire"
- Validation:
  * Format email
  * Champs requis
  * Messages erreur clairs (Email/MDP incorrect, Compte désactivé)

APRÈS CONNEXION:
- Sauvegarde tokens (localStorage ou sessionStorage selon "Se souvenir")
- Sauvegarde user data Redux/Context
- Redirection selon rôle:
  * Patient → /patient/dashboard
  * Medecin → /medecin/dashboard
  * Admin → /admin/dashboard
- Notification toast "Bienvenue {prenom} !"

SÉCURITÉ:
- Rate limiting (5 tentatives/15min)
- Captcha après 3 échecs
- Account lockout après 5 échecs (30min)
- Log tentatives connexion suspectes

MOT DE PASSE OUBLIÉ:
- Modal/Page dédiée
- Input email
- Endpoint: POST /api/auth/password-reset/
- Email avec lien reset (expire 1h)
- Page nouveau mot de passe avec token validation

DESIGN:
- Split screen: Form 50% / Illustration santé 50%
- Responsive: stack vertical mobile
- Logo AssitoSanté
- Couleurs brand

🎯 PROMPTS OPTIMISATION & INTÉGRATION
Intégration JWT dans Toutes Requêtes
Configure l'authentification JWT dans tous les appels API du frontend AssitoSanté.

AXIOS INTERCEPTOR:
- Fichier: src/utils/axiosConfig.js
- Intercepteur request ajoute token:
```javascript
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
REFRESH TOKEN AUTO:

Intercepteur response détecte 401
Tente refresh avec refresh_token
Si succès: retry request original
Si échec: logout + redirect login

TOKEN EXPIRATION:

Vérifie expiration avant chaque request
Auto-refresh si < 5min restantes
Logout si refresh_token expiré

IMPLÉMENTATION:

Import axiosConfig dans tous composants
Utilise instance axios configurée
Gestion loading states
Gestion erreurs réseau

SÉCURITÉ:

Tokens en httpOnly cookies (option alternative)
Clear tokens au logout
Pas de tokens dans URL/logs


---

### **Système Notifications Temps Réel**
Implémente les notifications push temps réel dans AssitoSanté.
BACKEND:

Install Django Channels pour WebSocket
Endpoint WS: ws://api/notifications/
Consumer notifications par user
Trigger notifications sur événements:

Nouveau rendez-vous (médecin)
RDV confirmé (patient)
Message reçu
Article validé (médecin)
Rappel médicament



FRONTEND:

Hook: useNotifications.js
Connexion WebSocket au mount
Écoute messages WS
Parse et affiche notifications:

Toast notification (react-toastify)
Badge compteur non lues
Son notification (optionnel)
Dropdown liste notifications



COMPOSANT NOTIFICATION CENTER:

Interface: components/shared/NotificationCenter.jsx
Icône cloche avec badge compteur
Dropdown menu click:

Liste notifications (max 5 récentes)
Type + message + temps relatif ("Il y a 5min")
Click notification → action (redirect page concernée)
Bouton "Tout marquer lu"
Lien "Voir toutes"


Page toutes notifications:

Liste complète paginée
Filtres: Type, Lu/Non lu
Actions: Marquer lu, Supprimer



TYPES NOTIFICATIONS:

rendez_vous: "Dr. X a confirmé votre RDV du 15/10"
message: "Nouveau message de Dr. Y"
article: "Votre article a été publié"
rappel_medicament: "Prenez votre Doliprane"
system: "Mise à jour maintenance programmée"

PERSISTANCE:

Sauvegarde notifications en DB
Marquage lu/non lu
Suppression après 30 jours
Préférences notifications par user


---

### **Système Messagerie Sécurisée Patient-Médecin**
Implémente la messagerie sécurisée entre patients et médecins dans AssitoSanté.
BACKEND:

Modèle: Conversation (participants, sujet, date_creation)
Modèle: Message (conversation, expediteur, contenu, lu, date_envoi)
Endpoints:

GET /api/messages/conversations/
POST /api/messages/conversations/create/
GET /api/messages/conversations/{id}/messages/
POST /api/messages/send/
PUT /api/messages/{id}/mark-read/


Permission: Participant de la conversation seulement
Encryption messages sensibles

FRONTEND PATIENT:

Interface: interface_patient/components/Messages/Messagerie.jsx
Layout inbox:

Sidebar conversations (liste contacts médecins)

Photo + nom médecin
Dernier message aperçu
Badge non lus
Heure dernier message


Zone messages (main area)

Header: Photo + nom médecin + bouton options
Messages scrollables (bulles)
Input message + bouton envoyer
Bouton joindre fichier (documents médicaux)


Bouton "Nouveau message" ouvre modal:

Sélection médecin
Sujet
Premier message





FRONTEND MÉDECIN:

Interface: interface_medecin/components/Messages/Messagerie.jsx
Même layout avec:

Liste conversations patients
Filtre: Non lus / Tous
Recherche patient
Badge urgent si marqué priorité



FEATURES:

Typing indicator ("Dr. X est en train d'écrire...")
Statut message: Envoyé, Délivré, Lu (double check)
Upload fichiers (PDF, images) max 5MB
Emoji picker
Recherche dans conversation
Archive conversation
Messages auto-supprimés après 90 jours (RGPD)

WEBSOCKET:

Connexion WS pour messages temps réel
Notification sonore nouveau message
Update liste conversations en live

SÉCURITÉ:

Messages encryptés end-to-end
Audit log consultations messages
Rapport abus
Block utilisateur (admin)


---

### **Dashboard Patient Complet**
Implémente le dashboard principal patient dans AssitoSanté.
FRONTEND:

Interface: interface_patient/components/Dashboard/DashboardPatient.jsx
Layout grid responsive (3 colonnes desktop, 1 mobile):

ROW 1 - STATISTIQUES:

Card "Prochains RDV" (compteur + date prochain)
Card "Messages non lus" (compteur + icon)
Card "Médicaments aujourd'hui" (compteur prises restantes)
Card "Documents" (total documents)

ROW 2 - RENDEZ-VOUS:

Section "Rendez-vous à venir":

Liste 3 prochains RDV (cards horizontal)
Photo médecin, nom, spécialité
Date/heure
Countdown jours restants
Bouton "Rejoindre" si téléconsultation
Lien "Voir tous les RDV"



ROW 3 - MÉDICAMENTS & SANTÉ:

Section "Médicaments aujourd'hui":

Liste prises médicaments (checkbox)
Heure + nom médicament
Bouton "Marquer pris"


Section "Mes constantes":

Graph ligne (Chart.js) tension/poids derniers 30j
Bouton "Ajouter mesure"



ROW 4 - QUICKLINKS:

Cards action rapide:

"Prendre RDV" → redirect booking
"Localiser centre" → redirect carte
"Mes dossiers" → redirect documents
"Contacter médecin" → redirect messages
"SOS Urgence" → gros bouton rouge



ROW 5 - ACTUALITÉS:

Section "Articles récents":

Carousel 3 articles santé
Image + titre + extrait
Click → ouvre article



HEADER DASHBOARD:

Message "Bonjour {prenom}, comment allez-vous ?"
Date jour
Météo (optionnel)
Bouton "Profil" (dropdown: Mon profil, Paramètres, Déconnexion)

WIDGETS INTERACTIFS:

Tous cliquables redirect pages détail
Loading skeletons
Empty states ("Aucun RDV à venir")
Refresh automatique chaque 5min

DESIGN:

Cards avec ombres légères
Couleurs: bleu primaire santé
Icons Lucide React
Animations subtiles hover


---

### **Dashboard Médecin Complet**
Implémente le dashboard principal médecin dans AssitoSanté.
FRONTEND:

Interface: interface_medecin/components/Dashboard/DashboardMedecin.jsx
Layout grid responsive:

ROW 1 - STATISTIQUES PRATIQUE:

Card "Patients total" (compteur)
Card "RDV aujourd'hui" (compteur + liste)
Card "RDV en attente" (compteur + badge alerte si >5)
Card "Messages non lus" (compteur)

ROW 2 - AGENDA JOURNÉE:

Section "Planning aujourd'hui":

Timeline verticale heure par heure (8h-18h)
RDV placés sur timeline avec:

Photo patient
Nom patient
Motif consultation
Bouton "Commencer consultation"


Créneaux libres en gris
Ligne rouge "Heure actuelle"
Scroll vers heure actuelle au chargement



ROW 3 - PATIENTS À VOIR:

Section "Patients aujourd'hui":

Liste cards patients avec RDV jour:

Photo + nom patient
Heure RDV
Badge "Urgent" si prioritaire
Bouton "Voir dossier"
Bouton "Commencer consultation"


Ordre chronologique



ROW 4 - DEMANDES EN ATTENTE:

Section "Demandes de RDV" (si >0):

Liste RDV en attente validation
Patient, date demandée, motif
Boutons rapides "Confirmer / Refuser"
Lien "Voir toutes les demandes"



ROW 5 - ACTIVITÉ:

Section "Mes articles":

Liste 3 derniers articles
Statut (publié/en attente/rejeté)
Bouton "Rédiger nouvel article"


Section "Statistiques":

Graph consultations 30 derniers jours
Taux présence patients (%)
Note moyenne reçue



QUICKLINKS:

Boutons action:

"Gérer disponibilités"
"Voir tous RDV"
"Mes patients"
"Messages"



NOTIFICATIONS IMPORTANTES:

Alerte top si:

RDV dans 15min
Patient en attente (salle virtuelle)
Message urgent patient



DESIGN:

Thème professionnel bleu/blanc
Priorisation visuelle (urgent = rouge)
Accessible WCAG AA


---

### **Dashboard Admin Complet**
Implémente le dashboard principal administrateur dans AssitoSanté.
FRONTEND:

Interface: interface_admin/components/Dashboard/DashboardAdmin.jsx
Layout grid responsive:

ROW 1 - KPI SYSTÈME:

Card "Total Utilisateurs" (compteur + variation % mois)
Card "Patients" (compteur + graphique sparkline)
Card "Médecins" (compteur + graphique sparkline)
Card "RDV ce mois" (compteur + comparaison mois précédent)

ROW 2 - ACTIVITÉ TEMPS RÉEL:

Section "Activité récente":

Feed temps réel dernières actions:

"Patient X s'est inscrit" (timestamp)
"Dr. Y a publié un article" (timestamp)
"RDV confirmé entre A et B" (timestamp)


Auto-update chaque 10s
Max 10 items, scroll
Icônes par type action



ROW 3 - MODÉRATION:

Card "Articles en attente":

Compteur + badge rouge si >0
Liste 3 premiers articles
Bouton "Modérer"


Card "Comptes à valider":

Si validation médecins manuelle
Compteur + liste
Bouton "Valider/Rejeter"



ROW 4 - STATISTIQUES PLATEFORME:

Graph "Inscriptions 12 derniers mois" (Chart.js line)
Graph "RDV par statut" (Chart.js doughnut)
Graph "Utilisation chatbot" (Chart.js bar)

ROW 5 - SANTÉ SYSTÈME:

Card "Performance":

Temps réponse API moyen
Uptime %
Erreurs 24h


Card "Stockage":

Espace utilisé / total
Barre progression
Documents uploadés ce mois



ROW 6 - QUICKLINKS ADMIN:

Boutons gestion:

"Gérer utilisateurs"
"Modérer articles"
"Voir tous RDV"
"Config chatbot"
"Logs système"
"Backups"



ALERTES SYSTÈME:

Banner top si:

Erreurs critiques détectées
Backup échoué
Espace disque <10%
Pic activité inhabituel



EXPORT DONNÉES:

Bouton "Générer rapport" ouvre modal:

Sélection période
Sélection métriques
Format (PDF/Excel)
Génération asynchrone
Email quand prêt



DESIGN:

Thème sombre optionnel
Data visualizations claires
Tooltips explicatifs
Responsive tablette/desktop (pas mobile pour admin)


---

### **Gestion Profil Utilisateur (Tous Rôles)**
Implémente la gestion de profil pour tous types d'utilisateurs dans AssitoSanté.
BACKEND:

Endpoints:

GET /api/users/me/ (profil user connecté)
PUT /api/users/me/update/ (modifier profil)
PUT /api/users/me/change-password/
POST /api/users/me/upload-photo/
DELETE /api/users/me/delete-account/



FRONTEND COMMUN (tous rôles):

Interface: components/shared/Profil/MonProfil.jsx
Onglets:

ONGLET INFORMATIONS PERSONNELLES:

Photo profil (upload, crop, remove)
Formulaire:

Prénom, Nom (disabled si validé)
Email (disabled, lien "Changer email" → vérification)
Téléphone
Adresse
Date naissance
Genre (si patient)


Bouton "Sauvegarder modifications"

ONGLET SÉCURITÉ:

Section "Mot de passe":

Input ancien mot de passe
Input nouveau mot de passe
Input confirmer mot de passe
Indicateur force mot de passe
Bouton "Changer mot de passe"


Section "Authentification 2FA" (optionnel):

Toggle activer 2FA
QR code setup


Section "Sessions actives":

Liste appareils connectés
Bouton "Déconnecter partout"



ONGLET PRÉFÉRENCES:

Langue interface (français/anglais/wolof)
Thème (clair/sombre/auto)
Notifications:

Toggle email notifications
Toggle SMS notifications
Toggle push notifications
Granularité (RDV, messages, articles, rappels)


Fuseau horaire

ONGLET CONFIDENTIALITÉ (Patient):

Qui peut voir mon profil (médecins/tous/personne)
Partage automatique dossier médical avec nouveaux médecins
Historique accès à mon dossier
Télécharger mes données (RGPD)
Supprimer mon compte

ONGLET PROFESSIONNEL (Médecin only):

Numéro ordre médecins
Spécialités (multi-select)
Établissements rattachés
Tarifs consultation
Upload diplômes/certifications
Biographie publique
Langues parlées

ONGLET QR CODE (Patient):

QR code unique patient
Contient: ID patient, nom, groupe sanguin, allergies
Bouton "Télécharger QR"
Bouton "Imprimer"
Usage: scan rapide urgences

VALIDATION:

Tous champs validés côté client
Confirmation modifications importantes
Toast succès/erreur
Audit log modifications profil

SÉCURITÉ:

Re-demande mot de passe pour changements sensibles
Email confirmation changement email
Log toutes modifications


---

### **Système Upload Fichiers Sécurisé**
Implémente l'upload sécurisé de fichiers médicaux dans AssitoSanté.
BACKEND:

Endpoint: POST /api/documents/upload/
Validation:

Types autorisés: PDF, JPG, PNG, DICOM
Taille max: 10MB
Scan antivirus (ClamAV)
Vérification MIME type réel


Storage:

AWS S3 ou local media/
Organisation: /documents/{user_id}/{year}/{month}/{filename}
Nom fichier: UUID + extension


Modèle Document:

user, titre, fichier, type, taille, date_upload, partage_avec



FRONTEND COMPOSANT:

Component: components/shared/FileUpload/SecureUpload.jsx
Props: allowedTypes, maxSize, multiple, onUploadComplete

FEATURES:

Drag & drop zone:

Visual feedback drag over
Message "Glissez fichiers ici ou cliquez"
Icône upload


Input file hidden (trigger par zone)
Preview fichiers avant upload:

Thumbnail si image
Icône + nom si PDF/autre
Taille fichier affichée
Bouton supprimer


Upload multiple simultané:

Barre progression par fichier
% progression
Vitesse upload
Bouton annuler upload


Validation côté client:

Vérif extension
Vérif taille
Messages erreur clairs



APRÈS UPLOAD:

Callback onUploadComplete avec file data
Toast succès avec nom fichier
Preview généré automatiquement
Metadata extrait (dimensions, date, etc.)

DOWNLOAD SÉCURISÉ:

URL signées temporaires (expire 1h)
Endpoint: GET /api/documents/{id}/download/
Permission: Owner ou médecin autorisé
Log téléchargements

INTÉGRATION:

Utilisé dans: Dossiers médicaux, Articles, Messages
Props configurables selon contexte
Styling cohérent plateforme

SÉCURITÉ:

Validation MIME type backend
Scan malware
Pas d'exécution fichiers uploadés
Stockage hors webroot
Access control strict


---

### **Système Recherche Globale**
Implémente la recherche globale dans l'interface AssitoSanté.
BACKEND:

Endpoint: GET /api/search/?q={query}&type={type}&page={page}
Recherche dans:

Patients (nom, email) - admin/médecin only
Médecins (nom, spécialité)
Articles (titre, contenu)
RDV (patient, médecin, date)


Filtres: type entité, date range
Pagination: 20 résultats par page
ElasticSearch ou PostgreSQL full-text search

FRONTEND:

Composant: components/shared/Search/GlobalSearch.jsx
Position: Header navbar (toutes interfaces)

FEATURES:

Input recherche avec icône loupe
Recherche déclenchée après 3 caractères
Debounce 300ms
Loading spinner pendant recherche
Dropdown résultats (max 5 par type):

Section "Médecins" (si trouvés)

Photo + nom + spécialité
Bouton "Voir profil"


Section "Articles"

Titre + extrait surligné
Date publication


Section "Patients" (admin/médecin)

Nom + date naissance


Section "Rendez-vous"

Patient + Médecin + Date




Lien "Voir tous les résultats" (si >5 par type)
Empty state si aucun résultat
Raccourci clavier: Ctrl+K ouvre recherche

PAGE RÉSULTATS COMPLETS:

Route: /search?q={query}
Onglets par type entité
Filtres avancés sidebar
Pagination
Export résultats (CSV)

HIGHLIGHTS:

Termes recherchés surlignés jaune
Pertinence score (tri)
Recherche floue (typo tolerance)

HISTORIQUE:

Sauvegarde dernières 10 recherches user
Suggestions rapides
Clear historique

SÉCURITÉ:

Résultats filtrés selon permissions user
Pas d'accès données non autorisées
Rate limiting recherches


---

## 🔧 PROMPTS TECHNIQUES SPÉCIFIQUES

### **Configuration Tailwind CSS Personnalisée**
Configure Tailwind CSS pour AssitoSanté avec thème santé personnalisé.
FICHIER: tailwind.config.js
Ajoute au theme.extend:
javascriptcolors: {
  primary: {
    50: '#e6f7ff',
    100: '#bae7ff',
    500: '#1890ff', // Bleu santé principal
    600: '#096dd9',
    700: '#0050b3',
  },
  success: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d',
  medical: {
    light: '#e6f7ff',
    DEFAULT: '#1890ff',
    dark: '#0050b3',
  }
},
fontFamily: {
  sans: ['Inter', 'sans-serif'],
},
boxShadow: {
  'card': '0 2px 8px rgba(0,0,0,0.1)',
  'card-hover': '0 4px 16px rgba(0,0,0,0.15)',
},
CLASSES CUSTOM:

.btn-primary: bouton bleu principal
.card: carte avec ombre
.badge: badge statut
.input-medical: input style santé

Utilise uniquement classes Tailwind core (pas JIT custom)

---

### **Gestion États Globaux React Context**
Configure React Context pour gestion état global AssitoSanté.
CONTEXTES À CRÉER:

AuthContext (src/contexts/AuthContext.jsx):

javascript- State: user, tokens, isAuthenticated, loading
- Functions: login(), logout(), refreshToken(), updateProfile()
- Persist: localStorage pour tokens
- Provider: Enrobe toute l'app

NotificationContext (src/contexts/NotificationContext.jsx):

javascript- State: notifications[], unreadCount
- Functions: addNotification(), markAsRead(), clearAll()
- WebSocket integration

ThemeContext (src/contexts/ThemeContext.jsx):

javascript- State: theme (light/dark)
- Functions: toggleTheme(), setTheme()
- Persist: localStorage
- Apply: className sur <html>
HOOKS CUSTOM:

useAuth() → accès AuthContext
useNotifications() → accès NotificationContext
useTheme() → accès ThemeContext

USAGE:
javascriptconst { user, logout } = useAuth();
const { notifications, markAsRead } = useNotifications();
Alternative Redux si app complexe

---

### **Protection Routes par Rôle**
Implémente la protection des routes par rôle utilisateur dans AssitoSanté.
COMPOSANT: src/components/PrivateRoute.jsx
javascriptimport { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
USAGE ROUTES:
javascript<Route path="/patient/*" element={
  <PrivateRoute allowedRoles={['patient']}>
    <PatientLayout />
  </PrivateRoute>
} />

<Route path="/medecin/*" element={
  <PrivateRoute allowedRoles={['medecin']}>
    <MedecinLayout />
  </PrivateRoute>
} />

<Route path="/admin/*" element={
  <PrivateRoute allowedRoles={['admin']}>
    <AdminLayout />
  </PrivateRoute>
} />
REDIRECT AUTOMATIQUE:

Si patient accède /medecin → redirect /patient
Après login → redirect selon rôle
Page 403 Unauthorized custom


---

**Voilà! Tu as maintenant tous les prompts prêts à copier-coller pour Qoder AI. Chaque prompt est structuré pour être:**
- ✅ Complet et autonome
- ✅ Avec contexte backend/frontend
- ✅ Sécurité incluse
- ✅ Testable
- ✅ Cohérent avec l'architecture AssitoSanté

**Copie-colle directement dans Qoder AI et il saura exactement quoi faire!** 🚀
````
