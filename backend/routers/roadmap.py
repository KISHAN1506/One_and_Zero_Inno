from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import UserProgress
from routers.auth import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

DEFAULT_ROADMAP = {
    "subject": "Data Structures & Algorithms",
    "topics": [
        {"id": 1, "name": "Arrays & Strings", "description": "Foundation of DSA", "mastery": 0.75, "status": "completed", "prerequisites": [], "subtopics": ["Array Basics", "Two Pointers", "Sliding Window"], "resources": {"videos": 2, "notes": 1, "problems": 8}},
        {"id": 2, "name": "Linked Lists", "description": "Dynamic data structures", "mastery": 0.45, "status": "in-progress", "prerequisites": [1], "subtopics": ["Singly LL", "Doubly LL", "Cycle Detection"], "resources": {"videos": 2, "notes": 1, "problems": 6}},
        {"id": 3, "name": "Stacks & Queues", "description": "LIFO and FIFO structures", "mastery": 0, "status": "unlocked", "prerequisites": [1, 2], "subtopics": ["Stack Ops", "Queue Ops", "Monotonic Stack"], "resources": {"videos": 2, "notes": 1, "problems": 5}},
        {"id": 4, "name": "Recursion", "description": "Self-referential functions", "mastery": 0, "status": "locked", "prerequisites": [3], "subtopics": ["Base Case", "Backtracking", "Memoization"], "resources": {"videos": 2, "notes": 1, "problems": 7}},
        {"id": 5, "name": "Trees & BST", "description": "Hierarchical structures", "mastery": 0, "status": "locked", "prerequisites": [4], "subtopics": ["Binary Trees", "BST", "Traversals"], "resources": {"videos": 3, "notes": 1, "problems": 8}},
        {"id": 6, "name": "Graphs", "description": "Networks of nodes", "mastery": 0, "status": "locked", "prerequisites": [5], "subtopics": ["BFS", "DFS", "Connected Components"], "resources": {"videos": 2, "notes": 1, "problems": 6}},
        {"id": 7, "name": "Sorting", "description": "Ordering algorithms", "mastery": 0, "status": "locked", "prerequisites": [4], "subtopics": ["Merge Sort", "Quick Sort", "Counting Sort"], "resources": {"videos": 2, "notes": 1, "problems": 5}},
        {"id": 8, "name": "Dynamic Programming", "description": "Optimization", "mastery": 0, "status": "locked", "prerequisites": [4, 7], "subtopics": ["1D DP", "2D DP", "Classic Problems"], "resources": {"videos": 3, "notes": 2, "problems": 10}},
    ],
    "gaps": [{"topic": "Two Pointers", "deficiency": 65}, {"topic": "Sliding Window", "deficiency": 45}, {"topic": "Hash Maps", "deficiency": 30}],
    "overallProgress": 35, "xp": 1250, "streak": 5
}

@router.get("")
async def get_roadmap(db: Session = Depends(get_db)):
    return DEFAULT_ROADMAP

@router.post("/update")
async def update_roadmap(db: Session = Depends(get_db)):
    return {"message": "Roadmap updated", "roadmap": DEFAULT_ROADMAP}
