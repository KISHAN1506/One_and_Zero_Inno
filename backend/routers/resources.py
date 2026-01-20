from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/api/resources", tags=["resources"])

SAMPLE_RESOURCES = {
    1: {
        "topic": {"id": 1, "name": "Arrays & Strings", "description": "Master array fundamentals"},
        "videos": [
            {"id": 1, "title": "Arrays Complete Guide", "url": "https://www.youtube.com/embed/QJNwK2uJyGs", "duration": "15:30", "completed": True},
            {"id": 2, "title": "Two Pointers Technique", "url": "https://www.youtube.com/embed/On03HWe2tZM", "duration": "12:45", "completed": False},
        ],
        "notes": [{"id": 1, "title": "Arrays Fundamentals", "content": "## Arrays\n\nO(1) access by index.\n\n### Two Pointers\nFor sorted arrays.\n\n### Sliding Window\nFor contiguous subarrays."}],
        "problems": [{"id": 1, "title": "Two Sum", "difficulty": "Easy", "completed": True}, {"id": 2, "title": "Container With Most Water", "difficulty": "Medium", "completed": False}]
    },
    2: {
        "topic": {"id": 2, "name": "Linked Lists", "description": "Dynamic data structures"},
        "videos": [
            {"id": 3, "title": "Linked List Basics", "url": "https://www.youtube.com/embed/N6dOwBde7-M", "duration": "18:00", "completed": False},
            {"id": 4, "title": "Cycle Detection", "url": "https://www.youtube.com/embed/gBTe7lFR3vc", "duration": "14:20", "completed": False},
        ],
        "notes": [{"id": 2, "title": "Linked Lists Guide", "content": "## Linked Lists\n\nNodes with pointers.\n\n### Operations\nInsert at head O(1), search O(n).\n\n### Floyd's Algorithm\nFor cycle detection."}],
        "problems": [{"id": 3, "title": "Reverse Linked List", "difficulty": "Easy", "completed": False}, {"id": 4, "title": "Linked List Cycle", "difficulty": "Easy", "completed": False}]
    }
}

@router.get("/topic/{topic_id}")
async def get_resources_by_topic(topic_id: int, db: Session = Depends(get_db)):
    if topic_id in SAMPLE_RESOURCES:
        return SAMPLE_RESOURCES[topic_id]
    return {"topic": {"id": topic_id, "name": "Topic"}, "videos": [], "notes": [], "problems": []}
