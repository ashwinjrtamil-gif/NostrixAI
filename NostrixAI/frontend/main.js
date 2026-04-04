const input = document.getElementById("query");
const btn = document.getElementById("send");
const resultsDiv = document.getElementById("results");

btn.addEventListener("click", sendQuery);
input.addEventListener("keypress", e => { if(e.key==="Enter") sendQuery(); });

async function sendQuery() {
    const query = input.value.trim();
    if(!query) return;

    resultsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`/api/query?text=${encodeURIComponent(query)}`);
        const data = await res.json();

        if(data.error){
            resultsDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
            return;
        }

        if(data.intent === "FINANCE"){
            resultsDiv.innerHTML = `
                <div class="result">
                    <h2>${data.symbol}</h2>
                    <p>Price: $${data.price}</p>
                    <p>Market Cap: $${data.mcap.toFixed(2)}B</p>
                    <p>${data.summary}</p>
                </div>`;
        } else {
            resultsDiv.innerHTML = data.results.map(r => `
                <div class="result">
                    <a href="${r.url}" target="_blank"><b>${r.title}</b></a>
                    <p>${r.snippet}</p>
                </div>`).join('');
        }
    } catch(err){
        resultsDiv.innerHTML = `<p style="color:red;">${err}</p>`;
    }
}