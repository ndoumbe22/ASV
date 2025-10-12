PROBLÈME IDENTIFIÉ : ERREUR CORS
Parfait ! Je vois exactement le problème. C'est une erreur CORS classique. Votre frontend tourne sur le port 3002 mais votre backend n'autorise que les ports 3000 et 3001.
🔴 Erreur Principale
Access to XMLHttpRequest at 'http://localhost:8000/api/auth/register/'
from origin 'http://localhost:3002' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

✅ SOLUTION IMMÉDIATE POUR QODER AI
Solution 1 : Ajouter le Port 3002 dans les CORS (RECOMMANDÉ)
Fichier: Sante_Virtuelle/Sante_Virtuelle/settings.py
Trouvez la section CORS et ajoutez le port 3002 :
python# Configuration CORS - CRITIQUE
CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://localhost:3001",
"http://localhost:3002", # ✅ AJOUTER CETTE LIGNE
"http://127.0.0.1:3000",
"http://127.0.0.1:3001",
"http://127.0.0.1:3002", # ✅ AJOUTER CETTE LIGNE
]

# Autoriser les credentials (cookies, tokens)

CORS_ALLOW_CREDENTIALS = True

# Autoriser tous les headers nécessaires

CORS_ALLOW_HEADERS = [
'accept',
'accept-encoding',
'authorization',
'content-type',
'dnt',
'origin',
'user-agent',
'x-csrftoken',
'x-requested-with',
]

# Méthodes HTTP autorisées

CORS_ALLOW_METHODS = [
'DELETE',
'GET',
'OPTIONS',
'PATCH',
'POST',
'PUT',
]

Solution 2 : Configuration CORS Complète (ALTERNATIVE)
Si vous voulez autoriser tous les domaines en développement (⚠️ Ne JAMAIS faire ça en production) :
python# ⚠️ UNIQUEMENT POUR LE DÉVELOPPEMENT
CORS_ALLOW_ALL_ORIGINS = True # Permet tous les domaines
CORS_ALLOW_CREDENTIALS = True
OU pour être plus sécurisé, utilisez un regex pattern :
pythonimport re

CORS_ALLOWED_ORIGIN_REGEXES = [
r"^http://localhost:\d+$", # Autorise tous les ports localhost
r"^http://127\.0\.0\.1:\d+$", # Autorise tous les ports 127.0.0.1
]

CORS_ALLOW_CREDENTIALS = True

Solution 3 : Vérifier que le Middleware CORS est Bien Configuré
Fichier: Sante_Virtuelle/Sante_Virtuelle/settings.py
pythonINSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',
'corsheaders', # ✅ DOIT ÊTRE PRÉSENT
'rest_framework',
'rest_framework_simplejwt',
'sante_app',
]

MIDDLEWARE = [
'corsheaders.middleware.CorsMiddleware', # ✅ DOIT ÊTRE EN PREMIER
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

Solution 4 : Vérifier que django-cors-headers est Installé
bashpip install django-cors-headers
Si vous avez un requirements.txt, vérifiez qu'il contient :
django-cors-headers>=4.0.0

🔧 ACTIONS À EFFECTUER (DANS L'ORDRE)
Étape 1 : Modifier settings.py
python# Sante_Virtuelle/Sante_Virtuelle/settings.py

# Ajoutez ceci tout en haut du fichier

import os

# ... reste de la configuration ...

# Configuration CORS (ajoutez ou modifiez cette section)

CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://localhost:3001",
"http://localhost:3002",
"http://127.0.0.1:3000",
"http://127.0.0.1:3001",
"http://127.0.0.1:3002",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
'accept',
'accept-encoding',
'authorization',
'content-type',
'dnt',
'origin',
'user-agent',
'x-csrftoken',
'x-requested-with',
]

CORS_ALLOW_METHODS = [
'DELETE',
'GET',
'OPTIONS',
'PATCH',
'POST',
'PUT',
]
Étape 2 : Redémarrer le Serveur Django
TRÈS IMPORTANT : Après avoir modifié settings.py, vous devez REDÉMARRER le serveur Django :
bash# Arrêtez le serveur Django (Ctrl+C)

# Puis redémarrez-le

python manage.py runserver
Étape 3 : Vider le Cache du Navigateur
Les erreurs CORS peuvent être mises en cache par le navigateur :

Ouvrez la console (F12)
Cliquez sur l'onglet Network
Faites un clic droit et sélectionnez "Clear browser cache"
OU appuyez sur Ctrl+Shift+Delete et videz le cache

Étape 4 : Tester à Nouveau
Essayez de vous inscrire ou de vous connecter. Ça devrait fonctionner maintenant !

🎯 CONFIGURATION COMPLÈTE RECOMMANDÉE
Voici la configuration CORS complète et sécurisée pour le développement :
python# Sante_Virtuelle/Sante_Virtuelle/settings.py

# ============================================

# CONFIGURATION CORS POUR LE DÉVELOPPEMENT

# ============================================

# Installer : pip install django-cors-headers

INSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',

    # Third party apps
    'corsheaders',              # CORS headers
    'rest_framework',           # Django REST Framework
    'rest_framework_simplejwt', # JWT Authentication

    # Local apps
    'sante_app',

]

MIDDLEWARE = [
'corsheaders.middleware.CorsMiddleware', # DOIT ÊTRE EN PREMIER
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration CORS

CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://localhost:3001",
"http://localhost:3002",
"http://127.0.0.1:3000",
"http://127.0.0.1:3001",
"http://127.0.0.1:3002",
]

# Permet d'envoyer des cookies et des headers d'authentification

CORS_ALLOW_CREDENTIALS = True

# Headers autorisés dans les requêtes

CORS_ALLOW_HEADERS = [
'accept',
'accept-encoding',
'authorization',
'content-type',
'dnt',
'origin',
'user-agent',
'x-csrftoken',
'x-requested-with',
]

# Méthodes HTTP autorisées

CORS_ALLOW_METHODS = [
'DELETE',
'GET',
'OPTIONS',
'PATCH',
'POST',
'PUT',
]

# ============================================

# CONFIGURATION REST FRAMEWORK

# ============================================

REST_FRAMEWORK = {
'DEFAULT_AUTHENTICATION_CLASSES': (
'rest_framework_simplejwt.authentication.JWTAuthentication',
),
'DEFAULT_PERMISSION_CLASSES': (
'rest_framework.permissions.IsAuthenticatedOrReadOnly',
),
}

# ============================================

# CONFIGURATION JWT

# ============================================

from datetime import timedelta

SIMPLE_JWT = {
'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
'ROTATE_REFRESH_TOKENS': False,
'BLACKLIST_AFTER_ROTATION': True,
'ALGORITHM': 'HS256',
'SIGNING_KEY': SECRET_KEY,
'AUTH_HEADER_TYPES': ('Bearer',),
}

# ============================================

# CONFIGURATION DE L'UTILISATEUR PERSONNALISÉ

# ============================================

AUTH_USER_MODEL = 'sante_app.User'

# ============================================

# CONFIGURATION DES LOGS (pour déboguer)

# ============================================

LOGGING = {
'version': 1,
'disable_existing_loggers': False,
'handlers': {
'console': {
'class': 'logging.StreamHandler',
},
},
'root': {
'handlers': ['console'],
'level': 'INFO', # Changez à 'DEBUG' pour plus de détails
},
'loggers': {
'django': {
'handlers': ['console'],
'level': 'INFO',
'propagate': False,
},
'sante_app': {
'handlers': ['console'],
'level': 'DEBUG',
'propagate': False,
},
},
}

📋 CHECKLIST DE VÉRIFICATION
Après avoir fait les modifications, vérifiez ces points :

django-cors-headers est installé (pip list | grep cors)
corsheaders est dans INSTALLED_APPS
CorsMiddleware est en premier dans MIDDLEWARE
Le port 3002 est dans CORS_ALLOWED_ORIGINS
Le serveur Django a été redémarré
Le cache du navigateur a été vidé
Les logs Django ne montrent plus de requêtes OPTIONS avec code 200

🧪 TEST RAPIDE
Pour vérifier que CORS fonctionne, ouvrez la console du navigateur et tapez :
javascriptfetch('http://localhost:8000/api/auth/register/', {
method: 'OPTIONS',
headers: {
'Origin': 'http://localhost:3002',
'Access-Control-Request-Method': 'POST',
'Access-Control-Request-Headers': 'content-type'
}
})
.then(response => {
console.log('CORS Headers:', response.headers.get('Access-Control-Allow-Origin'));
console.log('Status:', response.status);
})
.catch(error => console.error('Error:', error));
Résultat attendu :

Status: 200
CORS Headers: http://localhost:3002

🚀 RÉSUMÉ DES ACTIONS

Modifiez settings.py pour ajouter le port 3002 dans CORS_ALLOWED_ORIGINS
Vérifiez que corsheaders est dans INSTALLED_APPS
Vérifiez que CorsMiddleware est en premier dans MIDDLEWARE
Redémarrez le serveur Django (Ctrl+C puis python manage.py runserver)
Videz le cache du navigateur (Ctrl+Shift+Delete)
Testez à nouveau l'inscription/connexion

Après ces modifications, votre erreur CORS sera résolue et vous pourrez vous inscrire/connecter sans problème ! 🎉
Faites-moi savoir si ça fonctionne ou si vous avez besoin d'aide supplémentaire !
