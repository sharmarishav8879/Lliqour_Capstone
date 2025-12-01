// components/CartButton.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useCart } from "../app/context/CartProvider";
import { ShoppingCart } from "lucide-react";
import MiniCartPopover from "./MiniCartPopover";

export default function CartButton() {
  const cart = useCart(); // prefer drawer if available
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const hasDrawer = typeof cart?.setOpen === "function";

  // Fallback popover state (used only when drawer isn't wired)
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef(null);

  // Close popover on scroll (no-op if drawer path)
  useEffect(() => {
    if (hasDrawer) return;
    const onScroll = () => setPopoverOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasDrawer]);

  const count = items.reduce((n, it) => n + (Number(it?.qty) || 1), 0);

  function handleClick() {
    if (hasDrawer) {
      cart.setOpen(true);          // ✅ open right-side mini cart drawer
    } else {
      setPopoverOpen(true);        // ↩︎ fallback to existing popover
    }
  }

  return (
    <div>
      <button
        aria-label="Cart"
        onClick={handleClick}
        className="relative inline-flex items-center justify-center mt-2 ml-4"
        title="Cart"
      >
        <ShoppingCart 
            size={26}
            strokeWidth={1.5}
        />
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2 rounded-full text-white text-xs px-1.5"
            style={{ background: "#ff6a00" }}
          >
            {count}
          </span>
        )}
      </button>

      {/* Fallback popover (renders only when drawer API is not present) */}
      {!hasDrawer && (
        <div className="relative" ref={anchorRef}>
          <MiniCartPopover
            open={popoverOpen}
            onClose={() => setPopoverOpen(false)}
            anchorRef={anchorRef}
          />
        </div>
      )}
    </div>
  );
}
