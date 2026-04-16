import React, { useState, useEffect, useCallback } from "react";
import { Eye, X, AlertTriangle, CheckCircle, Clock, XCircle, Download, Send, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';
import CustomToast from "../../components/CustomToast";

/* ─── Responsive style injection ─────────────────────────────────────────── */
const RESPONSIVE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Stat cards grid ── */
  .admin-stat-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 1100px) {
    .admin-stat-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 700px) {
    .admin-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
  }
  @media (max-width: 400px) {
    .admin-stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  }

  /* ── Overview two-column grid ── */
  .overview-grid {
    display: grid;
    grid-template-columns: 1fr 1.8fr;
    gap: 20px;
    margin-bottom: 22px;
  }
  @media (max-width: 900px) {
    .overview-grid { grid-template-columns: 1fr; }
  }

  /* ── Ticket detail 2-col meta grid ── */
  .ticket-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 520px) {
    .ticket-meta-grid { grid-template-columns: 1fr; gap: 8px; }
  }

  /* ── Main padding ── */
  .admin-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 32px;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 768px) {
    .admin-main { padding: 20px 16px; }
  }
  @media (max-width: 480px) {
    .admin-main { padding: 14px 10px; }
  }

  /* ── Header padding ── */
  .admin-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    height: 68px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  @media (max-width: 768px) {
    .admin-header-inner { padding: 0 16px; height: 58px; }
  }

  /* ── Tab bar — technician style, horizontal scroll ── */
  .admin-tab-bar {
    display: flex;
    gap: 4px;
    padding: 5px;
    border-radius: 16px;
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.55);
    box-shadow: 0 6px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    margin-bottom: 20px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    width: 100%;
  }
  .admin-tab-bar::-webkit-scrollbar { display: none; }
  .admin-tab-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border-radius: 11px;
    border: none;
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    color: #6b7280;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.14s;
  }
  .admin-tab-btn.active {
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    color: white;
    box-shadow: 0 5px 15px rgba(99,102,241,0.28);
  }
  .admin-tab-btn.active.ov {
    background: linear-gradient(135deg,#b91c1c,#ef4444);
    box-shadow: 0 5px 15px rgba(185,28,28,0.26);
  }
  .admin-tab-ct {
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    background: rgba(99,102,241,0.1);
    color: #6366f1;
  }
  .admin-tab-btn.active .admin-tab-ct {
    background: rgba(255,255,255,0.25);
    color: white;
  }
  .admin-tab-ct.ov-pill {
    background: rgba(185,28,28,0.1);
    color: #b91c1c;
  }
  @media (min-width: 640px) {
    .admin-tab-btn { padding: 8px 13px; font-size: 13px; border-radius: 12px; }
  }

  /* ── Modal ── */
  .admin-modal-box {
    width: 100%;
    max-width: 640px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
  @media (max-width: 680px) {
    .admin-modal-box { border-radius: 20px; max-width: 98vw; }
  }

  .admin-modal-add {
    width: 100%;
    max-width: 500px;
    border-radius: 32px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  @media (max-width: 540px) {
    .admin-modal-add { border-radius: 18px; max-width: 98vw; }
  }

  .admin-modal-people {
    width: 100%;
    max-width: 620px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 660px) {
    .admin-modal-people { border-radius: 18px; max-width: 98vw; }
  }

  /* ── Modal scroll body ── */
  .admin-modal-body {
    padding: 24px 28px;
    max-height: 76vh;
    overflow-y: auto;
  }
  @media (max-width: 480px) {
    .admin-modal-body { padding: 16px 14px; }
  }

  /* ── Add modal scroll body ── */
  .admin-modal-add-body {
    padding: 24px 28px;
    overflow-y: auto;
    flex: 1;
  }
  @media (max-width: 480px) {
    .admin-modal-add-body { padding: 16px 14px; }
  }

  /* ── Pie chart container ── */
  .pie-container {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .pie-container { flex-direction: column; align-items: flex-start; gap: 12px; }
    .pie-container svg { width: 160px !important; height: 160px !important; }
  }

  /* ── Time range button bar ── */
  .time-range-bar {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 14px;
    background: rgba(99,102,241,0.08);
    flex-shrink: 0;
  }

  /* ── Overview chart header ── */
  .overview-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* ── Pagination ── */
  .admin-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding: 14px 18px;
    border-radius: 18px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.55);
    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    border: 1px solid rgba(255,255,255,0.7);
    flex-wrap: wrap;
    gap: 10px;
  }
  @media (max-width: 520px) {
    .admin-pagination { justify-content: center; padding: 12px 14px; }
    .admin-pagination-label { display: none; }
  }

  /* ── Critical alerts ── */
  .critical-alert-box {
    padding: 20px 22px;
    border-radius: 24px;
    margin-bottom: 22px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(241,245,249,0.75);
    border: 1px solid rgba(100,116,139,0.2);
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  @media (max-width: 480px) {
    .critical-alert-box { padding: 14px 14px; gap: 10px; border-radius: 16px; }
  }

  /* ── Sidebar ── */
  @media (max-width: 360px) {
    .admin-sidebar { width: 90vw !important; }
  }

  /* ── Comment section ── */
  .comment-input-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  @media (max-width: 420px) {
    .comment-input-row { flex-direction: column; }
    .comment-input-row textarea { width: 100%; box-sizing: border-box; }
    .comment-input-row button { width: 100%; justify-content: center; }
  }

  /* ── Engineer/technician manage rows ── */
  .people-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px;
    border-radius: 16px;
    background: rgba(99,102,241,0.06);
    border: 1px solid rgba(99,102,241,0.1);
    margin-bottom: 10px;
    gap: 12px;
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .people-row { flex-direction: column; align-items: flex-start; }
    .people-row-actions { width: 100%; display: flex; gap: 8px; }
    .people-row-actions button { flex: 1; }
  }

  /* ── Stat card ── */
  .stat-card-box {
    padding: 22px 20px;
  }
  @media (max-width: 480px) {
    .stat-card-box { padding: 12px 14px !important; border-radius: 18px !important; }
    .stat-card-value { font-size: 20px !important; }
    .stat-card-label { font-size: 10px !important; margin-bottom: 2px !important; }
  }

  /* ── COMPACT TICKET CARD (replaces big box) ── */
  .atk-card {
    border-radius: 16px;
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.65);
    box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    overflow: hidden;
    margin-bottom: 8px;
  }
  .atk-priority-banner {
    padding: 4px 14px;
    border-bottom: 1px solid rgba(239,68,68,0.1);
    background: rgba(254,242,242,0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .atk-body {
    padding: 12px 14px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .atk-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .atk-icon.overdue { background: linear-gradient(135deg,#b91c1c,#ef4444); }
  .atk-icon.pending  { background: linear-gradient(135deg,#d97706,#f59e0b); }
  .atk-icon.resolved { background: linear-gradient(135deg,#059669,#10b981); }
  .atk-icon.closed   { background: linear-gradient(135deg,#6b7280,#9ca3af); }
  .atk-content { flex: 1; min-width: 0; }
  .atk-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }
  .atk-subject {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .atk-status-pill {
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .atk-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .atk-meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: #9ca3af;
  }
  .atk-view-btn {
    padding: 6px 13px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    color: white;
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 3px 10px rgba(99,102,241,0.28);
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 2px;
  }
  @media (min-width: 640px) {
    .atk-card { border-radius: 18px; margin-bottom: 10px; }
    .atk-body { padding: 14px 18px; gap: 12px; }
    .atk-icon { width: 38px; height: 38px; border-radius: 11px; }
    .atk-subject { font-size: 14px; }
    .atk-meta-item { font-size: 12px; }
    .atk-view-btn { font-size: 12px; padding: 7px 15px; }
  }
  @media (min-width: 1024px) {
    .atk-body { padding: 16px 22px; }
  }

  /* overdue section divider */
  .atk-overdue-divider {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    margin: 6px 0;
  }

  /* section header */
  .admin-sec-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .admin-sec-title { font-size: 15px; font-weight: 600; color: #111827; }
  .admin-sec-sub   { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .admin-ct-pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    color: #6366f1;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    flex-shrink: 0;
    white-space: nowrap;
  }
`;

const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase().replace("_","-");
  const map = {
    overdue:  { color:"#b91c1c", background:"rgba(254,242,242,0.92)", border:"rgba(252,165,165,0.35)" },
    pending:  { color:"#d97706", background:"rgba(254,243,199,0.85)", border:"rgba(245,158,11,0.25)" },
    resolved: { color:"#059669", background:"rgba(236,253,245,0.88)", border:"rgba(16,185,129,0.22)" },
    closed:   { color:"#6b7280", background:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
  };
  return map[s] || map.closed;
};

const getStatusIcon = (status) => {
  const s = (status || "").toLowerCase().replace("_","-");
  const props = { size: 14 };
  switch (s) {
    case "overdue":  return <AlertTriangle {...props} />;
    case "pending":  return <Clock {...props} />;
    case "resolved": return <CheckCircle {...props} />;
    case "closed":   return <XCircle {...props} />;
    default: return null;
  }
};

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const TICKETS_PER_PAGE = 10;

const AREAS = [
  "Hostels", "KV School", "Abhinandhan Bhavan", "Academic Block",
  "Library", "Sports Complex", "Guest House", "Faculty Quarters",
  "Admin Block", "Cafeteria"
];

let _xlsxPromise = null;
const loadXLSX = () => {
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _xlsxPromise;
};

const exportTickets = async (tickets, format, tabLabel) => {
  if (!tickets || tickets.length === 0) { CustomToast("No tickets to export."); return; }
  if (format === "excel") {
    try {
      const XLSX = await loadXLSX();
      const rows = tickets.map(t => ({
        "Ticket ID":   t.id,
        "Subject":     t.subject || "",
        "Department":  t.type || "",
        "Location":    t.location || "—",
        "Status":      t.status || "",
        "Created At":  new Date(t.createdAt).toLocaleDateString(),
        "Description": t.body || "",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch:12 },{ wch:32 },{ wch:16 },{ wch:20 },{ wch:14 },{ wch:14 },{ wch:50 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tabLabel.slice(0, 31));
      XLSX.writeFile(wb, `tickets_${tabLabel}_${Date.now()}.xlsx`);
    } catch (e) { console.error(e); CustomToast("Excel export failed."); }
    return;
  }
  if (format === "pdf") {
    const rows = tickets.map(t => `<tr><td>#${t.id}</td><td>${t.subject||""}</td><td>${t.type||""}</td><td>${t.location||"—"}</td><td>${t.status||""}</td><td>${new Date(t.createdAt).toLocaleDateString()}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Tickets – ${tabLabel}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:22px;margin-bottom:6px}p{font-size:13px;color:#555;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#6366f1;color:white;padding:10px 12px;text-align:left}td{padding:9px 12px;border-bottom:1px solid #e5e7eb}tr:nth-child(even)td{background:#f9fafb}</style></head><body><h1>Tickets — ${tabLabel}</h1><p>Exported on ${new Date().toLocaleString()} · ${tickets.length} ticket(s)</p><table><thead><tr><th>ID</th><th>Subject</th><th>Dept</th><th>Location</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }
};

const ExportDropdown = ({ tickets, tabLabel }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding:"9px 16px", borderRadius:14, border:"1px solid rgba(99,102,241,0.25)", background:"rgba(99,102,241,0.08)", color:"#6366f1", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
        <Download size={13} /> Export
        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:400 }} />
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:500, borderRadius:16, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", boxShadow:"0 16px 48px rgba(0,0,0,0.12)", border:"1px solid rgba(99,102,241,0.12)", overflow:"hidden", minWidth:165 }}>
            {[{ label:"Export as PDF", fmt:"pdf", icon:"📄" },{ label:"Export as Excel", fmt:"excel", icon:"📊" }].map(({ label, fmt, icon }) => (
              <button key={fmt} onClick={() => { exportTickets(tickets, fmt, tabLabel); setOpen(false); }} style={{ width:"100%", padding:"11px 16px", border:"none", background:"transparent", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:9, textAlign:"left" }}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const COLORS = {
  total:"#6366f1", PENDING:"#ec4899", OVERDUE:"#ef4444", RESOLVED:"#10b981", CLOSED:"#f59e0b",
};

const OverviewTab = ({ stats }) => {
  const [range, setRange] = useState("month");
  const [timeData, setTimeData] = useState([]);
  const [timeLoading, setTimeLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [pieTooltip, setPieTooltip] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateMode, setDateMode] = useState(false);
  const svgRef = React.useRef(null);

  const fetchData = useCallback(async () => {
    setTimeLoading(true);
    try {
      let url = `http://localhost:3000/api/admin/tickets-over-time?range=${range}`;
      if (dateMode && fromDate) url += `&from=${fromDate}`;
      if (dateMode && toDate)   url += `&to=${toDate}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setTimeData(data.data || []);
    } catch (e) { console.error(e); }
    finally { setTimeLoading(false); }
  }, [range, dateMode, fromDate, toDate]);

  useEffect(() => { if (!dateMode) fetchData(); }, [fetchData, dateMode]);

  const handleApplyDates = () => { if (!fromDate && !toDate) return; fetchData(); };
  const handleClearDates = () => { setFromDate(""); setToDate(""); setDateMode(false); };

  const pieData = [
    { label:"Pending",  value:stats.pending,  color:COLORS.PENDING  },
    { label:"Overdue",  value:stats.overdue,  color:COLORS.OVERDUE  },
    { label:"Resolved", value:stats.resolved, color:COLORS.RESOLVED },
    { label:"Closed",   value:stats.closed,   color:COLORS.CLOSED   },
  ].filter(d => d.value > 0);

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const buildPie = () => {
    if (pieTotal === 0) return [];
    let angle = -Math.PI / 2;
    return pieData.map(d => {
      const slice = (d.value / pieTotal) * 2 * Math.PI;
      const start = angle;
      angle += slice;
      const cx=110, cy=110, r=88, ir=52;
      const x1=cx+r*Math.cos(start), y1=cy+r*Math.sin(start);
      const x2=cx+r*Math.cos(start+slice), y2=cy+r*Math.sin(start+slice);
      const ix1=cx+ir*Math.cos(start+slice), iy1=cy+ir*Math.sin(start+slice);
      const ix2=cx+ir*Math.cos(start), iy2=cy+ir*Math.sin(start);
      const large=slice>Math.PI?1:0;
      const midAngle=start+slice/2;
      return { ...d, path:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`, midAngle, pct:Math.round((d.value/pieTotal)*100) };
    });
  };

  const slices = buildPie();
  const W=700, H=220, PL=44, PR=16, PT=16, PB=36;
  const chartW=W-PL-PR, chartH=H-PT-PB;
  const keys = ["total","PENDING","OVERDUE","RESOLVED","CLOSED"];
  const keyLabels = { total:"All Tickets", PENDING:"Pending", OVERDUE:"Overdue", RESOLVED:"Resolved", CLOSED:"Closed" };
  const allVals = timeData.flatMap(d => keys.map(k => d[k]||0));
  const maxVal = Math.max(...allVals, 1);
  const ySteps = 4;
  const xOf = i => PL+(i/Math.max(timeData.length-1,1))*chartW;
  const yOf = v => PT+chartH-(v/maxVal)*chartH;
  const polyline = (key) => timeData.map((d,i) => `${xOf(i)},${yOf(d[key]||0)}`).join(" ");

  return (
    <div>
      <div className="critical-alert-box">
        <div style={{ width:44, height:44, borderRadius:14, background:"rgba(250,0,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", flexShrink:0 }}><AlertTriangle size={20} /></div>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:"#1e293b", marginBottom:5 }}>Critical Alerts</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#b91c1c" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#b91c1c", display:"inline-block", flexShrink:0 }} />
            {stats.overdue} ticket(s) overdue — Immediate action required
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div style={{ ...glassCard, padding:"24px 22px" }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#111827", marginBottom:16 }}>Status Distribution</div>
          {pieTotal === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af", fontSize:13 }}>No ticket data yet</div>
          ) : (
            <div className="pie-container">
              <div style={{ position:"relative", flexShrink:0 }}>
                <svg width="220" height="220" viewBox="0 0 220 220">
                  {slices.map((s,i) => (
                    <path key={i} d={s.path} fill={s.color} opacity={pieTooltip&&pieTooltip.label!==s.label?0.5:1} style={{ cursor:"pointer", transition:"opacity 0.2s" }} onMouseEnter={e => { const rect=e.target.closest("svg").getBoundingClientRect(); setPieTooltip({ label:s.label, value:s.value, pct:s.pct, color:s.color, x:e.clientX-rect.left, y:e.clientY-rect.top }); }} onMouseLeave={() => setPieTooltip(null)} />
                  ))}
                  <text x="110" y="104" textAnchor="middle" style={{ fontSize:26, fontWeight:700, fill:"#111827", fontFamily:"inherit" }}>{pieTotal}</text>
                  <text x="110" y="124" textAnchor="middle" style={{ fontSize:11, fill:"#6b7280", fontFamily:"inherit" }}>Total</text>
                  {pieTooltip && (
                    <g>
                      <rect x={pieTooltip.x-50} y={pieTooltip.y-38} width="100" height="34" rx="8" fill="rgba(17,24,39,0.85)" />
                      <text x={pieTooltip.x} y={pieTooltip.y-20} textAnchor="middle" style={{ fontSize:12, fill:"white", fontWeight:600, fontFamily:"inherit" }}>{pieTooltip.label}</text>
                      <text x={pieTooltip.x} y={pieTooltip.y-8} textAnchor="middle" style={{ fontSize:11, fill:"rgba(255,255,255,0.8)", fontFamily:"inherit" }}>{pieTooltip.value} ({pieTooltip.pct}%)</text>
                    </g>
                  )}
                </svg>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {slices.map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:s.color, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{s.label}</div>
                      <div style={{ fontSize:12, color:"#9ca3af" }}>{s.value} · {s.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ ...glassCard, padding:"24px 22px" }}>
          <div className="overview-chart-header">
            <div style={{ fontSize:15, fontWeight:600, color:"#111827" }}>Tickets Over Time</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {!dateMode && (
                <div className="time-range-bar">
                  {["day","month","year"].map(r => (
                    <button key={r} onClick={() => setRange(r)} style={{ padding:"6px 14px", borderRadius:10, border:"none", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", background:range===r?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:range===r?"white":"#6b7280", boxShadow:range===r?"0 4px 12px rgba(99,102,241,0.3)":"none", transition:"all 0.15s", textTransform:"capitalize" }}>
                      {r==="day"?"Daily":r==="month"?"Monthly":"Yearly"}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setDateMode(v => !v); if (dateMode) handleClearDates(); }} style={{ padding:"6px 13px", borderRadius:10, border:`1.5px solid ${dateMode?"#6366f1":"rgba(99,102,241,0.25)"}`, background:dateMode?"rgba(99,102,241,0.12)":"rgba(99,102,241,0.05)", color:"#6366f1", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {dateMode ? "Custom ✓" : "Custom"}
              </button>
            </div>
          </div>

          {dateMode && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", whiteSpace:"nowrap" }}>From</label>
                <input type="date" value={fromDate} max={toDate || undefined} onChange={e => setFromDate(e.target.value)} style={{ padding:"6px 10px", borderRadius:10, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(255,255,255,0.9)", fontSize:12, fontFamily:"inherit", color:"#111827", outline:"none" }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", whiteSpace:"nowrap" }}>To</label>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} style={{ padding:"6px 10px", borderRadius:10, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(255,255,255,0.9)", fontSize:12, fontFamily:"inherit", color:"#111827", outline:"none" }} />
              </div>
              <div className="time-range-bar">
                {["day","month","year"].map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{ padding:"5px 11px", borderRadius:9, border:"none", fontSize:11, fontWeight:600, fontFamily:"inherit", cursor:"pointer", background:range===r?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:range===r?"white":"#6b7280", transition:"all 0.15s" }}>
                    {r==="day"?"D":r==="month"?"M":"Y"}
                  </button>
                ))}
              </div>
              <button onClick={handleApplyDates} disabled={!fromDate && !toDate} style={{ padding:"6px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:(!fromDate&&!toDate)?"not-allowed":"pointer", opacity:(!fromDate&&!toDate)?0.5:1 }}>Apply</button>
              <button onClick={handleClearDates} style={{ padding:"6px 12px", borderRadius:10, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", color:"#374151", fontSize:12, fontWeight:500, fontFamily:"inherit", cursor:"pointer" }}>Clear</button>
            </div>
          )}

          {timeLoading ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#9ca3af", fontSize:13 }}>Loading...</div>
          ) : timeData.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#9ca3af", fontSize:13 }}>No data for this range</div>
          ) : (
            <div style={{ position:"relative" }}>
              <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }} onMouseMove={e => { if(!svgRef.current||timeData.length===0) return; const rect=svgRef.current.getBoundingClientRect(); const scaleX=W/rect.width; const mx=(e.clientX-rect.left)*scaleX; const idx=Math.round((mx-PL)/chartW*(timeData.length-1)); if(idx>=0&&idx<timeData.length) setTooltip({ idx, x:xOf(idx), y:PT }); }} onMouseLeave={() => setTooltip(null)}>
                {Array.from({ length:ySteps+1 }, (_,i) => { const v=Math.round((maxVal/ySteps)*(ySteps-i)); const y=yOf(v===0?0:v); return (<g key={i}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" /><text x={PL-6} y={y+4} textAnchor="end" style={{ fontSize:10, fill:"#9ca3af", fontFamily:"inherit" }}>{v}</text></g>); })}
                {timeData.map((d,i) => { if(timeData.length>12&&i%Math.ceil(timeData.length/12)!==0) return null; return (<text key={i} x={xOf(i)} y={H-4} textAnchor="middle" style={{ fontSize:9, fill:"#9ca3af", fontFamily:"inherit" }}>{range==="day"?d.date.slice(5):range==="month"?d.date.slice(0,7):d.date}</text>); })}
                {keys.map(key => (timeData.length>1 && <polyline key={key} points={polyline(key)} fill="none" stroke={COLORS[key]} strokeWidth={key==="total"?2.5:1.8} strokeLinejoin="round" strokeLinecap="round" opacity={key==="total"?1:0.85} />))}
                {tooltip&&keys.map(key => (<circle key={key} cx={tooltip.x} cy={yOf(timeData[tooltip.idx][key]||0)} r="4" fill={COLORS[key]} stroke="white" strokeWidth="2" />))}
                {tooltip&&(() => { const d=timeData[tooltip.idx]; const bx=Math.min(tooltip.x-60,W-140); return (<g><rect x={bx} y={PT} width="130" height={16+keys.length*16} rx="8" fill="rgba(17,24,39,0.88)" /><text x={bx+10} y={PT+14} style={{ fontSize:10, fill:"rgba(255,255,255,0.7)", fontFamily:"inherit" }}>{d.date}</text>{keys.map((key,ki) => (<g key={key}><rect x={bx+10} y={PT+22+ki*16} width="8" height="8" rx="2" fill={COLORS[key]} /><text x={bx+22} y={PT+30+ki*16} style={{ fontSize:10, fill:"white", fontFamily:"inherit" }}>{keyLabels[key]}: {d[key]||0}</text></g>))}</g>); })()}
              </svg>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:8 }}>
                {keys.map(key => (<div key={key} style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:24, height:3, borderRadius:2, background:COLORS[key] }} /><span style={{ fontSize:11, color:"#6b7280" }}>{keyLabels[key]}</span></div>))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Comment Section ──────────────────────────────────────────────────────── */
const CommentSection = ({ ticketId, currentUserId, role }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const BASE = `http://localhost:3000/api/${role}`;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}`, { credentials:"include" });
      const data = await res.json();
      if (res.ok) setComments(data.ticket?.comments || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [BASE, ticketId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments`, { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ body }) });
      const data = await res.json();
      if (res.ok) { setComments(prev => [...prev, data.comment]); setBody(""); }
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (commentId) => {
    if (!editBody.trim()) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ body: editBody }) });
      const data = await res.json();
      if (res.ok) { setComments(prev => prev.map(c => c.id === commentId ? data.comment : c)); setEditingId(null); setEditBody(""); }
    } catch(e) { console.error(e); }
    finally { setEditSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, { method:"DELETE", credentials:"include" });
      if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId));
    } catch(e) { console.error(e); }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" }) + " · " + d.toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div style={{ marginTop:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ flex:1, height:1, background:"rgba(99,102,241,0.15)" }} />
        <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.08em", textTransform:"uppercase" }}>Comments</span>
        <div style={{ flex:1, height:1, background:"rgba(99,102,241,0.15)" }} />
      </div>
      {loading ? (
        <div style={{ textAlign:"center", padding:"20px 0", color:"#9ca3af", fontSize:13 }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign:"center", padding:"18px 0", color:"#9ca3af", fontSize:13 }}>No comments yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
          {comments.map(c => {
            const isAdmin = c.authorRole === "admin";
            const isOwn   = c.authorRole === role;
            return (
              <div key={c.id} style={{ padding:"13px 15px", borderRadius:18, background: isAdmin ? "rgba(99,102,241,0.07)" : "rgba(14,165,233,0.06)", border: isAdmin ? "1px solid rgba(99,102,241,0.15)" : "1px solid rgba(14,165,233,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                    {isAdmin ? (
                      <span style={{ fontSize:11, fontWeight:800, color:"#6366f1", background:"rgba(99,102,241,0.12)", padding:"2px 9px", borderRadius:20 }}>ADMIN</span>
                    ) : (
                      <span style={{ fontSize:11, fontWeight:700, color:"#0ea5e9", background:"rgba(14,165,233,0.1)", padding:"2px 9px", borderRadius:20 }}>ENGINEER</span>
                    )}
                    <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{c.authorName}</span>
                    {c.authorDepartment && <span style={{ fontSize:11, color:"#9ca3af" }}>· {c.authorDepartment}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#9ca3af" }}>{formatDate(c.createdAt)}</span>
                    {isOwn && (
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => { setEditingId(c.id); setEditBody(c.body); }} style={{ width:26, height:26, borderRadius:8, border:"none", background:"rgba(99,102,241,0.1)", color:"#6366f1", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(c.id)} style={{ width:26, height:26, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", color:"#ef4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
                {editingId === c.id ? (
                  <div>
                    <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={1} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid rgba(99,102,241,0.3)", background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", color:"#111827", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
                    <div style={{ display:"flex", gap:8, marginTop:7 }}>
                      <button onClick={() => { setEditingId(null); setEditBody(""); }} style={{ padding:"7px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
                      <button onClick={() => handleEdit(c.id)} disabled={editSubmitting||!editBody.trim()} style={{ padding:"7px 16px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", opacity:editSubmitting||!editBody.trim()?0.6:1 }}>{editSubmitting ? "Saving..." : "Save"}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{c.body}</div>
                )}
                {c.updatedAt !== c.createdAt && editingId !== c.id && (
                  <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>edited {formatDate(c.updatedAt)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="comment-input-row">
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment..." rows={1} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSubmit(); } }} style={{ flex:1, padding:"11px 14px", borderRadius:16, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", color:"#111827", outline:"none", resize:"none", boxSizing:"border-box" }} />
        <button onClick={handleSubmit} disabled={submitting||!body.trim()} style={{ padding:"11px 18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 6px 18px rgba(99,102,241,0.3)", opacity:submitting||!body.trim()?0.6:1, flexShrink:0 }}>
          <Send size={14} />{submitting ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

/* ─── Description renderer ── */
const renderDescription = (body = "") => {
  const separatorRegex = /\n\n--- Original complaint \(raised on (.+?)\) ---\n([\s\S]*)/;
  const match = body.match(separatorRegex);
  if (match) {
    const followupText = body.replace(separatorRegex, "").replace(/^\[Follow-up\]\s*/, "").trim();
    const originalDate = match[1];
    const originalText = match[2].trim();
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#6366f1", display:"inline-block", flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase" }}>Follow-up complaint</span>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"#111827", lineHeight:1.65, padding:"12px 16px", borderRadius:12, background:"rgba(99,102,241,0.08)", border:"1.5px solid rgba(99,102,241,0.22)" }}>{followupText}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize:11, color:"#9ca3af", whiteSpace:"nowrap", fontStyle:"italic" }}>Original complaint · {originalDate}</span>
          <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }} />
        </div>
        <div style={{ fontSize:13, color:"#9ca3af", lineHeight:1.65, padding:"10px 14px", borderRadius:12, background:"rgba(0,0,0,0.025)", border:"1px solid rgba(0,0,0,0.06)", fontStyle:"italic" }}>{originalText}</div>
      </div>
    );
  }
  return <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{body}</div>;
};

/* ─── Compact Ticket Card ── */
const TicketCard = ({ t, onView, isOverdue }) => {
  const statusKey = (t.status || "").toLowerCase().replace("_", "-");
  const ss = getStatusStyle(statusKey);
  const formattedDate = new Date(t.createdAt).toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" });

  return (
    <div className="atk-card" style={{ outline: isOverdue ? "2px solid rgba(239,68,68,0.35)" : "none" }}>
      <div className="atk-body">
        <div className={`atk-icon ${statusKey}`}>
          {getStatusIcon(statusKey)}
        </div>
        <div className="atk-content">
          <div className="atk-top">
            <div style={{ flex:1, minWidth:0 }}>
              <div className="atk-subject">{t.subject || "No Subject"}</div>
              <div className="atk-meta" style={{ marginTop:3 }}>
                <span className="atk-meta-item">
                  <span style={{ fontSize:10, color:"#c4b5fd" }}>#{t.id}</span>
                </span>
                {t.user?.username && (
                  <span className="atk-meta-item">
                    <svg width="10" height="10" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {t.user.username}
                  </span>
                )}
                {t.type && (
                  <span className="atk-meta-item">
                    <svg width="10" height="10" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {t.type}
                  </span>
                )}
                <span className="atk-meta-item">
                  <svg width="10" height="10" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formattedDate}
                </span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
              <span className="atk-status-pill" style={{ color:ss.color, background:ss.background, border:`1px solid ${ss.border}` }}>
                {t.status}
              </span>
              <button className="atk-view-btn" onClick={() => onView(t)}>
                <Eye size={11} /> View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Ticket List ── */
const TicketList = ({ tickets, overdueTickets, activeTab, onView }) => {
  const pendingCount = tickets.length;
  const displayList = activeTab === "pending" ? [...tickets, ...overdueTickets] : tickets;

  return (
    <div>
      {displayList.map((t, idx) => {
        const isOverdueSuffix = activeTab === "pending" && idx >= pendingCount;
        return (
          <React.Fragment key={t.id}>
            {isOverdueSuffix && idx === pendingCount && (
              <div className="atk-overdue-divider">
                <div style={{ flex:1, height:1, background:"rgba(185,28,28,0.2)" }} />
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:"#b91c1c", background:"rgba(254,242,242,0.9)", border:"1px solid rgba(185,28,28,0.2)", padding:"3px 10px", borderRadius:20 }}>
                  <AlertTriangle size={10} /> OVERDUE TICKETS
                </span>
                <div style={{ flex:1, height:1, background:"rgba(185,28,28,0.2)" }} />
              </div>
            )}
            <TicketCard t={t} onView={onView} isOverdue={isOverdueSuffix} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [overdueTickets, setOverdueTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total:0, pending:0, inProgress:0, overdue:0, resolved:0, closed:0 });
  const navigate = useNavigate();

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [addRole, setAddRole] = useState("engineer");
  const [addForm, setAddForm] = useState({ username:"", email:"", password:"", department:"", area:[] });
  const [addLoading, setAddLoading] = useState(false);

  const [showManageEngineers, setShowManageEngineers] = useState(false);
  const [showManageTechnicians, setShowManageTechnicians] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [editTech, setEditTech] = useState(null);
  const [editAreaLoading, setEditAreaLoading] = useState(false);
  const [editAreaError, setEditAreaError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAddPeople = async (e) => {
    e.preventDefault();
    if (!addForm.username||!addForm.email||!addForm.password) { CustomToast("All fields are required!"); return; }
    if ((addRole==="engineer"||addRole==="technician")&&!addForm.department) { CustomToast("Please select a department!"); return; }
    if (addRole==="technician"&&addForm.area.length===0) { CustomToast("Please select at least one area!"); return; }
    setAddLoading(true);
    try {
      const body = { username:addForm.username, email:addForm.email, password:addForm.password };
      if (addRole==="engineer") body.department=addForm.department;
      if (addRole==="technician") { body.department=addForm.department; body.area=addForm.area; }
      const res = await fetch(`http://localhost:3000/api/${addRole}/register`, { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { CustomToast(data.message || "Registration failed"); return; }
      CustomToast(`${addRole.charAt(0).toUpperCase()+addRole.slice(1)} added successfully!`, "green");
      setAddForm({ username:"", email:"", password:"", department:"", area:[] });
      setShowAddPeople(false);
    } catch(err) { console.error(err); CustomToast("Server error"); }
    finally { setAddLoading(false); }
  };

  const fetchPeople = async () => {
    setPeopleLoading(true);
    try {
      const [engRes, techRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/engineers", { credentials:"include" }),
        fetch("http://localhost:3000/api/admin/technicians", { credentials:"include" }),
      ]);
      const engData = await engRes.json();
      const techData = await techRes.json();
      if(engRes.ok) setEngineers(engData.engineers);
      if(techRes.ok) setTechnicians(techData.technicians);
    } catch(e) { console.error(e); }
    finally { setPeopleLoading(false); }
  };

  const handleDelete = async () => {
    if(!deleteConfirm) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/${deleteConfirm.role}/${deleteConfirm.id}`, { method:"DELETE", credentials:"include" });
      const data = await res.json();
      if(!res.ok) { CustomToast(data.message); return; }
      if(deleteConfirm.role==="engineer") setEngineers(prev=>prev.filter(e=>e.id!==deleteConfirm.id));
      else setTechnicians(prev=>prev.filter(t=>t.id!==deleteConfirm.id));
      setDeleteConfirm(null);
    } catch(e) { console.error(e); CustomToast("Server error"); }
  };

  const handleEditArea = async () => {
    setEditAreaError("");
    if(!editTech||editTech.area.length===0) { setEditAreaError("Please select at least one area."); return; }
    setEditAreaLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/technician/${editTech.id}/area`, { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ area:editTech.area }) });
      const data = await res.json();
      if(!res.ok) { setEditAreaError(data.message||"Failed to update area."); return; }
      setTechnicians(prev=>prev.map(t=>t.id===editTech.id?{ ...t, area:editTech.area.join(",") }:t));
      setEditTech(null);
    } catch(e) { console.error(e); setEditAreaError("Server error. Please try again."); }
    finally { setEditAreaLoading(false); }
  };

  const fetchTickets = useCallback(async (status, page=1) => {
    setLoading(true);
    try {
      if (status==="pending") {
        const [pendingRes, overdueRes] = await Promise.all([
          fetch(`http://localhost:3000/api/admin/tickets?pg=${page}&status=PENDING`, { credentials:"include" }),
          fetch(`http://localhost:3000/api/admin/tickets?pg=1&status=OVERDUE`, { credentials:"include" }),
        ]);
        const pendingData = await pendingRes.json();
        const overdueData = await overdueRes.json();
        if(!pendingRes.ok) { CustomToast(pendingData.message); return; }
        setTickets(pendingData.tickets||[]);
        setTotalTickets(pendingData.pagination?.totalTickets||0);
        setOverdueTickets(overdueData.tickets||[]);
      } else {
        let url = `http://localhost:3000/api/admin/tickets?pg=${page}`;
        if(status&&status!=="overview") url += `&status=${status.toUpperCase().replace("-","_")}`;
        const res = await fetch(url, { credentials:"include" });
        const data = await res.json();
        if(!res.ok) { CustomToast(data.message); return; }
        setTickets(data.tickets||[]);
        setOverdueTickets([]);
        setTotalTickets(data.pagination?.totalTickets||0);
      }
    } catch(e) { console.error(e); CustomToast("Server error"); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = async () => {
    try {
      const statuses = ["PENDING","IN_PROGRESS","OVERDUE","RESOLVED","CLOSED"];
      const [allRes,...statusRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/tickets?pg=1", { credentials:"include" }),
        ...statuses.map(s=>fetch(`http://localhost:3000/api/admin/tickets?pg=1&status=${s}`, { credentials:"include" }))
      ]);
      const allData = await allRes.json();
      const statusData = await Promise.all(statusRes.map(r=>r.json()));
      const pending = statusData[0].pagination?.totalTickets||0;
      const overdue = statusData[2].pagination?.totalTickets||0;
      setStats({ total:allData.pagination?.totalTickets||0, pending, inProgress:statusData[1].pagination?.totalTickets||0, overdue, resolved:statusData[3].pagination?.totalTickets||0, closed:statusData[4].pagination?.totalTickets||0, totalPending:pending+overdue });
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    if(activeTab==="overview") fetchStats();
    else fetchTickets(activeTab, 1);
  }, [activeTab]);

  useEffect(() => { subscribeToPush(); }, []);

  /* ── Pagination: re-fetch when page changes (but not on tab change — tab change resets page to 1 above) ── */
  useEffect(() => {
    if(activeTab!=="overview" && currentPage > 1) fetchTickets(activeTab, currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalTickets / TICKETS_PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setTickets([]);
    setOverdueTickets([]);
  };

  const handlePageChange = (page) => {
    if(page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await unsubscribeFromPush();
    try {
      await fetch("http://localhost:3000/logout", { method:"POST", credentials:"include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch(error) { console.error("Logout error:", error); }
  };

  const TABS = [
    { id:"overview", label:"Overview", ct: null },
    { id:"pending",  label:"Pending",  ct: stats.pending   },
    { id:"overdue",  label:"Overdue",  ct: stats.overdue   },
    { id:"resolved", label:"Resolved", ct: stats.resolved  },
    { id:"closed",   label:"Closed",   ct: stats.closed    },
  ];

  const statCards = [
    { label:"Total Pending", value: stats.totalPending ?? (stats.pending + stats.overdue) },
    { label:"Pending",       value: stats.pending   },
    { label:"Overdue",       value: stats.overdue   },
    { label:"Resolved",      value: stats.resolved  },
    { label:"Closed",        value: stats.closed    },
  ];

  const pendingCombinedTickets = activeTab==="pending" ? [...tickets,...overdueTickets] : tickets;
  const activeTabLabel = TABS.find(t=>t.id===activeTab)?.label || activeTab;
  const exportableTickets = activeTab==="pending" ? pendingCombinedTickets : tickets;
  const displayTickets = activeTab==="pending" ? pendingCombinedTickets : tickets;

  /* Build pagination page numbers — show up to 5 pages around current */
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <style>{RESPONSIVE_CSS}</style>

      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      {sidebarOpen && (<div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.2)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)", zIndex:150 }} />)}

      {/* SIDEBAR */}
      <div className="admin-sidebar" style={{ position:"fixed", top:0, left:0, height:"100vh", width:280, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", boxShadow:sidebarOpen?"8px 0 48px rgba(0,0,0,0.12)":"none", borderRight:"1px solid rgba(255,255,255,0.7)", transform:sidebarOpen?"translateX(0)":"translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)", zIndex:160, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"24px 24px 20px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)", width:30, height:19, borderRadius:"50% 50% 0 0", background:"rgba(255,255,255,0.9)" }} />
              <div style={{ position:"absolute", top:8, left:"50%", transform:"translateX(-50%)", width:14, height:14, borderRadius:"50%", background:"rgba(255,255,255,0.9)" }} />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"white" }}>Admin Panel</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#6ee7b7", display:"inline-block" }} />
                System Administrator
              </div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ position:"absolute", top:12, right:12, width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={14} /></button>
        </div>

        <div style={{ flex:1, padding:"20px 16px", display:"flex", flexDirection:"column", gap:6, overflowY:"auto" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 8px", marginBottom:4 }}>People</div>

          {[
            { label:"Add People", icon:<svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>, grad:true, action:() => { setSidebarOpen(false); setShowAddPeople(true); } },
            { label:"Manage Engineers", icon:<svg width="15" height="15" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, grad:false, action:() => { setSidebarOpen(false); setShowManageEngineers(true); fetchPeople(); } },
            { label:"Manage Technicians", icon:<svg width="15" height="15" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, grad:false, action:() => { setSidebarOpen(false); setShowManageTechnicians(true); fetchPeople(); } },
          ].map(({ label, icon, grad, action }) => (
            <button key={label} onClick={action} style={{ width:"100%", padding:"13px 16px", borderRadius:16, border:"none", background:grad?"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(14,165,233,0.08))":"rgba(99,102,241,0.06)", fontSize:13, fontWeight:600, fontFamily:"inherit", color:grad?"#6366f1":"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:grad?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(99,102,241,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
              {label}
            </button>
          ))}

          <div style={{ height:1, background:"rgba(0,0,0,0.06)", margin:"10px 8px" }} />
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 8px", marginBottom:4 }}>Account</div>

          <button onClick={handleLogout} style={{ width:"100%", padding:"13px 16px", borderRadius:16, border:"none", background:"rgba(100,116,139,0.06)", fontSize:13, fontWeight:600, fontFamily:"inherit", color:"#1e293b", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(100,116,139,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="15" height="15" fill="none" stroke="#1e293b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            Logout
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div className="admin-header-inner">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setSidebarOpen(true)} style={{ width:42, height:42, borderRadius:14, border:"none", background:"rgba(99,102,241,0.08)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5, flexShrink:0 }}>
              <span style={{ width:18, height:2, borderRadius:2, background:"#6366f1", display:"block" }} />
              <span style={{ width:14, height:2, borderRadius:2, background:"#6366f1", display:"block" }} />
              <span style={{ width:18, height:2, borderRadius:2, background:"#6366f1", display:"block" }} />
            </button>
            <div style={{ width:1, height:28, background:"rgba(0,0,0,0.08)" }} />
            <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Admin Dashboard</div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* STAT CARDS */}
        <div className="admin-stat-grid">
          {statCards.map((c, i) => (
            <div key={i} className="stat-card-box" style={{ ...glassCard }}>
              <div className="stat-card-label" style={{ fontSize:12, color:"#6b7280", fontWeight:500, marginBottom:4 }}>{c.label}</div>
              <div className="stat-card-value" style={{ fontSize:32, fontWeight:600, background:"linear-gradient(90deg,#111827,#4f46e5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* TAB BAR — technician style */}
        <div className="admin-tab-bar">
          {TABS.map(tab => {
            const act = activeTab === tab.id;
            const ov  = tab.id === "overdue";
            return (
              <button
                key={tab.id}
                className={`admin-tab-btn${act ? ` active${ov ? " ov" : ""}` : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
                {tab.ct !== null && (
                  <span className={`admin-tab-ct${!act && ov && tab.ct > 0 ? " ov-pill" : ""}`}>
                    {tab.ct}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && <OverviewTab stats={stats} />}

        {/* TICKET LISTS */}
        {activeTab !== "overview" && (
          <div>
            {loading ? (
              <div style={{ ...glassCard, padding:"52px 32px", textAlign:"center" }}>
                <div style={{ fontSize:14, color:"#6b7280" }}>Loading tickets...</div>
              </div>
            ) : displayTickets.length === 0 ? (
              <div style={{ ...glassCard, padding:"64px 32px", textAlign:"center" }}>
                <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:6 }}>No Tickets Found</div>
                <div style={{ fontSize:13, color:"#6b7280" }}>There are no {activeTab} tickets at the moment.</div>
              </div>
            ) : (
              <>
                {/* Section header */}
                <div className="admin-sec-hd">
                  <div>
                    <div className="admin-sec-title">{activeTabLabel} Tickets</div>
                    <div className="admin-sec-sub">Showing {activeTabLabel.toLowerCase()} tickets · Page {currentPage} of {totalPages || 1}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span className="admin-ct-pill">{totalTickets} Total</span>
                    <ExportDropdown tickets={exportableTickets} tabLabel={activeTabLabel} />
                  </div>
                </div>

                <TicketList
                  tickets={tickets}
                  overdueTickets={overdueTickets}
                  activeTab={activeTab}
                  onView={setSelectedTicket}
                />

                {/* PAGINATION — fixed & always rendered when needed */}
                {totalPages > 1 && (
                  <div className="admin-pagination">
                    <div className="admin-pagination-label" style={{ fontSize:12, color:"#6b7280" }}>
                      Page <span style={{ fontWeight:600, color:"#111827" }}>{currentPage}</span> of{" "}
                      <span style={{ fontWeight:600, color:"#111827" }}>{totalPages}</span>
                      {" "}— <span style={{ fontWeight:600, color:"#111827" }}>{totalTickets}</span> tickets
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      {/* Prev */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ width:34, height:34, borderRadius:11, border:"1px solid rgba(0,0,0,0.08)", background:currentPage===1?"rgba(0,0,0,0.03)":"rgba(255,255,255,0.8)", color:currentPage===1?"#d1d5db":"#374151", cursor:currentPage===1?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((page, idx) =>
                        page === "..." ? (
                          <span key={`ellipsis-${idx}`} style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#9ca3af" }}>…</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            style={{ width:34, height:34, borderRadius:11, border:currentPage===page?"none":"1px solid rgba(0,0,0,0.08)", background:currentPage===page?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(255,255,255,0.8)", color:currentPage===page?"white":"#374151", fontSize:12, fontWeight:currentPage===page?700:500, cursor:"pointer", fontFamily:"inherit", boxShadow:currentPage===page?"0 4px 14px rgba(99,102,241,0.35)":"none" }}
                          >
                            {page}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ width:34, height:34, borderRadius:11, border:"1px solid rgba(0,0,0,0.08)", background:currentPage===totalPages?"rgba(0,0,0,0.03)":"rgba(255,255,255,0.8)", color:currentPage===totalPages?"#d1d5db":"#374151", cursor:currentPage===totalPages?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* TICKET DETAIL MODAL */}
      {selectedTicket && (
        <div onClick={()=>setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} className="admin-modal-box">
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Ticket Details</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:3 }}>#{selectedTicket.id} · {selectedTicket.subject}</div>
              <button onClick={()=>setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="ticket-meta-grid">
                {[
                  { label:"TICKET ID",      val:selectedTicket.id },
                  { label:"SUBJECT",        val:selectedTicket.subject },
                  { label:"DEPARTMENT",     val:selectedTicket.type },
                  { label:"LOCATION",       val:selectedTicket.location||"—" },
                  { label:"RAISED BY",      val:selectedTicket.user?.username||"—" },
                  { label:"CONTACT NUMBER", val:selectedTicket.phone||"—" },
                  { label:"STATUS",         val:selectedTicket.status },
                  { label:"DATE",           val:new Date(selectedTicket.createdAt).toLocaleDateString() },
                ].map((f,i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:"15px 17px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:10 }}>DESCRIPTION</div>
                {renderDescription(selectedTicket.body)}
              </div>
              <CommentSection ticketId={selectedTicket.id} role="admin" />
              <button onClick={()=>setSelectedTicket(null)} style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PEOPLE MODAL */}
      {showAddPeople && (
        <div onClick={()=>setShowAddPeople(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} className="admin-modal-add">
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", flexShrink:0, borderRadius:"32px 32px 0 0" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Add New Member</div>
              <button onClick={()=>setShowAddPeople(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div className="admin-modal-add-body">
              <div style={{ display:"flex", gap:6, padding:6, borderRadius:20, background:"rgba(99,102,241,0.08)", marginBottom:24 }}>
                {["engineer","technician"].map(r => (
                  <button key={r} onClick={()=>{ setAddRole(r); setAddForm({ username:"", email:"", password:"", department:"", area:[] }); }} style={{ flex:1, padding:"10px", borderRadius:14, border:"none", background:addRole===r?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:addRole===r?"white":"#6b7280", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", textTransform:"capitalize" }}>{r}</button>
                ))}
              </div>
              <form onSubmit={handleAddPeople}>
                {[
                  { label:"Username", key:"username", type:"text",     placeholder:"Enter username" },
                  { label:"Email",    key:"email",    type:"email",    placeholder:"Enter email address" },
                  { label:"Password", key:"password", type:"password", placeholder:"Set a password" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>{f.label}</label>
                    <input type={f.type} value={addForm[f.key]} onChange={e=>setAddForm(prev=>({ ...prev, [f.key]:e.target.value }))} placeholder={f.placeholder} autoComplete="off" style={{ width:"100%", padding:"13px 16px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
                {(addRole==="engineer"||addRole==="technician") && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Department</label>
                    <select value={addForm.department} onChange={e=>setAddForm(prev=>({ ...prev, department:e.target.value }))} style={{ width:"100%", padding:"13px 16px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box", cursor:"pointer" }}>
                      <option value="">Select Department</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
                )}
                {addRole==="technician" && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Area</label>
                    <div style={{ padding:"12px 14px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", display:"flex", flexWrap:"wrap", gap:8 }}>
                      {AREAS.map(area => { const selected=(addForm.area||[]).includes(area); return (<button key={area} type="button" onClick={()=>setAddForm(prev=>({ ...prev, area:selected?(prev.area||[]).filter(a=>a!==area):[...(prev.area||[]),area] }))} style={{ padding:"6px 14px", borderRadius:20, border:"none", fontSize:12, fontWeight:500, fontFamily:"inherit", cursor:"pointer", background:selected?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(99,102,241,0.08)", color:selected?"white":"#6366f1" }}>{selected&&"✓ "}{area}</button>); })}
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", gap:10, marginTop:24 }}>
                  <button type="button" onClick={()=>setShowAddPeople(false)} style={{ flex:1, padding:"13px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
                  <button type="submit" disabled={addLoading} style={{ flex:2, padding:"13px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer", opacity:addLoading?0.7:1 }}>{addLoading?"Adding...":`Add ${addRole.charAt(0).toUpperCase()+addRole.slice(1)}`}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE ENGINEERS */}
      {showManageEngineers && (
        <div onClick={()=>setShowManageEngineers(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} className="admin-modal-people">
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Manage Engineers</div>
              <button onClick={()=>setShowManageEngineers(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", overflowY:"auto", flex:1 }}>
              {peopleLoading ? <div style={{ textAlign:"center", padding:"40px 0", color:"#6b7280" }}>Loading...</div> : engineers.map(eng => (
                <div key={eng.id} className="people-row">
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{eng.username}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{eng.email} · {eng.department}</div>
                  </div>
                  <div className="people-row-actions">
                    <button onClick={()=>setDeleteConfirm({ role:"engineer", id:eng.id, name:eng.username })} style={{ padding:"7px 14px", borderRadius:14, border:"1px solid rgba(100,116,139,0.25)", background:"rgba(100,116,139,0.07)", color:"#1e293b", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANAGE TECHNICIANS */}
      {showManageTechnicians && (
        <div onClick={()=>setShowManageTechnicians(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} className="admin-modal-people">
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Manage Technicians</div>
              <button onClick={()=>setShowManageTechnicians(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", overflowY:"auto", flex:1 }}>
              {peopleLoading ? <div style={{ textAlign:"center", padding:"40px 0", color:"#6b7280" }}>Loading...</div> : technicians.map(tech => (
                <div key={tech.id} className="people-row">
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{tech.username}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{tech.email} · {tech.department}</div>
                    <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>Areas: {tech.area||"—"}</div>
                  </div>
                  <div className="people-row-actions" style={{ display:"flex", gap:8, flexShrink:0, marginLeft:12 }}>
                    <button onClick={()=>{ const currentAreas=tech.area?tech.area.split(",").map(a=>a.trim()):[]; setEditTech({ id:tech.id, name:tech.username, area:currentAreas }); setEditAreaError(""); }} style={{ padding:"7px 14px", borderRadius:14, border:"1px solid rgba(99,102,241,0.25)", background:"rgba(99,102,241,0.07)", color:"#6366f1", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Edit Area</button>
                    <button onClick={()=>setDeleteConfirm({ role:"technician", id:tech.id, name:tech.username })} style={{ padding:"7px 14px", borderRadius:14, border:"1px solid rgba(100,116,139,0.25)", background:"rgba(100,116,139,0.07)", color:"#1e293b", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT AREA MODAL */}
      {editTech && (
        <div onClick={()=>setEditTech(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:480, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Edit Area</div>
              <button onClick={()=>setEditTech(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ padding:"14px", borderRadius:18, border:"1.5px solid rgba(99,102,241,0.15)", background:"rgba(99,102,241,0.03)", display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                {AREAS.map(area => { const selected=editTech.area.includes(area); return (<button key={area} type="button" onClick={()=>setEditTech(prev=>({ ...prev, area:selected?prev.area.filter(a=>a!==area):[...prev.area,area] }))} style={{ padding:"7px 16px", borderRadius:20, border:"none", fontSize:12, fontWeight:500, fontFamily:"inherit", cursor:"pointer", background:selected?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(99,102,241,0.08)", color:selected?"white":"#6366f1" }}>{selected&&"✓ "}{area}</button>); })}
              </div>
              {editAreaError && <div style={{ marginBottom:14, padding:"10px 13px", borderRadius:12, background:"rgba(100,116,139,0.07)", fontSize:12, color:"#1e293b" }}>{editAreaError}</div>}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setEditTech(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
                <button onClick={handleEditArea} disabled={editAreaLoading} style={{ flex:1, padding:"12px", borderRadius:18, border:"none", background:editAreaLoading?"rgba(99,102,241,0.45)":"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:editAreaLoading?"not-allowed":"pointer" }}>{editAreaLoading?"Saving...":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div onClick={()=>setDeleteConfirm(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:400, borderRadius:28, boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", padding:"36px 32px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(100,116,139,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"#1e293b" }}><AlertTriangle size={28} /></div>
            <div style={{ fontSize:20, fontWeight:600, color:"#111827", marginBottom:8 }}>Remove {deleteConfirm.role==="engineer"?"Engineer":"Technician"}?</div>
            <div style={{ fontSize:15, fontWeight:600, color:"#6366f1", marginBottom:8 }}>{deleteConfirm.name}</div>
            <div style={{ fontSize:13, color:"#9ca3af", marginBottom:28 }}>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex:1, padding:"12px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#334155,#1e293b)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer" }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;