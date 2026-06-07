# FitBot — Fitness AI Chatbot

Un **chatbot fitness intelligent** avec suivi de progression, génération de programmes d'entraînement, calculs métaboliques et recommandations d'exercices via **RAG (Retrieval-Augmented Generation)** + **LLM (Gemini)**.

Le chatbot multilingue (Français, Anglais, Arabe, Darija) comprend l'intention de l'utilisateur et répond avec des données précises issues de la base d'exercices locale, enrichies par l'IA générative.

---

## ✨ Fonctionnalités

- **💬 Chatbot IA multilingue** — Coach virtuel boosté par Gemini, avec compréhension d'intention (musculation, nutrition, planning, cardio, progrès...)
- **📚 RAG (Recherche vectorielle)** — L'IA consulte une base locale de 1000+ exercices via ChromaDB pour des réponses précises
- **📊 Dashboard interactif** — Graphiques d'évolution du poids, mensurations et sessions passées (Chart.js)
- **📝 Profil & Métabolisme** — Calcul automatique du BMR, TDEE, macros (Protéines/Glucides/Lipides) selon l'objectif
- **📅 Planning 7 jours** — Génération automatique de programmes d'entraînement personnalisés
- **🏋️ Base d'exercices** — Animations GIF, ciblage musculaire, équipement requis
- **🔐 Authentification JWT** — Inscription/Connexion sécurisée avec tokens

---

## 🛠️ Technologies

### Frontend (React + Vite)
| Technologie | Utilisation |
|---|---|
| React 19 | UI dynamique |
| Vite 8 | Build & dev ultra-rapide |
| React Router DOM 7 | Navigation SPA |
| Chart.js + react-chartjs-2 | Graphiques dashboard |
| React Markdown | Rendu des réponses formatées du LLM |
| Phosphor Icons | Iconographie |
| Mapbox GL | Cartes (optionnel) |

### Backend (FastAPI + Python)
| Technologie | Utilisation |
|---|---|
| FastAPI | API REST asynchrone |
| Uvicorn | Serveur ASGI |
| Motor + PyMongo | Driver MongoDB asynchrone |
| Google Generative AI (Gemini) | LLM pour le chatbot |
| ChromaDB | Base vectorielle pour le RAG |
| Pydantic | Validation des données |
| python-jose + passlib | JWT + hachage bcrypt |
| pytest | Tests unitaires |

### Base de données
- **MongoDB** — Profils utilisateurs, historique des conversations, plannings, logs de progression
- **ChromaDB** — Index vectoriel des exercices pour la recherche sémantique

---

## 📁 Structure du projet

```
fitness-chatbot/
├── backend/
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── requirements.txt        # Dépendances Python
│   ├── Dockerfile              # Build Docker standalone (Render)
│   ├── .envEXMPLE              # Variables d'environnement (copier → .env)
│   ├── routes/                 # Endpoints API
│   │   ├── auth.py             #   /api/auth (register, login, me)
│   │   ├── chat.py             #   /api/chat (messages, upload, history)
│   │   ├── profile.py          #   /api/profile (get/update)
│   │   ├── schedule.py         #   /api/schedule (CRUD planning)
│   │   ├── exercises.py        #   /api/exercises (search)
│   │   └── crud.py             #   Opérations MongoDB communes
│   ├── services/               # Logique métier
│   │   ├── llm_service.py      #   Interface Gemini API
│   │   ├── rag_services.py     #   Recherche vectorielle ChromaDB
│   │   ├── intent_router.py    #   Classification d'intention (multi-langue)
│   │   ├── calculator_service.py  # Calculs BMR/TDEE/Macros
│   │   ├── plan_generator.py   #   Génération programme 7 jours
│   │   ├── progress_service.py #   Analyse de progression
│   │   ├── import_exercises.py #   Import des exercices (GIF → MongoDB)
│   │   └── populate_chroma.py  #   Peuplement ChromaDB depuis MongoDB
│   ├── models/
│   │   └── schemas.py          # Schémas Pydantic (Register, Login, Token...)
│   ├── db/
│   │   ├── mongodb.py          # Connexion MongoDB + index
│   │   ├── chroma.py           # Client ChromaDB persistant
│   │   └── schemas.py          # Schémas Pydantic (Chat, Profile, Exercise...)
│   ├── data/                   # Données RAG
│   │   ├── equipments.json
│   │   ├── muscles.json
│   │   ├── bodyParts.json
│   │   └── gifts/              # GIFs d'exercices
│   └── test/                   # Tests
│       ├── test_api.py
│       ├── test_db.py
│       ├── test_intent_router.py
│       └── create_admin.py
│
├── interface/                  # Frontend React
│   ├── src/
│   │   ├── App.jsx            # Routes principales
│   │   ├── pages/             # Pages : Home, Chat, Dashboard, Profile, Auth, Onboarding
│   │   ├── components/        # Composants : ScheduleView, ThemeToggle, MapboxMap, ProtectedRoute
│   │   └── services/api.js    # Client API (auth, chat, profile, schedule, exercises)
│   ├── package.json
│   ├── vite.config.js         # Proxy /api → backend:8001
│   └── .envEXMPLE
│
├── docker/
│   ├── backend/Dockerfile     # Docker image backend
│   ├── frontend/Dockerfile    # Docker image frontend (Nginx)
│   └── .env                   # Variables d'environnement Docker
├── docker-compose.yml         # Orchestration complète (MongoDB + Backend + Frontend)
└── README.md
```

---

## 🚀 Démarrage rapide (Développement)

### ✅ Prérequis

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (local ou [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Clé API Gemini** (gratuite via [Google AI Studio](https://aistudio.google.com/))

### 1️⃣ Backend

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Créer et activer l'environnement virtuel
python -m venv venv
source venv/bin/activate   # Linux/Mac
# .\venv\Scripts\activate  # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer les variables d'environnement
cp .envEXMPLE .env
# Éditer .env :
#   - MONGO_URL : mongodb://localhost:27017 (local) ou votre URI Atlas
#   - GEMINI_API_KEY : votre clé Google AI
#   - JWT_SECRET : une chaîne aléatoire sécurisée

# 5. Lancer le serveur
uvicorn main:app --reload --port 8001
```

Le backend est accessible sur **http://localhost:8001**.
La documentation interactive Swagger est sur **http://localhost:8001/docs**.

### 2️⃣ Importer les exercices (obligatoire)

```bash
cd backend
python services/import_exercises.py
# Importe les GIFs et métadonnées d'exercices dans MongoDB
```

### 3️⃣ Peupler ChromaDB (recommandé)

```bash
cd backend
python services/populate_chroma.py
# Crée l'index vectoriel pour la recherche RAG depuis MongoDB
```

### 4️⃣ Frontend

```bash
# 1. Aller dans le dossier interface
cd interface

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .envEXMPLE .env
# Éditer .env :
#   - VITE_API_BASE_URL : http://localhost:8001/api

# 4. Lancer le serveur de développement
npm run dev
```

Le frontend est accessible sur **http://localhost:5173**.
Le proxy Vite redirige `/api`, `/uploads` et `/gifs` vers le backend.

---

## 🐳 Démarrage avec Docker Compose

```bash
# 1. Configurer les variables d'environnement Docker
# Éditer docker/.env avec votre GEMINI_API_KEY et MONGO_URL

# 2. Lancer tous les services
docker-compose up -d --build

# 3. Accéder à l'application
# Frontend : http://localhost:8080
# Backend   : http://localhost:8001
```

**Services démarrés :**
- **mongo** — Base de données MongoDB (port 27017)
- **backend** — API FastAPI (port 8001)
- **frontend** — Nginx servant le build React (port 8080)

> ⚠️ Après le premier lancement, il faut importer les exercices et peupler ChromaDB dans le conteneur backend :
> ```bash
> docker exec -it fitness-chatbot-backend-1 python services/import_exercises.py
> docker exec -it fitness-chatbot-backend-1 python services/populate_chroma.py
> ```

---

## 🌐 API Endpoints

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| **POST** | `/api/auth/register` | ❌ | Inscription (email + password) |
| **POST** | `/api/auth/login` | ❌ | Connexion → retourne JWT |
| **GET** | `/api/auth/me` | ✅ | Infos utilisateur courant |
| **POST** | `/api/chat` | ✅ | Envoyer un message au chatbot |
| **POST** | `/api/chat/upload` | ✅ | Uploader un fichier |
| **GET** | `/api/chat/history` | ✅ | Historique des sessions |
| **DELETE** | `/api/chat/session/{id}` | ✅ | Supprimer une session |
| **GET** | `/api/profile/me` | ✅ | Profil utilisateur |
| **POST** | `/api/profile/update` | ✅ | Créer/Mettre à jour le profil |
| **GET** | `/api/exercises/search` | ❌ | Rechercher des exercices |
| **GET** | `/api/schedule/` | ✅ | Planning de l'utilisateur |
| **POST** | `/api/schedule/` | ✅ | Ajouter un élément au planning |
| **PUT** | `/api/schedule/{id}` | ✅ | Modifier un élément |
| **DELETE** | `/api/schedule/{id}` | ✅ | Supprimer un élément |
| **GET** | `/health` | ❌ | Healthcheck |

---

## 🔐 Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description | Défaut |
|---|---|---|
| `MONGO_URL` | URI MongoDB | `mongodb://localhost:27017` |
| `DB_NAME` | Nom de la base | `fitness_chatbot` |
| `GEMINI_API_KEY` | Clé API Google Gemini | — |
| `LLM_PROVIDER` | Fournisseur LLM | `gemini` |
| `LLM_MODEL` | Modèle Gemini | `gemini-3.1-flash-lite` |
| `JWT_SECRET` | Secret pour signer les tokens JWT | — |
| `JWT_ALGORITHM` | Algorithme JWT | `HS256` |
| `JWT_EXPIRE_MINUTES` | Durée de validité du token | `10080` (7 jours) |
| `APP_PORT` | Port du serveur | `8001` |
| `DEBUG` | Mode debug | `True` |
| `CHROMA_ENABLED` | Activer ChromaDB | `true` |

### Frontend (`interface/.env`)

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_BASE_URL` | URL de base de l'API | `/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Clé Google Maps (optionnel) | — |
| `VITE_BOXMAP` | Token Mapbox (optionnel) | — |

---

## 🧪 Tests

```bash
cd backend

# Lancer les tests
pytest test/

# Tester l'intent router
pytest test/test_intent_router.py -v

# Tester l'API
pytest test/test_api.py -v

# Tester la base de données
pytest test/test_db.py -v
```

---

## 📦 Déploiement

Le projet peut être déployé sur **Railway**, **Render** ou toute plateforme supportant Docker.

### Render

Le backend inclut un `Dockerfile` optimisé (multi-stage) qui sert également le frontend build :
```bash
# Builder le frontend d'abord
cd interface && npm run build

# Le backend Dockerfile copie interface/dist/ automatiquement
cd .. && docker build -f backend/Dockerfile -t fitbot .
```

---

## 🤝 Contribution

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feature/ma-feature`
3. Commitez : `git commit -m 'Ajout de ma feature'`
4. Poussez : `git push origin feature/ma-feature`
5. Ouvrez une Pull Request

---

## 📄 Licence

Voir le fichier [LICENSE](LICENSE).
