"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "../app/context/CartProvider";
import { FaRegTrashAlt } from "react-icons/fa";

function money(cents) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format((cents || 0) / 100);
}

export default function MiniCart() {
  const {
    items,
    removeItem,
    updateQty,
    clearCart,
    subtotalCents,
    open,
    setOpen,
  } = useCart();
  const isEmpty = items.length === 0;

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <main className="font-serif">
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className="fixed top-0 right-0 h-full w-[380px] max-w-[92vw] bg-white shadow-2xl z-50 flex flex-col"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .2s ease",
        }}
        aria-hidden={!open}
        aria-label="Mini cart drawer"
      >
        {/* header */}
<div className="relative px-4 py-3">
  <h3 className="text-lg font-semibold text-center">Your Cart</h3>
  <button
    type="button"
    onClick={() => setOpen(false)}
    aria-label="Close"
    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl leading-none"
  >
    ×
  </button>
</div>

        {/* items list */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
          {isEmpty ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex gap-3 rounded-lg shadow-xl px-4 py-3">
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
                       className="w-10 h-10 rounded-full flex items-center justify-center shadow bg-red-500 text-white"
                    >
                      <FaRegTrashAlt size={18} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {money(it.priceCents)}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQty(it.id, Math.max(1, (it.qty || 1) - 1))
                      }
                      className="h-7 w-7 rounded border leading-none"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{it.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                      className="h-7 w-7 rounded border leading-none"
                    >
                      +
                    </button>

                    <span className="ml-auto text-sm font-semibold">
                      {money((it.priceCents || 0) * (it.qty || 1))}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* sticky footer */}
        <div className="p-4 space-y-3 bg-white">
          {/* subtotal row */}
          <div className="flex items-center justify-between">
            <span className="text-gray-800">Subtotal</span>
            <span className="text-lg font-semibold">
              {money(subtotalCents)}
            </span>
          </div>

          {/* action buttons */}
          <div className="flex gap-2">
            {/* Clear button */}
            <button
              type="button"
              onClick={clearCart}
              disabled={isEmpty}
              className={`
                flex-1 text-center py-3 rounded-lg font-medium
               text-white
                  bg-gradient-to-r from-gray-400 to-gray-500 shadow-md
                 hover:from-gray-500 hover:to-gray-600
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                ${isEmpty ? "pointer-events-none opacity-50" : ""}
              `}
              title={isEmpty ? "Cart is already empty" : "Clear cart"}
            >
              Clear
            </button>

            {/* Checkout button */}
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className={`
                !text-white
                flex-1 text-center py-3 rounded-lg font-medium
                bg-gradient-to-r from-orange-500 to-amber-400 shadow-md
               hover:from-orange-600 hover:to-amber-500
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${isEmpty ? "pointer-events-none opacity-75" : ""}
            `}
              aria-disabled={isEmpty}
            >
              Checkout
            </Link>
          </div>

          <p className="text-[11px] text-gray-500">
            Taxes &amp; delivery calculated at checkout.
          </p>
        </div>
      </aside>
    </main>
  );
}
