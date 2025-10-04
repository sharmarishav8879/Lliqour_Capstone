"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/auth/_util/firebase";

function money(cents = 0) {
  const v = Number(cents || 0) / 100;
  return `$${v.toFixed(2)}`;
}

export default function AdminInsights() {
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [period, setPeriod] = useState(30); // days
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [abandoned, setAbandoned] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- guard: admin only
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/");
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.data()?.role?.toLowerCase() || "guest";
      if (role !== "admin") return router.push("/");
      setRoleChecked(true);
    });
    return () => unsub();
  }, [router]);

  // ---- fetch datasets for the selected period
  useEffect(() => {
    if (!roleChecked) return;
    (async () => {
      setLoading(true);

      const since = Timestamp.fromDate(
        new Date(Date.now() - period * 24 * 60 * 60 * 1000)
      );

      // orders
      const oq = query(
        collection(db, "orders"),
        where("createdAt", ">=", since),
        orderBy("createdAt", "desc")
      );
      const os = await getDocs(oq);
      const o = os.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(o);

      // feedback (latest 10)
      try {
        const fq = query(
          collection(db, "feedback"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const fs = await getDocs(fq);
        setFeedback(fs.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setFeedback([]);
      }

      // low stock (if you have `stock` on products)
      try {
        const lq = query(
          collection(db, "products"),
          where("stock", "<=", 10),
          orderBy("stock", "asc"),
          limit(10)
        );
        const ls = await getDocs(lq);
        setLowStock(ls.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setLowStock([]);
      }

      // abandoned carts (cart updated >24h ago and has items)
      try {
        const cutoff = Timestamp.fromDate(
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        const aq = query(
          collection(db, "users"),
          where("cart.updatedAt", "<", cutoff)
        );
        const as = await getDocs(aq);
        const filtered = as.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => (u.cart?.items?.length || 0) > 0);
        setAbandoned(filtered);
      } catch {
        setAbandoned([]);
      }

      setLoading(false);
    })();
  }, [roleChecked, period]);

  // ---- computed metrics
  const metrics = useMemo(() => {
    let revenueCents = 0;
    let itemsSold = 0;
    orders.forEach((o) => {
      // support either explicit total, or subtotal + tax
      const total =
        Number(o.total) || Number(o.subtotal || 0) + Number(o.tax || 0);
      revenueCents += total;
      (o.items || []).forEach((it) => {
        itemsSold += Number(it.qty || 0);
      });
    });
    const ordersCount = orders.length;
    const aov = ordersCount ? revenueCents / ordersCount : 0;
    return { revenueCents, itemsSold, ordersCount, aov };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach((o) =>
      (o.items || []).forEach((it) => {
        const key = it.productId || it.id || it.name;
        const prev = map.get(key) || {
          name: it.name || key,
          qty: 0,
          revenue: 0,
        };
        prev.qty += Number(it.qty || 0);
        prev.revenue += Number(it.price || 0) * Number(it.qty || 0);
        map.set(key, prev);
      })
    );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  function downloadCSV() {
    // simple revenue export (orders within period)
    const rows = [
      ["Order ID", "Date", "Method", "Items", "Subtotal", "Tax", "Total"],
      ...orders.map((o) => [
        o.id,
        o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : "",
        o.method || o.paymentMethod || "",
        (o.items || []).map((i) => `${i.name} x${i.qty}`).join("; "),
        money(o.subtotal || 0),
        money(o.tax || 0),
        money(o.total || (o.subtotal || 0) + (o.tax || 0)),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `insights-${period}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!roleChecked) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold mb-6">Admin Insights</h1>

      <div className="flex items-center gap-3 mb-6">
        <span className="opacity-80">Show last</span>
        <select
          className="bg-black border border-gray-700 rounded px-3 py-2"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>

        <button
          onClick={downloadCSV}
          className="ml-auto px-3 py-2 bg-white text-black rounded"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="opacity-70">Loading…</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPI label="Revenue" value={money(metrics.revenueCents)} />
            <KPI label="Orders" value={metrics.ordersCount} />
            <KPI label="Avg Order" value={money(metrics.aov)} />
            <KPI label="Items Sold" value={metrics.itemsSold} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top products */}
            <Card title="Top Products">
              {topProducts.length === 0 ? (
                <Empty />
              ) : (
                <table className="w-full text-sm">
                  <thead className="opacity-70">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.name} className="border-t border-gray-800">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-right">{p.qty}</td>
                        <td className="py-2 text-right">{money(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Low stock */}
            <Card title="Low Stock (≤ 10)">
              {lowStock.length === 0 ? (
                <div className="text-sm opacity-70">
                  Either everything’s fine or your products don’t have a
                  <code className="mx-1">stock</code> field.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="opacity-70">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => (
                      <tr key={p.id} className="border-t border-gray-800">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-right">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Abandoned carts */}
            <Card title="Abandoned Carts (24h+)">
              {abandoned.length === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-2 text-sm">
                  {abandoned.map((u) => (
                    <li
                      key={u.id}
                      className="border border-gray-800 rounded p-3"
                    >
                      <div className="opacity-70">User: {u.id}</div>
                      <div>
                        Items:{" "}
                        {(u.cart?.items || [])
                          .map((i) => `${i.name} x${i.qty}`)
                          .join(", ")}
                      </div>
                      <div className="opacity-70">
                        Updated:{" "}
                        {u.cart?.updatedAt?.toDate
                          ? u.cart.updatedAt.toDate().toLocaleString()
                          : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Latest feedback */}
            <Card title="Latest Feedback">
              {feedback.length === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-3 text-sm">
                  {feedback.map((f) => (
                    <li
                      key={f.id}
                      className="border border-gray-800 rounded p-3"
                    >
                      <div className="flex justify-between">
                        <div>Rating: {f.rating ?? "—"}/5</div>
                        <div className="opacity-70">
                          {f.createdAt?.toDate
                            ? f.createdAt.toDate().toLocaleString()
                            : ""}
                        </div>
                      </div>
                      {f.comment && (
                        <div className="opacity-90 mt-1">{f.comment}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-800 p-4">
      <div className="opacity-70 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-800 p-4 bg-[#121212]">
      <div className="text-lg font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="text-sm opacity-70">No data to show.</div>;
}
