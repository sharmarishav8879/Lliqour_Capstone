import GiftCardClient from "./GiftCardClient";

export const metadata = {
  title: "Gift Card Generator | Legacy Liquor",
};

export default function GiftCardPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 750, marginBottom: 8 }}>
        Gift Card Generator
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Create a shareable gift card for Legacy Liquor (demo feature).
      </p>

      <GiftCardClient />
    </main>
  );
}
