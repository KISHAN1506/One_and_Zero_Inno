from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
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
    skipped: List[int] = []

class SkipQuestionRequest(BaseModel):
    question_id: int

class SkipAllRequest(BaseModel):
    start_from_basics: bool = True

# Comprehensive sample questions - more questions per topic
SAMPLE_QUESTIONS = [
    # Arrays & Strings (Topic 1) - 5 questions
    {"id": 1, "topic_id": 1, "topic": "Arrays & Strings", "text": "What is the time complexity of accessing an element in an array by index?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct": 0, "difficulty": "easy"},
    {"id": 2, "topic_id": 1, "topic": "Arrays & Strings", "text": "Which technique is used to find pairs in a sorted array that sum to a target?", "options": ["Binary Search", "Two Pointers", "Sliding Window", "Recursion"], "correct": 1, "difficulty": "medium"},
    {"id": 3, "topic_id": 1, "topic": "Arrays & Strings", "text": "What is the sliding window technique best used for?", "options": ["Finding pairs", "Contiguous subarray problems", "Sorting", "Tree traversal"], "correct": 1, "difficulty": "medium"},
    {"id": 4, "topic_id": 1, "topic": "Arrays & Strings", "text": "What algorithm finds maximum subarray sum in O(n)?", "options": ["Merge Sort", "Quick Sort", "Kadane's Algorithm", "Two Pointers"], "correct": 2, "difficulty": "medium"},
    {"id": 5, "topic_id": 1, "topic": "Arrays & Strings", "text": "What is the space complexity of prefix sum array?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct": 1, "difficulty": "easy"},
    
    # Linked Lists (Topic 2) - 5 questions
    {"id": 6, "topic_id": 2, "topic": "Linked Lists", "text": "What is the time complexity of inserting at the head of a singly linked list?", "options": ["O(n)", "O(1)", "O(log n)", "O(n²)"], "correct": 1, "difficulty": "easy"},
    {"id": 7, "topic_id": 2, "topic": "Linked Lists", "text": "Which algorithm detects a cycle in a linked list in O(1) space?", "options": ["Hash Set", "Floyd's Cycle Detection", "BFS", "DFS"], "correct": 1, "difficulty": "medium"},
    {"id": 8, "topic_id": 2, "topic": "Linked Lists", "text": "How many pointers are typically needed to reverse a linked list iteratively?", "options": ["1", "2", "3", "4"], "correct": 2, "difficulty": "easy"},
    {"id": 9, "topic_id": 2, "topic": "Linked Lists", "text": "What is the time complexity of finding the middle of a linked list using fast/slow pointers?", "options": ["O(n)", "O(n/2)", "O(log n)", "O(1)"], "correct": 0, "difficulty": "medium"},
    {"id": 10, "topic_id": 2, "topic": "Linked Lists", "text": "In a doubly linked list, each node has how many pointers?", "options": ["1", "2", "3", "4"], "correct": 1, "difficulty": "easy"},
    
    # Stacks & Queues (Topic 3) - 5 questions
    {"id": 11, "topic_id": 3, "topic": "Stacks & Queues", "text": "Which data structure is used to implement function calls in recursion?", "options": ["Queue", "Stack", "Array", "Tree"], "correct": 1, "difficulty": "easy"},
    {"id": 12, "topic_id": 3, "topic": "Stacks & Queues", "text": "What is the output of pushing 1, 2, 3 and then popping twice from a stack?", "options": ["1, 2", "3, 2", "2, 3", "1, 3"], "correct": 1, "difficulty": "easy"},
    {"id": 13, "topic_id": 3, "topic": "Stacks & Queues", "text": "Monotonic stack is used to find?", "options": ["Minimum element", "Next greater element", "Sorted order", "Middle element"], "correct": 1, "difficulty": "medium"},
    {"id": 14, "topic_id": 3, "topic": "Stacks & Queues", "text": "Which data structure follows FIFO principle?", "options": ["Stack", "Queue", "Tree", "Graph"], "correct": 1, "difficulty": "easy"},
    {"id": 15, "topic_id": 3, "topic": "Stacks & Queues", "text": "What problem can be solved using a stack?", "options": ["Shortest path", "Balanced parentheses", "Sorting", "Finding median"], "correct": 1, "difficulty": "easy"},
    
    # Recursion & Backtracking (Topic 4) - 5 questions
    {"id": 16, "topic_id": 4, "topic": "Recursion & Backtracking", "text": "What is the base case in calculating factorial recursively?", "options": ["n == 1", "n == 0 or n == 1", "n < 0", "No base case needed"], "correct": 1, "difficulty": "easy"},
    {"id": 17, "topic_id": 4, "topic": "Recursion & Backtracking", "text": "What is the time complexity of recursive Fibonacci without memoization?", "options": ["O(n)", "O(n²)", "O(2^n)", "O(log n)"], "correct": 2, "difficulty": "medium"},
    {"id": 18, "topic_id": 4, "topic": "Recursion & Backtracking", "text": "In backtracking, what do we do after exploring a path?", "options": ["Continue forward", "Undo the choice", "Start over", "Skip it"], "correct": 1, "difficulty": "medium"},
    {"id": 19, "topic_id": 4, "topic": "Recursion & Backtracking", "text": "How many subsets does a set of n elements have?", "options": ["n", "n²", "2^n", "n!"], "correct": 2, "difficulty": "medium"},
    {"id": 20, "topic_id": 4, "topic": "Recursion & Backtracking", "text": "N-Queens problem is solved using which technique?", "options": ["Dynamic Programming", "Greedy", "Backtracking", "Divide and Conquer"], "correct": 2, "difficulty": "medium"},
    
    # Trees & BST (Topic 5) - 5 questions
    {"id": 21, "topic_id": 5, "topic": "Trees & BST", "text": "In a Binary Search Tree, where are smaller elements stored?", "options": ["Right subtree", "Left subtree", "Root", "Anywhere"], "correct": 1, "difficulty": "easy"},
    {"id": 22, "topic_id": 5, "topic": "Trees & BST", "text": "Which traversal gives sorted order for a BST?", "options": ["Preorder", "Inorder", "Postorder", "Level order"], "correct": 1, "difficulty": "easy"},
    {"id": 23, "topic_id": 5, "topic": "Trees & BST", "text": "What is the time complexity of search in a balanced BST?", "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"], "correct": 1, "difficulty": "medium"},
    {"id": 24, "topic_id": 5, "topic": "Trees & BST", "text": "Level order traversal uses which data structure?", "options": ["Stack", "Queue", "Array", "Linked List"], "correct": 1, "difficulty": "easy"},
    {"id": 25, "topic_id": 5, "topic": "Trees & BST", "text": "What is the height of a tree with only root node?", "options": ["0", "1", "-1", "Undefined"], "correct": 0, "difficulty": "easy"},
    
    # Graphs (Topic 6) - 5 questions
    {"id": 26, "topic_id": 6, "topic": "Graphs", "text": "Which algorithm is used for shortest path in an unweighted graph?", "options": ["DFS", "BFS", "Dijkstra", "Bellman-Ford"], "correct": 1, "difficulty": "medium"},
    {"id": 27, "topic_id": 6, "topic": "Graphs", "text": "What is the space complexity of adjacency matrix?", "options": ["O(V)", "O(E)", "O(V²)", "O(V+E)"], "correct": 2, "difficulty": "medium"},
    {"id": 28, "topic_id": 6, "topic": "Graphs", "text": "Which traversal can detect cycles in a directed graph?", "options": ["BFS only", "DFS only", "Both BFS and DFS", "Neither"], "correct": 2, "difficulty": "medium"},
    {"id": 29, "topic_id": 6, "topic": "Graphs", "text": "Topological sort is applicable to?", "options": ["Any graph", "DAG only", "Cyclic graphs", "Trees only"], "correct": 1, "difficulty": "medium"},
    {"id": 30, "topic_id": 6, "topic": "Graphs", "text": "BFS uses which data structure?", "options": ["Stack", "Queue", "Priority Queue", "Deque"], "correct": 1, "difficulty": "easy"},
    
    # Sorting (Topic 7) - 5 questions
    {"id": 31, "topic_id": 7, "topic": "Sorting", "text": "What is the average time complexity of Quick Sort?", "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "correct": 1, "difficulty": "easy"},
    {"id": 32, "topic_id": 7, "topic": "Sorting", "text": "Which sorting algorithm is stable?", "options": ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], "correct": 2, "difficulty": "medium"},
    {"id": 33, "topic_id": 7, "topic": "Sorting", "text": "What is the space complexity of Merge Sort?", "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"], "correct": 2, "difficulty": "medium"},
    {"id": 34, "topic_id": 7, "topic": "Sorting", "text": "Which sorting algorithm has worst case O(n²)?", "options": ["Merge Sort", "Heap Sort", "Quick Sort", "Counting Sort"], "correct": 2, "difficulty": "medium"},
    {"id": 35, "topic_id": 7, "topic": "Sorting", "text": "Counting Sort works best when?", "options": ["Data is random", "Range of values is small", "Data is large", "Data is sorted"], "correct": 1, "difficulty": "medium"},
    
    # Dynamic Programming (Topic 8) - 5 questions
    {"id": 36, "topic_id": 8, "topic": "Dynamic Programming", "text": "DP is recursion plus?", "options": ["Iteration", "Memoization", "Sorting", "Hashing"], "correct": 1, "difficulty": "easy"},
    {"id": 37, "topic_id": 8, "topic": "Dynamic Programming", "text": "What are the two approaches to DP?", "options": ["BFS and DFS", "Top-down and Bottom-up", "Greedy and Brute force", "Recursive and Iterative"], "correct": 1, "difficulty": "easy"},
    {"id": 38, "topic_id": 8, "topic": "Dynamic Programming", "text": "LCS stands for?", "options": ["Longest Common Substring", "Longest Common Subsequence", "Least Common Subsequence", "Linear Common Sequence"], "correct": 1, "difficulty": "easy"},
    {"id": 39, "topic_id": 8, "topic": "Dynamic Programming", "text": "What is the time complexity of LCS using DP?", "options": ["O(n)", "O(n²)", "O(mn)", "O(2^n)"], "correct": 2, "difficulty": "medium"},
    {"id": 40, "topic_id": 8, "topic": "Dynamic Programming", "text": "0/1 Knapsack can be solved using?", "options": ["Greedy", "DP", "Divide and Conquer", "Both Greedy and DP"], "correct": 1, "difficulty": "medium"},
]

@router.get("/diagnostic")
async def get_diagnostic(topic_ids: Optional[str] = None):
    """Get diagnostic questions. Optionally filter by topic IDs (comma-separated)."""
    questions = SAMPLE_QUESTIONS.copy()
    
    if topic_ids:
        ids = [int(x.strip()) for x in topic_ids.split(",")]
        questions = [q for q in questions if q["topic_id"] in ids]
    
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
        "can_skip": True  # Indicates skip is available
    }

@router.post("/submit")
async def submit_assessment(submit_data: SubmitRequest, db: Session = Depends(get_db)):
    answers = submit_data.answers
    skipped_ids = submit_data.skipped
    topic_scores = {}
    skipped_count = 0
    
    for q in SAMPLE_QUESTIONS:
        qid = str(q["id"])
        topic = q["topic"]
        
        if topic not in topic_scores:
            topic_scores[topic] = {"correct": 0, "total": 0, "skipped": 0}
        
        if q["id"] in skipped_ids:
            topic_scores[topic]["skipped"] += 1
            skipped_count += 1
        elif qid in answers:
            is_correct = answers[qid] == q["correct"]
            topic_scores[topic]["total"] += 1
            if is_correct:
                topic_scores[topic]["correct"] += 1
    
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
    
    return {
        "overallScore": overall, 
        "topicMastery": topic_mastery,
        "totalQuestions": len(SAMPLE_QUESTIONS),
        "answered": total_answered,
        "skipped": skipped_count
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
        "total": len(questions),
        "can_skip": True
    }
