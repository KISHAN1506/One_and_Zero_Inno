from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import get_settings
import google.generativeai as genai
import google.api_core.exceptions

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Configure Gemini API
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

# System prompt for DSA-focused responses
SYSTEM_PROMPT = """You are an expert DSA (Data Structures and Algorithms) tutor helping students learn programming concepts. 

Your role is to:
1. Explain DSA concepts clearly and concisely
2. Provide examples when helpful
3. Give hints rather than complete solutions when asked about problems
4. Suggest relevant topics to study next
5. Keep responses focused and educational

Topics you specialize in:
- Arrays & Strings (Two Pointers, Sliding Window, Prefix Sum, Kadane's Algorithm)
- Linked Lists (Singly/Doubly LL, Cycle Detection, Reversal, Fast & Slow Pointers)
- Stacks & Queues (LIFO/FIFO, Monotonic Stack, Priority Queue)
- Recursion & Backtracking (Base Case, Recursive Tree, Permutations, N-Queens)
- Trees & BST (Traversals, Binary Search Tree, LCA, Height/Depth)
- Graphs (BFS, DFS, Topological Sort, Connected Components)
- Sorting (Merge Sort, Quick Sort, Counting Sort)
- Dynamic Programming (Memoization, Tabulation, 1D/2D DP, Knapsack)

Keep responses concise but helpful. Use markdown formatting for code examples.
"""

class ChatRequest(BaseModel):
    message: str
    topic_id: int = None

class ChatResponse(BaseModel):
    response: str
    sources: list = []

# Topic context mapping
TOPIC_CONTEXT = {
    1: "The user is studying Arrays & Strings. Focus on array operations, two pointers, sliding window, and string manipulation.",
    2: "The user is studying Linked Lists. Focus on node-based structures, cycle detection, and list operations.",
    3: "The user is studying Stacks & Queues. Focus on LIFO/FIFO principles and related algorithms.",
    4: "The user is studying Recursion & Backtracking. Focus on recursive thinking, base cases, and backtracking patterns.",
    5: "The user is studying Trees & BST. Focus on tree traversals, BST properties, and tree algorithms.",
    6: "The user is studying Graphs. Focus on BFS, DFS, and graph representations.",
    7: "The user is studying Sorting Algorithms. Focus on comparison-based and non-comparison sorting.",
    8: "The user is studying Dynamic Programming. Focus on overlapping subproblems and optimal substructure.",
}

# List of models to try in order of preference/cost
MODELS_TO_TRY = [
    'gemini-2.5-flash',       # Latest working model
    'gemini-2.0-flash-lite',  # Lightweight, fast, likely better quota
    'gemini-2.0-flash',       # Standard flash
    'gemini-flash-latest',    # Alias for latest flash
]

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Build context-aware prompt
        context = ""
        if request.topic_id and request.topic_id in TOPIC_CONTEXT:
            context = f"\n\nContext: {TOPIC_CONTEXT[request.topic_id]}"
        
        full_prompt = f"{SYSTEM_PROMPT}{context}\n\nStudent Question: {request.message}"
        
        response_text = None
        last_error = None

        # Try models in sequence
        for model_name in MODELS_TO_TRY:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(full_prompt)
                response_text = response.text
                break # Success!
            except google.api_core.exceptions.ResourceExhausted:
                # Quota hit, try next model
                last_error = "Quota exceeded"
                continue
            except google.api_core.exceptions.NotFound:
                # Model not found, try next
                last_error = "Model not found"
                continue
            except Exception as e:
                # Other error
                print(f"Error with model {model_name}: {e}")
                last_error = str(e)
                continue
        
        if not response_text:
            raise Exception(f"All models failed. Last error: {last_error}")

        # Extract relevant sources based on topic
        sources = []
        if request.topic_id:
            topic_names = {
                1: "Arrays & Strings Notes",
                2: "Linked Lists Guide",
                3: "Stacks & Queues Notes",
                4: "Recursion Notes",
                5: "Trees & BST Notes",
                6: "Graphs Guide",
                7: "Sorting Notes",
                8: "DP Fundamentals",
            }
            if request.topic_id in topic_names:
                sources.append(topic_names[request.topic_id])
        
        return ChatResponse(
            response=response_text,
            sources=sources
        )
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback to basic response
        error_msg = "It seems I'm currently overloaded with requests (API quota exceeded). Please try again later."
        if "Quota" not in str(e) and "exhausted" not in str(e).lower():
            error_msg = "I'm having trouble connecting to the AI brain right now. Please try again in a moment."
            
        return ChatResponse(
            response=f"{error_msg} \n\nIn the meantime, check the learning resources for this topic!",
            sources=["Learning Resources"]
        )
