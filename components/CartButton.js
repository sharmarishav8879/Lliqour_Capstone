// components/CartButton.js
"use client";

import { useCart } from "../app/context/CartProvider";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  // Optional: close on route change if you have router events (App Router usually remounts)
  useEffect(() => {
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = items.reduce((n, it) => n + (it.qty || 1), 0);

  return (

    <button
      aria-label="Cart"
      onClick={() => setOpen(true)}
      className="relative inline-flex items-center justify-center"
      title="Cart"
    >
      <span style={{ fontSize: 22 }}>
        <ShoppingCart />
      </span>
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 rounded-full text-white text-xs px-1.5"
          style={{ background: "#ff6a00" }}
        >
          {count}
        </span>
      )}
    </button>

    <div className="relative" ref={anchorRef}>
      <button
        aria-label="Cart"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        {/* simple cart icon */}
        <span style={{ fontSize: 18 }}>🛒</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 text-[11px] bg-orange-500 text-white rounded-full px-1.5">
            {count}
          </span>
        )}
      </button>

      {/* The new mini popover */}
      <MiniCartPopover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} />
    </div>

  );
}
