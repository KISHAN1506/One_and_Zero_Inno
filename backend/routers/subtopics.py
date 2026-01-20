from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import SubtopicProgress, User
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/subtopics", tags=["subtopics"])

class ToggleCompleteRequest(BaseModel):
    completed: bool

# Default subtopics data (matches topics.py)
DEFAULT_SUBTOPICS = {
    1: [
        {"id": 1, "name": "Array Basics", "description": "Declaration, initialization, indexing", "video_url": "https://www.youtube.com/watch?v=37E9ckMDdTk"},
        {"id": 2, "name": "Two Pointers", "description": "Technique for sorted array problems", "video_url": "https://www.youtube.com/watch?v=-gjxk6MJbTE"},
        {"id": 3, "name": "Sliding Window", "description": "Fixed and variable size window problems", "video_url": "https://www.youtube.com/watch?v=9kdHxplyl5I"},
        {"id": 4, "name": "Prefix Sum", "description": "Cumulative sum for range queries", "video_url": "https://www.youtube.com/watch?v=xvNwoz-ufXA"},
        {"id": 5, "name": "Kadane's Algorithm", "description": "Maximum subarray sum", "video_url": "https://www.youtube.com/watch?v=AHZpyENo7k4"},
        {"id": 6, "name": "String Manipulation", "description": "Substrings, palindromes, anagrams", "video_url": "https://www.youtube.com/watch?v=428f84tQdQM"},
        {"id": 7, "name": "Hashing in Arrays", "description": "Using hashmaps for O(1) lookups", "video_url": "https://www.youtube.com/watch?v=KEs5UyBJ39g"},
    ],
    2: [
        {"id": 8, "name": "Singly Linked List", "description": "Basic node and next pointer", "video_url": "https://www.youtube.com/watch?v=Nq7OkCHCp-A"},
        {"id": 9, "name": "Doubly Linked List", "description": "Nodes with prev and next pointers", "video_url": "https://www.youtube.com/watch?v=0eMzhap7Qxw"},
        {"id": 10, "name": "Cycle Detection", "description": "Floyd's Tortoise and Hare algorithm", "video_url": "https://www.youtube.com/watch?v=wiOo4DC5GGA"},
        {"id": 11, "name": "List Reversal", "description": "Iterative and recursive reversal", "video_url": "https://www.youtube.com/watch?v=D2vI2DNJGd8"},
        {"id": 12, "name": "Fast & Slow Pointers", "description": "Finding middle, detecting cycles", "video_url": "https://www.youtube.com/watch?v=7L70TuPNUf8"},
        {"id": 13, "name": "Merge Lists", "description": "Merging sorted linked lists", "video_url": "https://www.youtube.com/watch?v=Xb4slcp1U38"},
    ],
    3: [
        {"id": 14, "name": "Stack Basics", "description": "Push, pop, peek operations", "video_url": "https://www.youtube.com/watch?v=BYhSys57LM0"},
        {"id": 15, "name": "Monotonic Stack", "description": "Next greater/smaller element", "video_url": "https://www.youtube.com/watch?v=Dq_ObZwTY_Q"},
        {"id": 16, "name": "Queue Basics", "description": "Enqueue, dequeue operations", "video_url": "https://www.youtube.com/watch?v=M6GnoUDpqEE"},
        {"id": 17, "name": "Deque", "description": "Double-ended queue operations", "video_url": "https://www.youtube.com/watch?v=pqg0SOPryJ4"},
        {"id": 18, "name": "Priority Queue Intro", "description": "Heap-based priority operations", "video_url": "https://www.youtube.com/watch?v=wptebq0r2IN"},
        {"id": 19, "name": "Stack Applications", "description": "Balanced parentheses, expression evaluation", "video_url": "https://www.youtube.com/watch?v=wkDfsKijrZ8"},
    ],
    4: [
        {"id": 20, "name": "Recursion Basics", "description": "Base case, recursive case", "video_url": "https://www.youtube.com/watch?v=yVdKa8dnKiE"},
        {"id": 21, "name": "Recursion Tree", "description": "Visualizing recursive calls", "video_url": "https://www.youtube.com/watch?v=5dP-bBVS1wU"},
        {"id": 22, "name": "Backtracking", "description": "Explore and undo approach", "video_url": "https://www.youtube.com/watch?v=Zq4upTEaQyM"},
        {"id": 23, "name": "Subsets & Permutations", "description": "Generating all combinations", "video_url": "https://www.youtube.com/watch?v=rYkfBRtMJr8"},
        {"id": 24, "name": "N-Queens Problem", "description": "Classic backtracking example", "video_url": "https://www.youtube.com/watch?v=i05Ju7AftcM"},
        {"id": 25, "name": "Sudoku Solver", "description": "Constraint satisfaction", "video_url": "https://www.youtube.com/watch?v=F_0rF6-mlF8"},
    ],
    5: [
        {"id": 26, "name": "Binary Tree Basics", "description": "Nodes with left and right children", "video_url": "https://www.youtube.com/watch?v=ctCqH0K3h8U"},
        {"id": 27, "name": "Tree Traversals", "description": "Inorder, preorder, postorder, level-order", "video_url": "https://www.youtube.com/watch?v=jmy0LaGET1I"},
        {"id": 28, "name": "BST Operations", "description": "Insert, search, delete in BST", "video_url": "https://www.youtube.com/watch?v=KcNt6v_56cc"},
        {"id": 29, "name": "Height & Depth", "description": "Calculating tree dimensions", "video_url": "https://www.youtube.com/watch?v=eD3tmO66aBA"},
        {"id": 30, "name": "Lowest Common Ancestor", "description": "Finding LCA in trees", "video_url": "https://www.youtube.com/watch?v=_-QHfMDde90"},
        {"id": 31, "name": "Tree Construction", "description": "Build tree from traversals", "video_url": "https://www.youtube.com/watch?v=9GMECGQgWrQ"},
    ],
    6: [
        {"id": 32, "name": "Graph Representation", "description": "Adjacency list and matrix", "video_url": "https://www.youtube.com/watch?v=M3_pLsDdeuU"},
        {"id": 33, "name": "BFS", "description": "Breadth-first search traversal", "video_url": "https://www.youtube.com/watch?v=-tgVpUgsQ5k"},
        {"id": 34, "name": "DFS", "description": "Depth-first search traversal", "video_url": "https://www.youtube.com/watch?v=QZF1uGJo1ww"},
        {"id": 35, "name": "Connected Components", "description": "Finding connected parts", "video_url": "https://www.youtube.com/watch?v=lea-Wl_uWXY"},
        {"id": 36, "name": "Topological Sort", "description": "Ordering DAG nodes", "video_url": "https://www.youtube.com/watch?v=5lZ0iJMrUMk"},
        {"id": 37, "name": "Cycle Detection in Graphs", "description": "Detecting cycles using DFS", "video_url": "https://www.youtube.com/watch?v=zQ3zbubqQLY"},
        {"id": 38, "name": "Shortest Path Basics", "description": "BFS for unweighted graphs", "video_url": "https://www.youtube.com/watch?v=C4DIzPDp4ag"},
    ],
    7: [
        {"id": 39, "name": "Bubble & Selection Sort", "description": "Simple O(n²) algorithms", "video_url": "https://www.youtube.com/watch?v=HGk_8y2OqKc"},
        {"id": 40, "name": "Insertion Sort", "description": "Build sorted array one element at a time", "video_url": "https://www.youtube.com/watch?v=wXSndz0_qSM"},
        {"id": 41, "name": "Merge Sort", "description": "Divide and conquer, O(n log n)", "video_url": "https://www.youtube.com/watch?v=ogjf7ORKfd8"},
        {"id": 42, "name": "Quick Sort", "description": "Partition-based sorting", "video_url": "https://www.youtube.com/watch?v=WIrA4YexLRQ"},
        {"id": 43, "name": "Counting Sort", "description": "Non-comparison based sorting", "video_url": "https://www.youtube.com/watch?v=pEJiGC-ObQE"},
        {"id": 44, "name": "Heap Sort", "description": "Using heap data structure", "video_url": "https://www.youtube.com/watch?v=2DmK_H7IdTo"},
    ],
    8: [
        {"id": 45, "name": "DP Introduction", "description": "Memoization vs tabulation", "video_url": "https://www.youtube.com/watch?v=tyB0ztf0DNY"},
        {"id": 46, "name": "1D DP", "description": "Fibonacci, climbing stairs", "video_url": "https://www.youtube.com/watch?v=MnJXTVqHPrI"},
        {"id": 47, "name": "2D DP", "description": "Grid problems, LCS", "video_url": "https://www.youtube.com/watch?v=M5-Ew8tXUCk"},
        {"id": 48, "name": "Longest Common Subsequence", "description": "Classic 2D DP problem", "video_url": "https://www.youtube.com/watch?v=NPZn9jBrX8U"},
        {"id": 49, "name": "Longest Increasing Subsequence", "description": "1D DP with binary search optimization", "video_url": "https://www.youtube.com/watch?v=ekcwMsSIzYo"},
        {"id": 50, "name": "Knapsack Problems", "description": "0/1 and unbounded knapsack", "video_url": "https://www.youtube.com/watch?v=GqOmJHQZivw"},
        {"id": 51, "name": "DP on Strings", "description": "Edit distance, palindromic substrings", "video_url": "https://www.youtube.com/watch?v=XYi2-LPrwm4"},
    ],
}

from fastapi import Header

def get_optional_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current user from token if provided, otherwise return None"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    try:
        from jose import jwt
        from config import get_settings
        settings = get_settings()
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        if email:
            return db.query(User).filter(User.email == email).first()
    except:
        pass
    return None

@router.get("/{topic_id}")
async def get_subtopics(
    topic_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    """Get subtopics for a topic with completion status"""
    subtopics = DEFAULT_SUBTOPICS.get(topic_id, [])
    
    # Try to get user-specific completion status
    completed_ids = set()
    current_user = get_optional_user(authorization, db)
    
    if current_user:
        # Fetch user's completed subtopics for this topic
        subtopic_ids = [st["id"] for st in subtopics]
        completed_records = db.query(SubtopicProgress).filter(
            SubtopicProgress.user_id == current_user.id,
            SubtopicProgress.subtopic_id.in_(subtopic_ids),
            SubtopicProgress.completed == True
        ).all()
        completed_ids = {r.subtopic_id for r in completed_records}
    
    result = []
    for st in subtopics:
        result.append({
            **st,
            "completed": st["id"] in completed_ids
        })
    
    completed_count = sum(1 for st in result if st["completed"])
    
    return {
        "topic_id": topic_id,
        "subtopics": result,
        "total": len(result),
        "completed": completed_count,
        "progress": completed_count / len(result) if result else 0
    }

@router.post("/{subtopic_id}/complete")
async def toggle_subtopic_completion(
    subtopic_id: int,
    request: ToggleCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completion status of a subtopic"""
    # Find existing progress record
    progress = db.query(SubtopicProgress).filter(
        SubtopicProgress.user_id == current_user.id,
        SubtopicProgress.subtopic_id == subtopic_id
    ).first()
    
    if progress:
        progress.completed = request.completed
        progress.completed_at = datetime.utcnow() if request.completed else None
    else:
        progress = SubtopicProgress(
            user_id=current_user.id,
            subtopic_id=subtopic_id,
            completed=request.completed,
            completed_at=datetime.utcnow() if request.completed else None
        )
        db.add(progress)
    
    db.commit()
    
    # Find which topic this subtopic belongs to
    topic_id = None
    for tid, subtopics in DEFAULT_SUBTOPICS.items():
        if any(st["id"] == subtopic_id for st in subtopics):
            topic_id = tid
            break
    
    # Calculate if the topic is now fully completed
    topic_completed = False
    completed_count = 0
    total_count = 0
    
    if topic_id:
        topic_subtopics = DEFAULT_SUBTOPICS.get(topic_id, [])
        total_count = len(topic_subtopics)
        
        # Get all completed subtopics for this topic
        subtopic_ids = [st["id"] for st in topic_subtopics]
        completed_records = db.query(SubtopicProgress).filter(
            SubtopicProgress.user_id == current_user.id,
            SubtopicProgress.subtopic_id.in_(subtopic_ids),
            SubtopicProgress.completed == True
        ).all()
        completed_count = len(completed_records)
        topic_completed = completed_count == total_count and total_count > 0
    
    return {
        "subtopic_id": subtopic_id,
        "completed": request.completed,
        "message": "Subtopic marked as complete" if request.completed else "Subtopic marked as incomplete",
        "topic_id": topic_id,
        "topic_completed": topic_completed,
        "topic_progress": {
            "completed": completed_count,
            "total": total_count
        }
    }

@router.get("/user/progress")
async def get_user_subtopic_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all subtopic progress for current user"""
    progress = db.query(SubtopicProgress).filter(
        SubtopicProgress.user_id == current_user.id,
        SubtopicProgress.completed == True
    ).all()
    
    completed_by_topic = {}
    for p in progress:
        # Find which topic this subtopic belongs to
        for topic_id, subtopics in DEFAULT_SUBTOPICS.items():
            if any(st["id"] == p.subtopic_id for st in subtopics):
                if topic_id not in completed_by_topic:
                    completed_by_topic[topic_id] = []
                completed_by_topic[topic_id].append(p.subtopic_id)
                break
    
    # Calculate progress per topic
    topic_progress = {}
    for topic_id, subtopics in DEFAULT_SUBTOPICS.items():
        completed = len(completed_by_topic.get(topic_id, []))
        total = len(subtopics)
        topic_progress[topic_id] = {
            "completed": completed,
            "total": total,
            "progress": completed / total if total > 0 else 0
        }
    
    return {
        "completed_subtopic_ids": [p.subtopic_id for p in progress],
        "completed_by_topic": completed_by_topic,
        "topic_progress": topic_progress
    }

@router.post("/complete-all")
async def complete_all_subtopics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all subtopics as completed for the current user"""
    
    # Get all subtopic IDs flattened
    all_subtopic_ids = []
    for subtopics in DEFAULT_SUBTOPICS.values():
        for st in subtopics:
            all_subtopic_ids.append(st["id"])
            
    # Get existing progress
    existing_progress = db.query(SubtopicProgress).filter(
        SubtopicProgress.user_id == current_user.id
    ).all()
    
    existing_map = {p.subtopic_id: p for p in existing_progress}
    
    # Update or create progress records
    for st_id in all_subtopic_ids:
        if st_id in existing_map:
            existing_map[st_id].completed = True
            existing_map[st_id].completed_at = datetime.utcnow()
        else:
            new_progress = SubtopicProgress(
                user_id=current_user.id,
                subtopic_id=st_id,
                completed=True,
                completed_at=datetime.utcnow()
            )
            db.add(new_progress)
            
    db.commit()
    
    return {"success": True, "message": "All topics and subtopics marked as completed"}
