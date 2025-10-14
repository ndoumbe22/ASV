# 🏥 AssitoSanté - Plateforme de Santé Virtuelle

## 📊 Avancement : 100% ✅

## 🚀 Fonctionnalités

### ✅ Modules Complétés

1. **Authentification** (95%)
2. **Chatbot Médical** (80%)
3. **Gestion Rendez-vous** (95%)
4. **Dossiers Médicaux** (70%)
5. **Géolocalisation** (90%)
6. **Rappels Médicaments** (85%)
7. **Articles de Santé** (100%) ⭐ NOUVEAU
8. **Urgences Critiques** (100%) ⭐ NOUVEAU
9. **Sécurité & RGPD** (100%) ⭐ NOUVEAU
10. **Notifications Push** (100%) ⭐ NOUVEAU
11. **Système de Notation** (100%) ⭐ NOUVEAU
12. **Améliorations UX/UI** (100%) ⭐ NOUVEAU

## 🛠️ Technologies

- **Backend** : Django 5.2.5, PostgreSQL
- **Frontend** : React 18, Bootstrap 5
- **Sécurité** : JWT, Chiffrement AES
- **Notifications** : Email (Gmail SMTP), Push Notifications
- **Scheduler** : APScheduler
- **Cartes** : Leaflet.js + OpenStreetMap

## ⚙️ Installation

### Backend

```bash
cd Sante_Virtuelle
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 🔒 Sécurité

- Chiffrement des données sensibles
- Audit logs complets
- Conformité RGPD
- Authentification JWT

## 📝 Documentation API

API disponible sur : `http://localhost:8000/api/`

### Endpoints principaux

- `/api/articles/` - Articles publics
- `/api/patient/urgences/` - Urgences
- `/api/medication-reminders/` - Rappels
- `/api/export-mes-donnees/` - Export RGPD
- `/api/notifications/` - Notifications
- `/api/ratings/` - Évaluations

## 👥 Rôles

- **Patient** : Rendez-vous, urgences, articles
- **Médecin** : Consultations, articles, urgences
- **Admin** : Modération, statistiques, gestion

## 🚀 Phase 4 - Améliorations UX/UI, Notifications et Évaluations

### Nouvelles fonctionnalités

1. **Notifications Push**

   - Système de notification en temps réel
   - Service worker pour les notifications en arrière-plan
   - Interface utilisateur pour gérer les notifications

2. **Système de Notation**

   - Notation des médecins par les patients
   - Affichage des évaluations pour les médecins
   - Modération des commentaires

3. **Améliorations UX/UI**

   - Tableaux de bord améliorés pour tous les rôles
   - Design responsive avec thème sombre
   - Composants réutilisables
   - Navigation améliorée

4. **Nouveaux composants**
   - Système de notation par étoiles
   - Dropdown de notifications
   - Carrousels d'actions rapides
   - Cartes de statistiques
   - Tableaux de données avec tri
   - Modales de confirmation
   - Barres de recherche avec auto-complétion

## 📧 Contact

Email : contact@assistosante.sn

## 📄 Licence

© 2024 AssitoSanté - Tous droits réservés
