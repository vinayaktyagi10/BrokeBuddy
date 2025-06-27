from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", or "system"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
