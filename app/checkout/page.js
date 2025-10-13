"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartProvider";
import { db, auth } from "@/app/auth/_util/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })
    .format((cents || 0) / 100);
}

// Minimal, print-friendly HTML (one page)
function buildReceiptHTML({
  orderId = "LOCAL-DEMO",
  createdAt,
  items,
  subtotalCents,
  taxCents,
  deliveryCents,
  totalCents,
}) {
  const rows = (items || [])
    .map(
      (it) => `
      <tr>
        <td>${(it.title || it.name || "").replace(/</g, "&lt;")}</td>
        <td style="text-align:center;">${it.qty}</td>
        <td>${money(it.priceCents)}</td>
        <td style="text-align:right;">${money(it.lineTotalCents)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${orderId}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial; color:#111; margin:20px; }
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:10px; margin-bottom:12px; }
  .brand { font-size:22px; font-weight:600; }
  .meta { font-size:13px; color:#555; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { padding:8px 6px; border-top:1px solid #eee; }
  th { text-align:left; }
  .totals { margin-top:12px; font-size:14px; }
  .totals div { display:flex; justify-content:space-between; padding:4px 0; }
  .total { font-weight:700; font-size:16px; border-top:1px solid #eee; margin-top:6px; padding-top:6px; }
  .thanks { text-align:center; margin-top:24px; font-size:13px; color:#444; }
  @media print { .noprint { display:none; } body { margin:0; }
    @page { size: A4; margin: 12mm; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Legacy Liquor</div>
      <div class="meta">Order #${orderId}</div>
      <div class="meta">Date: ${new Date(createdAt).toLocaleString()}</div>
    </div>
    <img src="/logo.png" alt="Legacy Liquor" style="height:60px; object-fit:contain;" onerror="this.style.display='none'"/>
  </div>

  <table>
    <thead>
      <tr><th>Item</th><th style="text-align:center;">Qty</th><th>Price</th><th style="text-align:right;">Line total</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${money(subtotalCents)}</span></div>
    <div><span>Tax</span><span>${money(taxCents)}</span></div>
    <div><span>Delivery</span><span>${money(deliveryCents)}</span></div>
    <div class="total"><span>Total</span><span>${money(totalCents)}</span></div>
  </div>

  <p class="thanks">Thanks for shopping with us!</p>

  <script>
    // Auto print as soon as it loads
    window.addEventListener('load', () => {
      try { window.print(); } catch (e) {}
    });
  </script>
</body>
</html>`;
}

// Open a new tab and synchronously write the receipt (must be called from a user click)
function openClientReceipt({ order, orderId = "LOCAL-DEMO" }) {
  const html = buildReceiptHTML({
    orderId,
    createdAt: Date.now(),
    items: order.items,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
    deliveryCents: order.deliveryCents,
    totalCents: order.totalCents,
  });

  try {
    // Prefer a Blob URL (works well in Edge/Chrome/Safari)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");       // no noreferrer/noopener to allow print script to run
    if (!w) {
      // Popup blocked: fall back to a data URL
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
      window.open(dataUrl, "_blank");
    }
  } catch {
    // Last-resort fallback
    const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    window.open(dataUrl, "_blank");
  }
}

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, setOpen } = useCart();
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null); // snapshot for printing
  const [pendingOrderId, setPendingOrderId] = useState("LOCAL-DEMO");

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const delivery = 0;
  const taxes = Math.round(subtotalCents * 0.05);
  const total = subtotalCents + delivery + taxes;

  async function placeOrder(e) {
    e.preventDefault();
    if (!items || items.length === 0 || sending) return;

    const user = auth.currentUser;

    // Prepare the snapshot we’ll print (works for both success & fallback)
    const snapshot = {
      items: items.map((it) => ({
        id: it.id,
        title: it.title || it.name || "",
        priceCents: Number(it.priceCents || 0),
        qty: Number(it.qty || 1),
        lineTotalCents: Number(it.priceCents || 0) * Number(it.qty || 1),
        image: it.image || null,
      })),
      subtotalCents,
      taxCents: taxes,
      deliveryCents: delivery,
      totalCents: total,
    };

    try {
      setSending(true);

      if (user?.uid) {
        // Try to persist; if rules block, we still show print step
        const ref = await addDoc(
          collection(db, "users", user.uid, "orders"),
          {
            userId: user.uid,
            method: "pickup",
            ...snapshot,
            status: "created",
            createdAt: serverTimestamp(),
          }
        );
        setPendingOrderId(ref.id);
      } else {
        setPendingOrderId("LOCAL-DEMO");
      }

      // Clear cart and show the print step
      clearCart();
      setOpen(false);
      setPendingOrder(snapshot);
      setReadyToPrint(true);
    } catch {
      // Permission denied or any failure → still proceed to print step
      clearCart();
      setOpen(false);
      setPendingOrder(snapshot);
      setPendingOrderId("LOCAL-DEMO");
      setReadyToPrint(true);
    } finally {
      setSending(false);
    }
  }

  function handlePrintThenHome() {
    if (pendingOrder) {
      openClientReceipt({ order: pendingOrder, orderId: pendingOrderId });
    }
    // Give the print tab a moment to open; then go home either way (print or cancel)
    setTimeout(() => router.push("/"), 1200);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 pt-40 text-black font-serif bg-white">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      {items.length === 0 && !readyToPrint ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {!readyToPrint ? (
            <>
              <section className="border rounded-lg p-4 mb-4">
                <h2 className="font-semibold mb-2">Order Summary</h2>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={it.image || "/fallback.png"} alt={it.title} className="w-12 h-12 rounded object-cover" />
                        <div className="truncate">
                          <div className="truncate">{it.title}</div>
                          <div className="text-sm text-gray-600">
                            Qty {it.qty} × {money(it.priceCents)}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">{money(it.priceCents * it.qty)}</div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotalCents)}</span></div>
                  <div className="flex justify-between"><span>GST (demo 5%)</span><span>{money(taxes)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>{money(delivery)}</span></div>
                  <div className="flex justify-between text-lg font-semibold pt-1">
                    <span>Total</span><span>{money(total)}</span>
                  </div>
                </div>
              </section>

              <form onSubmit={placeOrder} className="border rounded-lg p-4 space-y-3">
                <h2 className="font-semibold">Payment (Demo)</h2>

                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pay" defaultChecked /> Pay on pickup
                  </label>
                  <label className="flex items-center gap-2 text-gray-500">
                    <input type="radio" name="pay" disabled /> Card (demo)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded py-2 text-white disabled:opacity-60"
                  style={{ background: "#ff6a00" }}
                >
                  {sending ? "Placing order…" : "Place order (demo)"}
                </button>

                <p className="text-[11px] text-gray-500">
                  Demo only — no real payment is processed.
                </p>
              </form>
            </>
          ) : (
            // After placing order: show ONLY the print step
            <section className="border rounded-lg p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">Order created (demo)</h2>
              <p className="text-sm text-gray-600">
                You can now print / save your receipt as PDF.
              </p>
              <button
                type="button"
                onClick={handlePrintThenHome}
                className="rounded px-4 py-2 text-white"
                style={{ background: "#6b7280" }}
              >
                Print receipt (PDF)
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="underline text-sm"
                >
                  Skip and return to Home
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
