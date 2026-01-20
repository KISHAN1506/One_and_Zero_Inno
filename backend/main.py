from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, topics, assessment, roadmap, resources, chat

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LearnPath API",
    description="AI-Driven Personalized Learning Assistant for DSA",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(topics.router)
app.include_router(assessment.router)
app.include_router(roadmap.router)
app.include_router(resources.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "LearnPath API", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
