const API = "https://potential-engine-jjpg6jjg4r9w2q55q-8000.app.github.dev/"; // change this

async function run() {
    const q = document.getElementById("q").value;
    const out = document.getElementById("out");

    out.innerHTML = "Loading...";

    const res = await fetch(`${API}/query?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (data.error) {
        out.innerHTML = data.error;
        return;
    }

    if (data.intent === "FINANCE") {
        out.innerHTML = `
            <h2>${data.symbol}</h2>
            <h1>$${data.price}</h1>
            <p>${data.summary}</p>
        `;
    } else {
        out.innerHTML = `
            <h3>${data.summary}</h3>
            ${data.results.map(r => `
                <div style="border:1px solid #333;margin:10px;padding:10px;">
                    <a href="${r.url}" target="_blank">${r.title}</a>
                    <p>${r.snippet}</p>
                </div>
            `).join("")}
        `;
    }
}