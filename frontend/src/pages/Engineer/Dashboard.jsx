import React, { useState, useEffect } from "react";
import { X, Activity, Clock, AlertTriangle, CheckCircle, KeyRound, EyeOff, Eye, Mail, Send, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { unsubscribeFromPush } from '../../utils/pushNotifications';

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
    pending:  { color:"#d97706", bg:"rgba(254,243,199,0.85)", border:"rgba(245,158,11,0.25)" },
    overdue:  { color:"#dc2626", bg:"rgba(254,226,226,0.85)", border:"rgba(239,68,68,0.25)" },
    resolved: { color:"#059669", bg:"rgba(236,253,245,0.88)", border:"rgba(16,185,129,0.22)" },
    closed:   { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
  };
  return map[s] || { color:"#6b7280", bg:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" };
};

// ─── Shared Comment Section ───────────────────────────────────────────────────
const CommentSection = ({ ticketId, role }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const BASE = `http://localhost:3000/api/${role}`;

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}`, { credentials:"include" });
      const data = await res.json();
      if (res.ok) setComments(data.ticket?.comments || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, [ticketId]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments`, {
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok) { setComments(prev => [...prev, data.comment]); setBody(""); }
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (commentId) => {
    if (!editBody.trim()) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, {
        method:"PATCH", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ body: editBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === commentId ? data.comment : c));
        setEditingId(null); setEditBody("");
      }
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
              <div key={c.id} style={{ padding:"13px 15px", borderRadius:18, background:isAdmin?"rgba(99,102,241,0.07)":"rgba(14,165,233,0.06)", border:isAdmin?"1px solid rgba(99,102,241,0.15)":"1px solid rgba(14,165,233,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                    {/* Role badge — ADMIN is bold/prominent */}
                    {isAdmin ? (
                      <span style={{ fontSize:11, fontWeight:800, color:"#6366f1", background:"rgba(99,102,241,0.12)", padding:"2px 9px", borderRadius:20, letterSpacing:"0.04em" }}>ADMIN</span>
                    ) : (
                      <span style={{ fontSize:11, fontWeight:700, color:"#0ea5e9", background:"rgba(14,165,233,0.1)", padding:"2px 9px", borderRadius:20, letterSpacing:"0.04em" }}>ENGINEER</span>
                    )}
                    <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{c.authorName}</span>
                    {c.authorDepartment && <span style={{ fontSize:11, color:"#9ca3af" }}>· {c.authorDepartment}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#9ca3af" }}>{formatDate(c.createdAt)}</span>
                    {isOwn && (
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>{ setEditingId(c.id); setEditBody(c.body); }} style={{ width:26, height:26, borderRadius:8, border:"none", background:"rgba(99,102,241,0.1)", color:"#6366f1", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Pencil size={12} /></button>
                        <button onClick={()=>handleDelete(c.id)} style={{ width:26, height:26, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", color:"#ef4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === c.id ? (
                  <div>
                    <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={2} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid rgba(99,102,241,0.3)", background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", color:"#111827", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
                    <div style={{ display:"flex", gap:8, marginTop:7 }}>
                      <button onClick={()=>{ setEditingId(null); setEditBody(""); }} style={{ padding:"7px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Cancel</button>
                      <button onClick={()=>handleEdit(c.id)} disabled={editSubmitting||!editBody.trim()} style={{ padding:"7px 16px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", opacity:editSubmitting||!editBody.trim()?0.6:1 }}>{editSubmitting?"Saving...":"Save"}</button>
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

      <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a comment..." rows={2} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSubmit(); } }} style={{ flex:1, padding:"11px 14px", borderRadius:16, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", color:"#111827", outline:"none", resize:"none", boxSizing:"border-box" }} />
        <button onClick={handleSubmit} disabled={submitting||!body.trim()} style={{ padding:"11px 18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 6px 18px rgba(99,102,241,0.3)", opacity:submitting||!body.trim()?0.6:1, flexShrink:0 }}>
          <Send size={14} />{submitting?"...":"Send"}
        </button>
      </div>
    </div>
  );
};

const EngineerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [engineerInfo, setEngineerInfo] = useState({ username:"", department:"" });
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewTechnician, setViewTechnician] = useState(null);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [pwShow, setPwShow] = useState({ current:false, newPw:false, confirm:false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [tabCounts, setTabCounts] = useState({ pending:0, overdue:0, resolved:0, closed:0 });

  useEffect(() => {
    const fetchEngineerInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/engineer/dashboard", { credentials:"include" });
        const data = await res.json();
        if(res.ok) setEngineerInfo({ username:data.user?.username||"Engineer", department:data.user?.department||"" });
      } catch(e) { console.error(e); }
    };
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/engineer/profile", { credentials:"include" });
        const data = await res.json();
        if(res.ok) setProfile(data.engineer);
      } catch(e) { console.error(e); }
    };
    const fetchAllCounts = async () => {
      try {
        const statuses=["pending","overdue","resolved","closed"];
        const results=await Promise.all(statuses.map(s=>fetch(`http://localhost:3000/api/engineer/tickets?pg=1&status=${s.toUpperCase()}`, { credentials:"include" }).then(r=>r.json())));
        setTabCounts({ pending:results[0].tickets?.length||0, overdue:results[1].tickets?.length||0, resolved:results[2].tickets?.length||0, closed:results[3].tickets?.length||0 });
      } catch(e) { console.error(e); }
    };
    fetchEngineerInfo();
    fetchProfile();
    fetchAllCounts();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/engineer/technicians", { credentials:"include" });
      const data = await res.json();
      if(res.ok) setTechnicians(data.technicians);
    } catch(e) { console.error(e); }
  };

  const fetchTickets = async (status) => {
    setLoading(true);
    try {
      let url="http://localhost:3000/api/engineer/tickets?pg=1";
      if(status&&status!=="technicians") url+=`&status=${status.toUpperCase().replace("-","_")}`;
      const res=await fetch(url, { credentials:"include" });
      const data=await res.json();
      if(!res.ok) { alert(data.message); return; }
      setTickets(data.tickets);
    } catch(e) { console.error(e); alert("Server error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if(activeTab==="technicians") fetchTechnicians();
    else fetchTickets(activeTab);
  }, [activeTab]);

  const getStatusIcon = (status) => {
    const s=(status||"").toLowerCase().replace("_","-");
    switch(s) {
      case "pending":     return <Clock size={16} />;
      case "in-progress": return <Activity size={16} />;
      case "overdue":     return <AlertTriangle size={16} />;
      case "resolved":    return <CheckCircle size={16} />;
      case "closed":      return <X size={16} />;
      default: return null;
    }
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

  const resetPwForm = () => {
    setPwForm({ current:"", newPw:"", confirm:"" });
    setPwShow({ current:false, newPw:false, confirm:false });
    setPwError(""); setPwSuccess(false); setShowChangePw(false);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if(!pwForm.current||!pwForm.newPw||!pwForm.confirm) { setPwError("All fields are required."); return; }
    if(pwForm.newPw.length<6) { setPwError("New password must be at least 6 characters."); return; }
    if(pwForm.newPw!==pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if(pwForm.current===pwForm.newPw) { setPwError("New password must differ from current password."); return; }
    setPwLoading(true);
    try {
      const res=await fetch("http://localhost:3000/api/engineer/change-password", { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ currentPassword:pwForm.current, newPassword:pwForm.newPw }) });
      const data=await res.json();
      if(!res.ok) { setPwError(data.message||"Failed to change password."); return; }
      setPwSuccess(true);
      setTimeout(()=>resetPwForm(), 2200);
    } catch(e) { console.error(e); setPwError("Server error. Please try again."); }
    finally { setPwLoading(false); }
  };

  const pwInputStyle = { width:"100%", padding:"11px 11px 11px 40px", borderRadius:13, border:"1.5px solid rgba(99,102,241,0.2)", background:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box", paddingRight:40 };

  const pwScore=(()=>{ const v=pwForm.newPw; return [v.length>=6,v.length>=10,/[A-Z]/.test(v)||/[0-9]/.test(v),/[^a-zA-Z0-9]/.test(v)].filter(Boolean).length; })();
  const pwStrengthColors=["#334155","#475569","#eab308","#10b981"];
  const pwStrengthLabels=["","Weak","Fair","Good","Strong"];

  const tabBadgeStyle=(tabKey,isActive)=>{ const colorMap={ pending:{ color:"#d97706", bg:"rgba(254,243,199,0.9)" }, overdue:{ color:"#dc2626", bg:"rgba(254,226,226,0.9)" }, resolved:{ color:"#16a34a", bg:"rgba(220,252,231,0.9)" }, closed:{ color:"#6b7280", bg:"rgba(243,244,246,0.9)" }, technicians:{ color:"#6366f1", bg:"rgba(224,231,255,0.9)" } }; if(isActive) return { color:"rgba(255,255,255,0.95)", bg:"rgba(255,255,255,0.25)" }; return colorMap[tabKey]||{ color:"#6b7280", bg:"rgba(243,244,246,0.9)" }; };

  const tabs=[
    { key:"pending",     label:"Pending",  count:tabCounts.pending  },
    { key:"overdue",     label:"Overdue",  count:tabCounts.overdue  },
    { key:"resolved",    label:"Resolved", count:tabCounts.resolved },
    { key:"closed",      label:"Closed",   count:tabCounts.closed   },
    { key:"technicians", label:"My Team",  count:technicians.length },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div onClick={()=>{ setShowProfile(true); resetPwForm(); }} style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0, cursor:"pointer", overflow:"hidden", position:"relative" }}>
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:34, height:22, borderRadius:"50% 50% 0 0", background:"rgba(255,255,255,0.9)" }} />
              <div style={{ position:"absolute", top:9, left:"50%", transform:"translateX(-50%)", width:16, height:16, borderRadius:"50%", background:"rgba(255,255,255,0.9)" }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>{engineerInfo.username}</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}><span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />{engineerInfo.department} Department</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(239,68,68,0.2)", background:"rgba(254,242,242,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            Logout <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div style={{ position:"sticky", top:68, zIndex:90, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(255,255,255,0.45)", borderBottom:"1px solid rgba(255,255,255,0.5)", boxShadow:"0 4px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"14px 32px", display:"flex", gap:10, flexWrap:"wrap" }}>
          {tabs.map(tab => { const isActive=activeTab===tab.key; const badge=tabBadgeStyle(tab.key,isActive); return (
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{ padding:"9px 18px", borderRadius:20, border:"none", background:isActive?"linear-gradient(135deg,#6366f1,#0ea5e9)":"rgba(255,255,255,0.7)", color:isActive?"white":"#374151", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:isActive?"0 8px 24px rgba(99,102,241,0.3)":"0 2px 8px rgba(0,0,0,0.05)", transition:"all 0.2s" }}>
              <span>{tab.label}</span>
              {tab.count>0 && <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:badge.bg, color:badge.color, minWidth:20, textAlign:"center" }}>{tab.count}</span>}
            </button>
          ); })}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px", position:"relative", zIndex:1 }}>
        {activeTab!=="technicians" && (
          <div>
            {loading ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}><div style={{ fontSize:16, color:"#6b7280" }}>Loading tickets...</div></div>
            ) : tickets.length===0 ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Tickets Found</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>There are no {activeTab.replace("-"," ")} tickets at the moment.</div>
              </div>
            ) : (
              tickets.map(ticket => {
                const statusKey=(ticket.status||"").toLowerCase().replace("_","-");
                const ss=getStatusStyle(statusKey);
                return (
                  <div key={ticket.id} style={{ ...glassCard, marginBottom:16 }}>
                    <div style={{ padding:"24px 26px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", flexShrink:0 }}>{getStatusIcon(ticket.status)}</div>
                            <span style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em" }}>#{ticket.id}</span>
                          </div>
                          <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:4 }}>{ticket.subject}</div>
                          <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>{ticket.body}</div>
                          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                            {[{ label:"Department", val:ticket.type },{ label:"Date", val:new Date(ticket.createdAt).toLocaleDateString() }].map((m,i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div><div style={{ fontSize:11, color:"#9ca3af" }}>{m.label}</div><div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{m.val}</div></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:14, fontSize:12, fontWeight:600, color:ss.color, background:ss.bg, border:`1px solid ${ss.border}`, whiteSpace:"nowrap" }}>
                          {getStatusIcon(ticket.status)}{ticket.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:10, padding:"14px 26px", borderTop:"1px solid rgba(0,0,0,0.05)" }}>
                      <button onClick={()=>setSelectedTicket(ticket)} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
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

        {activeTab==="technicians" && (
          <div>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:20, fontWeight:600, color:"#111827" }}>My Team</div>
              <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Technicians in {engineerInfo.department} department</div>
            </div>
            {technicians.length===0 ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Technicians Found</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
                {technicians.map(tech => (
                  <div key={tech.id} style={{ ...glassCard, overflow:"hidden" }}>
                    <div style={{ height:60, background:"linear-gradient(135deg,#6366f1,#0ea5e9)" }} />
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 24px 24px" }}>
                      <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700, color:"white", boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>{(tech.username||"T").charAt(0).toUpperCase()}</div>
                      <div style={{ textAlign:"center", marginTop:12, marginBottom:14 }}>
                        <div style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:3 }}>{tech.username||"—"}</div>
                        <div style={{ fontSize:13, color:"#6b7280", marginBottom:2 }}>{tech.department}</div>
                        <div style={{ fontSize:12, color:"#9ca3af" }}>{tech.area}</div>
                      </div>
                      <button onClick={()=>setViewTechnician(tech)} style={{ width:"100%", padding:"11px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      {showProfile&&profile&&(
        <div onClick={()=>{ setShowProfile(false); resetPwForm(); }} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:460, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>My Profile</div>
              <button onClick={()=>{ setShowProfile(false); resetPwForm(); }} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", maxHeight:"80vh", overflowY:"auto" }}>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 12px", boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>{(profile.username||"E").charAt(0).toUpperCase()}</div>
                <div style={{ fontSize:20, fontWeight:700, color:"#111827" }}>{profile.username}</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>{profile.department} Department</div>
              </div>
              {[
                { label:"EMAIL",       val: profile.email },
                { label:"DEPARTMENT",  val: profile.department },
              ].map((f, i) => (
                <div key={i} style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:14, fontWeight:500, color:"#111827" }}>{f.val}</div>
                </div>
              ))}
              <div style={{ marginTop:16, borderRadius:18, border:"1.5px solid rgba(99,102,241,0.18)", overflow:"hidden" }}>
                <button onClick={()=>{ setShowChangePw(v=>!v); setPwError(""); setPwSuccess(false); }} style={{ width:"100%", padding:"14px 16px", background:showChangePw?"rgba(99,102,241,0.09)":"rgba(99,102,241,0.04)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"inherit" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center" }}><KeyRound size={14} color="white" /></div>
                    <span style={{ fontSize:14, fontWeight:600, color:"#374151" }}>Change Password</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ transition:"transform 0.25s", transform:showChangePw?"rotate(180deg)":"rotate(0deg)", flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showChangePw&&(
                  <div style={{ padding:"18px 16px", borderTop:"1px solid rgba(99,102,241,0.12)", background:"rgba(255,255,255,0.55)" }}>
                    {pwSuccess?(
                      <div style={{ textAlign:"center", padding:"14px 0" }}>
                        <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(16,185,129,0.1)", border:"2px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><CheckCircle size={26} color="#059669" /></div>
                        <div style={{ fontSize:15, fontWeight:600, color:"#059669", marginBottom:4 }}>Password Updated!</div>
                      </div>
                    ):(
                      <>
                        {pwError&&<div style={{ marginBottom:14, padding:"10px 13px", borderRadius:12, background:"rgba(100,116,139,0.07)", border:"1px solid rgba(100,116,139,0.18)", display:"flex", alignItems:"center", gap:9 }}><AlertTriangle size={14} color="#334155" style={{ flexShrink:0 }} /><span style={{ fontSize:12, color:"#334155" }}>{pwError}</span></div>}
                        {[{ key:"current", label:"Current Password", placeholder:"Enter current password" },{ key:"newPw", label:"New Password", placeholder:"At least 6 characters" },{ key:"confirm", label:"Confirm New Password", placeholder:"Re-enter new password" }].map(({ key, label, placeholder }) => (
                          <div key={key} style={{ marginBottom:14 }}>
                            <label style={{ display:"block", fontSize:12, fontWeight:500, color:"#374151", marginBottom:6 }}>{label}</label>
                            <div style={{ position:"relative" }}>
                              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}><KeyRound size={13} /></span>
                              <input type={pwShow[key]?"text":"password"} value={pwForm[key]} onChange={e=>setPwForm(prev=>({ ...prev, [key]:e.target.value }))} placeholder={placeholder} style={pwInputStyle} disabled={pwLoading} onKeyDown={e=>e.key==="Enter"&&handleChangePassword()} />
                              <button type="button" onClick={()=>setPwShow(prev=>({ ...prev, [key]:!prev[key] }))} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>{pwShow[key]?<EyeOff size={13} />:<Eye size={13} />}</button>
                            </div>
                            {key==="newPw"&&pwForm.newPw&&(
                              <div style={{ marginTop:7, display:"flex", alignItems:"center", gap:5 }}>
                                {[1,2,3,4].map(i=>(<div key={i} style={{ flex:1, height:3, borderRadius:4, background:i<=pwScore?pwStrengthColors[pwScore-1]:"rgba(0,0,0,0.08)", transition:"background 0.3s" }} />))}
                                <span style={{ fontSize:11, color:"#9ca3af", marginLeft:4, minWidth:30 }}>{pwStrengthLabels[pwScore]}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div style={{ display:"flex", gap:10, marginTop:6 }}>
                          <button onClick={resetPwForm} disabled={pwLoading} style={{ flex:1, padding:"10px", borderRadius:14, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:pwLoading?"not-allowed":"pointer" }}>Cancel</button>
                          <button onClick={handleChangePassword} disabled={pwLoading} style={{ flex:1, padding:"10px", borderRadius:14, border:"none", background:pwLoading?"rgba(99,102,241,0.45)":"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:pwLoading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                            {pwLoading?(<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Updating...</>) : (<><KeyRound size={13} /> Update Password</>)}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button onClick={()=>{ setShowProfile(false); resetPwForm(); }} style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKET DETAIL MODAL with Comments ── */}
      {selectedTicket && (
        <div onClick={()=>setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:620, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"22px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:18, fontWeight:600, color:"white" }}>Ticket Details</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>#{selectedTicket.id} · {selectedTicket.subject}</div>
              <button onClick={()=>setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}><X size={15} /></button>
            </div>
            <div style={{ padding:"24px 28px", maxHeight:"76vh", overflowY:"auto" }}>
              {[
                { label:"TICKET ID",   val:selectedTicket.id },
                { label:"SUBJECT",     val:selectedTicket.subject },
                { label:"DEPARTMENT",  val:selectedTicket.type },
                { label:"LOCATION",    val:selectedTicket.location||"—" },
                { label:"STATUS",      val:selectedTicket.status },
                { label:"DATE",        val:new Date(selectedTicket.createdAt).toLocaleDateString() },
                { label:"DESCRIPTION", val:selectedTicket.body },
              ].map((f,i) => (
                <div key={i} style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                </div>
              ))}

              {/* ── Comments ── */}
              <CommentSection ticketId={selectedTicket.id} role="engineer" />

              <button onClick={()=>setSelectedTicket(null)} style={{ width:"100%", marginTop:14, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TECHNICIAN DETAIL MODAL */}
      {viewTechnician && (
        <GlassModal onClose={()=>setViewTechnician(null)} title="Technician Profile">
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:32, fontWeight:700, margin:"0 auto 12px", boxShadow:"0 12px 32px rgba(99,102,241,0.35)" }}>{(viewTechnician.username||"T").charAt(0).toUpperCase()}</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>{viewTechnician.username||"—"}</div>
            <div style={{ fontSize:14, color:"#6b7280", marginBottom:4 }}>{viewTechnician.department}</div>
            <div style={{ fontSize:13, color:"#9ca3af" }}>{viewTechnician.area}</div>
          </div>
          {[{ icon:<Mail size={16} color="#6366f1" />, label:"EMAIL", val:viewTechnician.email },{ icon:<Activity size={16} color="#6366f1" />, label:"DEPARTMENT", val:viewTechnician.department },{ icon:<Activity size={16} color="#6366f1" />, label:"AREA", val:viewTechnician.area }].map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:10 }}>
              {f.icon}
              <div><div style={{ fontSize:11, fontWeight:600, color:"#6366f1", marginBottom:2 }}>{f.label}</div><div style={{ fontSize:14, fontWeight:500, color:"#111827" }}>{f.val}</div></div>
            </div>
          ))}
        </GlassModal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const GlassModal = ({ children, onClose, title }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
    <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:560, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
      <div style={{ padding:"22px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div><div style={{ fontSize:18, fontWeight:600, color:"white" }}>{title}</div><div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>View and manage information</div></div>
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