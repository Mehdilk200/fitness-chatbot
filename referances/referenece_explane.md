# 📘 Document de Référence Complet : Fitness AI Chatbot

Ce document est conçu pour servir de base à la rédaction de votre rapport de projet. Il détaille l'ensemble de l'architecture, le design (UI/UX), le code source, les API et les fonctionnalités du projet.

---

## 1. 🎯 Introduction et Objectif du Projet
Le projet **Fitness AI Chatbot** est une application web intelligente (SaaS) conçue pour aider les utilisateurs à atteindre leurs objectifs de fitness (perte de poids, prise de masse, remise en forme). 
Contrairement à une simple application de suivi, elle intègre un **Coach Virtuel basé sur l'Intelligence Artificielle (LLM + RAG)** qui analyse le profil de l'utilisateur et interagit avec lui en langage naturel pour fournir des programmes d'entraînement sur mesure, tout en s'appuyant sur une base de données locale validée d'exercices.

---

## 2. ✨ Fonctionnalités Principales (Features)
- **Onboarding Personnalisé** : Récupération des informations morphologiques (âge, taille, poids, sexe) et des objectifs (perte de graisse, musculation, etc.).
- **Calculs Métaboliques** : Calcul en temps réel du BMR (Métabolisme de base) et du TDEE (Dépenses énergétiques journalières), avec répartition des macronutriments (Protéines, Glucides, Lipides).
- **Générateur de Programmes (Schedule)** : Création de plans d'entraînement sur 7 jours adaptés au niveau et au matériel de l'utilisateur.
- **Chatbot IA (RAG + LLM)** : Interaction conversationnelle où l'utilisateur peut poser des questions. L'IA répond en utilisant une base locale (Retrieval-Augmented Generation) pour proposer des exercices précis (avec GIFs et images).
- **Dashboard de Suivi** : Visualisation graphique de l'évolution du poids et des calories brûlées (via Chart.js).
- **Sécurité et Authentification** : Système de Login/Register sécurisé avec JWT (JSON Web Tokens).

---

## 3. 🎨 UI/UX (Expérience et Interface Utilisateur)
L'application est pensée pour être engageante, moderne et motivante :
- **Design System** : Utilisation d'un thème visuel dynamique (probablement des tons sombres avec des couleurs d'accentuation vibrantes typiques du fitness, ex: vert fluo, orange ou bleu électrique) pour donner un aspect "Premium".
- **Composants Clés** :
  - *Cartes (Cards)* pour afficher les statistiques du Dashboard.
  - *Chat Interface* similaire aux applications de messagerie modernes, avec bulles de dialogue, rendu Markdown (gras, listes) et intégration de médias (GIFs d'exercices).
  - *Graphiques Interactifs* : Permettent à l'utilisateur de comprendre ses progrès d'un seul coup d'œil.
- **Navigation Flow** : 
  `Login/Register` ➔ `Onboarding (Formulaire à étapes)` ➔ `Dashboard (Statistiques & Graphiques)` ➔ `Chat (Coach IA)` ➔ `Schedule (Planning hebdo)`.

---

## 4. 🏗️ Architecture Globale
Le projet utilise une architecture **Client-Serveur (Decoupled)** avec :
- **Frontend** : React.js (propulsé par Vite pour la rapidité) - Port par défaut: 5173.
- **Backend** : FastAPI (Python) - Port: 8001.
- **Base de Données** : MongoDB (NoSQL) pour la flexibilité des profils et historiques.

---

## 5. 💻 Détail du Frontend (Source & Fichiers)
Construit avec **React 19** et **Vite**.

*Structure clé du dossier `src/` :*
- `src/pages/` : Contient les vues principales.
  - `Home.jsx` / `Dashboard.jsx` : Affichage des statistiques et graphiques (via `react-chartjs-2`).
  - `Chat.jsx` : L'interface conversationnelle avec le coach IA.
  - `Login.jsx` / `Register.jsx` : Pages d'authentification.
- `src/components/` : Composants réutilisables.
  - `ScheduleView.jsx` (et `.css`) : Affiche le planning d'entraînement sous forme de calendrier/liste.
- `src/services/` :
  - `api.js` : Centralise tous les appels HTTP vers le backend FastAPI (utilisation de `fetch` ou `axios` avec injection du token JWT dans les headers).

---

## 6. ⚙️ Détail du Backend (API & Source)
Construit avec **FastAPI** (Python 3.9+). Il est extrêmement rapide, asynchrone et génère automatiquement la documentation Swagger.

*Structure clé du dossier `backend/` :*
- `main.py` : Le point d'entrée. Configure l'application FastAPI, le middleware CORS et inclut toutes les routes (routers).
- **`routes/` (Les Endpoints de l'API)** :
  - `profile.py` : Gestion des utilisateurs (Onboarding, mise à jour des mensurations).
  - `chat.py` : Reçoit les requêtes de l'utilisateur, interroge le LLM et renvoie la réponse.
  - `schedule.py` : Gère la création et la récupération des plannings d'entraînement.
  - `auth.py` : Endpoints `/login` et `/register` avec hachage de mot de passe (Passlib) et génération de JWT.
- **`services/` (La Logique Métier)** :
  - `llm_service.py` : Fait le pont avec l'API Google Generative AI (Gemini) pour générer du texte de manière intelligente.
  - `rag_service.py` : (Retrieval-Augmented Generation) Lit les fichiers locaux JSON pour trouver l'exercice le plus adapté à la question de l'utilisateur avant de l'envoyer au LLM.
- **`models/` / `db/`** :
  - `schemas.py` : Modèles Pydantic. Ils valident strictement les données qui entrent et qui sortent de l'API (ex: `UserCreate`, `ChatMessage`).
  - Connexion à MongoDB via Motor (asynchrone).
- **`data/`** :
  - `bodyParts.json`, `exercises.json`, etc. : Constituent la base de connaissances locale "experte" pour le système RAG.

---

## 7. 🧠 Le Flux de Fonctionnement (Data Flow du Chat)
C'est le cœur technique du projet, parfait pour votre rapport :
1. **User Input** : L'utilisateur tape *"Je veux muscler mes bras avec des haltères"* dans `Chat.jsx`.
2. **API Call** : `api.js` envoie la requête à l'endpoint `POST /api/chat/`.
3. **Recherche RAG (`rag_service.py`)** : Le backend cherche dans `exercises.json` et `bodyParts.json` (ex: ciblage "bras", équipement "haltères").
4. **Prompt Engineering (`llm_service.py`)** : Le backend construit un prompt complexe pour l'IA : *"Tu es un coach fitness. Voici une question: [Question]. Voici des exercices pertinents issus de notre base: [Données RAG]. Réponds à l'utilisateur."*
5. **LLM Processing** : Gemini analyse le tout et génère une réponse structurée en Markdown (avec le lien vers les GIFs des exercices locaux).
6. **Réponse UI** : Le Frontend reçoit la réponse, la convertit grâce à `React Markdown` et affiche une jolie bulle avec le texte formatté et les animations.

---

## 8. 🛠️ Technologies Clés pour le Rapport (Tech Stack)
* **React 19 / Vite** : Frontend ultra-rapide.
* **FastAPI (Python)** : Backend asynchrone haute performance.
* **MongoDB (Motor)** : Base de données NoSQL adaptée aux structures JSON (historique de chat, profils).
* **Gemini AI / LLM** : Moteur d'intelligence artificielle pour la compréhension du langage naturel.
* **Système RAG** : Évite les hallucinations de l'IA en la forçant à utiliser des données locales fiables.
* **JWT (JSON Web Tokens)** : Standard de sécurité pour les sessions utilisateurs.

> **💡 Conseil pour votre rapport :** Insistez sur le fait que l'intégration du système **RAG** différencie votre application d'un simple wrapper ChatGPT. Votre application possède une véritable **expertise métier** locale (via les fichiers JSON) et l'IA ne fait "que" formuler la réponse autour de cette expertise.
