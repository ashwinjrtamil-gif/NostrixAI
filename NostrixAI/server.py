from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from engine import SovereignEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "NostrixAI running"}

@app.get("/query")
def query(q: str):
    engine = SovereignEngine(q)
    return engine.run_sync()