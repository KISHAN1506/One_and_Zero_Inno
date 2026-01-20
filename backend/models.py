from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    language_preference = Column(String, default="en")  # "en" or "hi"
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = relationship("UserProgress", back_populates="user")
    notes = relationship("UserNote", back_populates="user")
    subtopic_progress = relationship("SubtopicProgress", back_populates="user")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    order = Column(Integer)
    prerequisites = Column(JSON, default=[])
    summary_notes = Column(Text, nullable=True)  # Auto-generated topic summary
    questions = relationship("Question", back_populates="topic")
    resources = relationship("Resource", back_populates="topic")
    subtopics = relationship("Subtopic", back_populates="topic")
    leetcode_problems = relationship("LeetCodeProblem", back_populates="topic")

class Subtopic(Base):
    __tablename__ = "subtopics"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    order = Column(Integer, default=0)
    topic = relationship("Topic", back_populates="subtopics")
    progress = relationship("SubtopicProgress", back_populates="subtopic")

class SubtopicProgress(Base):
    __tablename__ = "subtopic_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subtopic_id = Column(Integer, ForeignKey("subtopics.id"))
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="subtopic_progress")
    subtopic = relationship("Subtopic", back_populates="progress")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    text = Column(String)
    text_hi = Column(String, nullable=True)  # Hindi translation
    options = Column(JSON)
    options_hi = Column(JSON, nullable=True)  # Hindi options
    correct_answer = Column(Integer)
    difficulty = Column(String, default="medium")
    topic = relationship("Topic", back_populates="questions")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    type = Column(String)  # video, note
    title = Column(String)
    title_hi = Column(String, nullable=True)  # Hindi title
    url = Column(String, nullable=True)
    url_hi = Column(String, nullable=True)  # Hindi video URL
    content = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    language = Column(String, default="en")  # Primary language
    topic = relationship("Topic", back_populates="resources")

class LeetCodeProblem(Base):
    __tablename__ = "leetcode_problems"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    title = Column(String)
    difficulty = Column(String)  # Easy, Medium, Hard
    url = Column(String)
    topic = relationship("Topic", back_populates="leetcode_problems")

class UserNote(Base):
    __tablename__ = "user_notes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="notes")

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    mastery_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    last_attempt = Column(DateTime, nullable=True)
    skipped_quiz = Column(Boolean, default=False)  # If user skipped the entire quiz
    user = relationship("User", back_populates="progress")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_answer = Column(Integer, nullable=True)  # null if skipped
    is_correct = Column(Boolean)
    skipped = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
