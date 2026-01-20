from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models import Topic

router = APIRouter(prefix="/api/topics", tags=["topics"])

class TopicResponse(BaseModel):
    id: int
    name: str
    description: str
    order: int
    prerequisites: list
    subtopics: list

@router.get("", response_model=List[TopicResponse])
async def get_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.order).all()
    if not topics:
        # Return default topics if none exist
        return [
            {"id": 1, "name": "Arrays & Strings", "description": "Foundation of DSA", "order": 1, "prerequisites": [], "subtopics": ["Two Pointers", "Sliding Window"]},
            {"id": 2, "name": "Linked Lists", "description": "Dynamic data structures", "order": 2, "prerequisites": [1], "subtopics": ["Singly LL", "Doubly LL"]},
            {"id": 3, "name": "Stacks & Queues", "description": "LIFO and FIFO structures", "order": 3, "prerequisites": [1, 2], "subtopics": ["Stack Ops", "Queue Ops"]},
            {"id": 4, "name": "Recursion", "description": "Self-referential functions", "order": 4, "prerequisites": [3], "subtopics": ["Base Case", "Backtracking"]},
            {"id": 5, "name": "Trees & BST", "description": "Hierarchical structures", "order": 5, "prerequisites": [4], "subtopics": ["Traversals", "BST Ops"]},
            {"id": 6, "name": "Graphs", "description": "Networks of nodes", "order": 6, "prerequisites": [5], "subtopics": ["BFS", "DFS"]},
            {"id": 7, "name": "Sorting", "description": "Ordering algorithms", "order": 7, "prerequisites": [4], "subtopics": ["Merge Sort", "Quick Sort"]},
            {"id": 8, "name": "Dynamic Programming", "description": "Optimization through subproblems", "order": 8, "prerequisites": [4, 7], "subtopics": ["1D DP", "2D DP"]},
        ]
    return topics

@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        return {"id": topic_id, "name": "Sample Topic", "description": "Description", "order": topic_id, "prerequisites": [], "subtopics": []}
    return topic
