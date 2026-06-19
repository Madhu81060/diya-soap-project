import { useEffect, useState } from "react";
import { supabase, type Member } from "../lib/supabase";
import { adminAuth } from "../auth/adminAuth";

const BACKEND_URL = import.meta.env.VITE_API_URL;

// ─── Pack config (mirrors backend exactly) ───────────────────────────
const PACK_INFO: Record<string, { label: string; soapsPerBox: number; pricePerBox: number; mrpPerBox: number | null }> = {
  NORMAL:     { label: "Starter Pack",          soapsPerBox: 1,  pricePerBox: 300,   mrpPerBox: null },
  HALF_YEAR:  { label: "Value Pack",            soapsPerBox: 3,  pricePerBox: 600,   mrpPerBox: 900  },
  ANNUAL:     { label: "Bumper Pack",           soapsPerBox: 6,  pricePerBox: 900,   mrpPerBox: 1800 },
  RED_SANDAL: { label: "Red Sandal Premium Kit",soapsPerBox: 14, pricePerBox: 50000, mrpPerBox: null },
};

function getPackKey(member: Member): string {
  const pt = (member as any).pack_type || (member as any).package_type || "";
  if (pt.includes("Red Sandal") || pt === "RED_SANDAL")  return "RED_SANDAL";
  if (pt.includes("Bumper")     || pt === "ANNUAL")      return "ANNUAL";
  if (pt.includes("Value")      || pt === "HALF_YEAR")   return "HALF_YEAR";
  return "NORMAL";
}

function getQuantity(member: Member): number {
  const key  = getPackKey(member);
  const info = PACK_INFO[key];
  if (!(member as any).no_of_soaps || !info.soapsPerBox) return 1;
  return Math.max(1, Math.floor((member as any).no_of_soaps / info.soapsPerBox));
}

export default function AdminPanel() {
  const [members, setMembers]   = useState<Member[]>([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState<string | null>(null);
  const [search,  setSearch]    = useState("");
  const [filter,  setFilter]    = useState<"ALL" | "NORMAL" | "HALF_YEAR" | "ANNUAL" | "RED_SANDAL">("ALL");

  const admin = adminAuth.getAdmin();

  // ── Security ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!adminAuth.isLoggedIn()) window.location.href = "/admin-login";
  }, []);

  // ── Logout ────────────────────────────────────────────────────────
  const logout = () => {
    adminAuth.logout();
    window.location.href = "/admin-login?logout=1";
  };

  // ── Fetch members ─────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/members`);
      if (!res.ok) { setMessage("❌ Failed to fetch members"); setLoading(false); return; }
      const data = await res.json();
      setMembers(data.data || []);
    } catch { setMessage("❌ Server error"); }
    finally { setLoading(false); }
  };

  // ── Realtime ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchMembers();
    const channel = supabase
      .channel("members_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, fetchMembers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────
  const totalMembers  = members.length;
  const totalQty      = members.reduce((s, m) => s + getQuantity(m), 0);
  const totalSoaps    = members.reduce((s, m) => {
    const key  = getPackKey(m);
    const info = PACK_INFO[key];
    return s + info.soapsPerBox * getQuantity(m);
  }, 0);
  const totalRevenue  = members.reduce((s, m) => {
    const key   = getPackKey(m);
    const info  = PACK_INFO[key];
    return s + info.pricePerBox * getQuantity(m);
  }, 0);
  const totalMRP      = members.reduce((s, m) => {
    const key   = getPackKey(m);
    const info  = PACK_INFO[key];
    if (!info.mrpPerBox) return s;
    return s + info.mrpPerBox * getQuantity(m);
  }, 0);
  const totalSavings  = totalMRP - members.reduce((s, m) => {
    const key   = getPackKey(m);
    const info  = PACK_INFO[key];
    if (!info.mrpPerBox) return s;
    return s + info.pricePerBox * getQuantity(m);
  }, 0);

  const packCounts = { NORMAL: 0, HALF_YEAR: 0, ANNUAL: 0, RED_SANDAL: 0 };
  members.forEach(m => { const k = getPackKey(m) as keyof typeof packCounts; packCounts[k]++; });

  // ── Filter + search ───────────────────────────────────────────────
  const filtered = members.filter(m => {
    const matchPack = filter === "ALL" || getPackKey(m) === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || m.full_name?.toLowerCase().includes(q)
      || m.mobile?.includes(q)
      || m.city?.toLowerCase().includes(q)
      || m.order_id?.toLowerCase().includes(q);
    return matchPack && matchSearch;
  });

  // ── CSV export ────────────────────────────────────────────────────
  const exportToCSV = () => {
    const rows = [
      ["Order ID","Name","Mobile","City","Pack","Quantity","Soaps","Amount Paid","MRP","Savings","Payment"],
      ...filtered.map(m => {
        const key   = getPackKey(m);
        const info  = PACK_INFO[key];
        const qty   = getQuantity(m);
        const soaps = info.soapsPerBox * qty;
        const amt   = info.pricePerBox * qty;
        const mrp   = info.mrpPerBox ? info.mrpPerBox * qty : "";
        const save  = info.mrpPerBox ? (info.mrpPerBox * qty) - amt : "";
        return [
          m.order_id, m.full_name, m.mobile, m.city,
          info.label, qty, soaps, amt, mrp, save, m.payment_status,
        ];
      }),
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv(rows)]);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "members_export.csv"; a.click();
  };

  const csv = (s: string) => s; // identity – rows is already a string


  if (loading) return (
    <div className="p-10 text-center font-bold text-xl text-amber-700">
      Loading admin panel…
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#f8f8f5", minHeight: "100vh", padding: "0 0 60px" }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: "linear-gradient(135deg,#78350f,#d97706,#fbbf24)", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 900 }}>🛠️ Diya Soaps — Admin</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 14 }}>👤 {admin?.name || admin?.email}</span>
          <button onClick={logout} style={{ padding: "8px 18px", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </div>

      {message && (
        <div style={{ margin: "16px 32px 0", background: "#fef3c7", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 18px", fontWeight: 700, color: "#78350f" }}>{message}</div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 0" }}>

        {/* ── STATS CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { icon: "👥", label: "Total Members",  value: totalMembers.toLocaleString(),            bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
            { icon: "📦", label: "Total Quantities",value: totalQty.toLocaleString(),              bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
            { icon: "🧼", label: "Total Soaps",    value: totalSoaps.toLocaleString(),              bg: "#f0fdf4", border: "#86efac", color: "#166534" },
            { icon: "💰", label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString()}`,      bg: "#fef9c3", border: "#fde68a", color: "#78350f" },
            { icon: "💸", label: "Cust. Savings",  value: totalMRP ? `₹${totalSavings.toLocaleString()}` : "—", bg: "#faf5ff", border: "#d8b4fe", color: "#6b21a8" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 20 }}>{s.icon}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: s.color, opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── PACK BREAKDOWN ── */}
        <div style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 16, padding: "18px 22px", marginBottom: 22 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 900, color: "#78350f" }}>📊 Pack Breakdown</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {(["NORMAL","HALF_YEAR","ANNUAL","RED_SANDAL"] as const).map(k => {
              const info  = PACK_INFO[k];
              const count = packCounts[k];
              const colors: Record<string, string> = { NORMAL: "#78350f", HALF_YEAR: "#1e40af", ANNUAL: "#166534", RED_SANDAL: "#9a3412" };
              const bgs:    Record<string, string> = { NORMAL: "#fffbeb", HALF_YEAR: "#eff6ff", ANNUAL: "#f0fdf4", RED_SANDAL: "#fef2f2" };
              return (
                <div key={k} style={{ background: bgs[k], border: `1.5px solid ${colors[k]}30`, borderRadius: 12, padding: "12px 18px", minWidth: 200 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 900, color: colors[k] }}>{info.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                    {count} order{count !== 1 ? "s" : ""} · {info.soapsPerBox} soap{info.soapsPerBox > 1 ? "s" : ""}/pack · ₹{info.pricePerBox}/pack
                    {info.mrpPerBox ? ` (MRP ₹${info.mrpPerBox})` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18, alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search name, mobile, city, order ID…"
            style={{ flex: 1, minWidth: 240, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #fde68a", fontSize: 13, fontFamily: "'Nunito',sans-serif", outline: "none", background: "#fffbeb" }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #fde68a", fontSize: 13, fontFamily: "'Nunito',sans-serif", background: "#fffbeb", cursor: "pointer" }}>
            <option value="ALL">All Packs</option>
            <option value="NORMAL">Starter Pack</option>
            <option value="HALF_YEAR">Value Pack</option>
            <option value="ANNUAL">Bumper Pack</option>
            <option value="RED_SANDAL">Red Sandal Kit</option>
          </select>
          <button onClick={exportToCSV} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#d97706,#b45309)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>
            📤 Export CSV ({filtered.length})
          </button>
          <button onClick={fetchMembers} style={{ padding: "10px 18px", background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>
            🔄 Refresh
          </button>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888", fontWeight: 700 }}>
          Showing {filtered.length} of {totalMembers} members
        </p>

        {/* ── TABLE ── */}
        <div style={{ overflowX: "auto", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1.5px solid #fde68a" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#78350f,#d97706)" }}>
                {["#","Order ID","Customer","Mobile","City / PIN","Pack Details","Soaps","Amount Paid","Savings","Payment","Date"].map(h => (
                  <th key={h} style={{ padding: "12px 10px", color: "#fff", fontWeight: 800, textAlign: "left", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={12} style={{ padding: "32px", textAlign: "center", color: "#aaa", fontWeight: 700 }}>No members found</td></tr>
              )}
              {filtered.map((m, i) => {
                const key    = getPackKey(m);
                const info   = PACK_INFO[key];
                const boxes  = getQuantity(m);
                const soaps  = info.soapsPerBox * boxes;
                const amt    = info.pricePerBox * boxes;
                const mrp    = info.mrpPerBox ? info.mrpPerBox * boxes : null;
                const saving = mrp ? mrp - amt : 0;
                const packColors: Record<string, string> = {
                  NORMAL: "#78350f", HALF_YEAR: "#1e40af", ANNUAL: "#166534", RED_SANDAL: "#9a3412",
                };
                const packBgs: Record<string, string> = {
                  NORMAL: "#fffbeb", HALF_YEAR: "#eff6ff", ANNUAL: "#f0fdf4", RED_SANDAL: "#fef2f2",
                };
                const date = (m as any).created_at
                  ? new Date((m as any).created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                  : "—";
                const isEven = i % 2 === 0;
                return (
                  <tr key={m.id} style={{ background: isEven ? "#fff" : "#fffbeb", borderTop: "1px solid #fef3c7" }}>
                    <td style={{ padding: "10px 10px", fontWeight: 700, color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 800, color: "#374151", fontSize: 11, fontFamily: "monospace" }}>{m.order_id || "—"}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <p style={{ margin: 0, fontWeight: 800, color: "#111" }}>{m.full_name}</p>
                      {(m as any).email && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#888" }}>{(m as any).email}</p>}
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 700, color: "#374151" }}>{m.mobile}</td>
                    <td style={{ padding: "10px 10px", fontSize: 12, color: "#555" }}>
                      <p style={{ margin: 0 }}>{m.city}</p>
                      {(m as any).pincode && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#aaa" }}>{(m as any).pincode}</p>}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ background: packBgs[key], border: `1px solid ${packColors[key]}30`, borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 800, color: packColors[key], display: "inline-block", whiteSpace: "nowrap" }}>
                        {info.label}
                      </span>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "#888" }}>
                        Qty: {boxes} × {info.soapsPerBox} soap{info.soapsPerBox > 1 ? "s" : ""}
                        {mrp && <span style={{ color: "#aaa", textDecoration: "line-through", marginLeft: 4 }}>MRP ₹{mrp.toLocaleString()}</span>}
                      </p>
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 900, color: "#166534", fontSize: 15 }}>{soaps}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 900, color: "#d97706", fontSize: 15 }}>₹{amt.toLocaleString()}</td>
                    <td style={{ padding: "10px 10px" }}>
                      {saving > 0
                        ? <span style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 800, color: "#166534" }}>💰 ₹{saving.toLocaleString()}</span>
                        : <span style={{ color: "#ddd", fontSize: 11 }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{
                        padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800,
                        background: m.payment_status === "success" ? "#f0fdf4" : "#fef2f2",
                        border:     m.payment_status === "success" ? "1px solid #86efac" : "1px solid #fca5a5",
                        color:      m.payment_status === "success" ? "#166534" : "#991b1b",
                      }}>
                        {m.payment_status === "success" ? "✅ Paid" : m.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER SUMMARY ── */}
        <div style={{ marginTop: 18, background: "linear-gradient(135deg,#78350f,#d97706)", borderRadius: 14, padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 24 }}>
          {[
            { label: "Filtered Members",  val: filtered.length },
            { label: "Filtered Quantity", val: filtered.reduce((s, m) => s + getQuantity(m), 0) },
            { label: "Filtered Soaps",    val: filtered.reduce((s, m) => { const k = getPackKey(m); return s + PACK_INFO[k].soapsPerBox * getQuantity(m); }, 0) },
            { label: "Filtered Revenue",  val: `₹${filtered.reduce((s, m) => { const k = getPackKey(m); return s + PACK_INFO[k].pricePerBox * getQuantity(m); }, 0).toLocaleString()}` },
          ].map(x => (
            <div key={x.label}>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{x.label}</p>
              <p style={{ margin: "3px 0 0", color: "#fff", fontSize: 20, fontWeight: 900 }}>{x.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
