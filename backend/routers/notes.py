from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import UserNote, User
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/notes", tags=["notes"])

class NoteCreate(BaseModel):
    topic_id: int
    content: str

class NoteUpdate(BaseModel):
    content: str

# Topic summaries (auto-generated notes)
TOPIC_SUMMARIES = {
    1: """## Arrays & Strings - Summary

**Key Concepts:**
- Arrays provide O(1) access by index
- Strings are immutable in most languages

**Important Techniques:**
1. **Two Pointers**: Use for sorted arrays, finding pairs
2. **Sliding Window**: Fixed/variable size for subarray problems
3. **Prefix Sum**: Precompute cumulative sums for range queries
4. **Kadane's Algorithm**: Maximum subarray sum in O(n)

**Common Patterns:**
- Reverse in-place using two pointers
- Use hashmap for O(1) lookups
- Sliding window for "at most K" problems""",

    2: """## Linked Lists - Summary

**Key Concepts:**
- Nodes contain data + pointer(s)
- No random access, must traverse

**Operations Complexity:**
| Operation | Singly LL | Doubly LL |
|-----------|-----------|-----------|
| Insert head | O(1) | O(1) |
| Insert tail | O(n) | O(1) |
| Delete | O(n) | O(1) |
| Search | O(n) | O(n) |

**Important Algorithms:**
- Floyd's Cycle Detection (fast/slow pointers)
- Reversal using 3 pointers""",

    3: """## Stacks & Queues - Summary

**Stack (LIFO):**
- Push, Pop, Peek: O(1)
- Use cases: Function calls, undo, balanced parentheses

**Queue (FIFO):**
- Enqueue, Dequeue: O(1)
- Use cases: BFS, task scheduling

**Advanced:**
- Monotonic Stack: Next greater element
- Deque: Double-ended operations
- Priority Queue: Min/max element access""",

    4: """## Recursion & Backtracking - Summary

**Recursion Rules:**
1. Always define base case first
2. Trust the recursive call
3. Consider the smallest input

**Backtracking Template:**
```
def backtrack(choices):
    if goal_reached:
        record_solution()
        return
    for choice in choices:
        make_choice()
        backtrack(remaining)
        undo_choice()  # backtrack
```

**Common Problems:** Subsets, Permutations, N-Queens""",

    5: """## Trees & BST - Summary

**Binary Search Tree Property:**
- Left subtree < Root < Right subtree
- Inorder traversal gives sorted order

**Traversals:**
- Preorder: Root, Left, Right (copy tree)
- Inorder: Left, Root, Right (sorted)
- Postorder: Left, Right, Root (delete)
- Level-order: BFS with queue

**Time Complexity:** O(h) for balanced, O(n) worst case""",

    6: """## Graphs - Summary

**Representations:**
- Adjacency List: O(V+E) space, good for sparse
- Adjacency Matrix: O(V²) space, good for dense

**Traversals:**
- BFS: Queue, level-by-level, shortest path unweighted
- DFS: Stack/recursion, explore deeply first

**Key Algorithms:**
- Topological Sort (DAG only)
- Cycle Detection (using colors or visited set)
- Connected Components""",

    7: """## Sorting Algorithms - Summary

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

**Non-comparison:** Counting Sort O(n+k) when range is small""",

    8: """## Dynamic Programming - Summary

**When to use DP:**
1. Optimal substructure
2. Overlapping subproblems

**Approaches:**
- Top-down: Recursion + Memoization
- Bottom-up: Iterative with table

**Classic Problems:**
- Fibonacci, Climbing Stairs (1D)
- LCS, Edit Distance (2D)
- Knapsack (0/1 and unbounded)
- LIS with binary search optimization"""
}

@router.get("/topic/{topic_id}")
async def get_notes_for_topic(
    topic_id: int, 
    db: Session = Depends(get_db)
):
    """Get topic summary and user's custom notes"""
    summary = TOPIC_SUMMARIES.get(topic_id, "No summary available for this topic.")
    
    # User notes require authentication - returning empty for now
    # Frontend should use authenticated endpoints for user-specific notes
    user_notes = []
    
    return {
        "topic_id": topic_id,
        "summary": summary,
        "user_notes": user_notes
    }

@router.post("")
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new user note for a topic"""
    note = UserNote(
        user_id=current_user.id,
        topic_id=note_data.topic_id,
        content=note_data.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "topic_id": note.topic_id,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }

@router.put("/{note_id}")
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing user note"""
    note = db.query(UserNote).filter(
        UserNote.id == note_id,
        UserNote.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note.content = note_data.content
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "topic_id": note.topic_id,
        "content": note.content,
        "updated_at": note.updated_at.isoformat()
    }

@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user note"""
    note = db.query(UserNote).filter(
        UserNote.id == note_id,
        UserNote.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    return {"success": True, "message": "Note deleted"}
