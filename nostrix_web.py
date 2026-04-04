# nostrix_web.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from nostrix_core import SovereignEngineCore

app = FastAPI(title="NOSTRIXAI Web API")
core = SovereignEngineCore()

@app.get("/")
def home():
    return HTMLResponse("<h1>NOSTRIXAI Web PWA</h1><p>Use /query?q=YOUR_QUERY</p>")

@app.get("/query")
def query(q: str):
    res = core.query(q)
    if "error" in res: raise HTTPException(status_code=500, detail=res["error"])
    return res
