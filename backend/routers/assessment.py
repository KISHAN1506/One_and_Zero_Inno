from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from database import get_db
from models import Question, QuestionAttempt, UserProgress, User
from routers.auth import get_current_user
from datetime import datetime

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

SAMPLE_QUESTIONS = [
    {"id": 1, "topic_id": 1, "topic": "Arrays & Strings", "text": "Time complexity of array index access?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct": 0, "difficulty": "easy"},
    {"id": 2, "topic_id": 1, "topic": "Arrays & Strings", "text": "Technique for pairs in sorted array?", "options": ["Binary Search", "Two Pointers", "Sliding Window", "Recursion"], "correct": 1, "difficulty": "medium"},
    {"id": 3, "topic_id": 2, "topic": "Linked Lists", "text": "Insert at head time complexity?", "options": ["O(n)", "O(1)", "O(log n)", "O(n²)"], "correct": 1, "difficulty": "easy"},
    {"id": 4, "topic_id": 2, "topic": "Linked Lists", "text": "Detect cycle algorithm?", "options": ["Hash Set", "Floyd's", "BFS", "DFS"], "correct": 1, "difficulty": "medium"},
    {"id": 5, "topic_id": 3, "topic": "Stacks & Queues", "text": "Structure for function calls?", "options": ["Queue", "Stack", "Array", "Tree"], "correct": 1, "difficulty": "easy"},
    {"id": 6, "topic_id": 4, "topic": "Recursion", "text": "Factorial base case?", "options": ["n==1", "n==0 or n==1", "n<0", "None"], "correct": 1, "difficulty": "easy"},
    {"id": 7, "topic_id": 5, "topic": "Trees & BST", "text": "Where are smaller elements in BST?", "options": ["Right", "Left", "Root", "Anywhere"], "correct": 1, "difficulty": "easy"},
    {"id": 8, "topic_id": 6, "topic": "Graphs", "text": "Shortest path in unweighted graph?", "options": ["DFS", "BFS", "Dijkstra", "Bellman-Ford"], "correct": 1, "difficulty": "medium"},
    {"id": 9, "topic_id": 7, "topic": "Sorting", "text": "Quick Sort average complexity?", "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "correct": 1, "difficulty": "easy"},
    {"id": 10, "topic_id": 8, "topic": "Dynamic Programming", "text": "DP is recursion plus?", "options": ["Iteration", "Memoization", "Sorting", "Hashing"], "correct": 1, "difficulty": "medium"},
]

@router.get("/diagnostic")
async def get_diagnostic(topic_ids: List[int] = Query(None)):
    if topic_ids:
        questions = [q for q in SAMPLE_QUESTIONS if q["topic_id"] in topic_ids]
    else:
        # If no topics selected (shouldn't happen with new flow, but fallback), return all
        questions = SAMPLE_QUESTIONS
        
    return {"questions": [{"id": q["id"], "topic_id": q["topic_id"], "topic": q["topic"], "text": q["text"], "options": q["options"], "difficulty": q["difficulty"]} for q in questions]}

@router.post("/submit")
async def submit_assessment(submit_data: SubmitRequest, db: Session = Depends(get_db)):
    answers = submit_data.answers
    topic_scores = {}
    
    for q in SAMPLE_QUESTIONS:
        qid = str(q["id"])
        if qid in answers:
            is_correct = answers[qid] == q["correct"]
            topic = q["topic"]
            if topic not in topic_scores:
                topic_scores[topic] = {"correct": 0, "total": 0}
            topic_scores[topic]["total"] += 1
            if is_correct:
                topic_scores[topic]["correct"] += 1
    
    topic_mastery = [{"topic": t, "mastery": s["correct"]/s["total"], "correct": s["correct"], "total": s["total"]} for t, s in topic_scores.items()]
    overall = sum(s["correct"] for s in topic_scores.values()) / max(sum(s["total"] for s in topic_scores.values()), 1)
    
    return {"overallScore": overall, "topicMastery": topic_mastery}

@router.get("/topic/{topic_id}")
async def get_topic_questions(topic_id: int):
    questions = [q for q in SAMPLE_QUESTIONS if q["topic_id"] == topic_id]
    return {"questions": [{"id": q["id"], "text": q["text"], "options": q["options"], "difficulty": q["difficulty"]} for q in questions]}
