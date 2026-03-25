from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from langchain_service import process_chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    userId: str
    history: List[Dict[str, str]]
    message: str

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        reply = await process_chat(req.userId, req.history, req.message)
        return {"data": {"reply": reply}}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
