from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import models
import json
import random
import google.generativeai as genai
from config import get_settings

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class RecommendationService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    async def generate_recommendations_from_assessment(self, topic_mastery: list):
        """
        Called AFTER user submits an assessment.
        Uses the assessment results directly to determine weak areas.
        Prioritizes practice questions over videos/tips.
        
        topic_mastery: [{"topic": "Arrays & Strings", "mastery": 0.4, "correct": 2, "total": 5}, ...]
        """
        # 1. Clean up old recommendations
        self._cleanup_recommendations()
        
        # 2. Identify weak topics (mastery < 60%)
        weak_topics = [
            t["topic"] for t in topic_mastery 
            if t["total"] > 0 and t["mastery"] < 0.6
        ]
        
        if not weak_topics:
            # User did well! Just give a progression tip
            self._recommend_progression()
            return
        
        # 3. For each weak topic, add 2-3 PRACTICE QUESTIONS
        for weak_topic in weak_topics[:3]:  # Focus on top 3 worst areas
            self._recommend_practice_questions(weak_topic, count=2)
        
        # 4. Add ONE video for the WEAKEST topic (optional enhancement)
        weakest = min(topic_mastery, key=lambda x: x["mastery"] if x["total"] > 0 else 1)
        if weakest["mastery"] < 0.5:
            self._recommend_video_rule_based(weakest["topic"])

    def _recommend_practice_questions(self, topic_name: str, count: int = 2):
        """
        Finds unanswered questions for the given topic and creates recommendations.
        """
        # Find Topic by name (partial match)
        topic = self.db.query(models.Topic).filter(
            models.Topic.name.contains(topic_name.split("&")[0].strip())
        ).first()
        
        if not topic:
            # Try exact match
            topic = self.db.query(models.Topic).filter(
                models.Topic.name == topic_name
            ).first()
            
        if not topic:
            return  # Unable to find topic
        
        # Get questions for this topic that user hasn't answered CORRECTLY
        correctly_answered_ids = [
            id for (id,) in self.db.query(models.QuestionAttempt.question_id).filter(
                models.QuestionAttempt.user_id == self.user_id,
                models.QuestionAttempt.is_correct == True
            ).all()
        ]
        
        query = self.db.query(models.Question).filter(
            models.Question.topic_id == topic.id
        )
        
        if correctly_answered_ids:
            query = query.filter(models.Question.id.not_in(correctly_answered_ids))
        
        available_questions = query.all()
        
        # Pick 'count' random questions
        selected = random.sample(available_questions, min(count, len(available_questions)))
        
        for question in selected:
            # Check if already recommended
            exists = self.db.query(models.Recommendation).filter_by(
                user_id=self.user_id,
                content_id=question.id,
                type="question",
                is_completed=False
            ).first()
            
            if not exists:
                rec = models.Recommendation(
                    user_id=self.user_id,
                    type="question",
                    content_id=question.id,
                    title=f"Practice: {topic_name}",
                    description=f"You struggled with {topic_name}. Try this {question.difficulty} question to reinforce your understanding.",
                    action_url=f"/assessment?topic={topic.id}",
                    source="rule_based",
                    priority=5  # High priority for practice questions
                )
                self.db.add(rec)
        
        self.db.commit()

    def _recommend_video_rule_based(self, tag):
        """
        Finds a video resource matching the tag/topic
        """
        VIDEO_MAP = {
            "Arrays": {"url": "https://www.youtube.com/watch?v=RBSGKlAvoiM", "title": "Arrays Interview Patterns"},
            "Arrays & Strings": {"url": "https://www.youtube.com/watch?v=RBSGKlAvoiM", "title": "Arrays Interview Patterns"},
            "Linked Lists": {"url": "https://www.youtube.com/watch?v=njTh_OwMljA", "title": "Linked List Deep Dive"},
            "Stacks & Queues": {"url": "https://www.youtube.com/watch?v=RBSGKlAvoiM", "title": "Stacks & Queues Explained"},
            "Recursion & Backtracking": {"url": "https://www.youtube.com/watch?v=M2uO2n5H69U", "title": "Recursion Mastery"},
            "Trees & BST": {"url": "https://www.youtube.com/watch?v=fAAZixBzIAI", "title": "Tree Traversals Explained"},
            "Graphs": {"url": "https://www.youtube.com/watch?v=tWVWeAqZ0WU", "title": "Graph Algorithms Crash Course"},
            "Sorting Algorithms": {"url": "https://www.youtube.com/watch?v=kgBjXUE_Nwc", "title": "All Sorting Algorithms Visualized"},
            "Dynamic Programming": {"url": "https://www.youtube.com/watch?v=oBt53YbR9Kk", "title": "DP for Beginners"},
        }
        
        video_data = VIDEO_MAP.get(tag)
        if not video_data:
            # Try partial match
            for k, v in VIDEO_MAP.items():
                if k in tag or tag in k:
                    video_data = v
                    break
        
        if video_data:
            exists = self.db.query(models.Recommendation).filter_by(
                user_id=self.user_id,
                title=video_data['title'],
                is_completed=False
            ).first()
            
            if not exists:
                rec = models.Recommendation(
                    user_id=self.user_id,
                    type="video",
                    title=video_data['title'],
                    description=f"Watch this video to strengthen your understanding of {tag}.",
                    action_url=video_data['url'],
                    source="rule_based",
                    priority=3  # Lower priority than practice questions
                )
                self.db.add(rec)
                self.db.commit()

    def _recommend_progression(self):
        """
        Recommend next topic if user did well
        """
        exists = self.db.query(models.Recommendation).filter_by(
            user_id=self.user_id,
            type="topic_focus",
            is_completed=False
        ).first()
        
        if not exists:
            rec = models.Recommendation(
                user_id=self.user_id,
                type="topic_focus",
                title="Great Job! Keep Going!",
                description="You performed well on the assessment. Continue to the next topic in your roadmap!",
                action_url="/roadmap",
                source="rule_based",
                priority=2,
                is_completed=False
            )
            self.db.add(rec)
            self.db.commit()

    def _cleanup_recommendations(self):
        """
        Delete ALL existing recommendations for the user before generating fresh ones.
        This ensures only the latest recommendations are shown.
        """
        self.db.query(models.Recommendation).filter(
            models.Recommendation.user_id == self.user_id
        ).delete()
        self.db.commit()

    def get_user_recommendations(self):
        """
        Get active recommendations, prioritizing practice questions.
        """
        return self.db.query(models.Recommendation).filter(
            models.Recommendation.user_id == self.user_id,
            models.Recommendation.is_completed == False
        ).order_by(models.Recommendation.priority.desc()).limit(6).all()
    
    # Legacy method for backward compatibility (called from Dashboard)
    async def generate_daily_recommendations(self):
        """
        Fallback for dashboard-triggered generation.
        Analyzes past attempts instead of using assessment results.
        """
        # Get recent incorrect answers
        recent_failures = (
            self.db.query(models.Question, models.QuestionAttempt)
            .join(models.QuestionAttempt)
            .filter(
                models.QuestionAttempt.user_id == self.user_id,
                models.QuestionAttempt.is_correct == False
            )
            .limit(20)
            .all()
        )
        
        # Build topic failure counts
        topic_failures = {}
        for question, attempt in recent_failures:
            topic_name = question.topic.name if question.topic else "Unknown"
            topic_failures[topic_name] = topic_failures.get(topic_name, 0) + 1
        
        if not topic_failures:
            self._recommend_progression()
            return
        
        # Convert to topic_mastery format for reuse
        topic_mastery = [
            {"topic": t, "mastery": 0.3, "correct": 0, "total": count}  # Fake low mastery
            for t, count in sorted(topic_failures.items(), key=lambda x: x[1], reverse=True)
        ]
        
        await self.generate_recommendations_from_assessment(topic_mastery)
