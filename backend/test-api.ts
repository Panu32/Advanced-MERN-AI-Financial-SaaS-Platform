async function run() {
  try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" })
    });
    console.log("LOGIN STATUS:", res.status, await res.text());
  } catch(e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
