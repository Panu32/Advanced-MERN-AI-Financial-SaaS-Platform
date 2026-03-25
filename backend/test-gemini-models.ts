import "dotenv/config";
import * as fs from "fs";

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    const modelNames = data.models.map((m: any) => m.name);
    fs.writeFileSync("models.json", JSON.stringify(modelNames, null, 2));
    console.log("WROTE MODELS!");
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}

run();
