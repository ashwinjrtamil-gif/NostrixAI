from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from NostrixAI.api.engine import SovereignEngine # Use your existing logic

app = FastAPI()

# Allow the PWA (Frontend) to talk to the Codespace (Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
async def search(q: str):
    # This calls your World #4 Logic
    engine = SovereignEngine(q)
    # Note: You'll need to modify SovereignEngine to return data 
    # instead of using PyQt signals
    return engine.execute_sync() 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)