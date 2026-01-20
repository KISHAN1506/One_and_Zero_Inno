from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
from database import get_db
from models import Question, QuestionAttempt, UserProgress, User, QuizAttempt
from routers.auth import get_current_user
from services.recommendation import RecommendationService
from datetime import datetime
import random
from question_bank import QUESTION_BANK

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

class QuestionResponse(BaseModel):
    id: int
    topic_id: int
    topic: str
    text: str
    options: list
    difficulty: str

class SubmitRequest(BaseModel):
    answers: Dict[str, int]
    skipped: List[int] = []
    question_ids: List[int] = []  # IDs of questions that were shown

class SkipQuestionRequest(BaseModel):
    question_id: int

class SkipAllRequest(BaseModel):
    start_from_basics: bool = True

# Number of questions to display per quiz (randomly selected from bank)
QUESTIONS_PER_QUIZ = 40
QUESTIONS_PER_TOPIC = 5  # 5 questions per topic for balanced quiz

def get_random_questions(topic_ids: Optional[List[int]] = None):
    """Select random questions from bank, balanced across topics"""
    questions = []
    
    # Group questions by topic
    topics = {}
    for q in QUESTION_BANK:
        if topic_ids and q["topic_id"] not in topic_ids:
            continue
        if q["topic_id"] not in topics:
            topics[q["topic_id"]] = []
        topics[q["topic_id"]].append(q)
    
    # Select random questions from each topic
    for topic_id, topic_questions in topics.items():
        count = min(QUESTIONS_PER_TOPIC, len(topic_questions))
        selected = random.sample(topic_questions, count)
        questions.extend(selected)
    
    # Shuffle final list
    random.shuffle(questions)
    return questions

@router.get("/diagnostic")
async def get_diagnostic(topic_ids: Optional[str] = None):
    """Get diagnostic questions with random selection from bank."""
    filter_ids = None
    if topic_ids:
        filter_ids = [int(x.strip()) for x in topic_ids.split(",")]
    
    questions = get_random_questions(filter_ids)
    
    return {
        "questions": [
            {
                "id": q["id"], 
                "topic_id": q["topic_id"], 
                "topic": q["topic"], 
                "text": q["text"], 
                "options": q["options"], 
                "difficulty": q["difficulty"]
            } for q in questions
        ],
        "total": len(questions),
        "can_skip": True
    }

@router.post("/submit")
async def submit_assessment(
    submit_data: SubmitRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answers = submit_data.answers
    skipped_ids = submit_data.skipped
    question_ids = submit_data.question_ids  # Questions that were shown
    topic_scores = {}
    skipped_count = 0
    
    # Build detailed question report
    detailed_report = []
    incorrect_questions = []
    
    # Filter to only questions that were shown (if provided)
    questions_to_check = QUESTION_BANK
    if question_ids:
        questions_to_check = [q for q in QUESTION_BANK if q["id"] in question_ids]
    
    for q in questions_to_check:
        qid = str(q["id"])
        topic = q["topic"]
        
        if topic not in topic_scores:
            topic_scores[topic] = {"correct": 0, "total": 0, "skipped": 0}
        
        question_report = {
            "id": q["id"],
            "topic": topic,
            "text": q["text"],
            "difficulty": q["difficulty"],
            "options": q["options"],
            "correct_answer_index": q["correct"],
            "correct_answer_text": q["options"][q["correct"]],
            "user_answer_index": None,
            "user_answer_text": None,
            "is_correct": None,
            "is_skipped": False
        }
        
        if q["id"] in skipped_ids:
            topic_scores[topic]["skipped"] += 1
            skipped_count += 1
            question_report["is_skipped"] = True
        elif qid in answers:
            user_answer = answers[qid]
            is_correct = user_answer == q["correct"]
            topic_scores[topic]["total"] += 1
            
            question_report["user_answer_index"] = user_answer
            question_report["user_answer_text"] = q["options"][user_answer] if 0 <= user_answer < len(q["options"]) else "Invalid"
            question_report["is_correct"] = is_correct
            
            if is_correct:
                topic_scores[topic]["correct"] += 1
            else:
                incorrect_questions.append({
                    "id": q["id"],
                    "topic": topic,
                    "question": q["text"],
                    "your_answer": question_report["user_answer_text"],
                    "correct_answer": question_report["correct_answer_text"]
                })
        
        detailed_report.append(question_report)
    
    topic_mastery = []
    for t, s in topic_scores.items():
        if s["total"] > 0:
            mastery = s["correct"] / s["total"]
        else:
            mastery = 0  # Skipped all questions
        topic_mastery.append({
            "topic": t, 
            "mastery": mastery, 
            "correct": s["correct"], 
            "total": s["total"],
            "skipped": s["skipped"]
        })
    
    total_answered = sum(s["total"] for s in topic_scores.values())
    total_correct = sum(s["correct"] for s in topic_scores.values())
    overall = total_correct / max(total_answered, 1)
    
    # Save quiz attempt to history FIRST (before recommendations to ensure persistence)
    try:
        quiz_attempt = QuizAttempt(
            user_id=current_user.id,
            overall_score=overall,
            total_questions=len(questions_to_check),
            correct_count=total_correct,
            incorrect_count=total_answered - total_correct,
            skipped_count=skipped_count,
            topic_mastery=topic_mastery,
            incorrect_questions=incorrect_questions,
            detailed_report=detailed_report,
            quiz_type="diagnostic"
        )
        db.add(quiz_attempt)
        db.commit()
        db.refresh(quiz_attempt)
        print(f"Quiz attempt {quiz_attempt.id} saved successfully for user {current_user.id}")
    except Exception as e:
        db.rollback()
        print(f"ERROR: Failed to save quiz attempt: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save quiz attempt: {str(e)}")
    
    # Generate recommendations based on quiz results (non-blocking)
    try:
        rec_service = RecommendationService(db, current_user.id)
        await rec_service.generate_recommendations_from_assessment(topic_mastery)
    except Exception as e:
        print(f"Recommendation generation failed (non-blocking): {e}")
    
    return {
        "attemptId": quiz_attempt.id,
        "overallScore": overall, 
        "topicMastery": topic_mastery,
        "totalQuestions": len(questions_to_check),
        "answered": total_answered,
        "skipped": skipped_count,
        "correctCount": total_correct,
        "incorrectCount": total_answered - total_correct,
        "incorrectQuestions": incorrect_questions,
        "detailedReport": detailed_report
    }

@router.post("/skip-question")
async def skip_question(request: SkipQuestionRequest):
    """Mark a question as skipped"""
    return {"success": True, "question_id": request.question_id, "skipped": True}

@router.post("/skip-all")
async def skip_all(request: SkipAllRequest, db: Session = Depends(get_db)):
    """Skip the entire quiz and optionally start from basics"""
    return {
        "success": True,
        "startFromBasics": request.start_from_basics,
        "message": "Quiz skipped. Starting from basics." if request.start_from_basics else "Quiz skipped."
    }

@router.get("/topic/{topic_id}")
async def get_topic_questions(topic_id: int):
    questions = [q for q in SAMPLE_QUESTIONS if q["topic_id"] == topic_id]
    return {
        "questions": [
            {
                "id": q["id"], 
                "text": q["text"], 
                "options": q["options"], 
                "difficulty": q["difficulty"]
            } for q in questions
        ],
        "total": len(questions)
    }

@router.get("/reassess")
async def get_reassess_questions(db: Session = Depends(get_db)):
    """Get a comprehensive reassessment quiz (one random question from each topic)"""
    import random
    
    questions = []
    topics = set(q["topic_id"] for q in SAMPLE_QUESTIONS)
    
    for topic_id in topics:
        topic_questions = [q for q in SAMPLE_QUESTIONS if q["topic_id"] == topic_id]
        if topic_questions:
            questions.append(random.choice(topic_questions))
            
    return {
        "questions": [
            {
                "id": q["id"], 
                "topic_id": q["topic_id"], 
                "topic": q["topic"], 
                "text": q["text"], 
                "options": q["options"], 
                "difficulty": q["difficulty"]
            } for q in questions
        ],
        "total": len(questions),
        "can_skip": False
    }

@router.get("/history")
async def get_quiz_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all quiz attempts for the current user"""
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.created_at.desc()).all()
    
    return {
        "attempts": [
            {
                "id": a.id,
                "overallScore": a.overall_score,
                "totalQuestions": a.total_questions,
                "correctCount": a.correct_count,
                "incorrectCount": a.incorrect_count,
                "skippedCount": a.skipped_count,
                "quizType": a.quiz_type,
                "createdAt": a.created_at.isoformat() if a.created_at else None
            } for a in attempts
        ],
        "total": len(attempts)
    }

@router.get("/history/{attempt_id}")
async def get_quiz_attempt_detail(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed report for a specific quiz attempt"""
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == attempt_id,
        QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    
    return {
        "id": attempt.id,
        "overallScore": attempt.overall_score,
        "totalQuestions": attempt.total_questions,
        "correctCount": attempt.correct_count,
        "incorrectCount": attempt.incorrect_count,
        "skippedCount": attempt.skipped_count,
        "quizType": attempt.quiz_type,
        "createdAt": attempt.created_at.isoformat() if attempt.created_at else None,
        "topicMastery": attempt.topic_mastery,
        "incorrectQuestions": attempt.incorrect_questions,
        "detailedReport": attempt.detailed_report
    }

