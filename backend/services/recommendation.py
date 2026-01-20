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
                title="Continue Learning",
                description="Continue to the next topic in your roadmap.",
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

    def generate_recommendations_from_progress(self, topic_id: int, subtopic_id: int, completed: bool, topic_progress: dict):
        """
        Called on EVERY subtopic completion status change.
        Generates contextual recommendations based on:
        1. Current topic progress
        2. Completed subtopics
        3. Next logical steps in the learning path
        
        Args:
            topic_id: The topic the subtopic belongs to
            subtopic_id: The subtopic that was just toggled
            completed: Whether it was marked complete (True) or incomplete (False)
            topic_progress: Dict with 'completed' and 'total' counts for the topic
        """
        # Clean up old recommendations first
        self._cleanup_recommendations()
        
        # Get topic info
        topic = self.db.query(models.Topic).filter(models.Topic.id == topic_id).first()
        topic_name = topic.name if topic else f"Topic {topic_id}"
        
        completed_count = topic_progress.get('completed', 0)
        total_count = topic_progress.get('total', 0)
        progress_pct = completed_count / total_count if total_count > 0 else 0
        
        # Import DEFAULT_SUBTOPICS to get subtopic details
        from routers.subtopics import DEFAULT_SUBTOPICS
        subtopics_list = DEFAULT_SUBTOPICS.get(topic_id, [])
        
        # Get user's completed subtopic IDs for this topic
        subtopic_ids = [st["id"] for st in subtopics_list]
        completed_records = self.db.query(models.SubtopicProgress).filter(
            models.SubtopicProgress.user_id == self.user_id,
            models.SubtopicProgress.subtopic_id.in_(subtopic_ids),
            models.SubtopicProgress.completed == True
        ).all()
        completed_subtopic_ids = {r.subtopic_id for r in completed_records}
        
        # Find uncompleted subtopics in order
        uncompleted_subtopics = [st for st in subtopics_list if st["id"] not in completed_subtopic_ids]
        
        if completed:
            # User just completed a subtopic
            if progress_pct >= 1.0:
                # Topic fully complete - recommend next topic and quiz
                self._recommend_next_topic(topic_id)
                self._recommend_topic_quiz(topic_id, topic_name)
            else:
                # Still in progress - recommend next subtopic and its video
                if uncompleted_subtopics:
                    self._recommend_next_subtopic(uncompleted_subtopics[0], topic_name)
                
                # If weak in quiz, add practice questions
                self._check_and_add_quiz_practice(topic_id, topic_name)
        else:
            # User marked something as incomplete - recommend that subtopic's video
            current_subtopic = next((st for st in subtopics_list if st["id"] == subtopic_id), None)
            if current_subtopic:
                self._recommend_next_subtopic(current_subtopic, topic_name)
                
                # Add a video recommendation for this subtopic
                if current_subtopic.get("video_url"):
                    self._add_video_recommendation(
                        current_subtopic["name"],
                        current_subtopic["video_url"],
                        current_subtopic.get("description", f"Learn {current_subtopic['name']}")
                    )
        
        self.db.commit()

    def _recommend_next_subtopic(self, subtopic: dict, topic_name: str):
        """Recommend the next subtopic to complete"""
        rec = models.Recommendation(
            user_id=self.user_id,
            type="topic_focus",
            title=f"Next: {subtopic['name']}",
            description=subtopic.get("description", f"Learn {subtopic['name']} in {topic_name}"),
            action_url=f"/roadmap",
            source="rule_based",
            priority=5
        )
        self.db.add(rec)
        
        # Also recommend the video for this subtopic if available
        if subtopic.get("video_url"):
            self._add_video_recommendation(
                subtopic['name'],
                subtopic["video_url"],
                subtopic.get("description", f"Learn {subtopic['name']}")
            )

    def _recommend_next_topic(self, current_topic_id: int):
        """Recommend starting the next topic"""
        next_topic = self.db.query(models.Topic).filter(
            models.Topic.id == current_topic_id + 1
        ).first()
        
        if next_topic:
            rec = models.Recommendation(
                user_id=self.user_id,
                type="topic_focus",
                title=f"Next Topic: {next_topic.name}",
                description=next_topic.description if next_topic.description else f"Start learning {next_topic.name}",
                action_url="/roadmap",
                source="rule_based",
                priority=5
            )
            self.db.add(rec)
        else:
            # User completed all topics - suggest reassessment
            rec = models.Recommendation(
                user_id=self.user_id,
                type="question",
                title="Take Full Reassessment",
                description="Test your overall DSA knowledge with a complete assessment",
                action_url="/assessment?mode=reassess",
                source="rule_based",
                priority=5
            )
            self.db.add(rec)

    def _recommend_topic_quiz(self, topic_id: int, topic_name: str):
        """Recommend taking a quiz for the completed topic"""
        rec = models.Recommendation(
            user_id=self.user_id,
            type="question",
            title=f"Quiz: {topic_name}",
            description=f"Test your {topic_name} knowledge",
            action_url=f"/assessment?topic={topic_id}",
            source="rule_based",
            priority=4
        )
        self.db.add(rec)

    # Removed _add_motivation_tip - no more motivational messages

    def _add_video_recommendation(self, title: str, url: str, description: str):
        """Add a video recommendation"""
        # Check if already exists
        exists = self.db.query(models.Recommendation).filter_by(
            user_id=self.user_id,
            action_url=url,
            is_completed=False
        ).first()
        
        if not exists:
            rec = models.Recommendation(
                user_id=self.user_id,
                type="video",
                title=f"Video: {title}",
                description=description,
                action_url=url,
                source="rule_based",
                priority=3
            )
            self.db.add(rec)

    def _check_and_add_quiz_practice(self, topic_id: int, topic_name: str):
        """Check if user has quiz history and add practice if needed"""
        # Check if user has taken quizzes and done poorly on this topic
        from models import QuizAttempt
        recent_attempts = self.db.query(QuizAttempt).filter(
            QuizAttempt.user_id == self.user_id
        ).order_by(QuizAttempt.created_at.desc()).limit(3).all()
        
        for attempt in recent_attempts:
            if attempt.topic_mastery:
                for tm in attempt.topic_mastery:
                    if topic_name in tm.get("topic", "") and tm.get("mastery", 1) < 0.6:
                        # User struggled with this topic in quiz - add practice
                        self._recommend_practice_questions(topic_name, count=2)
                        return

