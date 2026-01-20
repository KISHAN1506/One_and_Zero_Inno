from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models import Topic

router = APIRouter(prefix="/api/topics", tags=["topics"])

class SubtopicItem(BaseModel):
    id: int
    name: str
    description: str | None = None

class TopicResponse(BaseModel):
    id: int
    name: str
    description: str
    order: int
    prerequisites: List[int]
    subtopics: List[SubtopicItem]
    summary_notes: str | None = None

# Comprehensive DSA Topics with full subtopics
DEFAULT_TOPICS = [
    {
        "id": 1, 
        "name": "Arrays & Strings", 
        "description": "Foundation of DSA - contiguous memory, indexing, string manipulation", 
        "order": 1, 
        "prerequisites": [], 
        "subtopics": [
            {"id": 1, "name": "Array Basics", "description": "Declaration, initialization, indexing"},
            {"id": 2, "name": "Two Pointers", "description": "Technique for sorted array problems"},
            {"id": 3, "name": "Sliding Window", "description": "Fixed and variable size window problems"},
            {"id": 4, "name": "Prefix Sum", "description": "Cumulative sum for range queries"},
            {"id": 5, "name": "Kadane's Algorithm", "description": "Maximum subarray sum"},
            {"id": 6, "name": "String Manipulation", "description": "Substrings, palindromes, anagrams"},
            {"id": 7, "name": "Hashing in Arrays", "description": "Using hashmaps for O(1) lookups"},
        ],
        "summary_notes": "## Arrays & Strings\n\nArrays provide O(1) access by index and O(n) search.\n\n### Key Techniques\n- **Two Pointers**: Use for sorted arrays, pairs, triplets\n- **Sliding Window**: Contiguous subarray problems\n- **Prefix Sum**: Range sum queries in O(1)\n- **Kadane's Algorithm**: Maximum subarray in O(n)"
    },
    {
        "id": 2, 
        "name": "Linked Lists", 
        "description": "Dynamic data structures with node-based storage", 
        "order": 2, 
        "prerequisites": [1], 
        "subtopics": [
            {"id": 8, "name": "Singly Linked List", "description": "Basic node and next pointer"},
            {"id": 9, "name": "Doubly Linked List", "description": "Nodes with prev and next pointers"},
            {"id": 10, "name": "Cycle Detection", "description": "Floyd's Tortoise and Hare algorithm"},
            {"id": 11, "name": "List Reversal", "description": "Iterative and recursive reversal"},
            {"id": 12, "name": "Fast & Slow Pointers", "description": "Finding middle, detecting cycles"},
            {"id": 13, "name": "Merge Lists", "description": "Merging sorted linked lists"},
        ],
        "summary_notes": "## Linked Lists\n\nLinked lists use nodes with pointers for dynamic size.\n\n### Operations\n- Insert at head: O(1)\n- Insert at tail: O(n) or O(1) with tail pointer\n- Search: O(n)\n\n### Key Algorithms\n- **Floyd's Cycle Detection**: Fast and slow pointers\n- **Reversal**: Iterative uses 3 pointers"
    },
    {
        "id": 3, 
        "name": "Stacks & Queues", 
        "description": "LIFO and FIFO data structures for ordered operations", 
        "order": 3, 
        "prerequisites": [1, 2], 
        "subtopics": [
            {"id": 14, "name": "Stack Basics", "description": "Push, pop, peek operations"},
            {"id": 15, "name": "Monotonic Stack", "description": "Next greater/smaller element"},
            {"id": 16, "name": "Queue Basics", "description": "Enqueue, dequeue operations"},
            {"id": 17, "name": "Deque", "description": "Double-ended queue operations"},
            {"id": 18, "name": "Priority Queue Intro", "description": "Heap-based priority operations"},
            {"id": 19, "name": "Stack Applications", "description": "Balanced parentheses, expression evaluation"},
        ],
        "summary_notes": "## Stacks & Queues\n\n### Stack (LIFO)\n- Function call stack in recursion\n- Balanced parentheses checking\n- Monotonic stack for NGE problems\n\n### Queue (FIFO)\n- BFS traversal\n- Task scheduling"
    },
    {
        "id": 4, 
        "name": "Recursion & Backtracking", 
        "description": "Problem-solving through self-referential functions", 
        "order": 4, 
        "prerequisites": [3], 
        "subtopics": [
            {"id": 20, "name": "Recursion Basics", "description": "Base case, recursive case"},
            {"id": 21, "name": "Recursion Tree", "description": "Visualizing recursive calls"},
            {"id": 22, "name": "Backtracking", "description": "Explore and undo approach"},
            {"id": 23, "name": "Subsets & Permutations", "description": "Generating all combinations"},
            {"id": 24, "name": "N-Queens Problem", "description": "Classic backtracking example"},
            {"id": 25, "name": "Sudoku Solver", "description": "Constraint satisfaction"},
        ],
        "summary_notes": "## Recursion & Backtracking\n\n### Recursion\n- Always define base case\n- Trust the recursion\n\n### Backtracking\n1. Make a choice\n2. Recurse\n3. Undo the choice\n\n### Common Patterns\n- Subsets: Include/exclude each element\n- Permutations: Swap and recurse"
    },
    {
        "id": 5, 
        "name": "Trees & BST", 
        "description": "Hierarchical data structures with parent-child relationships", 
        "order": 5, 
        "prerequisites": [4], 
        "subtopics": [
            {"id": 26, "name": "Binary Tree Basics", "description": "Nodes with left and right children"},
            {"id": 27, "name": "Tree Traversals", "description": "Inorder, preorder, postorder, level-order"},
            {"id": 28, "name": "BST Operations", "description": "Insert, search, delete in BST"},
            {"id": 29, "name": "Height & Depth", "description": "Calculating tree dimensions"},
            {"id": 30, "name": "Lowest Common Ancestor", "description": "Finding LCA in trees"},
            {"id": 31, "name": "Tree Construction", "description": "Build tree from traversals"},
        ],
        "summary_notes": "## Trees & BST\n\n### Binary Search Tree\n- Left subtree < root < right subtree\n- Search, insert, delete: O(h)\n\n### Traversals\n- **Inorder**: Left, Root, Right (sorted for BST)\n- **Preorder**: Root, Left, Right\n- **Level-order**: BFS using queue"
    },
    {
        "id": 6, 
        "name": "Graphs", 
        "description": "Networks of nodes and edges for complex relationships", 
        "order": 6, 
        "prerequisites": [5], 
        "subtopics": [
            {"id": 32, "name": "Graph Representation", "description": "Adjacency list and matrix"},
            {"id": 33, "name": "BFS", "description": "Breadth-first search traversal"},
            {"id": 34, "name": "DFS", "description": "Depth-first search traversal"},
            {"id": 35, "name": "Connected Components", "description": "Finding connected parts"},
            {"id": 36, "name": "Topological Sort", "description": "Ordering DAG nodes"},
            {"id": 37, "name": "Cycle Detection in Graphs", "description": "Detecting cycles using DFS"},
            {"id": 38, "name": "Shortest Path Basics", "description": "BFS for unweighted graphs"},
        ],
        "summary_notes": "## Graphs\n\n### Representations\n- **Adjacency List**: Space O(V+E), good for sparse\n- **Adjacency Matrix**: Space O(V²), good for dense\n\n### Traversals\n- **BFS**: Shortest path in unweighted graphs\n- **DFS**: Cycle detection, topological sort"
    },
    {
        "id": 7, 
        "name": "Sorting Algorithms", 
        "description": "Efficient ordering of data using various strategies", 
        "order": 7, 
        "prerequisites": [4], 
        "subtopics": [
            {"id": 39, "name": "Bubble & Selection Sort", "description": "Simple O(n²) algorithms"},
            {"id": 40, "name": "Insertion Sort", "description": "Build sorted array one element at a time"},
            {"id": 41, "name": "Merge Sort", "description": "Divide and conquer, O(n log n)"},
            {"id": 42, "name": "Quick Sort", "description": "Partition-based sorting"},
            {"id": 43, "name": "Counting Sort", "description": "Non-comparison based sorting"},
            {"id": 44, "name": "Heap Sort", "description": "Using heap data structure"},
        ],
        "summary_notes": "## Sorting Algorithms\n\n### Comparison Based\n| Algorithm | Time | Space | Stable |\n|-----------|------|-------|--------|\n| Merge Sort | O(n log n) | O(n) | Yes |\n| Quick Sort | O(n log n) avg | O(log n) | No |\n\n### Non-comparison\n- Counting Sort: O(n + k) when range is small"
    },
    {
        "id": 8, 
        "name": "Dynamic Programming", 
        "description": "Optimization through overlapping subproblems", 
        "order": 8, 
        "prerequisites": [4, 7], 
        "subtopics": [
            {"id": 45, "name": "DP Introduction", "description": "Memoization vs tabulation"},
            {"id": 46, "name": "1D DP", "description": "Fibonacci, climbing stairs"},
            {"id": 47, "name": "2D DP", "description": "Grid problems, LCS"},
            {"id": 48, "name": "Longest Common Subsequence", "description": "Classic 2D DP problem"},
            {"id": 49, "name": "Longest Increasing Subsequence", "description": "1D DP with binary search optimization"},
            {"id": 50, "name": "Knapsack Problems", "description": "0/1 and unbounded knapsack"},
            {"id": 51, "name": "DP on Strings", "description": "Edit distance, palindromic substrings"},
        ],
        "summary_notes": "## Dynamic Programming\n\n### When to use DP?\n1. Optimal substructure\n2. Overlapping subproblems\n\n### Approaches\n- **Top-down**: Recursion + memoization\n- **Bottom-up**: Iterative tabulation\n\n### Classic Problems\n- Fibonacci, LCS, LIS, Knapsack, Edit Distance"
    },
]

# LeetCode problems per topic (3 Easy, 3 Medium)
LEETCODE_PROBLEMS = {
    1: [  # Arrays & Strings
        {"id": 1, "title": "Two Sum", "difficulty": "Easy", "url": "https://leetcode.com/problems/two-sum/"},
        {"id": 2, "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},
        {"id": 3, "title": "Contains Duplicate", "difficulty": "Easy", "url": "https://leetcode.com/problems/contains-duplicate/"},
        {"id": 4, "title": "3Sum", "difficulty": "Medium", "url": "https://leetcode.com/problems/3sum/"},
        {"id": 5, "title": "Product of Array Except Self", "difficulty": "Medium", "url": "https://leetcode.com/problems/product-of-array-except-self/"},
        {"id": 6, "title": "Maximum Subarray", "difficulty": "Medium", "url": "https://leetcode.com/problems/maximum-subarray/"},
    ],
    2: [  # Linked Lists
        {"id": 7, "title": "Reverse Linked List", "difficulty": "Easy", "url": "https://leetcode.com/problems/reverse-linked-list/"},
        {"id": 8, "title": "Merge Two Sorted Lists", "difficulty": "Easy", "url": "https://leetcode.com/problems/merge-two-sorted-lists/"},
        {"id": 9, "title": "Linked List Cycle", "difficulty": "Easy", "url": "https://leetcode.com/problems/linked-list-cycle/"},
        {"id": 10, "title": "Add Two Numbers", "difficulty": "Medium", "url": "https://leetcode.com/problems/add-two-numbers/"},
        {"id": 11, "title": "Remove Nth Node From End", "difficulty": "Medium", "url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"},
        {"id": 12, "title": "Reorder List", "difficulty": "Medium", "url": "https://leetcode.com/problems/reorder-list/"},
    ],
    3: [  # Stacks & Queues
        {"id": 13, "title": "Valid Parentheses", "difficulty": "Easy", "url": "https://leetcode.com/problems/valid-parentheses/"},
        {"id": 14, "title": "Min Stack", "difficulty": "Medium", "url": "https://leetcode.com/problems/min-stack/"},
        {"id": 15, "title": "Implement Queue using Stacks", "difficulty": "Easy", "url": "https://leetcode.com/problems/implement-queue-using-stacks/"},
        {"id": 16, "title": "Daily Temperatures", "difficulty": "Medium", "url": "https://leetcode.com/problems/daily-temperatures/"},
        {"id": 17, "title": "Evaluate Reverse Polish Notation", "difficulty": "Medium", "url": "https://leetcode.com/problems/evaluate-reverse-polish-notation/"},
        {"id": 18, "title": "Implement Stack using Queues", "difficulty": "Easy", "url": "https://leetcode.com/problems/implement-stack-using-queues/"},
    ],
    4: [  # Recursion & Backtracking
        {"id": 19, "title": "Climbing Stairs", "difficulty": "Easy", "url": "https://leetcode.com/problems/climbing-stairs/"},
        {"id": 20, "title": "Fibonacci Number", "difficulty": "Easy", "url": "https://leetcode.com/problems/fibonacci-number/"},
        {"id": 21, "title": "Power of Three", "difficulty": "Easy", "url": "https://leetcode.com/problems/power-of-three/"},
        {"id": 22, "title": "Subsets", "difficulty": "Medium", "url": "https://leetcode.com/problems/subsets/"},
        {"id": 23, "title": "Permutations", "difficulty": "Medium", "url": "https://leetcode.com/problems/permutations/"},
        {"id": 24, "title": "N-Queens", "difficulty": "Medium", "url": "https://leetcode.com/problems/n-queens/"},
    ],
    5: [  # Trees & BST
        {"id": 25, "title": "Invert Binary Tree", "difficulty": "Easy", "url": "https://leetcode.com/problems/invert-binary-tree/"},
        {"id": 26, "title": "Maximum Depth of Binary Tree", "difficulty": "Easy", "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"},
        {"id": 27, "title": "Same Tree", "difficulty": "Easy", "url": "https://leetcode.com/problems/same-tree/"},
        {"id": 28, "title": "Validate Binary Search Tree", "difficulty": "Medium", "url": "https://leetcode.com/problems/validate-binary-search-tree/"},
        {"id": 29, "title": "Binary Tree Level Order Traversal", "difficulty": "Medium", "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
        {"id": 30, "title": "Lowest Common Ancestor of BST", "difficulty": "Medium", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"},
    ],
    6: [  # Graphs
        {"id": 31, "title": "Flood Fill", "difficulty": "Easy", "url": "https://leetcode.com/problems/flood-fill/"},
        {"id": 32, "title": "Find if Path Exists in Graph", "difficulty": "Easy", "url": "https://leetcode.com/problems/find-if-path-exists-in-graph/"},
        {"id": 33, "title": "Island Perimeter", "difficulty": "Easy", "url": "https://leetcode.com/problems/island-perimeter/"},
        {"id": 34, "title": "Number of Islands", "difficulty": "Medium", "url": "https://leetcode.com/problems/number-of-islands/"},
        {"id": 35, "title": "Clone Graph", "difficulty": "Medium", "url": "https://leetcode.com/problems/clone-graph/"},
        {"id": 36, "title": "Course Schedule", "difficulty": "Medium", "url": "https://leetcode.com/problems/course-schedule/"},
    ],
    7: [  # Sorting
        {"id": 37, "title": "Merge Sorted Array", "difficulty": "Easy", "url": "https://leetcode.com/problems/merge-sorted-array/"},
        {"id": 38, "title": "Sort Colors", "difficulty": "Medium", "url": "https://leetcode.com/problems/sort-colors/"},
        {"id": 39, "title": "Squares of a Sorted Array", "difficulty": "Easy", "url": "https://leetcode.com/problems/squares-of-a-sorted-array/"},
        {"id": 40, "title": "Kth Largest Element", "difficulty": "Medium", "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/"},
        {"id": 41, "title": "Top K Frequent Elements", "difficulty": "Medium", "url": "https://leetcode.com/problems/top-k-frequent-elements/"},
        {"id": 42, "title": "Sort List", "difficulty": "Medium", "url": "https://leetcode.com/problems/sort-list/"},
    ],
    8: [  # Dynamic Programming
        {"id": 43, "title": "Climbing Stairs", "difficulty": "Easy", "url": "https://leetcode.com/problems/climbing-stairs/"},
        {"id": 44, "title": "House Robber", "difficulty": "Medium", "url": "https://leetcode.com/problems/house-robber/"},
        {"id": 45, "title": "Min Cost Climbing Stairs", "difficulty": "Easy", "url": "https://leetcode.com/problems/min-cost-climbing-stairs/"},
        {"id": 46, "title": "Longest Increasing Subsequence", "difficulty": "Medium", "url": "https://leetcode.com/problems/longest-increasing-subsequence/"},
        {"id": 47, "title": "Coin Change", "difficulty": "Medium", "url": "https://leetcode.com/problems/coin-change/"},
        {"id": 48, "title": "Unique Paths", "difficulty": "Medium", "url": "https://leetcode.com/problems/unique-paths/"},
    ],
}

@router.get("", response_model=List[TopicResponse])
async def get_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.order).all()
    if not topics:
        return DEFAULT_TOPICS
    # Convert database topics to include subtopics list
    result = []
    for topic in topics:
        topic_dict = {
            "id": topic.id,
            "name": topic.name,
            "description": topic.description,
            "order": topic.order,
            "prerequisites": topic.prerequisites or [],
            "subtopics": [{"id": st.id, "name": st.name, "description": st.description} for st in topic.subtopics],
            "summary_notes": topic.summary_notes
        }
        result.append(topic_dict)
    return result if result else DEFAULT_TOPICS

@router.get("/selection")
async def get_topics_for_selection():
    """Get topics for initial selection screen"""
    return {"topics": [{"id": t["id"], "name": t["name"], "description": t["description"]} for t in DEFAULT_TOPICS]}

@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        for t in DEFAULT_TOPICS:
            if t["id"] == topic_id:
                return t
        return {"id": topic_id, "name": "Sample Topic", "description": "Description", "order": topic_id, "prerequisites": [], "subtopics": [], "summary_notes": None}
    return {
        "id": topic.id,
        "name": topic.name,
        "description": topic.description,
        "order": topic.order,
        "prerequisites": topic.prerequisites or [],
        "subtopics": [{"id": st.id, "name": st.name, "description": st.description} for st in topic.subtopics],
        "summary_notes": topic.summary_notes
    }

@router.get("/{topic_id}/leetcode")
async def get_leetcode_problems(topic_id: int):
    """Get LeetCode problems for a topic"""
    problems = LEETCODE_PROBLEMS.get(topic_id, [])
    return {"problems": problems}

@router.get("/{topic_id}/subtopics")
async def get_subtopics(topic_id: int):
    """Get all subtopics for a topic"""
    for t in DEFAULT_TOPICS:
        if t["id"] == topic_id:
            return {"subtopics": t.get("subtopics", [])}
    return {"subtopics": []}
