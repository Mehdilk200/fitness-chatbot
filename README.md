# Fitness AI Chatbot

Un chatbot de conseils fitness intelligent et une application de suivi conçus pour offrir une expérience d'entraînement personnalisée. Ce projet propose des exercices selon les objectifs de l'utilisateur (perte de poids, musculation, remise en forme, etc.) en utilisant une approche **RAG (Retrieval-Augmented Generation)** couplée à des modèles d'IA (LLMs) pour fournir des recommandations précises et adaptées.

---

## Fonctionnalités (Features)

Voici les principales capacités de la plateforme :

- **Chatbot IA Avancé :** Interagissez avec un coach virtuel boosté par un LLM (Google Generative AI / Gemini). Il comprend vos demandes, analyse vos objectifs et propose des routines adaptées.
- **RAG (Base de Connaissances Locale) :** L'IA ne se base pas uniquement sur ses connaissances générales. Elle recherche dans notre base locale (plus de 1000 exercices, ciblage musculaire, équipements) pour formuler des réponses expertes et exactes.
- **Profil & Calculs Métaboliques :** Lors de l'inscription (Onboarding), l'application calcule automatiquement votre métabolisme de base (BMR), votre dépense énergétique journalière (TDEE) et répartit vos macros (Protéines, Glucides, Lipides) selon votre objectif (prise de masse, sèche...).
- **Planification d'Entraînement :** Génération automatique de programmes sur 7 jours avec des exercices spécifiques par journée.
- **Dashboard Interactif :** Un tableau de bord complet avec des graphiques pour visualiser l'historique de vos mensurations, l'évolution de votre poids et vos sessions passées.
- **Intégration Multimédia :** Affichage d'images d'anatomie et de GIFs animés pour illustrer chaque mouvement d'exercice.
- **Authentification Sécurisée :** Inscription et connexion sécurisées par JWT (JSON Web Tokens) et hachage des mots de passe.

---

## Outils & Technologies (Stack)

Le projet repose sur une architecture moderne séparant le Frontend et le Backend :

### Frontend (Interface Utilisateur)

- **React 19 & Vite :** Pour la création d'interfaces dynamiques ultra-rapides et un développement fluide.
- **React Router DOM :** Gestion de la navigation entre les pages (Accueil, Chat, Dashboard, etc.).
- **Chart.js & React-Chartjs-2 :** Création des graphiques interactifs pour le Dashboard.
- **React Markdown :** Rendu riche du texte formaté (gras, listes) renvoyé par le LLM.
- **Phosphor Icons :** Bibliothèque d'icônes modernes pour l'UI.

### Backend (Serveur & API)

- **FastAPI :** Framework Python moderne et ultra-rapide pour construire nos API REST.
- **Uvicorn :** Serveur ASGI performant pour faire tourner l'application FastAPI.
- **Motor & PyMongo :** Pilotes asynchrones pour communiquer de manière fluide avec la base de données MongoDB.
- **Pydantic :** Validation stricte des données (Modèles de requêtes, de réponses et de BDD).
- **Python-Jose & Passlib :** Gestion de la sécurité (Génération/Vérification de tokens JWT et hachage bcrypt).
- **Google Generative AI (SDK) :** Intégration native des modèles d'IA Gemini pour le Chatbot.

### Base de données

- **MongoDB :** Base de données NoSQL (idéale pour stocker l'historique des conversations, les profils souples des utilisateurs et les plannings générés).

---

## 📂 Structure du Projet

```text
fitness-chatbot/
├── backend/                  # API FastAPI (Python)
│   ├── main.py               # Point d'entrée de l'API
│   ├── routes/               # Endpoints de l'application (chat, exercices, auth, schedule)
│   ├── services/             # Logique métier (LLM, RAG, NLP)
│   ├── models/               # Schémas de données Pydantic et modèles MongoDB
│   ├── db/                   # Configuration de la base de données
│   ├── data/                 # Fichiers sources RAG (.json)
│   └── requirements.txt      # Dépendances Python
│
├── interface/                      # Application Frontend (React/Vite)
│   ├── src/
│   │   ├── components/       # Composants réutilisables (Dashboard, Chat, etc.)
│   │   ├── pages/            # Vues principales de l'application
│   │   └── ...
│   ├── package.json          # Dépendances Node.js
│   └── vite.config.js        # Configuration Vite
│
└── docker/                   # Fichiers de configuration Docker
```

---

## Installation & Lancement

### Prérequis

- **Python 3.10**
- **Node.js 18+**
- **MongoDB** (en local ou MongoDB Atlas)

### Lancement du Backend

1. Accédez au répertoire du backend :
   ```bash
   cd backend
   ```
2. Créez un environnement virtuel et activez-le :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```
3. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
4. Configurez les variables d'environnement (`.env`) avec votre URI MongoDB et votre clé API Gemini.
5. Démarrez le serveur :
   ```bash
   uvicorn main:app --reload --port 8001
   ```

### Lancement du Frontend

1. Accédez au répertoire source du frontend :
   ```bash
   cd interface
   ```
2. Installez les dépendances Node.js :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

---

## Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forkez le dépôt.
2. Créez une branche (`git checkout -b feature/NouvelleFonctionnalite`).
3. Poussez vos modifications (`git push origin feature/NouvelleFonctionnalite`).
4. Ouvrez une Pull Request.

---

## Licence

Ce projet est sous licence. Voir le fichier `LICENSE` pour plus de détails.
