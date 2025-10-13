// components/MiniCartPopover.js
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartProvider";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })
    .format((cents || 0) / 100);
}

export default function MiniCartPopover({ open, onClose, anchorRef }) {
  const api = useCart();
  const { items = [], subtotalCents = 0, remove } = api;
  const panelRef = useRef(null);

  // --- helpers to be robust to different CartProvider APIs ---
  const callIf = (fn, ...args) => (typeof fn === "function" ? (fn(...args), true) : false);

  function changeQty(id, delta, currentQty = 1) {
    if (delta < 0) {
      // Try common "decrease" method names
      if (callIf(api.dec, id)) return;
      if (callIf(api.decrease, id)) return;
      if (callIf(api.decrement, id)) return;
      // Fallback: setQty if available
      if (typeof api.setQty === "function") {
        api.setQty(id, Math.max(1, (currentQty || 1) - 1));
        return;
      }
    } else {
      // Try common "increase" method names
      if (callIf(api.inc, id)) return;
      if (callIf(api.increase, id)) return;
      if (callIf(api.increment, id)) return;
      // Fallback: setQty if available
      if (typeof api.setQty === "function") {
        api.setQty(id, (currentQty || 1) + 1);
        return;
      }
    }
    // If nothing matched, no-op (prevents crashes)
    console.warn("MiniCartPopover: no qty change method found on useCart()");
  }

  // Close on outside click / ESC
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      const a = anchorRef?.current;
      const p = panelRef.current;
      if (p && !p.contains(e.target) && a && !a.contains(e.target)) onClose?.();
    }
    function onEsc(e) { if (e.key === "Escape") onClose?.(); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-[320px] sm:w-[360px] rounded-xl border bg-white shadow-xl z-50"
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,.15))" }}
    >
      <div className="p-3 border-b font-semibold">Your Cart</div>

      {items.length === 0 ? (
        <div className="p-4 text-sm text-gray-600">Your cart is empty.</div>
      ) : (
        <>
          <ul className="max-h-[50vh] overflow-auto divide-y">
            {items.map((it) => (
              <li key={it.id} className="p-3 flex gap-3">
                <img
                  src={it.image || "/fallback.png"}
                  alt={it.title}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-gray-600">Qty {it.qty} × {money(it.priceCents)}</div>
                  <div className="text-sm font-semibold">{money((it.priceCents || 0) * (it.qty || 1))}</div>

                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <button
                      onClick={() => changeQty(it.id, -1, it.qty)}
                      className="px-2 py-0.5 border rounded"
                      aria-label="Decrease quantity"
                    >-</button>
                    <span>{it.qty}</span>
                    <button
                      onClick={() => changeQty(it.id, +1, it.qty)}
                      className="px-2 py-0.5 border rounded"
                      aria-label="Increase quantity"
                    >+</button>
                    <button
                      onClick={() => remove?.(it.id)}
                      className="ml-auto text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="p-3 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span><span>{money(subtotalCents)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/checkout"
                className="flex-1 text-center rounded-md py-2 text-white"
                style={{ background: "#ff6a00" }}
                onClick={onClose}
              >
                Checkout
              </Link>
              <button
                className="px-3 rounded-md border"
                onClick={onClose}
                title="Close"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
