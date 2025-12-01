"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartProvider";
import { db, auth } from "@/app/auth/_util/firebase";
import { addDoc, collection, doc, serverTimestamp, setDoc, increment } from "firebase/firestore";

const DEMO_ONLY = process.env.NEXT_PUBLIC_DEMO_RECEIPT_ONLY === "1";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })
    .format((cents || 0) / 100);
}
function calculateLoyaltyPointsFromOrder(order) {
  const cents =
    order.totalCents ??
    order.total ??
    0;

  const dollars = Number(cents) / 100;
  if (!isFinite(dollars) || dollars <= 0) return 0;

  // Earn 1 point for every full $10 spent
  return Math.floor(dollars / 10);
}

/* ---------- Fallback HTML receipt (used in demo-only mode or on write failure) ---------- */
function buildReceiptHTML({ orderId = "LOCAL-DEMO", createdAt, items, subtotalCents, taxCents, deliveryCents, totalCents }) {
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${orderId}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }
    .page { max-width: 720px; margin: 0 auto; background: white; padding: 24px 28px; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,0.18); }
    h1 { margin-top: 0; font-size: 24px; }
    .meta { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 8px 6px; font-size: 13px; }
    thead th { text-align: left; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
    tbody td { border-bottom: 1px solid #f3f4f6; }
    tfoot td { font-size: 14px; }
    tfoot tr:nth-child(3) td { font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .total-row td { font-size: 15px; font-weight: 700; }
    .brand { font-size: 12px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.12em; margin-bottom: 4px; }
    .footer { margin-top: 18px; font-size: 12px; color: #6b7280; }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">Legacy Liquor • Order Receipt</div>
    <h1>Order ${orderId}</h1>
    <div class="meta">
      <div>Date: ${createdAt ? new Date(createdAt).toLocaleString() : "—"}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Item</th>
          <th style="width: 15%; text-align:center;">Qty</th>
          <th style="width: 15%;">Price</th>
          <th style="width: 20%; text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" style="padding:16px 4px;color:#6b7280;">No items found.</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;padding-top:8px;">Subtotal</td>
          <td style="text-align:right;padding-top:8px;">${money(subtotalCents)}</td>
        </tr>
        <tr>
          <td colspan="3" style="text-align:right;">GST</td>
          <td style="text-align:right;">${money(taxCents)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align:right;">Total</td>
          <td style="text-align:right;">${money(totalCents)}</td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">
      Thank you for shopping with Legacy Liquor. This is a demo receipt generated from the capstone project.
    </div>
  </div>
</body>
</html>
  `;
}

/* ---------- Modal to show receipt in new window ---------- */
function openClientReceipt({ orderId, order }) {
  try {
    const html = buildReceiptHTML({
      orderId,
      createdAt: Date.now(),
      items: order.items || [],
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      deliveryCents: order.deliveryCents,
      totalCents: order.totalCents,
    });
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  } catch (e) {
    console.warn("Failed to open receipt window", e);
  }
}

/* ---------- Checkout page ---------- */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();

  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Basic guard: if cart is empty, send them back
    if (!items || items.length === 0) {
      setOpen(false);
    }
  }, [items]);

  const delivery = 0;
  const taxes = Math.round(subtotalCents * 0.05);
  const total = subtotalCents + delivery + taxes;

  async function placeOrder(e) {
    e.preventDefault();
    if (!items || items.length === 0 || sending) return;

    // unified snapshot
    const snapshot = {
      items: items.map((it) => ({
        id: it.id,
        productId: it.id,
        title: it.title || it.name || "",
        name: it.title || it.name || "",
        priceCents: Number(it.priceCents || 0),
        qty: Number(it.qty || 1),
        lineTotalCents: Number(it.priceCents || 0) * Number(it.qty || 1),
        image: it.image || null,
      })),
      subtotalCents,
      taxCents: taxes,
      deliveryCents: delivery,
      totalCents: total,
      status: "created",
    };

    // Demo/presentation mode: skip Firestore to avoid permission errors
    if (DEMO_ONLY) {
      setSending(true);
      clearCart();
      setOpen(false);
      openClientReceipt({ order: snapshot, orderId: "LOCAL-DEMO" });
      setTimeout(() => router.push("/"), 1200);
      setSending(false);
      return;
    }

    try {
      setSending(true);
      const user = auth.currentUser;

      if (user?.uid) {
        // build a base order object for loyalty + writes
        const baseOrder = {
          ...snapshot,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };

        const loyaltyPoints = calculateLoyaltyPointsFromOrder(baseOrder);

        // write to user-scoped, then mirror to top-level with same id
        const userOrderRef = await addDoc(
          collection(db, "users", user.uid, "orders"),
          {
            ...baseOrder,
            loyaltyPointsEarned: loyaltyPoints,
          }
        );

        await setDoc(
          doc(db, "orders", userOrderRef.id),
          {
            id: userOrderRef.id,
            ...baseOrder,
            loyaltyPointsEarned: loyaltyPoints,
          }
        );

        if (loyaltyPoints > 0) {
          await setDoc(
            doc(db, "users", user.uid),
            {
              loyaltyPoints: increment(loyaltyPoints),
              lifetimeLoyaltyPoints: increment(loyaltyPoints),
            },
            { merge: true }
          );
        }

        clearCart();
        setOpen(false);
        router.push(`/receipt/${userOrderRef.id}?u=${user.uid}`);
        return;
      }

      // guest: top-level only
      const topLevelRef = await addDoc(collection(db, "orders"), {
        ...snapshot,
        anonymous: true,
        loyaltyPointsEarned: 0,
        createdAt: serverTimestamp(),
      });

      clearCart();
      setOpen(false);
      router.push(`/receipt/${topLevelRef.id}`);
    } catch (err) {
      // Use warn (not error) so Next dev overlay doesn't hijack the screen
      if (process.env.NODE_ENV !== "production") {
        console.warn("checkout write failed; using local receipt only", err);
      }
      clearCart();
      setOpen(false);
      openClientReceipt({ order: snapshot, orderId: "LOCAL-FAILOVER" });
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <main className="max-w-3xl mx-auto pt-28 pb-10 px-4">
        {!items || items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <p>Checkout closed.</p>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto pt-28 pb-10 px-4">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">Checkout</h1>

      {!items || items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
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
                        {money(it.priceCents)} × {it.qty}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono">
                    {money(Number(it.priceCents || 0) * Number(it.qty || 1))}
                  </div>
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
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="pay" defaultChecked />
                <span>Credit / Debit card</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <input type="radio" name="pay" disabled />
                <span>Gift card (coming soon)</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <input
                className="border rounded px-2 py-1"
                placeholder="Card number"
                required
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Name on card"
                required
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="MM/YY"
                required
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="CVC"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded py-2 text-white disabled:opacity-60"
              style={{ background: "#ff6a00" }}
            >
              {sending ? "Placing order…" : "Place order (demo)"}
            </button>

            <p className="text-[11px] text-gray-500">Demo only — no real payment is processed.</p>
          </form>
        </>
      )}
    </main>
  );
}
