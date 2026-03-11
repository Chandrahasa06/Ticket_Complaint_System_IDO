import React, { useState } from "react";
import { Eye, CheckCircle, X, MapPin, Calendar, Wrench, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const getStatusStyle = (status) => {
  const map = {
    assigned:      { color:"#2563eb", bg:"rgba(219,234,254,0.85)", border:"rgba(59,130,246,0.25)" },
    "in-progress": { color:"#7c3aed", bg:"rgba(237,233,254,0.85)", border:"rgba(139,92,246,0.25)" },
    resolved:      { color:"#16a34a", bg:"rgba(220,252,231,0.85)", border:"rgba(34,197,94,0.25)" },
    closed:        { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
  };
  return map[status] || { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" };
};

const getStatusIcon = (status) => {
  switch (status) {
    case "assigned":    return <AlertTriangle size={15} />;
    case "in-progress": return <Wrench size={15} />;
    case "resolved":    return <CheckCircle size={15} />;
    case "closed":      return <X size={15} />;
    default: return null;
  }
};

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([
    { id:"TKT001", title:"AC not working",  description:"Air conditioner not cooling properly", location:"Room 301", assignedDate:"2026-01-24", status:"assigned" },
    { id:"TKT002", title:"Projector issue", description:"Projector display flickering",          location:"Lab 5",   assignedDate:"2026-01-22", status:"in-progress" },
  ]);

  const [selectedTicket, setSelectedTicket]         = useState(null);
  const [confirmCloseTicket, setConfirmCloseTicket] = useState(null);

  const resolveWork = (id) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"resolved" } : t));
  const closeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"closed" } : t));
    setConfirmCloseTicket(null);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", { method:"POST", credentials:"include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch (error) { console.error("Logout error:", error); }
  };

  const stats = [
    { label:"Total Assigned",     value: tickets.length,                                         icon:"📋" },
    { label:"Pending to Work On", value: tickets.filter(t => t.status === "assigned").length,    icon:"⏳" },
    { label:"In Progress",        value: tickets.filter(t => t.status === "in-progress").length, icon:"🔧" },
    { label:"Completed",          value: tickets.filter(t => t.status === "resolved").length,    icon:"✅" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0 }}>
              <Wrench size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Technician Dashboard</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                Maintenance Technician
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            Logout
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"30px 32px", position:"relative", zIndex:1 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:30 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...glassCard, padding:"24px 22px" }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontSize:12, fontWeight:500, color:"#6b7280", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:36, fontWeight:700, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:600, color:"#111827" }}>My Tickets</div>
            <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Manage your assigned work orders</div>
          </div>
          <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, color:"#6366f1", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>{tickets.length} Total</span>
        </div>

        {tickets.map((t) => {
          const ss = getStatusStyle(t.status);
          return (
            <div key={t.id} style={{ ...glassCard, marginBottom:16 }}>
              <div style={{ padding:"24px 26px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em" }}>{t.id}</span>
                    </div>
                    <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:4 }}>{t.title}</div>
                    <div style={{ fontSize:13, color:"#6b7280", marginBottom:14 }}>{t.description}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <MapPin size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:1 }}>Location</div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{t.location}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Calendar size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:1 }}>Assigned Date</div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{t.assignedDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:14, fontSize:12, fontWeight:600, color:ss.color, background:ss.bg, border:`1px solid ${ss.border}`, whiteSpace:"nowrap" }}>
                    {getStatusIcon(t.status)}
                    {t.status.replace("-"," ").toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:10, padding:"14px 26px", borderTop:"1px solid rgba(0,0,0,0.05)", flexWrap:"wrap" }}>
                <button onClick={() => setSelectedTicket(t)} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                  <Eye size={15} /> View Details
                </button>
                <button onClick={() => resolveWork(t.id)} disabled={t.status === "resolved" || t.status === "closed"} style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(34,197,94,0.2)", background: t.status === "resolved" || t.status === "closed" ? "rgba(0,0,0,0.04)" : "rgba(34,197,94,0.08)", color: t.status === "resolved" || t.status === "closed" ? "#9ca3af" : "#16a34a", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: t.status === "resolved" || t.status === "closed" ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <CheckCircle size={15} />
                  {t.status === "resolved" ? "Resolved ✓" : "Mark as Resolved"}
                </button>
                <button onClick={() => setConfirmCloseTicket(t)} disabled={t.status === "closed" || t.status === "resolved"} style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(239,68,68,0.2)", background: t.status === "closed" || t.status === "resolved" ? "rgba(0,0,0,0.04)" : "rgba(239,68,68,0.08)", color: t.status === "closed" || t.status === "resolved" ? "#9ca3af" : "#dc2626", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: t.status === "closed" || t.status === "resolved" ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <X size={15} />
                  {t.status === "closed" ? "Closed ✓" : "Close Ticket"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:580, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Wrench size={22} color="white" /></div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Work Order Details</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Complete ticket information</div>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", borderRadius:18, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.12)", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:3 }}>WORK ORDER ID</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>{selectedTicket.id}</div>
                </div>
                {(() => { const ss = getStatusStyle(selectedTicket.status); return (
                  <span style={{ padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, color:ss.color, background:ss.bg, border:`1px solid ${ss.border}` }}>{selectedTicket.status.replace("-"," ")}</span>
                ); })()}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"ISSUE TITLE",   val: selectedTicket.title,       span: true },
                  { label:"LOCATION",      val: selectedTicket.location },
                  { label:"ASSIGNED DATE", val: selectedTicket.assignedDate },
                ].map((f, i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:6 }}>DETAILED DESCRIPTION</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{selectedTicket.description}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ width:"100%", padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmCloseTicket && (
        <div onClick={() => setConfirmCloseTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:400, borderRadius:28, boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", padding:"36px 32px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"#dc2626" }}><AlertTriangle size={28} /></div>
            <div style={{ fontSize:20, fontWeight:600, color:"#111827", marginBottom:8 }}>Close Ticket?</div>
            <div style={{ fontSize:14, color:"#6b7280", marginBottom:6 }}>Are you sure you want to close</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#6366f1", marginBottom:8 }}>{confirmCloseTicket.id} — {confirmCloseTicket.title}</div>
            <div style={{ fontSize:13, color:"#9ca3af", marginBottom:28 }}>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setConfirmCloseTicket(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
              <button onClick={() => closeTicket(confirmCloseTicket.id)} style={{ flex:1, padding:"12px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 8px 24px rgba(239,68,68,0.3)" }}>Yes, Close Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;