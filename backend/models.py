from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = relationship("UserProgress", back_populates="user")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    order = Column(Integer)
    prerequisites = Column(JSON, default=[])
    subtopics = Column(JSON, default=[])
    questions = relationship("Question", back_populates="topic")
    resources = relationship("Resource", back_populates="topic")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    text = Column(String)
    options = Column(JSON)
    correct_answer = Column(Integer)
    difficulty = Column(String, default="medium")
    topic = relationship("Topic", back_populates="questions")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    type = Column(String)  # video, note
    title = Column(String)
    url = Column(String, nullable=True)
    content = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    topic = relationship("Topic", back_populates="resources")

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    mastery_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    last_attempt = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="progress")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_answer = Column(Integer)
    is_correct = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)
