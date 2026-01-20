from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    topic_id: int = None

RESPONSES = {
    "array": {"response": "Arrays are contiguous memory blocks with O(1) index access. Key patterns: Two Pointers, Sliding Window. For sorted arrays, use binary search for O(log n) lookups.", "sources": ["Arrays Notes", "Two Pointers Guide"]},
    "linked list": {"response": "Linked Lists use nodes with pointers. Insert at head O(1), search O(n). Common: cycle detection (Floyd's), reversal, merge two lists.", "sources": ["Linked Lists Guide"]},
    "stack": {"response": "Stacks follow LIFO. Used in recursion, expression evaluation, monotonic stack problems. Push/pop are O(1).", "sources": ["Stacks & Queues Notes"]},
    "queue": {"response": "Queues follow FIFO. Used in BFS, level-order traversal, task scheduling. Enqueue/dequeue are O(1).", "sources": ["Stacks & Queues Notes"]},
    "tree": {"response": "Trees are hierarchical. BST property: left < root < right. Traversals: inorder, preorder, postorder (DFS), level-order (BFS).", "sources": ["Trees & BST Notes"]},
    "graph": {"response": "Graphs have vertices and edges. BFS for shortest unweighted path. DFS for exploration. Track visited nodes.", "sources": ["Graphs Guide"]},
    "recursion": {"response": "Recursion needs base case + recursive case. Ask: 1) Smallest input? 2) How does smaller solution help?", "sources": ["Recursion Notes"]},
    "dp": {"response": "DP = Recursion + Memoization. Identify overlapping subproblems. Patterns: 1D (stairs), 2D (grid paths).", "sources": ["DP Fundamentals"]},
    "dynamic programming": {"response": "DP = Recursion + Memoization. Identify overlapping subproblems. Patterns: 1D (stairs), 2D (grid paths).", "sources": ["DP Fundamentals"]},
    "sort": {"response": "Merge Sort: O(n log n), stable. Quick Sort: O(n log n) avg, in-place. Insertion Sort for nearly sorted.", "sources": ["Sorting Notes"]},
    "two pointer": {"response": "Two Pointers: Use for sorted arrays. Start left=0, right=n-1. Move based on comparison with target.", "sources": ["Arrays Notes"]},
    "sliding window": {"response": "Sliding Window: For contiguous subarrays with constraints. Expand right, shrink left when constraint violated.", "sources": ["Arrays Notes"]},
}

@router.post("")
async def chat(request: ChatRequest):
    msg = request.message.lower()
    for key, resp in RESPONSES.items():
        if key in msg:
            return resp
    return {"response": "Great question! Check the resources section for detailed explanations on this topic. The curated videos and notes will help clarify the concept.", "sources": ["Learning Resources"]}
