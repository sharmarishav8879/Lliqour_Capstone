"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartProvider";   // relative to /app/checkout/page.js
import { db, auth } from "@/app/auth/_util/firebase"; // ← add auth
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format((cents || 0) / 100);
}

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart, setOpen } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

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
    if (!user) {
      alert("Please sign in to place an order.");
      return;
    }

    try {
      setSending(true);

      // Build an order document in CENTS (matches CartProvider shape)
      const order = {
        userId: user.uid,
        method: "pickup",
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
        customerEmail: email.trim() || "",
        emailQueued: Boolean(email.trim()), // queued for later function
        status: "created",
        createdAt: serverTimestamp(),
      };

      // Write under users/{uid}/orders to satisfy common Firestore rules
      const ref = await addDoc(collection(db, "users", user.uid, "orders"), order);
      const orderId = ref.id;

      clearCart();
      setOpen(false);
      router.push(`/receipt/${orderId}?u=${user.uid}`); // pass uid for receipt lookup
    } catch (err) {
      console.error("placeOrder error:", err);
      alert("Sorry—couldn’t place the order (demo). Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 pt-40 text-black font-serif bg-white">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      {items.length === 0 ? (
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

            <label className="block">
              <span className="text-sm text-gray-700">Email for receipt (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded p-2"
                placeholder="you@example.com"
              />
            </label>

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
            <p className="text-[11px] text-gray-500">Demo only — no real payment is processed.</p>
          </form>
        </>
      )}
    </main>
  );
}
