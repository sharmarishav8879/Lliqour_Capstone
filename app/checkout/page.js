"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useCart } from "../context/CartProvider";

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const { items, clear } = useCart();

  // totals
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // ui state
  const [method, setMethod] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  // feedback
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");

  // snapshot used ONLY for printing (so it still prints after cart is cleared)
  const [receipt, setReceipt] = useState(null);

  async function placeOrder() {
    try {
      setError("");
      setPlacing(true);

      // snapshot BEFORE clear()
      const snapshot = {
        items: items.map((i) => ({ ...i })),
        subtotal,
        tax,
        total,
        method,
        placedAtLocal: new Date().toLocaleString(),
      };

      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, "orders"), {
        userId: user?.uid ?? "anon",
        items,
        subtotal,
        tax,
        total,
        method,
        status: "placed",
        createdAt: serverTimestamp(),
      });

      setOrderId(docRef.id);
      setReceipt({ ...snapshot, orderId: docRef.id });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  async function submitFeedback(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "feedback"), {
        orderId: orderId ?? null,
        rating,
        comments,
        createdAt: serverTimestamp(),
      });
      setComments("");
      alert("Thanks for the feedback!");
    } catch {
      alert("Failed to submit feedback");
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] pt-28 pb-20 px-4">
      {/* Centered page grid */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Payment / place order */}
        <div className="rounded-2xl border border-neutral-700 bg-white/5 text-white p-6 shadow-md">
          <h2 className="text-2xl font-serif text-orange-500 mb-4">Checkout</h2>

          <div className="mb-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span><span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span><span>{money(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span><span>{money(total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold mb-2">Payment method</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="card"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                <span>Card (simulated)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="cod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              disabled={items.length === 0 || placing}
              onClick={placeOrder}
              className="px-5 py-2 rounded bg-black text-white disabled:opacity-40"
            >
              {placing ? "Placing..." : "Place order"}
            </button>

            {/* Print only available after order placed (uses receipt snapshot) */}
            {receipt && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded border border-orange-500 text-orange-500 hover:bg-orange-500/10"
              >
                Print receipt
              </button>
            )}

            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </div>

        {/* RIGHT: Order summary (center the card width) */}
        <aside className="rounded-2xl border border-neutral-700 bg-white/5 text-white p-6 shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-serif text-orange-500 mb-3">Order Summary</h3>

          {items.length > 0 ? (
            <ul className="divide-y divide-neutral-700 mb-4">
              {items.map((i) => (
                <li key={i.productId} className="py-3 flex justify-between">
                  <span className="truncate pr-2">
                    {i.name} × {i.qty}
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-75 mb-4">Your cart is empty.</p>
          )}

          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span><span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span><span>{money(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span><span>{money(total)}</span>
            </div>
          </div>
        </aside>

        {/* Feedback (full width) */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-700 bg-white/5 text-white p-6 shadow-md">
          <h3 className="text-xl font-serif text-orange-500 mb-4">
            Rate your checkout experience
          </h3>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <span>Rating: {rating}/5</span>
          </div>

          <form onSubmit={submitFeedback} className="mt-4 space-y-3">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any comments?"
              className="w-full h-24 p-3 rounded border border-neutral-700 bg-transparent"
            />
            <button className="px-4 py-2 rounded bg-black text-white">Submit</button>
          </form>
        </div>
      </section>

      {/* PRINT-ONLY RECEIPT (not visible on screen; shown only in print) */}
      {receipt && (
        <div id="print-receipt" className="print-area text-black" style={{ display: "none" }}>
          <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Legacy Liquor — Receipt</h1>

            <div style={{ marginBottom: 12, fontSize: 14 }}>
              <div><strong>Order ID:</strong> {receipt.orderId}</div>
              <div><strong>Date:</strong> {receipt.placedAtLocal}</div>
              <div><strong>Payment method:</strong> {receipt.method === "card" ? "Card (simulated)" : "Cash on Delivery"}</div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 0", borderBottom: "1px solid #ccc" }}>Item</th>
                  <th style={{ textAlign: "right", padding: "6px 0", borderBottom: "1px solid #ccc" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "6px 0", borderBottom: "1px solid #ccc" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((i) => (
                  <tr key={i.productId}>
                    <td style={{ padding: "6px 0" }}>{i.name}</td>
                    <td style={{ padding: "6px 0", textAlign: "right" }}>{i.qty}</td>
                    <td style={{ padding: "6px 0", textAlign: "right" }}>{money(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ paddingTop: 8 }} />
                  <td style={{ paddingTop: 8, textAlign: "right" }}>Subtotal</td>
                  <td style={{ paddingTop: 8, textAlign: "right" }}>{money(receipt.subtotal)}</td>
                </tr>
                <tr>
                  <td />
                  <td style={{ textAlign: "right" }}>GST (5%)</td>
                  <td style={{ textAlign: "right" }}>{money(receipt.tax)}</td>
                </tr>
                <tr>
                  <td />
                  <td style={{ fontWeight: 700, textAlign: "right" }}>Total</td>
                  <td style={{ fontWeight: 700, textAlign: "right" }}>{money(receipt.total)}</td>
                </tr>
              </tfoot>
            </table>

            <p style={{ marginTop: 16, fontSize: 13 }}>
              Thank you for shopping with Legacy Liquor.
            </p>
          </div>
        </div>
      )}

      {/* Print styles: only print the receipt snapshot */}
      <style jsx global>{`
        @media screen {
          .print-area { display: none; }
        }
        @media print {
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #print-receipt, #print-receipt * {
            visibility: visible !important;
          }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          nav, footer { display: none !important; }
          @page { margin: 16mm; }
        }
      `}</style>
    </main>
  );
}
