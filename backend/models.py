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
    recommendations = relationship("Recommendation", back_populates="user")
    tag_mastery = relationship("UserTagMastery", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

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
    tags = Column(JSON, default=[])  # e.g., ["Arrays", "Two Pointers"]
    difficulty_score = Column(Integer, default=5)  # 1-10
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

class UserTagMastery(Base):
    """Tracks mastery of specific concepts (tags) like 'Two Pointers'"""
    __tablename__ = "user_tag_mastery"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tag = Column(String, index=True)
    mastery_score = Column(Float, default=0.0)  # 0.0 to 1.0
    attempts = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="tag_mastery")

class Recommendation(Base):
    """Stores AI or rule-based recommendations for the user"""
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # 'question', 'video', 'topic_focus'
    
    # Content details (stored to avoid complex joins and external API calls on read)
    content_id = Column(Integer, nullable=True)  # ID of question/resource if internal
    title = Column(String)
    description = Column(String)  # The 'Why' reason
    action_url = Column(String, nullable=True)  # URL for video or route for question
    
    # Metadata
    source = Column(String)  # 'ai' or 'rule_based'
    priority = Column(Integer, default=1)  # 1 (Low) to 5 (High)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Recommendations can expire
    
    user = relationship("User", back_populates="recommendations")

class QuizAttempt(Base):
    """Stores quiz attempt history for users"""
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Summary scores
    overall_score = Column(Float)  # 0.0 to 1.0
    total_questions = Column(Integer)
    correct_count = Column(Integer)
    incorrect_count = Column(Integer)
    skipped_count = Column(Integer)
    
    # Detailed data stored as JSON
    topic_mastery = Column(JSON)  # List of {topic, mastery, correct, total}
    incorrect_questions = Column(JSON)  # List of {id, topic, question, your_answer, correct_answer}
    detailed_report = Column(JSON)  # Full question-by-question breakdown
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    quiz_type = Column(String, default="diagnostic")  # diagnostic, topic, reassess
    
    user = relationship("User", back_populates="quiz_attempts")

