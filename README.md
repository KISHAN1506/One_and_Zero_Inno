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
| Package Manager | pnpm (frontend), pip (backend) |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** - Install via `npm install -g pnpm`
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/One_and_Zero_Inno.git
cd One_and_Zero_Inno
```

### 2. Backend Setup

#### On Windows (PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### On macOS/Linux

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend will be available at **http://localhost:3000**

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the `backend/` directory for custom configuration:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./learnpath.db
```

## 📁 Project Structure

```
One_and_Zero_Inno/
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
│   ├── database.py      # Database connection
│   ├── config.py        # Configuration settings
│   ├── main.py          # FastAPI app entry point
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

## 🐛 Troubleshooting

### Common Issues

**1. PowerShell script execution policy error**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**2. Port already in use**
- Backend: Change port with `uvicorn main:app --reload --port 8001`
- Frontend: Vite will automatically use the next available port

**3. Module not found errors**
Make sure you've activated the virtual environment before installing dependencies.

## 👥 Team

One and Zero

---

Built with ❤️ for INNOHACK
