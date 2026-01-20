from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import UserProgress
from routers.auth import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

DEFAULT_ROADMAP = {
    "subject": "Data Structures & Algorithms",
    "topics": [
        {"id": 1, "name": "Arrays & Strings", "description": "Foundation of DSA", "mastery": 0.75, "status": "completed", "prerequisites": [], "subtopics": ["Array Basics", "Two Pointers", "Sliding Window", "Prefix Sum", "Kadane's Algorithm", "String Manipulation", "Hashing in Arrays"], "resources": {"videos": 7, "notes": 1, "problems": 6}},
        {"id": 2, "name": "Linked Lists", "description": "Dynamic data structures", "mastery": 0.45, "status": "in-progress", "prerequisites": [1], "subtopics": ["Singly Linked List", "Doubly Linked List", "Cycle Detection", "List Reversal", "Fast & Slow Pointers", "Merge Lists"], "resources": {"videos": 6, "notes": 1, "problems": 6}},
        {"id": 3, "name": "Stacks & Queues", "description": "LIFO and FIFO structures", "mastery": 0, "status": "unlocked", "prerequisites": [1, 2], "subtopics": ["Stack Basics", "Monotonic Stack", "Queue Basics", "Deque", "Priority Queue Intro", "Stack Applications"], "resources": {"videos": 6, "notes": 1, "problems": 6}},
        {"id": 4, "name": "Recursion & Backtracking", "description": "Self-referential functions", "mastery": 0, "status": "locked", "prerequisites": [3], "subtopics": ["Recursion Basics", "Recursion Tree", "Backtracking", "Subsets & Permutations", "N-Queens Problem", "Sudoku Solver"], "resources": {"videos": 6, "notes": 1, "problems": 6}},
        {"id": 5, "name": "Trees & BST", "description": "Hierarchical structures", "mastery": 0, "status": "locked", "prerequisites": [4], "subtopics": ["Binary Tree Basics", "Tree Traversals", "BST Operations", "Height & Depth", "Lowest Common Ancestor", "Tree Construction"], "resources": {"videos": 6, "notes": 1, "problems": 6}},
        {"id": 6, "name": "Graphs", "description": "Networks of nodes", "mastery": 0, "status": "locked", "prerequisites": [5], "subtopics": ["Graph Representation", "BFS", "DFS", "Connected Components", "Topological Sort", "Cycle Detection in Graphs", "Shortest Path Basics"], "resources": {"videos": 7, "notes": 1, "problems": 6}},
        {"id": 7, "name": "Sorting Algorithms", "description": "Ordering algorithms", "mastery": 0, "status": "locked", "prerequisites": [4], "subtopics": ["Bubble & Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Counting Sort", "Heap Sort"], "resources": {"videos": 6, "notes": 1, "problems": 6}},
        {"id": 8, "name": "Dynamic Programming", "description": "Optimization", "mastery": 0, "status": "locked", "prerequisites": [4, 7], "subtopics": ["DP Introduction", "1D DP", "2D DP", "Longest Common Subsequence", "Longest Increasing Subsequence", "Knapsack Problems", "DP on Strings"], "resources": {"videos": 7, "notes": 1, "problems": 6}},
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
