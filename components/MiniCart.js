"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../app/context/CartProvider";

function money(cents) { return `$${(cents / 100).toFixed(2)}`; }

export default function MiniCart({ onNavigate }) {
  const { items = [], setQty, remove } = useCart();
  const pathname = usePathname();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <div className="p-4 w-80 text-sm">
      <h3 className="font-semibold mb-3">Your Cart</h3>

      {items.length === 0 ? (
        <p className="opacity-70">Cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <div className="truncate">{i.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-2 border rounded disabled:opacity-40" onClick={() => setQty(i.productId, i.qty - 1)} disabled={i.qty <= 1}>−</button>
                    <span>{i.qty}</span>
                    <button className="px-2 border rounded" onClick={() => setQty(i.productId, i.qty + 1)}>+</button>
                    <button className="ml-2 text-red-500" onClick={() => remove(i.productId)}>remove</button>
                  </div>
                </div>
                <div className="shrink-0">{money(i.price * i.qty)}</div>
              </li>
            ))}
          </ul>

          <hr className="my-3" />
          <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>GST (5%)</span><span>{money(tax)}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>{money(total)}</span></div>

          {/* hide CTA if we're already on /checkout */}
          {pathname !== "/checkout" && (
            <Link href="/checkout" className="block mt-4" onClick={onNavigate}>
              <button className="w-full py-2 rounded bg-black text-white disabled:opacity-50">
                Go to Checkout
              </button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
