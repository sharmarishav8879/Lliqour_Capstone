"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/app/auth/_util/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";

function money(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })
    .format((cents || 0) / 100);
}

export default function ReceiptPage({ params }) {
  const { orderId } = params;
  const qs = useSearchParams();
  const uid = qs.get("u"); // when present, we read users/{uid}/orders/{orderId}

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // Prefer user-scoped doc (matches checkout write path).
        const primaryRef = uid
          ? doc(db, "users", uid, "orders", orderId)
          : doc(db, "orders", orderId);

        let snap = await getDoc(primaryRef);

        // If not found and no uid provided, try fallback to top-level (or vice versa)
        if (!snap.exists() && uid) {
          // fallback if someone shared link without ?u
          snap = await getDoc(doc(db, "orders", orderId));
        }

        if (active) setOrder(snap.exists() ? snap.data() : null);
      } catch (e) {
        console.error("receipt load error", e);
        if (active) setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();

    // Optional: auto-print on load. Uncomment next line if desired.
    // window.addEventListener("load", () => setTimeout(() => window.print(), 300));

    return () => {
      active = false;
    };
  }, [orderId, uid]);

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading…</div>;
  if (!order) return <div className="max-w-2xl mx-auto p-6">Order not found.</div>;

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : (order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date());

  return (
    <div className="max-w-[780px] mx-auto my-6 bg-white p-6 shadow print:shadow-none print:my-0 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Legacy Liquor</h1>
          <p className="text-sm text-gray-500">Order #{orderId}</p>
          <p className="text-xs text-gray-500">Date: {createdAt.toLocaleString()}</p>
        </div>
        <div className="w-20 h-20 relative">
          <Image src="/logo.png" alt="Legacy Liquor" fill style={{ objectFit: "contain" }} />
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-sm border-t border-b">
        <thead>
          <tr className="text-left">
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2">Qty</th>
            <th className="py-2 pr-2">Price</th>
            <th className="py-2 pr-2 text-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((it, idx) => (
            <tr key={idx} className="border-t">
              <td className="py-2 pr-2">{it.title || it.name}</td>
              <td className="py-2 pr-2">{it.qty}</td>
              <td className="py-2 pr-2">{money(it.priceCents)}</td>
              <td className="py-2 pr-2 text-right">{money(it.lineTotalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span><span>{money(order.subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span><span>{money(order.taxCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span><span>{money(order.deliveryCents)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-1 border-t mt-2">
          <span>Total</span><span>{money(order.totalCents)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded px-4 py-2 text-white"
          style={{ background: "#ff6a00" }}
        >
          Print receipt
        </button>
        <Link href="/" className="underline">Back to store</Link>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 print:mt-6">
        Thanks for shopping with us!
      </p>

      <style jsx global>{`
        @media print {
          html, body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </div>
  );
}
