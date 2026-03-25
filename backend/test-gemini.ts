import "dotenv/config";

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: "Hello world" }] }
      })
    });
    const data = await res.json();
    if (!res.ok) {
        console.error("FAILED:", data);
        return;
    }
    console.log("Embeddings OK! Length:", data.embedding.values.length);
  } catch (e: any) {
    console.error("FETCH ERROR:", e.message);
  }
}

run();
