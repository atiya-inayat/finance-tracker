"use client";
import { useState } from "react";
import { API_BASE_URL } from "@/app/lib/constant";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const res = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setResponse(data.response);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gemini AI Chat (FREE API)</h1>

      <textarea
        placeholder="Ask something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", height: 80, marginBottom: 10 }}
      />

      <button
        onClick={sendPrompt}
        disabled={loading}
        style={{ padding: "10px 20px", marginBottom: 20 }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div>
        <h3>Response:</h3>
        <pre>{response}</pre>
      </div>
    </div>
  );
}
