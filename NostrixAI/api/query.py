import os
import re
import urllib.parse
import sqlite3
import json
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import yfinance as yf
from curl_cffi import requests as stealth_requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util

# --- CONFIG ---
MODEL_NAME = 'all-MiniLM-L6-v2'
DB_NAME = "phantom_quant.db"
TECH_UNITS = r'(\d+\.?\d*\s?(kN|lbf|kg|Mach|Isp|psi|pa|rpm|V|A|MW|km/s|m/s|thrust|torque|bypass))'

app = FastAPI()
MODEL = SentenceTransformer(MODEL_NAME)

# --- DATABASE ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS intel (
            id INTEGER PRIMARY KEY,
            query TEXT,
            category TEXT,
            data TEXT,
            timestamp DATETIME
        )
    """)
    conn.commit()
    conn.close()

init_db()

# --- HELPERS ---
def save_to_db(query, category, data):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO intel (query, category, data, timestamp) VALUES (?, ?, ?, ?)",
              (query, category, json.dumps(data), datetime.utcnow()))
    conn.commit()
    conn.close()

# --- CORE LOGIC ---
def execute_stock(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        data = {
            "intent": "FINANCE",
            "symbol": ticker,
            "price": info.get('currentPrice', 0),
            "mcap": info.get('marketCap', 0) / 1e9,
            "summary": info.get('longBusinessSummary', "No profile available.")
        }
        save_to_db(ticker, "FINANCE", data)
        return data
    except Exception as e:
        return {"error": str(e)}

def execute_rag(query):
    try:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}+specs"
        r = stealth_requests.get(url, impersonate="chrome120", timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")

        nodes = []
        q_emb = MODEL.encode(query)
        for res in soup.select(".result")[:12]:
            a = res.select_one("a.result__a")
            if not a:
                continue
            href = a.get("href")
            link = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0]) if 'uddg=' in href else href
            snip = res.select_one(".result__snippet").get_text().strip() if res.select_one(".result__snippet") else ""
            score = float(util.cos_sim(q_emb, MODEL.encode(a.get_text() + " " + snip))[0][0])
            nodes.append({"title": a.get_text(), "url": link, "snippet": snip, "score": score})

        nodes.sort(key=lambda x: x['score'], reverse=True)
        units = list(set([m[0] for m in re.findall(TECH_UNITS, " ".join([n['snippet'] for n in nodes]), re.I)]))

        data = {
            "intent": "RESEARCH",
            "query": query,
            "results": nodes,
            "summary": " ".join([n['snippet'] for n in nodes[:4]]),
            "units": units
        }
        save_to_db(query, "RESEARCH", data)
        return data
    except Exception as e:
        return {"error": str(e)}

# --- ROUTE ---
@app.get("/api/query")
async def query_api(text: str):
    text_clean = text.strip().upper()
    if re.match(r'^[A-Z]{1,5}$', text_clean):
        return execute_stock(text_clean)
    return execute_rag(text)