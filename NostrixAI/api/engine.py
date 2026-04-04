import urllib.parse, re, sqlite3
from curl_cffi import requests as stealth_requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util
import yfinance as yf

MODEL = SentenceTransformer('all-MiniLM-L6-v2')
TECH_UNITS = r'(\d+\.?\d*\s?(kN|lbf|kg|Mach|Isp|psi|pa|rpm|V|A|MW|km/s|m/s|thrust|torque|bypass))'

class SovereignEngine:
    def __init__(self, query):
        self.query = query

    def execute_sync(self):
        q_clean = self.query.strip().upper()
        if re.match(r'^[A-Z]{1,5}$', q_clean):
            return self.execute_stock(q_clean)
        else:
            return self.execute_rag(self.query)

    def execute_stock(self, ticker):
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            return {
                "intent": "FINANCE", "symbol": ticker,
                "price": info.get('currentPrice', 0),
                "mcap": info.get('marketCap', 0) / 1e9,
                "summary": info.get('longBusinessSummary', "No profile available.")
            }
        except: return self.execute_rag(ticker)

    def execute_rag(self, query):
        try:
            url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}+specs"
            r = stealth_requests.get(url, impersonate="chrome120", timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            
            nodes = []
            q_emb = MODEL.encode(query)
            for res in soup.select(".result")[:10]:
                a = res.select_one("a.result__a")
                if not a: continue
                href = a.get("href")
                link = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0]) if 'uddg=' in href else href
                snip = res.select_one(".result__snippet").get_text().strip() if res.select_one(".result__snippet") else ""
                
                score = float(util.cos_sim(q_emb, MODEL.encode(a.get_text() + " " + snip))[0][0])
                nodes.append({"title": a.get_text(), "url": link, "snippet": snip, "score": score})

            nodes.sort(key=lambda x: x['score'], reverse=True)
            units = list(set([m[0] for m in re.findall(TECH_UNITS, " ".join([n['snippet'] for n in nodes]), re.I)]))
            
            return {
                "intent": "RESEARCH", "query": query, "results": nodes[:5],
                "summary": " ".join([n['snippet'] for n in nodes[:3]]), "units": units
            }
        except Exception as e: return {"error": str(e)}