"use client";

import { useCart } from "../app/context/CartProvider";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format((cents || 0) / 100);
}

export default function MiniCart() {
  const { items, removeItem, updateQty, clearCart, subtotalCents, open, setOpen } = useCart();
  const isEmpty = items.length === 0;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}
      <aside
        className="fixed top-0 right-0 h-full w-[380px] max-w-[92vw] bg-white text-black shadow-2xl z-50 flex flex-col"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .2s ease" }}
        aria-hidden={!open}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-2xl leading-none">
            ×
          </button>
        </div>

        {/* items list */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
          {isEmpty ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex gap-3 border rounded-lg p-2">
                <img
                  src={it.image || "/fallback.png"}
                  alt={it.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium truncate">{it.title}</div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="text-red-600 text-sm shrink-0 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">{money(it.priceCents)}</div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}
                      className="h-7 w-7 rounded border leading-none"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{it.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(it.id, it.qty + 1)}
                      className="h-7 w-7 rounded border leading-none"
                    >
                      +
                    </button>

                    <span className="ml-auto text-sm font-semibold">
                      {money(it.priceCents * it.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* sticky footer */}
        <div className="border-t p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="text-lg font-semibold">{money(subtotalCents)}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearCart}
              disabled={isEmpty}
              className={`flex-1 rounded border py-2 ${isEmpty ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isEmpty ? "Cart is already empty" : "Clear cart"}
            >
              Clear
            </button>
            <a
              href="/checkout"
              className={`flex-1 text-center rounded py-2 text-white ${isEmpty ? "pointer-events-none opacity-60" : ""}`}
              style={{ background: "#ff6a00" }}
            >
              Checkout
            </a>
          </div>
          <p className="text-[11px] text-gray-500">Taxes & delivery calculated at checkout.</p>
        </div>
      </aside>
    </>
  );
}
