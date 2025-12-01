"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection, collectionGroup, doc, getDoc, getDocs, query,
  where, orderBy, limit, Timestamp, onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/auth/_util/firebase";
import { useTheme } from "@/components/ThemeToggle";

/* ---------- format helpers ---------- */
function money(cents = 0) {
  const v = Number(cents || 0) / 100;
  try { return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(v); }
  catch { return `$${v.toFixed(2)}`; }
}
function toDateFlexible(x){
  if (x?.toDate) return x.toDate();
  if (x instanceof Date) return x;
  if (typeof x==="number") return new Date(x < 1e12 ? x*1000 : x);
  if (typeof x==="string"){ const d=new Date(x); return isNaN(d)?null:d; }
  return null;
}
function toCents(v){
  const n = Number(v || 0);
  if (!isFinite(n) || n === 0) return 0;
  if (Number.isInteger(n) && n >= 1000) return n;
  return Math.round(n*100);
}

/* ========================================= */
export default function AdminInsights(){
  const router = useRouter();
  const { theme } = useTheme();

  const [roleChecked, setRoleChecked] = useState(false);
  const [period, setPeriod] = useState(30);
  const [ordersLive, setOrdersLive] = useState([]);   // last 50
  const [feedback, setFeedback] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [abandoned, setAbandoned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveBlocked, setLiveBlocked] = useState(false);

  const [debugOpen, setDebugOpen] = useState(false);
  const [debugScan, setDebugScan] = useState({ topLevelCount:null, errors:[] });

  /* ----- admin gate ----- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/");
      const snap = await getDoc(doc(db,"users",u.uid));
      const role = (snap.data()?.role || "guest").toLowerCase();
      if (role !== "admin") return router.push("/");
      setRoleChecked(true);
    });
    return () => unsub();
  }, [router]);

  /* ----- data load (orders + others) ----- */
  useEffect(() => {
    if (!roleChecked) return;

    setLoading(true);

    /** 1) One-time fetch first so list shows even if live listener is blocked */
    (async () => {
      try {
        let baseQ = query(collection(db,"orders"), orderBy("createdAt","desc"), limit(50));
        let snap;
        try {
          snap = await getDocs(baseQ);
        } catch {
          // fallback if some docs miss createdAt: order by id
          baseQ = query(collection(db,"orders"), orderBy("__name__","desc"), limit(50));
          snap = await getDocs(baseQ);
        }
        const rows = [];
        snap.forEach(d => rows.push({ id:d.id, ...d.data() }));
        setOrdersLive(rows);
      } catch (e) {
        console.warn("initial orders load failed", e);
        setOrdersLive([]);
      } finally {
        setLoading(false);
      }
    })();

    /** 2) Try live updates; if rules block, keep the one-time list */
    let unsub = () => {};
    (async () => {
      try {
        const qLive = query(collection(db,"orders"), orderBy("createdAt","desc"), limit(50));
        unsub = onSnapshot(qLive, (s) => {
          const rows = [];
          s.forEach(d => rows.push({ id:d.id, ...d.data() }));
          setOrdersLive(rows);
          setLiveBlocked(false);
        }, (err) => {
          console.warn("live orders blocked:", err?.message || err);
          setLiveBlocked(true);
        });
      } catch (e) {
        setLiveBlocked(true);
      }
    })();

    /** side panels */
    (async () => {
      try {
        const allTop = await getDocs(collection(db,"orders"));
        setDebugScan(p => ({...p, topLevelCount: allTop.size}));
      } catch (e) {
        setDebugScan(p => ({...p, errors:[...(p.errors||[]), `Count failed: ${String(e?.message||e)}`]}));
      }
      try {
        const fq = query(collection(db,"feedback"), orderBy("createdAt","desc"), limit(10));
        const fs = await getDocs(fq);
        setFeedback(fs.docs.map(d => ({id:d.id,...d.data()})));
      } catch { setFeedback([]); }
      try {
        const lq = query(collection(db,"products"), where("stock","<=",10), orderBy("stock","asc"), limit(10));
        const ls = await getDocs(lq);
        setLowStock(ls.docs.map(d => ({id:d.id,...d.data()})));
      } catch { setLowStock([]); }
      try {
        const cutoff = Timestamp.fromDate(new Date(Date.now()-24*60*60*1000));
        const aq = query(collection(db,"users"), where("cart.updatedAt","<",cutoff));
        const as = await getDocs(aq);
        setAbandoned(as.docs.map(d => ({id:d.id,...d.data()})).filter(u => (u.cart?.items?.length||0)>0));
      } catch { setAbandoned([]); }
    })();

    return () => unsub();
  }, [roleChecked]);

  /* ----- period window + derived orders ----- */
  const windowStart = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate()-period); return d;
  }, [period]);

  const orders = useMemo(() =>
    ordersLive.filter(o => {
      const d = toDateFlexible(o.createdAt || o.created_at || o.date || o.createdOn);
      return d ? d >= windowStart : true;
    }), [ordersLive, windowStart]
  );

  /* ----- metrics ----- */
  const metrics = useMemo(() => {
    let revenueCents=0, itemsSold=0;
    orders.forEach(o => {
      const sub = toCents(o.subtotal ?? o.subtotalCents);
      const tax = toCents(o.tax ?? o.taxCents);
      const total = toCents(o.total ?? o.totalCents ?? sub + tax);
      revenueCents += total;
      (o.items||[]).forEach(it => itemsSold += Number(it.qty||0));
    });
    const ordersCount = orders.length;
    const aov = ordersCount ? revenueCents/ordersCount : 0;
    return { revenueCents, itemsSold, ordersCount, aov };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach(o => (o.items||[]).forEach(it => {
      const key = it.productId || it.id || it.name || it.title || "unknown";
      const prev = map.get(key) || { name: it.name || it.title || key, qty:0, revenue:0 };
      const qty = Number(it.qty||0);
      const price = toCents(it.price || it.priceCents || it.amount);
      prev.qty += qty; prev.revenue += price*qty;
      map.set(key, prev);
    }));
    return [...map.values()].sort((a,b)=>b.qty-a.qty).slice(0,5);
  }, [orders]);

  const paymentMix = useMemo(() => {
    const m=new Map();
    orders.forEach(o=>{
      const method=(o.method || o.paymentMethod || "Unknown").toString();
      const sub=toCents(o.subtotal ?? o.subtotalCents);
      const tax=toCents(o.tax ?? o.taxCents);
      const total=toCents(o.total ?? o.totalCents ?? sub+tax);
      const prev=m.get(method)||{method,orders:0,revenue:0};
      prev.orders+=1; prev.revenue+=total; m.set(method,prev);
    });
    return [...m.values()].map(x=>({...x,avg:x.orders?x.revenue/x.orders:0})).sort((a,b)=>b.revenue-a.revenue);
  }, [orders]);

  /* ----- THEME TOKENS (Orange/White light, same dark) ----- */
  const lightPanel       = "bg-white text-neutral-900 border border-orange-200";
  const lightHeader      = "bg-orange-50 text-orange-900 border-b border-orange-200";
  const lightZebra       = ["", "bg-orange-50/40"];
  const lightBtn         = "bg-white border border-orange-300 hover:bg-orange-50 text-orange-700";
  const lightBadge       = "text-[12px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200";

  const darkPanel        = "bg-[#0f1115] text-neutral-100 border border-neutral-800";
  const darkHeader       = "bg-[#151821] text-neutral-100 border-b border-neutral-800";
  const darkZebra        = ["", "bg-[#141820]"];
  const darkBtn          = "bg-neutral-800 border border-neutral-700 hover:bg-neutral-700/60";
  const darkBadge        = "text-[12px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700";

  const panel      = theme==="light" ? lightPanel  : darkPanel;
  const headerBar  = theme==="light" ? lightHeader : darkHeader;
  const zebra      = theme==="light" ? lightZebra  : darkZebra;
  const btn        = theme==="light" ? lightBtn    : darkBtn;
  const badge      = theme==="light" ? lightBadge  : darkBadge;

  /* ----- UI ----- */
  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-10 text-[15px]">
      <div className="mb-4 flex items-end gap-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Insights</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Live sales, trends, and health overview.
          </p>
        </div>
        <button onClick={()=>setDebugOpen(v=>!v)} className={`ml-auto rounded px-3 py-2 text-sm font-semibold ${btn}`}>
          {debugOpen ? "Hide Debug" : "Debug data"}
        </button>
      </div>

      <div className={`mb-6 rounded-xl px-3 py-3 flex flex-wrap items-center gap-3 ${panel}`}>
        <label htmlFor="period" className="text-sm font-medium">Show last</label>
        <select id="period" value={period} onChange={(e)=>setPeriod(Number(e.target.value))}
                className={`rounded px-3 py-2 text-sm outline-none ${panel}`}>
          <option value={7}>7 days</option><option value={14}>14 days</option>
          <option value={30}>30 days</option><option value={90}>90 days</option>
          <option value={180}>180 days</option><option value={365}>365 days</option>
        </select>

        {liveBlocked && (
          <span className={`${badge} ml-2`} title="Falling back to one-time fetch (rules block live read)">
            live updates blocked by rules
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={()=>downloadOrdersCSV(orders)} className={`rounded px-3 py-2 text-sm font-semibold ${btn}`}>
            Export Orders CSV
          </button>
          <button onClick={()=>downloadTopCSV(topProducts, period)} className={`rounded px-3 py-2 text-sm font-semibold ${btn}`}>
            Export Top Products CSV
          </button>
        </div>
      </div>

      {debugOpen && (
        <div className={`mb-6 rounded-2xl overflow-hidden ${panel}`}>
          <div className={`px-4 py-3 text-base font-semibold ${headerBar}`}>Diagnostics (live Firestore scan)</div>
          <div className="p-4 text-sm">
            <div className="font-semibold mb-1">Top-level <code>/orders</code> count:</div>
            <div className="mb-3">{debugScan.topLevelCount ?? "—"}</div>
            {debugScan.errors?.length>0 && (
              <>
                <div className="font-semibold text-red-700 dark:text-red-400">Errors</div>
                <ul className="list-disc pl-5">
                  {debugScan.errors.map((e,i)=><li key={i} className="text-red-700 dark:text-red-400">{e}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_,i)=>(
            <div key={i} className={`rounded-xl p-4 animate-pulse ${panel}`}>
              <div className="h-4 w-24 bg-black/10 dark:bg-white/10 rounded mb-3"/>
              <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded"/>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPI label="Revenue" value={money(metrics.revenueCents)} panel={panel}/>
            <KPI label="Orders" value={metrics.ordersCount} panel={panel}/>
            <KPI label="Avg Order" value={money(metrics.aov)} panel={panel}/>
            <KPI label="Items Sold" value={metrics.itemsSold} panel={panel}/>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top products */}
            <Card title="Top Products" panel={panel} header={headerBar}>
              {topProducts.length===0 ? <Empty/> : (
                <Table header={headerBar} zebra={zebra} rows={topProducts.map((p)=>({
                  c:[
                    p.name,
                    {r:p.qty},
                    {r:money(p.revenue), mono:true}
                  ]
                }))} cols={["Product","Qty","Revenue"]}/>
              )}
            </Card>

            {/* Low stock */}
            <Card title="Low Stock (≤ 10)" panel={panel} header={headerBar}>
              {lowStock.length===0 ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  Either everything’s fine or your products don’t have a <code>stock</code> field.
                </div>
              ) : (
                <Table header={headerBar} zebra={zebra}
                       rows={lowStock.map(p=>({c:[p.name,{r:p.stock}]}))}
                       cols={["Product","Stock"]}/>
              )}
            </Card>

            {/* Recent orders (live when allowed) */}
            <Card title="Recent Orders" panel={panel} header={headerBar}>
              {ordersLive.length===0 ? <Empty/> : (
                <Table header={headerBar} zebra={zebra}
                       rows={ordersLive.slice(0,10).map(o=>{
                         const sub=toCents(o.subtotal ?? o.subtotalCents);
                         const tax=toCents(o.tax ?? o.taxCents);
                         const total=toCents(o.total ?? o.totalCents ?? sub+tax);
                         const d=toDateFlexible(o.createdAt || o.created_at || o.date || o.createdOn);
                         const items=(o.items||[]).reduce((n,it)=>n+Number(it.qty||0),0);
                         return { c:[`#${o.id}`, d?d.toLocaleString():"", {r:money(total), mono:true}, {r:items}] };
                       })}
                       cols={["Order","Date","Total","Items"]}/>
              )}
            </Card>

            {/* Feedback */}
            <Card title="Latest Feedback" panel={panel} header={headerBar}>
              {feedback.length===0 ? <Empty/> : (
                <ul className="space-y-3 text-sm">
                  {feedback.map(f=>(
                    <li key={f.id} className={`rounded-lg p-3 ${panel}`}>
                      <div className="flex justify-between">
                        <div>Rating: {f.rating ?? "—"}/5</div>
                        <div className="text-neutral-600 dark:text-neutral-300">
                          {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleString() : ""}
                        </div>
                      </div>
                      {f.comment && <div className="mt-1">{f.comment}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Payment mix */}
            <Card title={`Payment Mix (${period}d)`} panel={panel} header={headerBar}>
              {paymentMix.length===0 ? <Empty/> : (
                <Table header={headerBar} zebra={zebra}
                       rows={paymentMix.map(r=>({c:[
                         r.method, {r:r.orders}, {r:money(r.revenue), mono:true}, {r:money(r.avg), mono:true}
                       ]}))}
                       cols={["Method","Orders","Revenue","Avg"]}/>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- dumb UI pieces ---------- */
function KPI({label,value,panel}) {
  return (
    <div className={`rounded-xl p-4 ${panel}`}>
      <div className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">{label}</div>
      <div className="text-3xl font-extrabold mt-1 font-mono tabular-nums tracking-tight">{value}</div>
    </div>
  );
}
function Card({title,children,panel,header}) {
  return (
    <div className={`rounded-2xl overflow-hidden ${panel}`}>
      <div className={`px-4 py-3 text-base font-semibold ${header}`}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function Table({header,zebra,rows,cols}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className={header}>
          <tr className="border-0">
            {cols.map((c,i)=>(
              <th key={i} className={`py-2 px-2 ${i===0?'text-left':'text-right'}`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r,idx)=>(
            <tr key={idx} className={`${zebra[idx%2]} border-b border-orange-200/60 dark:border-neutral-800`}>
              {r.c.map((cell,i)=>(
                <td key={i} className={`py-2 px-2 ${i===0?'text-left':'text-right'} ${cell?.mono?'font-mono':''}`}>
                  {cell?.r ?? cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Empty(){ return <div className="text-sm text-neutral-600 dark:text-neutral-300">No data to show.</div>; }

/* ---------- CSV helpers ---------- */
function downloadOrdersCSV(orders){
  const rows=[["Order ID","Date","Method","Items","Subtotal","Tax","Total"],
    ...orders.map(o=>{
      const sub=toCents(o.subtotal ?? o.subtotalCents);
      const tax=toCents(o.tax ?? o.taxCents);
      const total=toCents(o.total ?? o.totalCents ?? sub+tax);
      const d=toDateFlexible(o.createdAt||o.created_at||o.date||o.createdOn);
      return [
        o.id, d?d.toLocaleString():"", o.method||o.paymentMethod||"",
        money(sub), money(tax), money(total)
      ];
    })
  ];
  const csv=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="insights-orders.csv"; a.click(); URL.revokeObjectURL(a.href);
}
function downloadTopCSV(top,period){
  const rows=[["Product","Quantity","Revenue"], ...top.map(p=>[p.name,p.qty,money(p.revenue)])];
  const csv=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`insights-top-products-${period}d.csv`; a.click(); URL.revokeObjectURL(a.href);
}