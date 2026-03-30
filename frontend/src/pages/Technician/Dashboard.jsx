import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, X, MapPin, Calendar, Wrench, AlertTriangle, KeyRound, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase().replace("_", "-");
  const map = {
    pending:       { color:"#d97706", bg:"rgba(254,243,199,0.85)", border:"rgba(245,158,11,0.25)" },
    resolved:      { color:"#059669", bg:"rgba(236,253,245,0.88)", border:"rgba(16,185,129,0.22)" },
    closed:        { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
    overdue:       { color:"#1e293b", bg:"rgba(241,245,249,0.92)", border:"rgba(100,116,139,0.25)" },
  };
  return map[s] || { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" };
};

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [prevTicket, setPrevTicket] = useState(null);
  const [prevTicketLoading, setPrevTicketLoading] = useState(false);
  const [confirmCloseTicket, setConfirmCloseTicket] = useState(null);
  const [techInfo, setTechInfo] = useState({ username:"", department:"", area:"" });
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [pwShow, setPwShow] = useState({ current:false, newPw:false, confirm:false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/technician/tickets", { credentials:"include" });
      const data = await res.json();
      if(!res.ok) { alert(data.message); return; }
      setTickets(data.tickets);
    } catch(e) {
      console.error(e);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketById = async (id) => {
    setPrevTicketLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}`, { credentials:"include" });
      const data = await res.json();
      if(!res.ok) { alert(data.message); return; }
      setPrevTicket(data.ticket);
    } catch(e) {
      console.error(e);
      alert("Server error");
    } finally {
      setPrevTicketLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setPrevTicket(null);
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/technician/dashboard", { credentials:"include" });
        const data = await res.json();
        if(res.ok) setTechInfo({
          username: data.user?.username || "Technician",
          department: data.user?.department || "",
          area: data.user?.area || "",
        });
      } catch(e) { console.error(e); }
    };
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/technician/profile", { credentials:"include" });
        const data = await res.json();
        if(res.ok) setProfile(data.technician);
      } catch(e) { console.error(e); }
    };
    fetchInfo();
    fetchProfile();
    fetchTickets();
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}/resolve`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if(!res.ok) { alert(data.message); return; }
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"RESOLVED" } : t));
    } catch(e) { console.error(e); alert("Server error"); }
  };

  const handleClose = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}/close`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if(!res.ok) { alert(data.message); return; }
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"CLOSED" } : t));
      setConfirmCloseTicket(null);
    } catch(e) { console.error(e); alert("Server error"); }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", { method:"POST", credentials:"include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch(error) { console.error("Logout error:", error); }
  };

  const resetPwForm = () => {
    setPwForm({ current:"", newPw:"", confirm:"" });
    setPwShow({ current:false, newPw:false, confirm:false });
    setPwError("");
    setPwSuccess(false);
    setShowChangePw(false);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwError("All fields are required."); return;
    }
    if (pwForm.newPw.length < 6) {
      setPwError("New password must be at least 6 characters."); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError("New passwords do not match."); return;
    }
    if (pwForm.current === pwForm.newPw) {
      setPwError("New password must differ from current password."); return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/technician/change-password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.message || "Failed to change password."); return; }
      setPwSuccess(true);
      setTimeout(() => resetPwForm(), 2200);
    } catch(e) {
      console.error(e);
      setPwError("Server error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const stats = [
    { label:"Total Assigned",  value: tickets.length},
    { label:"Pending",         value: tickets.filter(t => t.status === "PENDING").length },
    { label:"Resolved",        value: tickets.filter(t => t.status === "RESOLVED").length },
  ];

  const pwInputStyle = {
    width:"100%", padding:"11px 11px 11px 40px", borderRadius:13,
    border:"1.5px solid rgba(99,102,241,0.2)",
    background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit",
    color:"#111827", outline:"none", boxSizing:"border-box", paddingRight:40,
  };

  const pwScore = (() => {
    const v = pwForm.newPw;
    return [v.length >= 6, v.length >= 10, /[A-Z]/.test(v)||/[0-9]/.test(v), /[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
  })();
  const pwStrengthColors = ["#334155","#475569","#eab308","#10b981"];
  const pwStrengthLabels = ["","Weak","Fair","Good","Strong"];

  const displayedTicket = prevTicket ?? selectedTicket;

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div
              onClick={() => { setShowProfile(true); resetPwForm(); }}
              style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0, cursor:"pointer", overflow:"hidden", position:"relative" }}
            >
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:34, height:22, borderRadius:"50% 50% 0 0", background:"rgba(255,255,255,0.9)" }} />
              <div style={{ position:"absolute", top:9, left:"50%", transform:"translateX(-50%)", width:16, height:16, borderRadius:"50%", background:"rgba(255,255,255,0.9)" }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Welcome, {techInfo.username} </div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
                {techInfo.department} · {techInfo.area}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              Logout
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"30px 32px", position:"relative", zIndex:1 }}>

        {/* STAT CARDS */}
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
            <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Tickets assigned to your area and department</div>
          </div>
          <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, color:"#6366f1", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>{tickets.length} Total</span>
        </div>

        {loading && (
          <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
            <div style={{ fontSize:16, color:"#6b7280" }}>Loading tickets...</div>
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div style={{ ...glassCard, padding:"72px 32px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(99,102,241,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Wrench size={28} color="#9ca3af" />
            </div>
            <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Tickets Assigned</div>
            <div style={{ fontSize:13, color:"#9ca3af" }}>No tickets match your area and department yet.</div>
          </div>
        )}

        {!loading && tickets.map((t) => {
          const statusKey = (t.status || "").toLowerCase().replace("_", "-");
          const ss = getStatusStyle(statusKey);
          const isResolved = t.status === "RESOLVED";
          const isClosed = t.status === "CLOSED";
          const isDone = isResolved || isClosed;

          return (
            <div key={t.id} style={{ ...glassCard, marginBottom:16 }}>
              <div style={{ padding:"24px 26px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em" }}>#{t.id}</span>
                      {t.prevId && (
                        <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, color:"#7c3aed", background:"rgba(124,58,237,0.10)", border:"1px solid rgba(124,58,237,0.18)" }}>
                          Follow-up
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:4 }}>{t.subject}</div>
                    <div style={{ fontSize:13, color:"#6b7280", marginBottom:14 }}>{t.body}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <MapPin size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:1 }}>Area</div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{t.area}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <MapPin size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:1 }}>Location</div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{t.location || "—"}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Calendar size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:1 }}>Raised On</div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:14, fontSize:12, fontWeight:600, color:ss.color, background:ss.bg, border:`1px solid ${ss.border}`, whiteSpace:"nowrap" }}>
                    {t.status}
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:10, padding:"14px 26px", borderTop:"1px solid rgba(0,0,0,0.05)", flexWrap:"wrap" }}>
                <button onClick={() => { setPrevTicket(null); setSelectedTicket(t); }} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                  <Eye size={15} /> View Details
                </button>
                <button
                  onClick={() => !isDone && handleResolve(t.id)}
                  disabled={isDone}
                  style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(16,185,129,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(16,185,129,0.08)", color: isDone ? "#9ca3af" : "#059669", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: isDone ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <CheckCircle size={15} />
                  {isResolved ? "Resolved ✓" : "Mark as Resolved"}
                </button>
                <button
                  onClick={() => !isDone && setConfirmCloseTicket(t)}
                  disabled={isDone}
                  style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(100,116,139,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(100,116,139,0.08)", color: isDone ? "#9ca3af" : "#334155", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: isDone ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <X size={15} />
                  {isClosed ? "Closed ✓" : "Close Ticket"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── VIEW DETAILS MODAL ─── */}
      {selectedTicket && (
        <div onClick={closeModal} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:580, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background: prevTicket ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Wrench size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>
                    {prevTicket ? "Previous Ticket Details" : "Ticket Details"}
                  </div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>
                    {prevTicket ? `Referenced by Ticket #${selectedTicket.id}` : "Complete ticket information"}
                  </div>
                </div>
              </div>
              <button onClick={closeModal} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
              {prevTicket && (
                <button onClick={() => setPrevTicket(null)} style={{ marginBottom:18, background:"none", border:"none", color:"#6366f1", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, padding:0 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back to Ticket #{selectedTicket.id}
                </button>
              )}

              {!prevTicket && selectedTicket.prevId && (
                <div style={{ marginBottom:18, padding:"12px 16px", borderRadius:16, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <svg width="15" height="15" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span style={{ fontSize:13, color:"#374151" }}>
                      This is a follow-up to <span style={{ fontWeight:600, color:"#7c3aed" }}>Ticket #{selectedTicket.prevId}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => fetchTicketById(selectedTicket.prevId)}
                    disabled={prevTicketLoading}
                    style={{ padding:"6px 14px", borderRadius:20, border:"none", background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"white", fontSize:12, fontWeight:600, cursor: prevTicketLoading ? "wait" : "pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, opacity: prevTicketLoading ? 0.7 : 1 }}
                  >
                    {prevTicketLoading ? "Loading..." : (
                      <><Eye size={12} /> View Previous Ticket</>
                    )}
                  </button>
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"TICKET ID",  val: displayedTicket.id,                                        span: false },
                  { label:"STATUS",     val: displayedTicket.status,                                    span: false },
                  { label:"SUBJECT",    val: displayedTicket.subject,                                   span: true  },
                  { label:"DEPARTMENT", val: displayedTicket.type,                                      span: false },
                  { label:"AREA",       val: displayedTicket.area,                                      span: false },
                  { label:"LOCATION",   val: displayedTicket.location || "—",                           span: false },
                  { label:"RAISED BY",  val: displayedTicket.user?.username || "—",                     span: false },
                  { label:"DATE",       val: new Date(displayedTicket.createdAt).toLocaleDateString(),  span: false },
                ].map((f, i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:6 }}>DESCRIPTION</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{displayedTicket.body}</div>
              </div>

              {displayedTicket.imageUrl && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:8 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${displayedTicket.imageUrl}`} alt="ticket" style={{ width:"100%", borderRadius:16, maxHeight:240, objectFit:"cover" }} />
                </div>
              )}

              <button onClick={closeModal} style={{ width:"100%", padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE MODAL ──────────────────────────────────────────────────── */}
      {showProfile && profile && (
        <div
          onClick={() => { setShowProfile(false); resetPwForm(); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width:"100%", maxWidth:460, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}
          >
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>My Profile</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:3 }}>Your account details</div>
              <button
                onClick={() => { setShowProfile(false); resetPwForm(); }}
                style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding:"24px 28px", maxHeight:"80vh", overflowY:"auto" }}>
              <div style={{ textAlign:"center", marginBottom:22 }}>
                <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 12px", boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>
                  {(profile.username || "T").charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:"#111827" }}>{profile.username}</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>{profile.department} · {profile.area}</div>
              </div>

              {[
                { label:"EMAIL",       val: profile.email },
                { label:"PHONE",       val: profile.phone || "Not added" },
                { label:"EMPLOYEE ID", val: profile.employeeId || "Not added" },
                { label:"DEPARTMENT",  val: profile.department },
                { label:"AREA",        val: profile.area },
              ].map((f, i) => (
                <div key={i} style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:14, fontWeight:500, color:"#111827" }}>{f.val}</div>
                </div>
              ))}

              {/* Change Password accordion */}
              <div style={{ marginTop:16, borderRadius:18, border:"1.5px solid rgba(99,102,241,0.18)", overflow:"hidden" }}>
                <button
                  onClick={() => { setShowChangePw(v => !v); setPwError(""); setPwSuccess(false); }}
                  style={{ width:"100%", padding:"14px 16px", background: showChangePw ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.04)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"inherit" }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <KeyRound size={14} color="white" />
                    </div>
                    <span style={{ fontSize:14, fontWeight:600, color:"#374151" }}>Change Password</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ transition:"transform 0.25s", transform: showChangePw ? "rotate(180deg)" : "rotate(0deg)", flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showChangePw && (
                  <div style={{ padding:"18px 16px", borderTop:"1px solid rgba(99,102,241,0.12)", background:"rgba(255,255,255,0.55)" }}>
                    {pwSuccess ? (
                      <div style={{ textAlign:"center", padding:"14px 0" }}>
                        <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(16,185,129,0.1)", border:"2px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                          <CheckCircle size={26} color="#059669" />
                        </div>
                        <div style={{ fontSize:15, fontWeight:600, color:"#059669", marginBottom:4 }}>Password Updated!</div>
                        <div style={{ fontSize:12, color:"#6b7280" }}>Your password has been changed successfully.</div>
                      </div>
                    ) : (
                      <>
                        {pwError && (
                          <div style={{ marginBottom:14, padding:"10px 13px", borderRadius:12, background:"rgba(100,116,139,0.07)", border:"1px solid rgba(100,116,139,0.18)", display:"flex", alignItems:"center", gap:9 }}>
                            <AlertTriangle size={14} color="#334155" style={{ flexShrink:0 }} />
                            <span style={{ fontSize:12, color:"#334155" }}>{pwError}</span>
                          </div>
                        )}

                        {[
                          { key:"current", label:"Current Password",    placeholder:"Enter current password" },
                          { key:"newPw",   label:"New Password",         placeholder:"At least 6 characters" },
                          { key:"confirm", label:"Confirm New Password", placeholder:"Re-enter new password" },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key} style={{ marginBottom:14 }}>
                            <label style={{ display:"block", fontSize:12, fontWeight:500, color:"#374151", marginBottom:6 }}>{label}</label>
                            <div style={{ position:"relative" }}>
                              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>
                                <KeyRound size={13} />
                              </span>
                              <input
                                type={pwShow[key] ? "text" : "password"}
                                value={pwForm[key]}
                                onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={placeholder}
                                style={pwInputStyle}
                                disabled={pwLoading}
                                onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                              />
                              <button
                                type="button"
                                onClick={() => setPwShow(prev => ({ ...prev, [key]: !prev[key] }))}
                                style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}
                              >
                                {pwShow[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                            {key === "newPw" && pwForm.newPw && (
                              <div style={{ marginTop:7, display:"flex", alignItems:"center", gap:5 }}>
                                {[1,2,3,4].map(i => (
                                  <div key={i} style={{ flex:1, height:3, borderRadius:4, background: i <= pwScore ? pwStrengthColors[pwScore-1] : "rgba(0,0,0,0.08)", transition:"background 0.3s" }} />
                                ))}
                                <span style={{ fontSize:11, color:"#9ca3af", marginLeft:4, minWidth:30 }}>{pwStrengthLabels[pwScore]}</span>
                              </div>
                            )}
                          </div>
                        ))}

                        <div style={{ display:"flex", gap:10, marginTop:6 }}>
                          <button
                            onClick={resetPwForm}
                            disabled={pwLoading}
                            style={{ flex:1, padding:"10px", borderRadius:14, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor: pwLoading ? "not-allowed" : "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={pwLoading}
                            style={{ flex:1, padding:"10px", borderRadius:14, border:"none", background: pwLoading ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: pwLoading ? "not-allowed" : "pointer", boxShadow: pwLoading ? "none" : "0 6px 18px rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
                          >
                            {pwLoading ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                                Updating...
                              </>
                            ) : (
                              <><KeyRound size={13} /> Update Password</>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => { setShowProfile(false); resetPwForm(); }}
                style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLOSE MODAL */}
      {confirmCloseTicket && (
        <div onClick={() => setConfirmCloseTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:400, borderRadius:28, boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", padding:"36px 32px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(100,116,139,0.1)", border:"1px solid rgba(100,116,139,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"#334155" }}><AlertTriangle size={28} /></div>
            <div style={{ fontSize:20, fontWeight:600, color:"#111827", marginBottom:8 }}>Close Ticket?</div>
            <div style={{ fontSize:14, color:"#6b7280", marginBottom:6 }}>Are you sure you want to close</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#6366f1", marginBottom:8 }}>#{confirmCloseTicket.id} — {confirmCloseTicket.subject}</div>
            <div style={{ fontSize:13, color:"#9ca3af", marginBottom:28 }}>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setConfirmCloseTicket(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
              <button onClick={() => handleClose(confirmCloseTicket.id)} style={{ flex:1, padding:"12px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#1e293b,#334155)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 8px 24px rgba(30,41,59,0.3)" }}>Yes, Close Ticket</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TechnicianDashboard;