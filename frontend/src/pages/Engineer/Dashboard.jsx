import React, { useState, useEffect } from "react";
import { X, Star, Phone, Mail, Activity, Clock, AlertTriangle, CheckCircle, KeyRound, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase().replace("_","-");
  const map = {
    pending:       { color:"#d97706", bg:"rgba(254,243,199,0.85)", border:"rgba(245,158,11,0.25)" },
    "in-progress": { color:"#7c3aed", bg:"rgba(237,233,254,0.85)", border:"rgba(139,92,246,0.25)" },
    overdue:       { color:"#dc2626", bg:"rgba(254,226,226,0.85)", border:"rgba(239,68,68,0.25)" },
    resolved:      { color:"#16a34a", bg:"rgba(220,252,231,0.85)", border:"rgba(34,197,94,0.25)" },
    closed:        { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
  };
  return map[s] || { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" };
};

const EngineerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const technicians = [
    { id:"TECH01", name:"Ravi Kumar",  skill:"Electrical",  rating:4.6, email:"ravi@iiti.ac.in",  phone:"9876543210", activeTickets:2, status:"active" },
    { id:"TECH02", name:"Amit Sharma", skill:"Maintenance", rating:4.2, email:"amit@iiti.ac.in",  phone:"9123456789", activeTickets:1, status:"inactive" },
  ];

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewTechnician, setViewTechnician]  = useState(null);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [pwVisible, setPwVisible] = useState({ current:false, newPw:false, confirm:false });
  const [pwFocus, setPwFocus] = useState({ current:false, newPw:false, confirm:false });
  const [pwLoading, setPwLoading] = useState(false);

  const fetchTickets = async (status) => {
    setLoading(true);
    try {
      let url = "http://localhost:3000/api/engineer/tickets?pg=1";
      if (status && status !== "technicians") {
        url += `&status=${status.toUpperCase().replace("-","_")}`;
      }
      const res = await fetch(url, { credentials:"include" });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setTickets(data.tickets);
    } catch (e) {
      console.error(e);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "technicians") {
      fetchTickets(activeTab);
    }
  }, [activeTab]);

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
      const res = await fetch("http://localhost:3000/api/engineer/change-password", {
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

  const getStatusIcon = (status) => {
    const s = (status || "").toLowerCase().replace("_","-");
    switch (s) {
      case "pending":     return <Clock size={16} />;
      case "in-progress": return <Activity size={16} />;
      case "overdue":     return <AlertTriangle size={16} />;
      case "resolved":    return <CheckCircle size={16} />;
      default: return null;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", { method:"POST", credentials:"include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch (error) { console.error("Logout error:", error); }
  };

  const tabs = [
    { key:"pending",     label:"Pending",    icon:"⏳" },
    { key:"in-progress", label:"In Progress", icon:"🔄" },
    { key:"overdue",     label:"Overdue",     icon:"⚠️" },
    { key:"resolved",    label:"Resolved",    icon:"✅" },
    { key:"closed",      label:"Closed",      icon:"🔒" },
    { key:"technicians", label:"My Team",     icon:"👥", customCount: technicians.length },
  ];

  const inputStyle = (focused) => ({
    width:"100%", padding:"13px 16px 13px 44px",
    borderRadius:18, border:`1.5px solid ${focused ? "#6366f1" : "rgba(0,0,0,0.09)"}`,
    background:"rgba(255,255,255,0.9)", fontSize:14,
    fontFamily:"inherit", color:"#111827", outline:"none",
    boxSizing:"border-box", display:"block",
    boxShadow: focused ? "0 0 0 5px rgba(99,102,241,0.15)" : "none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0 }}>
              <svg width="22" height="22" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Engineer Dashboard</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                Electrical Department
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button
              onClick={() => { setShowChangePassword(true); setPwForm({ current:"", newPw:"", confirm:"" }); }}
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

      {/* TAB BAR */}
      <div style={{ position:"sticky", top:68, zIndex:90, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(255,255,255,0.45)", borderBottom:"1px solid rgba(255,255,255,0.5)", boxShadow:"0 4px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"14px 32px", display:"flex", gap:10, flexWrap:"wrap" }}>
          {tabs.map(tab => {
            const cnt = tab.customCount !== undefined ? tab.customCount : tickets.length;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding:"9px 18px", borderRadius:20, border:"none", background: active ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(255,255,255,0.7)", color: active ? "white" : "#374151", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow: active ? "0 8px 24px rgba(99,102,241,0.3)" : "0 2px 8px rgba(0,0,0,0.05)", transition:"all 0.2s" }}>
                <span>{tab.icon}</span><span>{tab.label}</span>
                {cnt > 0 && activeTab === tab.key && (
                  <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.25)", color:"white" }}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px", position:"relative", zIndex:1 }}>

        {/* TICKET TABS */}
        {activeTab !== "technicians" && (
          <div>
            {loading ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:16, color:"#6b7280" }}>Loading tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(99,102,241,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <svg width="28" height="28" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Tickets Found</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>There are no {activeTab.replace("-"," ")} tickets at the moment.</div>
              </div>
            ) : (
              tickets.map((ticket) => {
                const statusKey = (ticket.status || "").toLowerCase().replace("_","-");
                const ss = getStatusStyle(statusKey);
                return (
                  <div key={ticket.id} style={{ ...glassCard, marginBottom:16 }}>
                    <div style={{ padding:"24px 26px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", flexShrink:0 }}>
                              {getStatusIcon(ticket.status)}
                            </div>
                            <span style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em" }}>#{ticket.id}</span>
                          </div>
                          <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:4 }}>{ticket.subject}</div>
                          <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>{ticket.body}</div>
                          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              <div><div style={{ fontSize:11, color:"#9ca3af" }}>Department</div><div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{ticket.type}</div></div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                              <div><div style={{ fontSize:11, color:"#9ca3af" }}>Issue Type</div><div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{ticket.subtype}</div></div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <div><div style={{ fontSize:11, color:"#9ca3af" }}>Date</div><div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{new Date(ticket.createdAt).toLocaleDateString()}</div></div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:14, fontSize:12, fontWeight:600, color:ss.color, background:ss.bg, border:`1px solid ${ss.border}`, whiteSpace:"nowrap" }}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:10, padding:"14px 26px", borderTop:"1px solid rgba(0,0,0,0.05)", flexWrap:"wrap" }}>
                      <button onClick={() => setSelectedTicket(ticket)} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TECHNICIANS TAB */}
        {activeTab === "technicians" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {technicians.map((tech) => (
              <div key={tech.id} style={{ ...glassCard, overflow:"hidden" }}>
                <div style={{ height:80, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
                  <div style={{ position:"absolute", top:10, right:12, display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background: tech.status === "active" ? "#4ade80" : "#f87171", display:"inline-block" }} />
                    <span style={{ fontSize:11, fontWeight:600, color:"white" }}>{tech.status === "active" ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div style={{ padding:"0 24px 24px", marginTop:-36 }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, boxShadow:"0 8px 24px rgba(99,102,241,0.35)", border:"3px solid white", margin:"0 auto 14px" }}>{tech.name.charAt(0)}</div>
                  <div style={{ textAlign:"center", marginBottom:14 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:3 }}>{tech.name}</div>
                    <div style={{ fontSize:13, color:"#6b7280", marginBottom:2 }}>{tech.skill}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3, marginBottom:14 }}>
                    {[...Array(5)].map((_, i) => (<Star key={i} size={14} style={{ color: i < Math.floor(tech.rating) ? "#facc15" : "#d1d5db", fill: i < Math.floor(tech.rating) ? "#facc15" : "none" }} />))}
                    <span style={{ fontSize:13, fontWeight:600, color:"#374151", marginLeft:4 }}>{tech.rating}</span>
                  </div>
                  <button onClick={() => setViewTechnician(tech)} style={{ width:"100%", padding:"11px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div onClick={() => setShowChangePassword(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:460, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
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

            <div style={{ padding:"28px 28px" }}>
              {/* Current Password */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Current Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}><KeyRound size={16} /></span>
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
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}><KeyRound size={16} /></span>
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

              {/* Confirm Password */}
              <div style={{ marginBottom:26 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Confirm New Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "#dc2626" : "#6366f1", display:"flex", pointerEvents:"none" }}><KeyRound size={16} /></span>
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

      {/* TICKET MODAL */}
      {selectedTicket && (
        <GlassModal onClose={() => setSelectedTicket(null)} title="Ticket Details">
          {[
            { label:"TICKET ID",   val: selectedTicket.id },
            { label:"SUBJECT",     val: selectedTicket.subject },
            { label:"DEPARTMENT",  val: selectedTicket.type },
            { label:"ISSUE TYPE",  val: selectedTicket.subtype },
            { label:"STATUS",      val: selectedTicket.status },
            { label:"DATE",        val: new Date(selectedTicket.createdAt).toLocaleDateString() },
            { label:"DESCRIPTION", val: selectedTicket.body },
          ].map((f,i) => (
            <div key={i} style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>{f.label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
            </div>
          ))}
        </GlassModal>
      )}

      {/* TECHNICIAN MODAL */}
      {viewTechnician && (
        <GlassModal onClose={() => setViewTechnician(null)} title="Technician Profile">
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:32, fontWeight:700, margin:"0 auto 12px", boxShadow:"0 12px 32px rgba(99,102,241,0.35)" }}>{viewTechnician.name.charAt(0)}</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>{viewTechnician.name}</div>
            <div style={{ fontSize:14, color:"#6b7280", marginBottom:12 }}>{viewTechnician.skill}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
              {[...Array(5)].map((_, i) => (<Star key={i} size={16} style={{ color: i < Math.floor(viewTechnician.rating) ? "#facc15" : "#d1d5db", fill: i < Math.floor(viewTechnician.rating) ? "#facc15" : "none" }} />))}
              <span style={{ fontSize:14, fontWeight:600, color:"#374151", marginLeft:6 }}>{viewTechnician.rating}</span>
            </div>
          </div>
          {[
            { icon: <Mail size={16} color="#6366f1" />,     label:"EMAIL",          val: viewTechnician.email },
            { icon: <Phone size={16} color="#6366f1" />,    label:"PHONE",          val: viewTechnician.phone },
            { icon: <Activity size={16} color="#6366f1" />, label:"ACTIVE TICKETS", val: `${viewTechnician.activeTickets} tickets` },
          ].map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
              {f.icon}
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", marginBottom:2 }}>{f.label}</div>
                <div style={{ fontSize:14, fontWeight:500, color:"#111827" }}>{f.val}</div>
              </div>
            </div>
          ))}
        </GlassModal>
      )}
    </div>
  );
};

const GlassModal = ({ children, onClose, title }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
    <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:560, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
      <div style={{ padding:"22px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:600, color:"white" }}>{title}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>View and manage information</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
      </div>
      <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
        {children}
        <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", marginTop:8 }}>Close</button>
      </div>
    </div>
  </div>
);

export default EngineerDashboard;