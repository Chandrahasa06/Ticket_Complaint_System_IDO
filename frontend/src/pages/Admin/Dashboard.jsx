import React, { useState, useEffect } from "react";
import { Eye, X, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase().replace("_","-");
  const map = {
    overdue:      { color:"#dc2626", background:"rgba(254,226,226,0.85)", border:"rgba(239,68,68,0.25)" },
    pending:      { color:"#d97706", background:"rgba(254,243,199,0.85)", border:"rgba(245,158,11,0.25)" },
    "in-progress":{ color:"#2563eb", background:"rgba(219,234,254,0.85)", border:"rgba(59,130,246,0.25)" },
    resolved:     { color:"#16a34a", background:"rgba(220,252,231,0.85)", border:"rgba(34,197,94,0.25)" },
    closed:       { color:"#6b7280", background:"rgba(243,244,246,0.85)", border:"rgba(156,163,175,0.25)" },
  };
  return map[s] || map.closed;
};
 
const getStatusIcon = (status) => {
  const s = (status || "").toLowerCase().replace("_","-");
  const props = { size: 15 };
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
 
const TICKETS_PER_PAGE = 3;
 
const AREAS = [
  "Hostels", "KV School", "Abhinandhan Bhavan", "Academic Block",
  "Library", "Sports Complex", "Guest House", "Faculty Quarters",
  "Admin Block", "Cafeteria"
];
 
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total:0, pending:0, inProgress:0, overdue:0, resolved:0 });
  const navigate = useNavigate();
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [addRole, setAddRole] = useState("engineer");
  const [addForm, setAddForm] = useState({ username:"", email:"", password:"", department:"", area:[], phone:"", employeeId:"" });
  const [addLoading, setAddLoading] = useState(false);
 
  const handleAddPeople = async (e) => {
    e.preventDefault();
    if (!addForm.username || !addForm.email || !addForm.password) { alert("All fields are required!"); return; }
    if (addRole === "engineer" && !addForm.department) { alert("Please select a department!"); return; }
    if (addRole === "technician" && !addForm.department) { alert("Please select a department!"); return; }
    if (addRole === "technician" && addForm.area.length === 0) { alert("Please select at least one area!"); return; }
    setAddLoading(true);
    try {
      const body = { username: addForm.username, email: addForm.email, password: addForm.password, phone: addForm.phone, employeeId: addForm.employeeId };
      if (addRole === "engineer") body.department = addForm.department;
      if (addRole === "technician") { body.department = addForm.department; body.area = addForm.area; }
      const res = await fetch(`http://localhost:3000/api/${addRole}/register`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Registration failed"); return; }
      alert(`${addRole.charAt(0).toUpperCase() + addRole.slice(1)} added successfully!`);
      setAddForm({ username:"", email:"", password:"", department:"", area:[], phone:"", employeeId:"" });
      setShowAddPeople(false);
    } catch (err) { console.error(err); alert("Server error"); }
    finally { setAddLoading(false); }
  };
 
  const fetchTickets = async (status, page = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/api/admin/tickets?pg=${page}`;
      if (status && status !== "overview") url += `&status=${status.toUpperCase().replace("-","_")}`;
      const res = await fetch(url, { credentials:"include" });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setTickets(data.tickets);
      setTotalTickets(data.pagination.totalTickets);
    } catch (e) { console.error(e); alert("Server error"); }
    finally { setLoading(false); }
  };
 
  const fetchStats = async () => {
    try {
      const statuses = ["PENDING", "IN_PROGRESS", "OVERDUE", "RESOLVED"];
      const [allRes, ...statusRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/tickets?pg=1", { credentials:"include" }),
        ...statuses.map(s => fetch(`http://localhost:3000/api/admin/tickets?pg=1&status=${s}`, { credentials:"include" }))
      ]);
      const allData = await allRes.json();
      const statusData = await Promise.all(statusRes.map(r => r.json()));
      setStats({
        total:      allData.pagination?.totalTickets || 0,
        pending:    statusData[0].pagination?.totalTickets || 0,
        inProgress: statusData[1].pagination?.totalTickets || 0,
        overdue:    statusData[2].pagination?.totalTickets || 0,
        resolved:   statusData[3].pagination?.totalTickets || 0,
      });
    } catch (e) { console.error(e); }
  };
 
  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats();
    } else {
      setCurrentPage(1);
      fetchTickets(activeTab, 1);
    }
  }, [activeTab]);
 
  useEffect(() => {
    if (activeTab !== "overview") {
      fetchTickets(activeTab, currentPage);
    }
  }, [currentPage, activeTab]);
 
  const totalPages = Math.ceil(totalTickets / TICKETS_PER_PAGE);
 
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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
    { id:"overview",    label:"Overview",    icon:"📈" },
    { id:"pending",     label:"Pending",     icon:"⏳" },
    { id:"overdue",     label:"Overdue",     icon:"⚠️" },
    { id:"in-progress", label:"In Progress", icon:"🔄" },
    { id:"resolved",    label:"Resolved",    icon:"✅" },
    { id:"closed",      label:"Closed",      icon:"🔒" },
  ];
 
  const statCards = [
    { label:"Total Tickets", value: stats.total,      icon:"📊" },
    { label:"Pending",       value: stats.pending,    icon:"⏳" },
    { label:"In Progress",   value: stats.inProgress, icon:"🔄" },
    { label:"Overdue",       value: stats.overdue,    icon:"⚠️" },
    { label:"Resolved",      value: stats.resolved,   icon:"✅" },
  ];
 
  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>
 
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />
 
      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0 }}>
              <svg width="22" height="22" fill="white" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>Admin Dashboard</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                System Administrator
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setShowAddPeople(true)} style={{ padding:"10px 20px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", fontSize:13, fontWeight:600, fontFamily:"inherit", color:"white", cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
              <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Add People
            </button>
            <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              Logout
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
 
      {/* MAIN */}
      <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 32px", position:"relative", zIndex:1 }}>
 
        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:28 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ ...glassCard, padding:"22px 20px" }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontSize:12, color:"#6b7280", fontWeight:500, marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:32, fontWeight:600, background:"linear-gradient(90deg,#111827,#4f46e5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{c.value}</div>
            </div>
          ))}
        </div>
 
        {/* Tabs */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:26, padding:8, borderRadius:22, backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)", width:"fit-content" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
              padding:"10px 18px", borderRadius:15, border:"none",
              fontSize:13, fontWeight:500, fontFamily:"inherit",
              cursor:"pointer", display:"flex", alignItems:"center", gap:6,
              background: activeTab === tab.id ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent",
              color: activeTab === tab.id ? "white" : "#6b7280",
              boxShadow: activeTab === tab.id ? "0 8px 24px rgba(99,102,241,0.3)" : "none",
            }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
 
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{ padding:"20px 22px", borderRadius:24, marginBottom:22, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(254,226,226,0.65)", border:"1px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:"rgba(239,68,68,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444", flexShrink:0 }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:"#991b1b", marginBottom:8 }}>⚠️ Critical Alerts</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#b91c1c" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", display:"inline-block", flexShrink:0 }} />
                  {stats.overdue} ticket(s) overdue — Immediate action required
                </div>
              </div>
            </div>
            <div style={{ ...glassCard, padding:26 }}>
              <div style={{ fontSize:15, fontWeight:600, color:"#111827", marginBottom:16 }}>Ticket Summary</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[
                  { label:"Pending",     val: stats.pending,    color:"#d97706" },
                  { label:"In Progress", val: stats.inProgress, color:"#2563eb" },
                  { label:"Overdue",     val: stats.overdue,    color:"#dc2626" },
                  { label:"Resolved",    val: stats.resolved,   color:"#16a34a" },
                ].map((s,i) => (
                  <div key={i} style={{ padding:"18px", borderRadius:18, background:"rgba(255,255,255,0.5)", textAlign:"center" }}>
                    <div style={{ fontSize:32, fontWeight:700, color:s.color, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontSize:13, color:"#6b7280" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* TICKET LIST */}
        {activeTab !== "overview" && (
          <div>
            {loading ? (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:16, color:"#6b7280" }}>Loading tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ ...glassCard, padding:"72px 32px", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(99,102,241,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#6366f1" }}>
                  <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div style={{ fontSize:18, fontWeight:600, color:"#111827", marginBottom:6 }}>No Tickets Found</div>
                <div style={{ fontSize:14, color:"#6b7280" }}>There are no {activeTab.replace("-"," ")} tickets at the moment.</div>
              </div>
            ) : (
              <>
                {tickets.map((t) => {
                  const statusKey = (t.status || "").toLowerCase().replace("_","-");
                  const ss = getStatusStyle(statusKey);
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
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                              {[
                                { label:"Department", val: t.type },
                                { label:"Issue Type",  val: t.subtype },
                                { label:"Created",    val: new Date(t.createdAt).toLocaleDateString() },
                                { label:"Status",     val: t.status },
                              ].map((m, i) => (
                                <div key={i}>
                                  <div style={{ fontSize:11, color:"#9ca3af", marginBottom:2 }}>{m.label}</div>
                                  <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{m.val}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:14, fontSize:12, fontWeight:600, color:ss.color, background:ss.background, border:`1px solid ${ss.border}`, whiteSpace:"nowrap" }}>
                            {getStatusIcon(statusKey)}
                            {t.status}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:10, padding:"14px 26px", borderTop:"1px solid rgba(0,0,0,0.05)" }}>
                        <button onClick={() => setSelectedTicket(t)} style={{ padding:"10px 18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                          <Eye size={15} /> View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
                {totalPages > 1 && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8, padding:"16px 22px", borderRadius:22, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 8px 24px rgba(0,0,0,0.05)", border:"1px solid rgba(255,255,255,0.7)" }}>
                    <div style={{ fontSize:13, color:"#6b7280" }}>
                      Page <span style={{ fontWeight:600, color:"#111827" }}>{currentPage}</span> of <span style={{ fontWeight:600, color:"#111827" }}>{totalPages}</span> — <span style={{ fontWeight:600, color:"#111827" }}>{totalTickets}</span> total tickets
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ width:36, height:36, borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: currentPage === 1 ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)} style={{ width:36, height:36, borderRadius:12, border: currentPage === page ? "none" : "1px solid rgba(0,0,0,0.08)", background: currentPage === page ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(255,255,255,0.8)", color: currentPage === page ? "white" : "#374151", fontSize:13, fontWeight: currentPage === page ? 700 : 500, cursor:"pointer", fontFamily:"inherit", boxShadow: currentPage === page ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ width:36, height:36, borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: currentPage === totalPages ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
 
      {/* TICKET MODAL */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:620, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Ticket Details</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:3 }}>Complete information about this ticket</div>
              <button onClick={() => setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  { label:"TICKET ID",   val: selectedTicket.id },
                  { label:"SUBJECT",     val: selectedTicket.subject },
                  { label:"DEPARTMENT",  val: selectedTicket.type },
                  { label:"ISSUE TYPE",  val: selectedTicket.subtype },
                  { label:"STATUS",      val: selectedTicket.status },
                  { label:"DATE",        val: new Date(selectedTicket.createdAt).toLocaleDateString() },
                ].map((f, i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"15px 17px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:6 }}>DESCRIPTION</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{selectedTicket.body}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ width:"100%", marginTop:14, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
 
      {/* ADD PEOPLE MODAL */}
      {showAddPeople && (
        <div onClick={() => setShowAddPeople(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:500, borderRadius:32, boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", display:"flex", flexDirection:"column", maxHeight:"90vh" }}>
 
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative", flexShrink:0, borderRadius:"32px 32px 0 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Add New Member</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Register an engineer or technician</div>
                </div>
              </div>
              <button onClick={() => setShowAddPeople(false)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
 
            <div style={{ padding:"24px 28px", overflowY:"auto", flex:1 }}>
              <div style={{ display:"flex", gap:6, padding:6, borderRadius:20, background:"rgba(99,102,241,0.08)", marginBottom:24 }}>
                {["engineer","technician"].map(r => (
                  <button key={r} onClick={() => { setAddRole(r); setAddForm({ username:"", email:"", password:"", department:"", area:[], phone:"", employeeId:"" }); }} style={{ flex:1, padding:"10px", borderRadius:14, border:"none", background: addRole === r ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent", color: addRole === r ? "white" : "#6b7280", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow: addRole === r ? "0 4px 14px rgba(99,102,241,0.3)" : "none", transition:"all 0.2s", textTransform:"capitalize" }}>
                    {r}
                  </button>
                ))}
              </div>
 
              <form onSubmit={handleAddPeople}>
                {[
                  { label:"Username",     key:"username",   type:"text",     placeholder:"Enter username" },
                  { label:"Email",        key:"email",      type:"email",    placeholder:"Enter email address" },
                  { label:"Password",     key:"password",   type:"password", placeholder:"Set a password" },
                  { label:"Phone Number", key:"phone",      type:"tel",      placeholder:"Enter phone number" },
                  { label:"Employee ID",  key:"employeeId", type:"text",     placeholder:"Enter employee ID" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={addForm[f.key]}
                      onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      autoComplete="off"
                      style={{ width:"100%", padding:"13px 16px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box", transition:"all 0.2s" }}
                      onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }}
                    />
                  </div>
                ))}
 
                {addRole === "engineer" && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Department</label>
                    <select value={addForm.department} onChange={e => setAddForm(prev => ({ ...prev, department: e.target.value }))} style={{ width:"100%", padding:"13px 16px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box", cursor:"pointer" }} onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.12)"; }} onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }}>
                      <option value="">Select Department</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
                )}
 
                {addRole === "technician" && (
                  <>
                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Department</label>
                      <select value={addForm.department} onChange={e => setAddForm(prev => ({ ...prev, department: e.target.value }))} style={{ width:"100%", padding:"13px 16px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", fontSize:14, fontFamily:"inherit", color:"#111827", outline:"none", boxSizing:"border-box", cursor:"pointer" }} onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.12)"; }} onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }}>
                        <option value="">Select Department</option>
                        <option value="Civil">Civil</option>
                        <option value="Electrical">Electrical</option>
                        <option value="HVAC">HVAC</option>
                      </select>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>
                        Area <span style={{ color:"#9ca3af", fontWeight:400 }}>(select one or more)</span>
                      </label>
                      <div style={{ padding:"12px 14px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)", background:"rgba(255,255,255,0.9)", display:"flex", flexWrap:"wrap", gap:8 }}>
                        {AREAS.map(area => {
                          const selected = (addForm.area || []).includes(area);
                          return (
                            <button key={area} type="button" onClick={() => setAddForm(prev => ({ ...prev, area: selected ? (prev.area || []).filter(a => a !== area) : [...(prev.area || []), area] }))} style={{ padding:"6px 14px", borderRadius:20, border:"none", fontSize:12, fontWeight:500, fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s", background: selected ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(99,102,241,0.08)", color: selected ? "white" : "#6366f1", boxShadow: selected ? "0 4px 12px rgba(99,102,241,0.3)" : "none" }}>
                              {selected && "✓ "}{area}
                            </button>
                          );
                        })}
                      </div>
                      {(addForm.area || []).length > 0 && (
                        <div style={{ fontSize:12, color:"#6366f1", marginTop:6, fontWeight:500 }}>
                          {addForm.area.length} area{addForm.area.length > 1 ? "s" : ""} selected
                        </div>
                      )}
                    </div>
                  </>
                )}
 
                <div style={{ display:"flex", gap:10, marginTop:24 }}>
                  <button type="button" onClick={() => setShowAddPeople(false)} style={{ flex:1, padding:"13px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={addLoading} style={{ flex:2, padding:"13px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 8px 24px rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity: addLoading ? 0.7 : 1 }}>
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    {addLoading ? "Adding..." : `Add ${addRole.charAt(0).toUpperCase() + addRole.slice(1)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default AdminDashboard;
 