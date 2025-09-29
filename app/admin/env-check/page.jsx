"use client";

export default function EnvCheck() {
  const data = {
    NEXT_PUBLIC_FB_PROJECT_ID: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    hasApiKey: !!process.env.NEXT_PUBLIC_FB_API_KEY,
  };

  // also log to DevTools so you can see values even if styling breaks
  console.log("ENV CHECK ->", data);

  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h1 style={{ marginBottom: 8 }}>Env Check</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
