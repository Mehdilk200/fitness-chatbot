# EliteFiT - Coach Sportif IA

**EliteFiT** est une plateforme de coaching sportif complète (full-stack) propulsée par l'intelligence artificielle. Elle combine un chatbot multilingue intelligent, une planification personnalisée des entraînements, des calculs métaboliques, et une vaste base de données d'exercices exploitant la technologie RAG (Retrieval-Augmented Generation).

Le chatbot comprend les intentions des utilisateurs dans plusieurs langues (Anglais, Français, Arabe, Darija) et répond par des conseils de fitness précis et adaptés au contexte, en s'appuyant sur le modèle de langage LLM Google Gemini et sur une bibliothèque d'exercices vectorisée.

---

## Fonctionnalités Principales

- **Chatbot IA Multilingue** : Coach sportif virtuel alimenté par Google Gemini, capable de reconnaître les intentions liées à l'entraînement, la nutrition, la planification, le cardio, le suivi des progrès, et bien plus encore.
- **RAG (Recherche Vectorielle)** : L'IA interroge une base de données locale contenant plus de 1000 exercices via ChromaDB afin de fournir des réponses précises et fondées sur des données fiables.
- **Tableau de Bord Interactif** : Suivi visuel des progrès à l'aide de graphiques pour le poids, les mensurations corporelles et les séances d'entraînement précédentes (réalisé avec Chart.js).
- **Profil et Calculateur Métabolique** : Calcul automatique du métabolisme de base (BMR), de la dépense énergétique journalière (TDEE) et des macronutriments (Protéines/Glucides/Lipides) en fonction de vos objectifs.
- **Planificateur Intelligent sur 7 Jours** : Génération automatique de programmes d'entraînement personnalisés.
- **Bibliothèque d'Exercices** : Démonstrations sous forme de GIF animés, ciblage musculaire et indications sur l'équipement requis.
- **Authentification JWT** : Inscription et connexion sécurisées basées sur des sessions par tokens.
- **Persistance de la Barre Latérale** : L'état d'ouverture ou de fermeture de la barre latérale est sauvegardé dans le stockage local du navigateur (localStorage).
- **Intégration d'Appareils Connectés** : Possibilité de connecter des appareils tels que Fitbit, Strava, Apple Watch, entre autres.
- **Thème Clair/Sombre** : Basculement fluide entre des modes d'affichage clair et sombre élégants.

---

## Technologies Utilisées

### Frontend (React + Vite)

| Technologie                          | Objectif                       |
| ------------------------------------ | ------------------------------ |
| **React 19**                         | Composants d'interface dynamiques |
| **Vite 8**                           | Compilation et développement ultra-rapides |
| **React Router DOM 7**               | Navigation et routage pour application monopage (SPA) |
| **Chart.js + react-chartjs-2**       | Tableaux et graphiques pour le tableau de bord |
| **React Markdown**                   | Rendu formaté des réponses du LLM |
| **Phosphor Icons**                   | Iconographie complète de l'application |
| **Mapbox GL**                        | Cartes de localisation interactives |

### Backend (FastAPI + Python)

| Technologie                             | Objectif                    |
| --------------------------------------- | --------------------------- |
| **FastAPI**                             | Framework d'API REST asynchrone |
| **Uvicorn**                             | Serveur ASGI                |
| **Motor + PyMongo**                     | Pilote MongoDB asynchrone   |
| **Google Generative AI (Gemini)**       | LLM utilisé par le chatbot  |
| **ChromaDB**                            | Base de données vectorielle pour le RAG |
| **Pydantic**                            | Validation des données et création de schémas |
| **python-jose + passlib**               | Jetons JWT et hachage bcrypt |
| **pytest**                              | Tests unitaires et d'intégration |

### Base de Données

- **MongoDB** : Profils d'utilisateurs, historique des conversations, plannings d'entraînement et journaux de progression.
- **ChromaDB** : Indexation vectorielle des exercices pour la recherche sémantique.

---

## Mises à Jour Récentes

### Mise à Jour de l'Identité Visuelle (Intégration du Logo)

- Remplacement du texte de l'espace réservé au logo par l'image `logoelet.png` dans la barre de navigation et le pied de page.
- Le logo a été redimensionné de manière appropriée : 32x32px dans la barre de navigation et 28x28px dans le pied de page.
- Le Favicon a été mis à jour pour utiliser `/logoelet.png` afin d'assurer la cohérence de l'image de marque dans les onglets du navigateur.

### Améliorations de la Navigation et du Pied de Page

- Ajout d'icônes de réseaux sociaux (Instagram, Facebook, Twitter) au pied de page en utilisant la bibliothèque Phosphor Icons.
- Les icônes sociales intègrent des effets de survol utilisant la couleur vert citron emblématique de la marque.
- Le logo du pied de page correspond désormais à celui de la barre de navigation pour garantir une uniformité visuelle globale.

### Persistance de la Barre Latérale (localStorage)

- L'état (ouvert/fermé) de la barre latérale est sauvegardé dans le `localStorage` sous la clé `sidebarOpen`.
- Cet état persiste même lors du rafraîchissement de la page ou entre différentes sessions de navigation.
- Implémenté via l'utilisation du hook `useState` de React couplé à une initialisation asynchrone lisant depuis le `localStorage`.

### Autres Améliorations

- Design entièrement adaptatif (responsive) incluant un menu de navigation latéral pour mobile.
- Basculement entre les thèmes sombre et clair avec persistance via `localStorage`.
- Configuration Docker Compose pour un déploiement simplifié.

---

## Instructions d'Installation

### Prérequis

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (en local ou via [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Clé API Gemini** (gratuite via [Google AI Studio](https://aistudio.google.com/))

### 1. Cloner le Dépôt

```bash
git clone https://github.com/votre_nom_utilisateur/fitness-chatbot.git
cd fitness-chatbot
```

### 2. Configuration du Backend

```bash
# Accéder au dossier backend
cd backend

# Créer et activer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .envEXMPLE .env
# Modifiez le fichier .env en y ajoutant :
#   - MONGO_URL : votre URI MongoDB
#   - GEMINI_API_KEY : votre clé Google AI
#   - JWT_SECRET : une chaîne de caractères aléatoire et sécurisée

# Démarrer le serveur
uvicorn main:app --reload --port 8001
```

Le backend sera accessible sur **http://localhost:8001** avec une documentation interactive Swagger disponible sur **http://localhost:8001/docs**.

### 3. Importation des Données d'Exercices

```bash
cd backend
python scripts/import_exercises.py
python scripts/populate_chroma.py
```

### 4. Configuration du Frontend

```bash
# Accéder au dossier frontend
cd interface

# Installer les dépendances
npm install

# Configurer l'environnement
cp .envEXMPLE .env
# Modifiez le fichier .env en y ajoutant :
#   - VITE_API_BASE_URL: http://localhost:8001/api

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur **http://localhost:5173**. Le proxy Vite redirigera les requêtes `/api`, `/uploads` et `/gifs` vers le backend.

### 5. Déploiement via Docker (Alternative)

```bash
# Modifiez le fichier docker/.env avec vos propres clés API
docker-compose up -d --build
```

- Frontend : **http://localhost:8080**
- Backend : **http://localhost:8001**

---

## Exécution des Tests

```bash
cd backend
pytest test/
```

---

## Variables d'Environnement (Sécurité)

Ne soumettez jamais vos clés API réelles sur Git. Utilisez toujours les fichiers `.env.example` comme modèles de référence :

### Backend (`backend/.env`)

| Variable             | Description                   |
| -------------------- | ----------------------------- |
| `MONGO_URL`          | URI de connexion MongoDB      |
| `GEMINI_API_KEY`     | Clé API Google Gemini         |
| `JWT_SECRET`         | Clé secrète pour signer les jetons JWT |
| `STRAVA_CLIENT_ID`   | ID client OAuth Strava        |
| `FITBIT_CLIENT_ID`   | ID client OAuth Fitbit        |

### Frontend (`interface/.env`)

| Variable              | Description         |
| --------------------- | ------------------- |
| `VITE_API_BASE_URL`   | URL de l'API Backend |
| `VITE_BOXMAP`         | Jeton d'accès Mapbox |

> **Bonne Pratique :** Ajoutez systématiquement les fichiers `.env` à votre fichier `.gitignore` avant tout commit. Les fichiers `.env.example` servent de modèles indiquant quelles variables sont requises, sans pour autant exposer vos informations sensibles.

---

## Structure du Projet

```
fitness-chatbot/
├── backend/           # Backend Python basé sur FastAPI
│   ├── routes/        # Endpoints de l'API
│   ├── services/      # Logique métier
│   ├── models/        # Schémas Pydantic
│   ├── db/            # Connexions à la base de données
│   ├── data/          # Données des exercices et ressources
│   └── scripts/       # Scripts d'initialisation
├── interface/         # Frontend React + Vite
│   ├── src/
│   │   ├── pages/     # Composants des pages
│   │   ├── components/# Composants réutilisables
│   │   └── services/  # Client d'appel API
│   └── package.json
├── docker/            # Fichiers de configuration Docker
└── docker-compose.yml # Orchestration complète
```

---

## Contribuer

1. Forkez (bifurquez) le dépôt
2. Créez une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. Commitez vos modifications : `git commit -m 'Ajout de ma fonctionnalité'`
4. Poussez (push) la branche : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request (demande de tirage)

---

## Licence

Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
