<<<<<<< Updated upstream
import React, { useState } from "react";
import { Eye, CheckCircle, X, MapPin, Calendar, Wrench, AlertTriangle, KeyRound, EyeOff } from "lucide-react";
=======
import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, X, MapPin, Calendar, Wrench, AlertTriangle } from "lucide-react";
>>>>>>> Stashed changes
import { useNavigate } from "react-router-dom";
 
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
    "in-progress": { color:"#7c3aed", bg:"rgba(237,233,254,0.85)", border:"rgba(139,92,246,0.25)" },
    resolved:      { color:"#16a34a", bg:"rgba(220,252,231,0.85)", border:"rgba(34,197,94,0.25)" },
    closed:        { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
    overdue:       { color:"#dc2626", bg:"rgba(254,226,226,0.85)", border:"rgba(239,68,68,0.25)" },
  };
  return map[s] || { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" };
};
 
const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [confirmCloseTicket, setConfirmCloseTicket] = useState(null);
<<<<<<< Updated upstream

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [pwVisible, setPwVisible] = useState({ current:false, newPw:false, confirm:false });
  const [pwLoading, setPwLoading] = useState(false);

  const resolveWork = (id) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"resolved" } : t));
  const closeTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status:"closed" } : t));
    setConfirmCloseTicket(null);
=======
  const [techInfo, setTechInfo] = useState({ username:"", department:"", area:"" });
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
 
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      alert("All fields are required!"); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      alert("New passwords do not match!"); return;
    }
    if (pwForm.newPw.length < 6) {
      alert("New password must be at least 6 characters!"); return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/technician/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed to change password"); return; }
      alert("Password changed successfully!");
      setShowChangePassword(false);
      setPwForm({ current:"", newPw:"", confirm:"" });
    } catch (err) {
      console.error(err); alert("Server error");
    } finally {
      setPwLoading(false);
    }
  };

=======
 
>>>>>>> Stashed changes
  const stats = [
    { label:"Total Assigned",     value: tickets.length,                                                    icon:"📋" },
    { label:"Pending",            value: tickets.filter(t => t.status === "PENDING").length,                icon:"⏳" },
    { label:"In Progress",        value: tickets.filter(t => t.status === "IN_PROGRESS").length,            icon:"🔧" },
    { label:"Resolved",           value: tickets.filter(t => t.status === "RESOLVED").length,               icon:"✅" },
  ];
<<<<<<< Updated upstream

  const inputStyle = (focused) => ({
    width:"100%", padding:"13px 16px 13px 44px",
    borderRadius:18, border:`1.5px solid ${focused ? "#6366f1" : "rgba(0,0,0,0.09)"}`,
    background:"rgba(255,255,255,0.9)", fontSize:14,
    fontFamily:"inherit", color:"#111827", outline:"none",
    boxSizing:"border-box", display:"block",
    boxShadow: focused ? "0 0 0 5px rgba(99,102,241,0.15)" : "none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  });

  const [pwFocus, setPwFocus] = useState({ current:false, newPw:false, confirm:false });

=======
 
>>>>>>> Stashed changes
  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />
<<<<<<< Updated upstream

=======
 
>>>>>>> Stashed changes
      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div onClick={() => setShowProfile(true)} style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0, cursor:"pointer" }}>
              <Wrench size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Welcome, {techInfo.username} 👋</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                {techInfo.department} · {techInfo.area}
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => { setShowChangePassword(true); setPwForm({ current:"", newPw:"", confirm:"" }); }}
              style={{ padding:"10px 18px", borderRadius:18, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(99,102,241,0.08)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#6366f1", cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
              <KeyRound size={15} />
              Change Password
            </button>
            <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              Logout
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>
 
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"30px 32px", position:"relative", zIndex:1 }}>
<<<<<<< Updated upstream
        {/* Stats */}
=======
 
        {/* STAT CARDS */}
>>>>>>> Stashed changes
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
                <button onClick={() => setSelectedTicket(t)} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                  <Eye size={15} /> View Details
                </button>
                <button
                  onClick={() => !isDone && handleResolve(t.id)}
                  disabled={isDone}
                  style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(34,197,94,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(34,197,94,0.08)", color: isDone ? "#9ca3af" : "#16a34a", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: isDone ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <CheckCircle size={15} />
                  {isResolved ? "Resolved ✓" : "Mark as Resolved"}
                </button>
                <button
                  onClick={() => !isDone && setConfirmCloseTicket(t)}
                  disabled={isDone}
                  style={{ padding:"10px 18px", borderRadius:18, border:"1px solid rgba(239,68,68,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(239,68,68,0.08)", color: isDone ? "#9ca3af" : "#dc2626", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor: isDone ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:7 }}>
                  <X size={15} />
                  {isClosed ? "Closed ✓" : "Close Ticket"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
<<<<<<< Updated upstream

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div onClick={() => setShowChangePassword(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:460, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>

            {/* Modal header */}
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <KeyRound size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Change Password</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Update your account password</div>
                </div>
              </div>
              <button onClick={() => setShowChangePassword(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding:"28px 28px" }}>

              {/* Current Password */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Current Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={pwVisible.current ? "text" : "password"}
                    value={pwForm.current}
                    onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                    onFocus={() => setPwFocus(p => ({ ...p, current:true }))}
                    onBlur={() => setPwFocus(p => ({ ...p, current:false }))}
                    placeholder="Enter current password"
                    style={{ ...inputStyle(pwFocus.current), paddingRight:44 }}
                  />
                  <button type="button" onClick={() => setPwVisible(p => ({ ...p, current:!p.current }))} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                    {pwVisible.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>New Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={pwVisible.newPw ? "text" : "password"}
                    value={pwForm.newPw}
                    onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                    onFocus={() => setPwFocus(p => ({ ...p, newPw:true }))}
                    onBlur={() => setPwFocus(p => ({ ...p, newPw:false }))}
                    placeholder="Enter new password"
                    style={{ ...inputStyle(pwFocus.newPw), paddingRight:44 }}
                  />
                  <button type="button" onClick={() => setPwVisible(p => ({ ...p, newPw:!p.newPw }))} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                    {pwVisible.newPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom:26 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Confirm New Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "#dc2626" : "#6366f1", display:"flex", pointerEvents:"none" }}>
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={pwVisible.confirm ? "text" : "password"}
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                    onFocus={() => setPwFocus(p => ({ ...p, confirm:true }))}
                    onBlur={() => setPwFocus(p => ({ ...p, confirm:false }))}
                    placeholder="Re-enter new password"
                    style={{
                      ...inputStyle(pwFocus.confirm),
                      paddingRight:44,
                      borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "#dc2626" : pwFocus.confirm ? "#6366f1" : "rgba(0,0,0,0.09)",
                      boxShadow: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "0 0 0 5px rgba(220,38,38,0.1)" : pwFocus.confirm ? "0 0 0 5px rgba(99,102,241,0.15)" : "none",
                    }}
                  />
                  <button type="button" onClick={() => setPwVisible(p => ({ ...p, confirm:!p.confirm }))} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "#dc2626" : "#6366f1", display:"flex", padding:4 }}>
                    {pwVisible.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                  <div style={{ fontSize:12, color:"#dc2626", marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
                    <AlertTriangle size={12} /> Passwords do not match
                  </div>
                )}
                {pwForm.confirm && pwForm.confirm === pwForm.newPw && pwForm.newPw && (
                  <div style={{ fontSize:12, color:"#16a34a", marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
                    <CheckCircle size={12} /> Passwords match
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowChangePassword(false)} style={{ flex:1, padding:"13px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleChangePassword} disabled={pwLoading} style={{ flex:2, padding:"13px", borderRadius:18, border:"none", background: pwLoading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor: pwLoading ? "not-allowed" : "pointer", boxShadow: pwLoading ? "none" : "0 8px 24px rgba(99,102,241,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {pwLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>
                      Updating…
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

=======
 
>>>>>>> Stashed changes
      {/* VIEW DETAILS MODAL */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:580, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Wrench size={22} color="white" /></div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Ticket Details</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Complete ticket information</div>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"TICKET ID",    val: selectedTicket.id,                                          span: false },
                  { label:"STATUS",       val: selectedTicket.status,                                      span: false },
                  { label:"SUBJECT",      val: selectedTicket.subject,                                     span: true  },
                  { label:"DEPARTMENT",   val: selectedTicket.type,                                        span: false },
                  { label:"ISSUE TYPE",   val: selectedTicket.subtype,                                     span: false },
                  { label:"AREA",         val: selectedTicket.area,                                        span: false },
                  { label:"LOCATION",     val: selectedTicket.location || "—",                             span: false },
                  { label:"RAISED BY",    val: selectedTicket.user?.username || "—",                       span: false },
                  { label:"DATE",         val: new Date(selectedTicket.createdAt).toLocaleDateString(),    span: false },
                ].map((f, i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:6 }}>DESCRIPTION</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{selectedTicket.body}</div>
              </div>
              {selectedTicket.imageUrl && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:8 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${selectedTicket.imageUrl}`} alt="ticket" style={{ width:"100%", borderRadius:16, maxHeight:240, objectFit:"cover" }} />
                </div>
              )}
              <button onClick={() => setSelectedTicket(null)} style={{ width:"100%", padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
<<<<<<< Updated upstream

=======
 
      {/* PROFILE MODAL */}
      {showProfile && profile && (
        <div onClick={() => setShowProfile(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:460, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>My Profile</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:3 }}>Your account details</div>
              <button onClick={() => setShowProfile(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 12px", boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>{(profile.username || "T").charAt(0).toUpperCase()}</div>
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
              <button onClick={() => setShowProfile(false)} style={{ width:"100%", marginTop:8, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
 
>>>>>>> Stashed changes
      {/* CONFIRM CLOSE MODAL */}
      {confirmCloseTicket && (
        <div onClick={() => setConfirmCloseTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:400, borderRadius:28, boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", padding:"36px 32px", textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"#dc2626" }}><AlertTriangle size={28} /></div>
            <div style={{ fontSize:20, fontWeight:600, color:"#111827", marginBottom:8 }}>Close Ticket?</div>
            <div style={{ fontSize:14, color:"#6b7280", marginBottom:6 }}>Are you sure you want to close</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#6366f1", marginBottom:8 }}>#{confirmCloseTicket.id} — {confirmCloseTicket.subject}</div>
            <div style={{ fontSize:13, color:"#9ca3af", marginBottom:28 }}>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setConfirmCloseTicket(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
              <button onClick={() => handleClose(confirmCloseTicket.id)} style={{ flex:1, padding:"12px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 8px 24px rgba(239,68,68,0.3)" }}>Yes, Close Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default TechnicianDashboard;
 