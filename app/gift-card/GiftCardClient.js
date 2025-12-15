"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/ThemeToggle";

function makeCode() {
  const chunk = () =>
    Math.random()
      .toString(36)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);
  return `LLQ-${chunk()}-${chunk()}`;
}

function money(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
}

// Theme tokens (requested palettes)
// Light: orange + white
// Dark: dark blue + black
function getTokens(isDark) {
  if (isDark) {
    return {
      accent: "#0A2A66", // dark blue
      bg: "#0B0B0F", // near black page background
      card: "#0F1118", // card background
      border: "rgba(10,42,102,0.55)",
      text: "rgba(255,255,255,0.92)",
      muted: "rgba(255,255,255,0.72)",
      inputBg: "rgba(255,255,255,0.03)",
      badgeBg: "rgba(10,42,102,0.20)",
      dangerBg: "rgba(255,255,255,0.04)",
    };
  }

  return {
    accent: "#F97316", // orange
    bg: "#FFFFFF",
    card: "#FFFFFF",
    border: "rgba(249,115,22,0.35)",
    text: "rgba(0,0,0,0.88)",
    muted: "rgba(0,0,0,0.62)",
    inputBg: "rgba(0,0,0,0.02)",
    badgeBg: "rgba(249,115,22,0.10)",
    dangerBg: "rgba(249,115,22,0.06)",
  };
}

// Optional per-theme flavor (keeps your dropdown meaningful without changing palette)
const THEME_FLAVOR = {
  Classic: { label: "Classic" },
  Holiday: { label: "Holiday" },
  Birthday: { label: "Birthday" },
};

export default function GiftCardClient() {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";

  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [amount, setAmount] = useState("50");
  const [message, setMessage] = useState("Enjoy your celebration!");
  const [theme, setTheme] = useState("Classic");
  const [code, setCode] = useState(makeCode());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const t = getTokens(isDark);
  const flavor = THEME_FLAVOR[theme] || THEME_FLAVOR.Classic;

  const details = useMemo(() => {
    return [
      "Legacy Liquor Gift Card (Demo)",
      `Theme: ${flavor.label}`,
      `Code: ${code}`,
      `Amount: ${money(amount)}`,
      `To: ${toName || "(not set)"}`,
      `From: ${fromName || "(not set)"}`,
      `Message: ${message || "(none)"}`,
    ].join("\n");
  }, [code, amount, toName, fromName, message, flavor.label]);

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

  const labelStyle = { fontSize: 13, color: t.muted, marginBottom: 6 };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        background: t.bg,
        color: t.text,
        borderRadius: 16,
        padding: 6,
      }}
    >
      {/* Form */}
      <section
        style={{
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 16,
          background: t.card,
          color: t.text,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 650, marginTop: 0 }}>
          Gift Card Details
        </h2>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={labelStyle}>To</div>
          <input
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="Recipient name"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              color: t.text,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={labelStyle}>From</div>
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              color: t.text,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={labelStyle}>Amount (CAD)</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="50"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              color: t.text,
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <div style={labelStyle}>Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              color: t.text,
              outline: "none",
              resize: "vertical",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={labelStyle}>Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              color: t.text,
              outline: "none",
            }}
          >
            {Object.keys(THEME_FLAVOR).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <div
            style={{
              marginBottom: 10,
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.dangerBg,
              color: t.text,
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onGenerate}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              background: "transparent",
              cursor: "pointer",
              color: t.text,
            }}
          >
            Generate new code
          </button>

          <button
            onClick={onCopy}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              background: t.badgeBg,
              cursor: "pointer",
              color: t.text,
            }}
          >
            {copied ? "Copied" : "Copy gift card"}
          </button>
        </div>
      </section>

      {/* Preview */}
      <section
        style={{
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 16,
          background: t.card,
          color: t.text,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 750 }}>
            Legacy Liquor
          </div>

          <div
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: t.badgeBg,
              color: t.text,
            }}
          >
            Gift Card ({flavor.label})
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={labelStyle}>Gift Code</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1.2,
            marginTop: 4,
            color: t.text,
          }}
        >
          {code}
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>To</div>
            <div style={{ fontSize: 16, fontWeight: 650 }}>
              {toName || "—"}
            </div>
          </div>
          <div>
            <div style={labelStyle}>From</div>
            <div style={{ fontSize: 16, fontWeight: 650 }}>
              {fromName || "—"}
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={labelStyle}>Value</div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 850,
            color: isDark ? t.text : t.accent, // orange emphasis in light mode
          }}
        >
          {money(amount)}
        </div>

        <div style={{ height: 14 }} />

        <div style={labelStyle}>Message</div>
        <div style={{ fontSize: 15, lineHeight: 1.35, marginTop: 6 }}>
          {message || "—"}
        </div>

        <div style={{ height: 16 }} />
        <div style={{ fontSize: 12, color: t.muted }}>
          Note: Demo feature. Redemption is not connected to checkout.
        </div>
      </section>
    </div>
  );
}
