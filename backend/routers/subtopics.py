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
        {"id": 1, "name": "Array Basics", "description": "Declaration, initialization, indexing"},
        {"id": 2, "name": "Two Pointers", "description": "Technique for sorted array problems"},
        {"id": 3, "name": "Sliding Window", "description": "Fixed and variable size window problems"},
        {"id": 4, "name": "Prefix Sum", "description": "Cumulative sum for range queries"},
        {"id": 5, "name": "Kadane's Algorithm", "description": "Maximum subarray sum"},
        {"id": 6, "name": "String Manipulation", "description": "Substrings, palindromes, anagrams"},
        {"id": 7, "name": "Hashing in Arrays", "description": "Using hashmaps for O(1) lookups"},
    ],
    2: [
        {"id": 8, "name": "Singly Linked List", "description": "Basic node and next pointer"},
        {"id": 9, "name": "Doubly Linked List", "description": "Nodes with prev and next pointers"},
        {"id": 10, "name": "Cycle Detection", "description": "Floyd's Tortoise and Hare algorithm"},
        {"id": 11, "name": "List Reversal", "description": "Iterative and recursive reversal"},
        {"id": 12, "name": "Fast & Slow Pointers", "description": "Finding middle, detecting cycles"},
        {"id": 13, "name": "Merge Lists", "description": "Merging sorted linked lists"},
    ],
    3: [
        {"id": 14, "name": "Stack Basics", "description": "Push, pop, peek operations"},
        {"id": 15, "name": "Monotonic Stack", "description": "Next greater/smaller element"},
        {"id": 16, "name": "Queue Basics", "description": "Enqueue, dequeue operations"},
        {"id": 17, "name": "Deque", "description": "Double-ended queue operations"},
        {"id": 18, "name": "Priority Queue Intro", "description": "Heap-based priority operations"},
        {"id": 19, "name": "Stack Applications", "description": "Balanced parentheses, expression evaluation"},
    ],
    4: [
        {"id": 20, "name": "Recursion Basics", "description": "Base case, recursive case"},
        {"id": 21, "name": "Recursion Tree", "description": "Visualizing recursive calls"},
        {"id": 22, "name": "Backtracking", "description": "Explore and undo approach"},
        {"id": 23, "name": "Subsets & Permutations", "description": "Generating all combinations"},
        {"id": 24, "name": "N-Queens Problem", "description": "Classic backtracking example"},
        {"id": 25, "name": "Sudoku Solver", "description": "Constraint satisfaction"},
    ],
    5: [
        {"id": 26, "name": "Binary Tree Basics", "description": "Nodes with left and right children"},
        {"id": 27, "name": "Tree Traversals", "description": "Inorder, preorder, postorder, level-order"},
        {"id": 28, "name": "BST Operations", "description": "Insert, search, delete in BST"},
        {"id": 29, "name": "Height & Depth", "description": "Calculating tree dimensions"},
        {"id": 30, "name": "Lowest Common Ancestor", "description": "Finding LCA in trees"},
        {"id": 31, "name": "Tree Construction", "description": "Build tree from traversals"},
    ],
    6: [
        {"id": 32, "name": "Graph Representation", "description": "Adjacency list and matrix"},
        {"id": 33, "name": "BFS", "description": "Breadth-first search traversal"},
        {"id": 34, "name": "DFS", "description": "Depth-first search traversal"},
        {"id": 35, "name": "Connected Components", "description": "Finding connected parts"},
        {"id": 36, "name": "Topological Sort", "description": "Ordering DAG nodes"},
        {"id": 37, "name": "Cycle Detection in Graphs", "description": "Detecting cycles using DFS"},
        {"id": 38, "name": "Shortest Path Basics", "description": "BFS for unweighted graphs"},
    ],
    7: [
        {"id": 39, "name": "Bubble & Selection Sort", "description": "Simple O(n²) algorithms"},
        {"id": 40, "name": "Insertion Sort", "description": "Build sorted array one element at a time"},
        {"id": 41, "name": "Merge Sort", "description": "Divide and conquer, O(n log n)"},
        {"id": 42, "name": "Quick Sort", "description": "Partition-based sorting"},
        {"id": 43, "name": "Counting Sort", "description": "Non-comparison based sorting"},
        {"id": 44, "name": "Heap Sort", "description": "Using heap data structure"},
    ],
    8: [
        {"id": 45, "name": "DP Introduction", "description": "Memoization vs tabulation"},
        {"id": 46, "name": "1D DP", "description": "Fibonacci, climbing stairs"},
        {"id": 47, "name": "2D DP", "description": "Grid problems, LCS"},
        {"id": 48, "name": "Longest Common Subsequence", "description": "Classic 2D DP problem"},
        {"id": 49, "name": "Longest Increasing Subsequence", "description": "1D DP with binary search optimization"},
        {"id": 50, "name": "Knapsack Problems", "description": "0/1 and unbounded knapsack"},
        {"id": 51, "name": "DP on Strings", "description": "Edit distance, palindromic substrings"},
    ],
}

@router.get("/{topic_id}")
async def get_subtopics(
    topic_id: int,
    db: Session = Depends(get_db)
):
    """Get subtopics for a topic with completion status"""
    subtopics = DEFAULT_SUBTOPICS.get(topic_id, [])
    
    # Completion status requires authentication - returning all as incomplete for public view
    # Frontend should use authenticated endpoints for user-specific progress
    completed_ids = set()
    
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
    
    return {
        "subtopic_id": subtopic_id,
        "completed": request.completed,
        "message": "Subtopic marked as complete" if request.completed else "Subtopic marked as incomplete"
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
    
    return {
        "completed_subtopics": [p.subtopic_id for p in progress],
        "by_topic": completed_by_topic
    }
