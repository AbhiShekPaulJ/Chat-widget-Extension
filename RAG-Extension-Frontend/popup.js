document.getElementById("askBtn").addEventListener("click", ask);

async function ask() {
    console.log("Button clicked");

    const q = document.getElementById("query").value;

    const res = await fetch("http://localhost:5678/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: q })
    });

    const data = await res.json();
    console.log(data);
    alert(data.answer);
}
console.log("JS loaded");
