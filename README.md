# LearnPath - AI-Driven Personalized Learning Assistant

> PS12 Hackathon Project | Track: AIML

An AI-powered learning platform that helps undergraduate engineering students master Data Structures & Algorithms through personalized, adaptive learning roadmaps.

## 🚀 Features

- **Adaptive Learning Engine** - Personalized roadmaps based on performance
- **Knowledge Gap Detection** - Identifies weak topics for targeted practice
- **Curated Resources** - Free YouTube videos and concept notes
- **AI Doubt Solver** - Context-aware chatbot for DSA questions
- **Privacy First** - Minimal data collection, secure auth

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Framer Motion |
| Backend | FastAPI (Python) |
| Database | SQLite (MVP) |
| Auth | JWT |
| Package Manager | pnpm |

## 📦 Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Access the app at **http://localhost:3000**

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── pages/       # Home, Dashboard, Assessment, Roadmap, Resources, Chatbot
│   │   ├── components/  # Navbar, reusable UI
│   │   ├── context/     # Theme, User state
│   │   └── api/         # Axios client
│   └── package.json
├── backend/
│   ├── routers/         # auth, topics, assessment, roadmap, resources, chat
│   ├── models.py        # SQLAlchemy models
│   ├── main.py          # FastAPI app
│   └── requirements.txt
└── README.md
```

## 🎯 MVP Scope (DSA Subject)

| Topic | Questions | Videos | Notes |
|-------|-----------|--------|-------|
| Arrays & Strings | 5 | 2 | ✓ |
| Linked Lists | 5 | 2 | ✓ |
| Stacks & Queues | 5 | 2 | ✓ |
| Recursion | 5 | 2 | ✓ |
| Trees & BST | 6 | 3 | ✓ |
| Graphs | 5 | 2 | ✓ |
| Sorting | 5 | 2 | ✓ |
| Dynamic Programming | 4 | 3 | ✓ |

## 🔐 Privacy

- Minimal PII (email + name only)
- Passwords hashed with bcrypt
- JWT tokens with short expiry
- No raw chat logs stored

## 👥 Team

One and Zero

---

Built with ❤️ for INNOHACK
