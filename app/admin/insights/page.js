"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  collectionGroup,
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

// --- formatting
function money(cents = 0) {
  const v = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD" }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}
function fmtDate(ts) {
  const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null;
  return d ? d.toLocaleString() : "";
}

// --- helpers: normalize data coming from checkout variants
function toDateFlexible(value) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    return new Date(ms);
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function toCents(value) {
  const n = Number(value || 0);
  if (!isFinite(n) || n === 0) return 0;
  if (Number.isInteger(n) && n >= 1000) return n; // likely cents
  return Math.round(n * 100); // likely dollars
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

  // NEW: debug state
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugScan, setDebugScan] = useState({
    topLevelCount: null,
    cg: [],       // [{name, count, samples:[...]}]
    errors: [],   // strings
  });

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

  // ---- fetch datasets for the selected period (robust)
  useEffect(() => {
    if (!roleChecked) return;
    (async () => {
      setLoading(true);

      const sinceTs = Timestamp.fromDate(new Date(Date.now() - period * 24 * 60 * 60 * 1000));
      const sinceDate = sinceTs.toDate();

      let ordersAll = [];
      const dbgErrors = [];
      const dbgCg = [];

      // 1) Try top-level /orders with server filter
      try {
        const oq = query(
          collection(db, "orders"),
          where("createdAt", ">=", sinceTs),
          orderBy("createdAt", "desc")
        );
        const os = await getDocs(oq);
        const top = os.docs.map((d) => ({ id: d.id, ...d.data(), _path: d.ref.path }));
        ordersAll = top;
        // debug: raw count of top-level (regardless of period)
        try {
          const allTop = await getDocs(collection(db, "orders"));
          debugScan.topLevelCount = allTop.size;
        } catch (e) {
          dbgErrors.push(`Top-level count failed: ${String(e?.message || e)}`);
        }
      } catch (e) {
        dbgErrors.push(`Top-level period query failed: ${String(e?.message || e)}`);
      }

      // 2) If nothing (or you want broader catch), scan subcollections commonly used
      const names = ["orders", "order", "transactions", "sales"];
      for (const name of names) {
        try {
          // no orderBy — avoids index errors if field missing; we filter in JS
          const snap = await getDocs(query(collectionGroup(db, name), limit(50)));
          const arr = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              _path: d.ref.path,
              createdAt: data.createdAt ?? data.created_at ?? data.date ?? data.createdOn ?? null,
              total: data.total ?? data.amount ?? data.grandTotal ?? null,
              method: data.method ?? data.paymentMethod ?? null,
              itemsLen: Array.isArray(data.items) ? data.items.length : 0,
              _raw: data,
            };
          });
          dbgCg.push({ name, count: arr.length, samples: arr.slice(0, 5) });

          // Merge into ordersAll if we still have none
          if (ordersAll.length === 0 && arr.length > 0) {
            const filtered = arr
              .filter((o) => {
                const d = toDateFlexible(o.createdAt);
                return d ? d >= sinceDate : true;
              })
              .map((o) => o._raw); // strip debug fields; keep raw data shape
            // We keep as-is; below metrics/topProducts handle flexible fields
            ordersAll = filtered;
          }
        } catch (e) {
          dbgErrors.push(`CG scan '${name}' failed: ${String(e?.message || e)}`);
        }
      }

      setDebugScan((prev) => ({ ...prev, cg: dbgCg, errors: dbgErrors }));

      setOrders(ordersAll);

      // FEEDBACK (latest 10)
      try {
        const fq = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(10));
        const fs = await getDocs(fq);
        setFeedback(fs.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setFeedback([]);
      }

      // LOW STOCK
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

      // ABANDONED CARTS
      try {
        const cutoff = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const aq = query(collection(db, "users"), where("cart.updatedAt", "<", cutoff));
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

  // ---- computed metrics (robust cents/dollars handling)
  const metrics = useMemo(() => {
    let revenueCents = 0;
    let itemsSold = 0;
    orders.forEach((o) => {
      const sub = toCents(o.subtotal);
      const tax = toCents(o.tax);
      const total = toCents(o.total ?? (sub + tax));
      revenueCents += total;
      (o.items || []).forEach((it) => (itemsSold += Number(it.qty || 0)));
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
        const prev = map.get(key) || { name: it.name || key, qty: 0, revenue: 0 };
        const qty = Number(it.qty || 0);
        const priceCents = toCents(it.price || it.priceCents || it.amount);
        prev.qty += qty;
        prev.revenue += priceCents * qty;
        map.set(key, prev);
      })
    );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const paymentMix = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => {
      const method = (o.method || o.paymentMethod || "Unknown").toString();
      const sub = toCents(o.subtotal);
      const tax = toCents(o.tax);
      const total = toCents(o.total ?? (sub + tax));
      const prev = m.get(method) || { method, orders: 0, revenue: 0 };
      prev.orders += 1;
      prev.revenue += total;
      m.set(method, prev);
    });
    const arr = [...m.values()].map((x) => ({ ...x, avg: x.orders ? x.revenue / x.orders : 0 }));
    return arr.sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // --- CSV exports (unchanged except robust totals/dates)
  function downloadCSV() {
    const rows = [
      ["Order ID", "Date", "Method", "Items", "Subtotal", "Tax", "Total"],
      ...orders.map((o) => {
        const sub = toCents(o.subtotal);
        const tax = toCents(o.tax);
        const total = toCents(o.total ?? (sub + tax));
        const created = toDateFlexible(o.createdAt || o.created_at || o.date || o.createdOn);
        return [
          o.id,
          created ? created.toLocaleString() : "",
          o.method || o.paymentMethod || "",
          (o.items || []).map((i) => `${i.name} x${i.qty}`).join("; "),
          money(sub),
          money(tax),
          money(total),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `insights-${period}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadTopProductsCSV() {
    const rows = [
      ["Product", "Quantity", "Revenue"],
      ...topProducts.map((p) => [p.name, p.qty, money(p.revenue)]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `insights-top-products-${period}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!roleChecked) return null;

  // light-orange theme tokens
  const cardBg = "bg-[#FFF4E6]";
  const cardHdr = "bg-[#FFE3C2]";
  const zebra = ["", "bg-white"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-neutral-900">
      <div className="mb-3 flex items-end gap-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Insights</h1>
          <p className="text-sm text-neutral-600">Quick view of orders, trends and health.</p>
        </div>
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="ml-auto px-3 py-2 bg-white border-2 border-black rounded text-xs font-semibold shadow-[0_2px_0_#000] active:translate-y-[1px]"
          title="Toggle diagnostics"
        >
          {debugOpen ? "Hide Debug" : "Debug data"}
        </button>
      </div>

      {/* toolbar */}
      <div className={`flex flex-wrap items-center gap-3 mb-6 rounded-xl border-2 border-black ${cardBg} px-3 py-3 shadow-[0_2px_0_#000]`}>
        <label htmlFor="period" className="text-sm font-medium">Show last</label>
        <select
          id="period"
          className="rounded border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>365 days</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 bg-white border-2 border-black rounded text-sm font-semibold shadow-[0_2px_0_#000] active:translate-y-[1px]"
          >
            Export Orders CSV
          </button>
          <button
            onClick={downloadTopProductsCSV}
            className="px-3 py-2 bg-[#FFEBD3] border-2 border-black rounded text-sm font-semibold shadow-[0_2px_0_#000] active:translate-y-[1px]"
          >
            Export Top Products CSV
          </button>
        </div>
      </div>

      {/* DEBUG CARD (toggle) */}
      {debugOpen && (
        <div className={`mb-6 rounded-2xl border-2 border-black ${cardBg} shadow-[0_3px_0_#000]`}>
          <div className={`text-base font-semibold px-4 py-3 border-b-2 border-black ${cardHdr}`}>
            Diagnostics (live Firestore scan)
          </div>
          <div className="p-4 text-sm">
            <div className="mb-2">
              <div className="font-semibold">Top-level <code>/orders</code> count:</div>
              <div>{debugScan.topLevelCount ?? "—"}</div>
            </div>
            <div className="mb-2">
              <div className="font-semibold">Subcollection scans (first 5 each):</div>
              {debugScan.cg.length === 0 ? (
                <div className="text-neutral-700">No subcollection results yet.</div>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {debugScan.cg.map((g) => (
                    <li key={g.name}>
                      <span className="font-medium">{g.name}</span> — found <b>{g.count}</b>
                      <div className="mt-1 grid sm:grid-cols-2 gap-2">
                        {g.samples.map((s, i) => (
                          <div key={i} className="rounded border border-black/20 bg-white p-2 overflow-auto">
                            <div className="text-xs text-neutral-600 mb-1">{s._path}</div>
                            <pre className="text-[11px] whitespace-pre-wrap break-all">
{JSON.stringify({
  id: s.id,
  createdAt: typeof s.createdAt === "object" && s.createdAt?.seconds ? `Timestamp(${s.createdAt.seconds})` : s.createdAt,
  total: s.total,
  method: s.method,
  itemsLen: s.itemsLen
}, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {debugScan.errors.length > 0 && (
              <div className="mt-3">
                <div className="font-semibold text-red-700">Errors</div>
                <ul className="list-disc pl-5">
                  {debugScan.errors.map((e, i) => (
                    <li key={i} className="text-red-700">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 border-black ${cardBg} p-4 shadow-[0_3px_0_#000] animate-pulse`}
            >
              <div className="h-4 w-24 bg-white/60 rounded mb-3" />
              <div className="h-6 w-32 bg-white/60 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPI label="Revenue" value={money(metrics.revenueCents)} cardBg={cardBg} />
            <KPI label="Orders" value={metrics.ordersCount} cardBg={cardBg} />
            <KPI label="Avg Order" value={money(metrics.aov)} cardBg={cardBg} />
            <KPI label="Items Sold" value={metrics.itemsSold} cardBg={cardBg} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top products */}
            <Card title="Top Products" cardBg={cardBg} cardHdr={cardHdr}>
              {topProducts.length === 0 ? (
                <Empty />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${cardHdr}`}>
                      <tr className="border-b-2 border-black">
                        <th scope="col" className="text-left py-2 px-2">Product</th>
                        <th scope="col" className="text-right py-2 px-2">Qty</th>
                        <th scope="col" className="text-right py-2 px-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {topProducts.map((p, idx) => (
                        <tr key={p.name} className={`border-b border-black/20 ${zebra[idx % 2]} hover:bg-white`}>
                          <td className="py-2 px-2">{p.name}</td>
                          <td className="py-2 px-2 text-right">{p.qty}</td>
                          <td className="py-2 px-2 text-right font-mono">{money(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Low stock */}
            <Card title="Low Stock (≤ 10)" cardBg={cardBg} cardHdr={cardHdr}>
              {lowStock.length === 0 ? (
                <div className="text-sm text-neutral-700">
                  Either everything’s fine or your products don’t have a
                  <code className="mx-1">stock</code> field.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${cardHdr}`}>
                      <tr className="border-b-2 border-black">
                        <th scope="col" className="text-left py-2 px-2">Product</th>
                        <th scope="col" className="text-right py-2 px-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {lowStock.map((p, idx) => (
                        <tr key={p.id} className={`border-b border-black/20 ${zebra[idx % 2]} hover:bg-white`}>
                          <td className="py-2 px-2">{p.name}</td>
                          <td className="py-2 px-2 text-right">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Abandoned carts */}
            <Card title="Abandoned Carts (24h+)" cardBg={cardBg} cardHdr={cardHdr}>
              {abandoned.length === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-2 text-sm">
                  {abandoned.map((u) => (
                    <li key={u.id} className="border-2 border-black rounded-lg p-3 bg.white hover:bg-white/80">
                      <div className="text-neutral-600 text-xs">User</div>
                      <div className="font-medium">{u.id}</div>
                      <div className="mt-1">
                        <span className="text-neutral-600 text-xs">Items</span>:{" "}
                        {(u.cart?.items || []).map((i) => `${i.name} x${i.qty}`).join(", ")}
                      </div>
                      <div className="text-neutral-600 text-xs mt-1">
                        Updated: {u.cart?.updatedAt?.toDate ? u.cart.updatedAt.toDate().toLocaleString() : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Recent orders */}
            <Card title="Recent Orders (10)" cardBg={cardBg} cardHdr={cardHdr}>
              {orders.length === 0 ? (
                <Empty />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${cardHdr}`}>
                      <tr className="border-b-2 border-black">
                        <th scope="col" className="text-left py-2 px-2">Order</th>
                        <th scope="col" className="text-left py-2 px-2">Date</th>
                        <th scope="col" className="text-right py-2 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {orders.slice(0, 10).map((o, idx) => {
                        const sub = toCents(o.subtotal);
                        const tax = toCents(o.tax);
                        const total = toCents(o.total ?? (sub + tax));
                        const d = toDateFlexible(o.createdAt || o.created_at || o.date || o.createdOn);
                        return (
                          <tr key={o.id} className={`border-b border-black/20 ${zebra[idx % 2]} hover:bg-white`}>
                            <td className="py-2 px-2">{o.id}</td>
                            <td className="py-2 px-2">{d ? d.toLocaleString() : ""}</td>
                            <td className="py-2 px-2 text-right font-mono">{money(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Latest feedback */}
            <Card title="Latest Feedback" cardBg={cardBg} cardHdr={cardHdr}>
              {feedback.length === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-3 text-sm">
                  {feedback.map((f) => (
                    <li key={f.id} className="border-2 border-black rounded-lg p-3 bg-white hover:bg-white/80">
                      <div className="flex justify-between">
                        <div>Rating: {f.rating ?? "—"}/5</div>
                        <div className="text-neutral-600">
                          {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleString() : ""}
                        </div>
                      </div>
                      {f.comment && <div className="mt-1">{f.comment}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Payment Mix */}
            <Card title={`Payment Mix (${period}d)`} cardBg={cardBg} cardHdr={cardHdr}>
              {paymentMix.length === 0 ? (
                <Empty />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${cardHdr}`}>
                      <tr className="border-b-2 border-black">
                        <th scope="col" className="text-left py-2 px-2">Method</th>
                        <th scope="col" className="text-right py-2 px-2">Orders</th>
                        <th scope="col" className="text-right py-2 px-2">Revenue</th>
                        <th scope="col" className="text-right py-2 px-2">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {paymentMix.map((r, idx) => (
                        <tr key={r.method} className={`border-b border-black/20 ${zebra[idx % 2]} hover:bg-white`}>
                          <td className="py-2 px-2">{r.method}</td>
                          <td className="py-2 px-2 text-right">{r.orders}</td>
                          <td className="py-2 px-2 text-right font-mono">{money(r.revenue)}</td>
                          <td className="py-2 px-2 text-right font-mono">{money(r.avg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ label, value, cardBg }) {
  return (
    <div className={`rounded-2xl border-2 border-black ${cardBg} p-4 shadow-[0_3px_0_#000]`}>
      <div className="text-xs text-neutral-700 font-semibold">{label}</div>
      <div className="text-3xl font-extrabold mt-1 font-mono tabular-nums tracking-tight">{value}</div>
    </div>
  );
}

function Card({ title, children, cardBg, cardHdr }) {
  return (
    <div className={`rounded-2xl border-2 border-black ${cardBg} shadow-[0_3px_0_#000]`}>
      <div className={`text-base font-semibold px-4 py-3 border-b-2 border-black ${cardHdr}`}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-neutral-700">No data to show.</div>;
}
