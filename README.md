#  Fitness AI Chatbot

Un chatbot de conseils fitness intelligent capable de proposer des exercices personnalisés selon les objectifs de l'utilisateur (perte de poids, musculation, etc.). Ce projet utilise une approche **RAG (Retrieval-Augmented Generation)** avec des LLM gratuits, éliminant ainsi le besoin d'un entraînement avancé (fine-tuning) dans un premier temps.

---

## Fonctionnalités Principales

- **Chatbot Intelligent :** Recommandations d'exercices basées sur les objectifs via un LLM gratuit (Gemini Flash, Groq Llama3 ou Mistral Free).
- **RAG (Retrieval-Augmented Generation) :** Utilisation d'une base de données locale (JSON) contenant des exercices, muscles ciblés, et équipements pour des réponses précises.
- **Support Visuel :** Intégration de GIFs (180/360/720px) pour illustrer les exercices recommandés.
- **Calculs Métaboliques :** Calcul automatique du BMR (Harris-Benedict), TDEE, et répartition des macros (Protéines, Glucides).
- **Génération de Programme :** Création de plannings d'entraînement hebdomadaires (J1 → J7).
- **Suivi de Progression :** Tracking du poids, des calories et de l'historique des séances.
- **Sécurité :** Authentification sécurisée des utilisateurs via JWT (JSON Web Tokens).

---

##  Architecture du Projet

Le système est divisé en trois couches principales :

1. **Frontend (HTML / CSS / JS) :** - Landing Page, Formulaire d'Onboarding (Poids, Taille, Âge, Objectif, Niveau), Interface de Chatbot et Dashboard.
2. **Backend (FastAPI - Python) :**
   - Routage d'intentions (NLP), Service RAG (Musculation), et appels LLM. 
   - Calculateurs (BMR/TDEE) et Générateur de plans.
3. **Data Layer :**
   - **MongoDB :** Stockage des profils, sessions de chat, plans hebdomadaires et logs de progression.
   - **Fichiers JSON (Source RAG) :** Données statiques sur les exercices (`exercises.json`, `muscles.json`, etc.).

---

##  Structure du Répertoire

```text
fitness-chatbot/
├── backend/
│   ├── main.py              # Application FastAPI principale
│   ├── routes/
│   │   ├── chat.py          # Endpoints pour /api/chat
│   │   └── exercises.py     # Endpoints pour /api/exercises
│   ├── services/
│   │   ├── rag_service.py   # Logique RAG (Retrieval-Augmented Generation)
│   │   ├── llm_service.py   # Intégration et appels aux LLMs (Gemini/Groq/Mistral)
│   │   └── nlp_service.py   # Extraction d'intentions et classification
│   ├── models/
│   │   └── schemas.py       # Modèles Pydantic pour la validation des données
│   ├── db/
│   │   └── mongodb.py       # Connexion et opérations MongoDB
│   └── data/                # Fichiers sources RAG
│       ├── exercises.json
│       ├── muscles.json
│       ├── bodyParts.json
│       └── equipments.json
├── frontend/
│   ├── index.html           # Landing page
│   ├── chat.html            # Interface du chatbot
│   ├── css/                 # Feuilles de style
│   └── js/                  # Scripts d'interface
└── gifs/                    # Média : Animations des exercices
