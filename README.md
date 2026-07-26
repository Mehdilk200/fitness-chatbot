# 🏋️ EliteFiT — AI Fitness Coach

**EliteFiT** is a full-stack AI-powered fitness coaching platform that combines an intelligent multilingual chatbot, personalized workout planning, metabolic calculations, and a rich exercise database with RAG (Retrieval-Augmented Generation).

The chatbot understands user intent across multiple languages (English, French, Arabic, Darija) and responds with accurate, context-aware fitness advice powered by Google Gemini LLM and a vector-searchable exercise library.

---

## ✨ Features

- **💬 AI Chatbot (Multilingual)** — Virtual fitness coach powered by Google Gemini, with intent recognition for training, nutrition, planning, cardio, progress tracking, and more
- **📚 RAG (Vector Search)** — The AI queries a local database of 1000+ exercises via ChromaDB for precise, evidence-based answers
- **📊 Interactive Dashboard** — Visual progress tracking with charts for weight, body measurements, and past sessions (Chart.js)
- **📝 Profile & Metabolism Calculator** — Automatic BMR, TDEE, and macronutrient (Protein/Carbs/Fats) calculations based on your goals
- **📅 7-Day Smart Planner** — Auto-generated personalized workout schedules
- **🏋️ Exercise Library** — GIF demonstrations, muscle targeting, equipment requirements
- **🔐 JWT Authentication** — Secure sign-up/login with token-based sessions
- **⌨️ Sidebar Persistence** — Sidebar state (open/closed) saved to localStorage
- **🔗 Wearable Integration** — Connect Fitbit, Strava, Apple Watch, and other devices
- **🎨 Dark/Light Theme** — Toggle between elegant light and dark modes

---

## 🛠️ Tech Stack

### Frontend (React + Vite)

| Technology                           | Purpose                        |
| ------------------------------------ | ------------------------------ |
| **React 19**                   | Dynamic UI components          |
| **Vite 8**                     | Ultra-fast build & development |
| **React Router DOM 7**         | SPA navigation & routing       |
| **Chart.js + react-chartjs-2** | Dashboard charts and graphs    |
| **React Markdown**             | Rendered LLM responses         |
| **Phosphor Icons**             | Iconography throughout the app |
| **Mapbox GL**                  | Interactive location maps      |

### Backend (FastAPI + Python)

| Technology                              | Purpose                     |
| --------------------------------------- | --------------------------- |
| **FastAPI**                       | Async REST API framework    |
| **Uvicorn**                       | ASGI server                 |
| **Motor + PyMongo**               | Async MongoDB driver        |
| **Google Generative AI (Gemini)** | LLM for the chatbot         |
| **ChromaDB**                      | Vector database for RAG     |
| **Pydantic**                      | Data validation & schemas   |
| **python-jose + passlib**         | JWT tokens + bcrypt hashing |
| **pytest**                        | Unit & integration testing  |

### Database

- **MongoDB** — User profiles, chat history, workout schedules, progress logs
- **ChromaDB** — Vector index of exercises for semantic search

---

## 🔄 Recent Updates

### Branding Update (Logo Implementation)

- Replaced the text-based 'A' logo placeholder in both the **Navbar** and **Footer** with the actual `logoelet.png` image
- Logo is resized appropriately: 32×32px in the navbar, 28×28px in the footer
- Favicon updated to use `/logoelet.png` for browser tab branding

### Navigation & Footer Improvements

- Added **social media icons** (Instagram, Facebook, Twitter) to the footer using the Phosphor Icons library
- Social icons feature hover effects with the brand's signature lime green color
- Footer logo now matches the navbar branding for visual consistency

### Sidebar Persistence (localStorage)

- Sidebar open/closed state is saved to `localStorage` under the key `sidebarOpen`
- State persists across page refreshes and browser sessions
- Implemented using React's `useState` with a lazy initializer reading from `localStorage`

### Other Improvements

- Fully responsive design with mobile drawer navigation
- Dark/light theme toggle with `localStorage` persistence
- Docker Compose setup for easy deployment

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Gemini API Key** (free via [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fitness-chatbot.git
cd fitness-chatbot
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .envEXMPLE .env
# Edit .env with:
#   - MONGO_URL: your MongoDB URI
#   - GEMINI_API_KEY: your Google AI key
#   - JWT_SECRET: a secure random string

# Start the server
uvicorn main:app --reload --port 8001
```

The backend runs at **http://localhost:8001** with interactive Swagger docs at **http://localhost:8001/docs**.

### 3. Import Exercise Data

```bash
cd backend
python scripts/import_exercises.py
python scripts/populate_chroma.py
```

### 4. Frontend Setup

```bash
# Navigate to frontend
cd interface

# Install dependencies
npm install

# Configure environment
cp .envEXMPLE .env
# Edit .env with:
#   - VITE_API_BASE_URL: http://localhost:8001/api

# Start dev server
npm run dev
```

The frontend runs at **http://localhost:5173**. The Vite proxy redirects `/api`, `/uploads`, and `/gifs` to the backend.

### 5. Docker Deployment (Alternative)

```bash
# Edit docker/.env with your API keys
docker-compose up -d --build
```

- Frontend: **http://localhost:8080**
- Backend: **http://localhost:8001**

---

## 🧪 Running Tests

```bash
cd backend
pytest test/
```

---

## 🔐 Environment Variables (Security)

Never commit real API keys to Git. Use `.env.example` files as templates:

### Backend (`backend/.env`)

| Variable             | Description                   |
| -------------------- | ----------------------------- |
| `MONGO_URL`        | MongoDB connection URI        |
| `GEMINI_API_KEY`   | Google Gemini API key         |
| `JWT_SECRET`       | Secret for signing JWT tokens |
| `STRAVA_CLIENT_ID` | Strava OAuth client ID        |
| `FITBIT_CLIENT_ID` | Fitbit OAuth client ID        |

### Frontend (`interface/.env`)

| Variable              | Description         |
| --------------------- | ------------------- |
| `VITE_API_BASE_URL` | Backend API URL     |
| `VITE_BOXMAP`       | Mapbox access token |

> **Best Practice:** Always add `.env` files to `.gitignore` before pushing. The `.env.example` files serve as templates showing which variables are needed without exposing real secrets.

---

## 📁 Project Structure

```
fitness-chatbot/
├── backend/           # FastAPI Python backend
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   ├── models/        # Pydantic schemas
│   ├── db/            # Database connections
│   ├── data/          # Exercise data & assets
│   └── scripts/       # Initialization scripts
├── interface/         # React + Vite frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   └── services/  # API client
│   └── package.json
├── docker/            # Docker configuration
└── docker-compose.yml # Full orchestration
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

See the [LICENSE](LICENSE) file for details.
