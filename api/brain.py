from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class SwarmTask(BaseModel):
    task: str
    context: str = ""

@app.get("/api/brain/health")
async def health_check():
    return {"status": "online", "engine": "FastAPI/Python", "mode": "Antigravity Hybrid"}

@app.post("/api/brain/swarm")
async def process_swarm(task: SwarmTask):
    # This is where the Python-specific AI logic will live
    return {
        "source": "Python Brain",
        "result": f"Task '{task.task}' analyzed via FastAPI gateway.",
        "synergy": "Javascript UI + Python Intelligence"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
