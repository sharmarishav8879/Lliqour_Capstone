"use client";

import { useMemo, useState } from "react";

function makeCode() {
  const chunk = () =>
    Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `LLQ-${chunk()}-${chunk()}`;
}

function money(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}

const THEMES = {
  Classic: {
    border: "rgba(255,255,255,0.18)",
    bg: "rgba(255,255,255,0.04)",
    accent: "rgba(255,255,255,0.85)",
    badge: "rgba(255,255,255,0.10)",
  },
  Holiday: {
    border: "rgba(255,255,255,0.18)",
    bg: "rgba(255,255,255,0.04)",
    accent: "rgba(255,255,255,0.85)",
    badge: "rgba(255,255,255,0.10)",
  },
  Birthday: {
    border: "rgba(255,255,255,0.18)",
    bg: "rgba(255,255,255,0.04)",
    accent: "rgba(255,255,255,0.85)",
    badge: "rgba(255,255,255,0.10)",
  },
};

export default function GiftCardClient() {
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [amount, setAmount] = useState("50");
  const [message, setMessage] = useState("Enjoy your celebration!");
  const [theme, setTheme] = useState("Classic");
  const [code, setCode] = useState(makeCode());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const style = THEMES[theme] || THEMES.Classic;

  const details = useMemo(() => {
    return [
      "Legacy Liquor Gift Card (Demo)",
      `Code: ${code}`,
      `Amount: ${money(amount)}`,
      `To: ${toName || "(not set)"}`,
      `From: ${fromName || "(not set)"}`,
      `Message: ${message || "(none)"}`,
    ].join("\n");
  }, [code, amount, toName, fromName, message]);

  function validate() {
    const n = Number(amount);
    if (!toName.trim()) return "Recipient name is required.";
    if (!fromName.trim()) return "Sender name is required.";
    if (!Number.isFinite(n) || n <= 0) return "Amount must be a positive number.";
    if (n > 500) return "Amount looks too high for a demo (max $500).";
    return "";
  }

  async function onCopy() {
    const v = validate();
    setError(v);
    if (v) return;

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Clipboard permission blocked by the browser.");
    }
  }

  function onNewCode() {
    setCode(makeCode());
  }

  function onGenerate() {
    const v = validate();
    setError(v);
    if (!v) onNewCode();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Form */}
      <section style={{ border: `1px solid ${style.border}`, borderRadius: 14, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650, marginTop: 0 }}>Gift Card Details</h2>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>To</div>
          <input
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="Recipient name"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, background: "transparent" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>From</div>
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, background: "transparent" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Amount (CAD)</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="50"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, background: "transparent" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, background: "transparent" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, background: "transparent" }}
          >
            {Object.keys(THEMES).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, border: `1px solid ${style.border}`, opacity: 0.9 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onGenerate}
            style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${style.border}`, background: "transparent", cursor: "pointer" }}
          >
            Generate new code
          </button>
          <button
            onClick={onCopy}
            style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${style.border}`, background: "transparent", cursor: "pointer" }}
          >
            {copied ? "Copied" : "Copy gift card"}
          </button>
        </div>
      </section>

      {/* Preview */}
      <section style={{ border: `1px solid ${style.border}`, borderRadius: 14, padding: 16, background: style.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 750 }}>Legacy Liquor</div>
          <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: `1px solid ${style.border}`, background: style.badge }}>
            Gift Card (Demo)
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ fontSize: 13, opacity: 0.8 }}>Gift Code</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1.2, marginTop: 4 }}>
          {code}
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>To</div>
            <div style={{ fontSize: 16, fontWeight: 650 }}>{toName || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>From</div>
            <div style={{ fontSize: 16, fontWeight: 650 }}>{fromName || "—"}</div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ fontSize: 13, opacity: 0.8 }}>Value</div>
        <div style={{ fontSize: 26, fontWeight: 850 }}>{money(amount)}</div>

        <div style={{ height: 14 }} />

        <div style={{ fontSize: 13, opacity: 0.8 }}>Message</div>
        <div style={{ fontSize: 15, lineHeight: 1.35, marginTop: 6 }}>
          {message || "—"}
        </div>

        <div style={{ height: 16 }} />
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Note: Demo feature. Redemption is not connected to checkout.
        </div>
      </section>
    </div>
  );
}
