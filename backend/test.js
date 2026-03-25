fetch("http://localhost:8000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "test", history: [] })
}).then(async r => console.log("Status:", r.status, "Body:", await r.text())).catch(console.error);
