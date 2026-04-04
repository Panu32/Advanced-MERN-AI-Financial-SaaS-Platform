from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import os
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

@app.get("/ping")
def ping():
    return {"status": "ok", "service": "Finora AI Service"}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"[PythonService] Received chat request for user: {req.userId}")
    try:
        reply = await process_chat(req.userId, req.history, req.message)
        print(f"[PythonService] Chat processing successful")
        return {"data": {"reply": reply}}
    except Exception as e:
        print(f"[PythonService] ERROR during processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Render and other deployment platforms provide a PORT env variable
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
