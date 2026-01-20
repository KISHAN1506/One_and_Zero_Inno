from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import UserNote
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/resources", tags=["resources"])

# Sample resources with multilingual support (English and Hindi videos)
SAMPLE_RESOURCES = {
    1: {
        "topic": {"id": 1, "name": "Arrays & Strings", "description": "Master array fundamentals"},
        "videos": [
            {"id": 1, "title": "Arrays Complete Guide", "title_hi": "Arrays पूरी गाइड", "url": "https://www.youtube.com/embed/QJNwK2uJyGs", "url_hi": "https://www.youtube.com/embed/n60Dn0UsbEk", "duration": "15:30", "language": "en"},
            {"id": 2, "title": "Two Pointers Technique", "title_hi": "Two Pointers तकनीक", "url": "https://www.youtube.com/embed/On03HWe2tZM", "url_hi": "https://www.youtube.com/embed/2wVjt3yhGwg", "duration": "12:45", "language": "en"},
            {"id": 3, "title": "Sliding Window Explained", "title_hi": "Sliding Window समझाया", "url": "https://www.youtube.com/embed/GcW4mgmgSbw", "url_hi": "https://www.youtube.com/embed/EHCGAZBbB88", "duration": "18:00", "language": "en"},
        ],
        "notes": [{"id": 1, "title": "Arrays Fundamentals", "content": "## Arrays\n\nO(1) access by index.\n\n### Two Pointers\nFor sorted arrays, finding pairs.\n\n### Sliding Window\nFor contiguous subarrays.\n\n### Kadane's Algorithm\nMax subarray sum in O(n)."}],
        "summary": "Arrays are contiguous memory blocks with O(1) index access. Key techniques: Two Pointers for sorted arrays, Sliding Window for subarray problems, and Kadane's Algorithm for maximum subarray sum.",
    },
    2: {
        "topic": {"id": 2, "name": "Linked Lists", "description": "Dynamic data structures"},
        "videos": [
            {"id": 4, "title": "Linked List Basics", "title_hi": "Linked List मूल बातें", "url": "https://www.youtube.com/embed/N6dOwBde7-M", "url_hi": "https://www.youtube.com/embed/oAja8-Ulz6o", "duration": "18:00", "language": "en"},
            {"id": 5, "title": "Cycle Detection - Floyd's Algorithm", "title_hi": "Cycle Detection - Floyd's एल्गोरिदम", "url": "https://www.youtube.com/embed/gBTe7lFR3vc", "url_hi": "https://www.youtube.com/embed/354J83hX7RI", "duration": "14:20", "language": "en"},
        ],
        "notes": [{"id": 2, "title": "Linked Lists Guide", "content": "## Linked Lists\n\nNodes with pointers.\n\n### Operations\nInsert at head O(1), search O(n).\n\n### Floyd's Algorithm\nFast and slow pointers for cycle detection."}],
        "summary": "Linked lists use nodes with pointers. Insert at head is O(1). Floyd's Cycle Detection uses fast/slow pointers to detect cycles in O(1) space.",
    },
    3: {
        "topic": {"id": 3, "name": "Stacks & Queues", "description": "LIFO and FIFO structures"},
        "videos": [
            {"id": 6, "title": "Stack Data Structure", "title_hi": "Stack डेटा संरचना", "url": "https://www.youtube.com/embed/I37kGX-nZEI", "url_hi": "https://www.youtube.com/embed/GYptUgnIM_I", "duration": "12:00", "language": "en"},
            {"id": 7, "title": "Queue Implementation", "title_hi": "Queue कार्यान्वयन", "url": "https://www.youtube.com/embed/zp6pBNbUB2U", "url_hi": "https://www.youtube.com/embed/M6GnoUDpqEE", "duration": "15:00", "language": "en"},
        ],
        "notes": [{"id": 3, "title": "Stacks & Queues", "content": "## Stack (LIFO)\nPush, pop, peek operations.\nUsed for function calls, balanced parentheses.\n\n## Queue (FIFO)\nEnqueue, dequeue operations.\nUsed for BFS, task scheduling."}],
        "summary": "Stack follows LIFO (Last In First Out), used for function calls and parentheses matching. Queue follows FIFO (First In First Out), used for BFS and scheduling.",
    },
    4: {
        "topic": {"id": 4, "name": "Recursion & Backtracking", "description": "Self-referential problem solving"},
        "videos": [
            {"id": 8, "title": "Recursion Fundamentals", "title_hi": "Recursion मूल बातें", "url": "https://www.youtube.com/embed/IJDJ0kBx2LM", "url_hi": "https://www.youtube.com/embed/M2uO2nMT0Bk", "duration": "20:00", "language": "en"},
            {"id": 9, "title": "Backtracking Explained", "title_hi": "Backtracking समझाया", "url": "https://www.youtube.com/embed/DKCbsiDBN6c", "url_hi": "https://www.youtube.com/embed/zg5v2rlV1tM", "duration": "18:30", "language": "en"},
        ],
        "notes": [{"id": 4, "title": "Recursion Guide", "content": "## Recursion\nDefine base case first!\nTrust the recursion.\n\n## Backtracking\n1. Make a choice\n2. Recurse\n3. Undo the choice"}],
        "summary": "Recursion solves problems by calling itself with smaller inputs. Always define base case. Backtracking explores choices, recurses, then undoes the choice if it doesn't work.",
    },
    5: {
        "topic": {"id": 5, "name": "Trees & BST", "description": "Hierarchical structures"},
        "videos": [
            {"id": 10, "title": "Binary Tree Basics", "title_hi": "Binary Tree मूल बातें", "url": "https://www.youtube.com/embed/oSWTXtMglKE", "url_hi": "https://www.youtube.com/embed/5cU1ILGy6dM", "duration": "16:00", "language": "en"},
            {"id": 11, "title": "BST Operations", "title_hi": "BST ऑपरेशन", "url": "https://www.youtube.com/embed/pYT9F8_LFTM", "url_hi": "https://www.youtube.com/embed/cySVml6e_Fc", "duration": "20:00", "language": "en"},
        ],
        "notes": [{"id": 5, "title": "Trees Guide", "content": "## Binary Trees\nEach node has at most 2 children.\n\n## BST Property\nLeft < Root < Right\n\n## Traversals\n- Inorder: Left, Root, Right\n- Preorder: Root, Left, Right\n- Level-order: BFS with queue"}],
        "summary": "Binary Search Tree maintains left < root < right property. Inorder traversal gives sorted order. Search/insert/delete are O(h) where h is height.",
    },
    6: {
        "topic": {"id": 6, "name": "Graphs", "description": "Networks of nodes"},
        "videos": [
            {"id": 12, "title": "Graph Representations", "title_hi": "Graph प्रतिनिधित्व", "url": "https://www.youtube.com/embed/pcKY4hjDrxk", "url_hi": "https://www.youtube.com/embed/bIQV8aPDPaY", "duration": "14:00", "language": "en"},
            {"id": 13, "title": "BFS and DFS", "title_hi": "BFS और DFS", "url": "https://www.youtube.com/embed/oDqjPvD54Ss", "url_hi": "https://www.youtube.com/embed/M3_pLsDdeuU", "duration": "22:00", "language": "en"},
        ],
        "notes": [{"id": 6, "title": "Graphs Guide", "content": "## Representations\n- Adjacency List: O(V+E) space\n- Adjacency Matrix: O(V²) space\n\n## Traversals\n- BFS: Uses queue, shortest path in unweighted\n- DFS: Uses stack/recursion, cycle detection"}],
        "summary": "Graphs can be represented as adjacency list (good for sparse) or matrix (good for dense). BFS finds shortest path in unweighted graphs. DFS is used for cycle detection and topological sort.",
    },
    7: {
        "topic": {"id": 7, "name": "Sorting Algorithms", "description": "Ordering data efficiently"},
        "videos": [
            {"id": 14, "title": "Merge Sort Explained", "title_hi": "Merge Sort समझाया", "url": "https://www.youtube.com/embed/JSceec-wEyw", "url_hi": "https://www.youtube.com/embed/HGk_8y2OqKc", "duration": "16:00", "language": "en"},
            {"id": 15, "title": "Quick Sort Algorithm", "title_hi": "Quick Sort एल्गोरिदम", "url": "https://www.youtube.com/embed/QN9hnmAgmOc", "url_hi": "https://www.youtube.com/embed/7h1s2SojIRw", "duration": "18:00", "language": "en"},
        ],
        "notes": [{"id": 7, "title": "Sorting Guide", "content": "## Comparison Based\n| Algo | Time | Space | Stable |\n|------|------|-------|--------|\n| Merge | O(n log n) | O(n) | Yes |\n| Quick | O(n log n) | O(log n) | No |\n\n## Non-comparison\nCounting Sort: O(n+k)"}],
        "summary": "Merge Sort is O(n log n) and stable. Quick Sort is O(n log n) average but O(n²) worst case. Counting Sort is O(n+k) when range is small.",
    },
    8: {
        "topic": {"id": 8, "name": "Dynamic Programming", "description": "Overlapping subproblems"},
        "videos": [
            {"id": 16, "title": "DP Introduction", "title_hi": "DP परिचय", "url": "https://www.youtube.com/embed/nqowUJzG-iM", "url_hi": "https://www.youtube.com/embed/tyB0ztf0DNY", "duration": "25:00", "language": "en"},
            {"id": 17, "title": "Classic DP Problems", "title_hi": "क्लासिक DP समस्याएं", "url": "https://www.youtube.com/embed/oBt53YbR9Kk", "url_hi": "https://www.youtube.com/embed/WbwP4w6TpCk", "duration": "30:00", "language": "en"},
        ],
        "notes": [{"id": 8, "title": "DP Guide", "content": "## When to use DP?\n1. Optimal substructure\n2. Overlapping subproblems\n\n## Approaches\n- Top-down: Recursion + Memoization\n- Bottom-up: Iterative tabulation\n\n## Classic: Fibonacci, LCS, LIS, Knapsack"}],
        "summary": "Use DP when problem has optimal substructure and overlapping subproblems. Top-down uses recursion with memoization. Bottom-up uses iterative tabulation.",
    },
}

from routers.subtopics import DEFAULT_SUBTOPICS

@router.get("/topic/{topic_id}")
async def get_resources_by_topic(topic_id: int, language: str = "en", db: Session = Depends(get_db)):
    if topic_id in SAMPLE_RESOURCES:
        resource = SAMPLE_RESOURCES[topic_id].copy()
        
        # Get videos from subtopics
        subtopics = DEFAULT_SUBTOPICS.get(topic_id, [])
        videos = []
        
        # Add videos from subtopics
        for st in subtopics:
            if "video_url" in st:
                # Convert regular YouTube watch URLs to embed URLs if needed
                url = st["video_url"]
                if "watch?v=" in url:
                    url = url.replace("watch?v=", "embed/")
                
                videos.append({
                    "id": st["id"],
                    "title": st["name"],
                    "url": url,
                    "duration": "15:00", # Placeholder duration
                    "completed": False
                })
        
        # If no subtopic videos, fall back to sample videos (compatibility)
        if not videos:
            for v in resource.get("videos", []):
                video = v.copy()
                if language == "hi":
                    video["title"] = v.get("title_hi", v["title"])
                    video["url"] = v.get("url_hi", v["url"])
                videos.append({
                    "id": video["id"],
                    "title": video["title"],
                    "url": video["url"],
                    "duration": video.get("duration", ""),
                    "completed": False
                })
        
        resource["videos"] = videos
        return resource
    
    return {"topic": {"id": topic_id, "name": "Topic"}, "videos": [], "notes": [], "summary": "", "problems": []}
