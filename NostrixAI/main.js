// THE SOVEREIGN BRIDGE
// Since we are on Vercel, we use a relative path. No URL needed.
const API_BASE = "/api"; 

const queryInput = document.getElementById('query');
const display = document.getElementById('display');

async function execute() {
    const q = queryInput.value.trim();
    if (!q) return;

    // Visual feedback for the "Grid Interception"
    display.innerHTML = "<p style='color:#444; font-weight:bold; letter-spacing:2px;'>INTERCEPTING_DATA...</p>";

    try {
        // Fetching from your Vercel Python Function
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
        
        if (!response.ok) throw new Error('KERNEL_OFFLINE');
        
        const data = await response.json();
        
        // INTERFACE RENDERING
        if (data.intent === "FINANCE") {
            display.innerHTML = `
                <div class="result-box" style="border-left: 2px solid #FFF; padding-left: 20px; animation: fadeIn 0.4s ease;">
                    <h2 style="margin:0; color:#888;">${data.symbol} // MARKET_DATA</h2>
                    <h1 style="font-size:70px; margin:10px 0; letter-spacing:-4px;">$${data.price}</h1>
                    <p style="color:#BBB; line-height:1.6;">${data.summary}</p>
                    <div style="margin-top:15px;">
                        <span class="unit">MCAP: $${data.mcap.toFixed(2)}B</span>
                        <span class="unit">STATUS: TRADING</span>
                    </div>
                </div>`;
        } else {
            const units = data.units.map(u => `<span class="unit">${u}</span>`).join('');
            const links = data.results.map(r => `
                <a href="${r.url}" target="_blank" style="display:block; text-decoration:none; color:#666; padding:10px 0; border-bottom:1px solid #111;">
                    <b style="color:#EEE;">${r.title.toUpperCase()}</b><br>
                    <small>${r.snippet.substring(0, 100)}...</small>
                </a>`).join('');
            
            display.innerHTML = `
                <div class="result-box" style="border-left: 2px solid #FFF; padding-left: 20px; animation: fadeIn 0.4s ease;">
                    <h3 style="letter-spacing:2px; color:#555;">RESEARCH // ${data.query.toUpperCase()}</h3>
                    <p style="color:#FFF; font-size:18px;">${data.summary}</p>
                    <div style="margin:20px 0;">${units}</div>
                    <div style="margin-top:20px;">${links}</div>
                </div>`;
        }
    } catch (e) {
        display.innerHTML = `<p style="color:#FF0000; font-weight:bold;">CORE_ERROR: CHECK_VERCEL_LOGS</p>`;
        console.error(e);
    }
}

// Global Trigger
queryInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') execute(); 
});

// PWA SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('NOSTRIX_PWA_ACTIVE'))
            .catch(err => console.log('PWA_HANDSHAKE_FAILED', err));
    });
}