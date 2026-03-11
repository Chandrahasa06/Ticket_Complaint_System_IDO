import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("raise");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [followupTicket, setFollowupTicket] = useState(null); // ticket to follow up on
  const [followupForm, setFollowupForm] = useState({ title:"", description:"" });
  const [formData, setFormData] = useState({ title:"", department:"", subtype:"", description:"" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async (status) => {
    setLoading(true);
    try {
      let url = "http://localhost:3000/api/user/tickets";
      if (status) url = url + "?status=" + status;
      const response = await fetch(url, { credentials:"include" });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      setTickets(data.tickets);
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitTicket = async () => {
    if (!formData.title || !formData.department || !formData.subtype || !formData.description) {
      alert("All fields are required!");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/user/raise", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.department,
          subtype: formData.subtype,
          subject: formData.title,
          body: formData.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      alert("Ticket raised successfully!");
      setFormData({ title:"", department:"", subtype:"", description:"" });
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleSubmitFollowup = async () => {
    if (!followupForm.title || !followupForm.description) {
      alert("All fields are required!");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/user/followup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: followupTicket.type,
          subtype: followupTicket.subtype,
          subject: followupForm.title,
          body: followupForm.description,
          prevId: followupTicket.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message); return; }
      alert("Follow-up ticket raised successfully!");
      setFollowupTicket(null);
      setFollowupForm({ title:"", description:"" });
      fetchTickets("RESOLVED");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", { method:"POST", credentials:"include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px",
    borderRadius:18, border:"1.5px solid rgba(0,0,0,0.09)",
    background:"rgba(255,255,255,0.9)", fontSize:14,
    fontFamily:"inherit", color:"#111827", outline:"none",
    boxSizing:"border-box", display:"block",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };

  const tabs = [
    { id:"raise",    label:"Raise Ticket", iconPath:"M12 4v16m8-8H4" },
    { id:"pending",  label:"Pending",      iconPath:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id:"resolved", label:"Resolved",     iconPath:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const subtypeOptions = {
    Electrical: ["Fan", "Light", "AC", "Switchboard", "Wiring", "Other"],
    Plumbing:   ["Tap", "Pipe Leak", "Water Pump", "Drainage", "Other"],
    Carpentry:  ["Door", "Window", "Furniture", "Other"],
    IT:         ["Network", "Projector", "CCTV", "Computer", "Other"],
  };

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", position:"relative", overflowX:"hidden" }}>

      {/* Blobs */}
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(25px)", WebkitBackdropFilter:"blur(25px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", borderBottom:"1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", height:68, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0 }}>
              <svg width="22" height="22" fill="white" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:600, color:"#111827" }}>User Dashboard</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:1 }}>Manage your service requests</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding:"10px 20px", borderRadius:18, border:"1.5px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            Logout
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 32px", position:"relative", zIndex:1 }}>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:28, padding:8, borderRadius:22, backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", background:"rgba(255,255,255,0.55)", boxShadow:"0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)", width:"fit-content" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => {
              if (tab.id === "pending")  fetchTickets("PENDING");
              if (tab.id === "resolved") fetchTickets("RESOLVED");
              setActiveTab(tab.id);
            }} style={{
              padding:"10px 20px", borderRadius:15, border:"none",
              fontSize:13, fontWeight:500, fontFamily:"inherit",
              cursor:"pointer", display:"flex", alignItems:"center", gap:7,
              background: activeTab === tab.id ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent",
              color: activeTab === tab.id ? "white" : "#6b7280",
              boxShadow: activeTab === tab.id ? "0 8px 24px rgba(99,102,241,0.3)" : "none",
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.iconPath} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* RAISE TICKET */}
        {activeTab === "raise" && (
          <div style={{ ...glassCard, padding:"36px 40px", maxWidth:780 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:30 }}>
              <div style={{ width:48, height:48, borderRadius:15, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.35)", flexShrink:0 }}>
                <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize:20, fontWeight:600, color:"#111827" }}>Raise a New Ticket</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Fill in the details below to submit your request</div>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Complaint Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Fan not working in Room 101" style={inputStyle}
                onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.15)"; }}
                onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Department</label>
              <select name="department" value={formData.department} onChange={e => {
                setFormData({ ...formData, department: e.target.value, subtype: "" });
              }} style={{ ...inputStyle, cursor:"pointer" }}>
                <option value="">Select Department</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Carpentry</option>
                <option>IT</option>
              </select>
            </div>

            {formData.department && (
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Issue Type</label>
                <select name="subtype" value={formData.subtype} onChange={handleInputChange} style={{ ...inputStyle, cursor:"pointer" }}>
                  <option value="">Select Issue Type</option>
                  {(subtypeOptions[formData.department] || []).map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide detailed information about the issue..." rows={5} style={{ ...inputStyle, resize:"none", height:"auto" }}
                onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.15)"; }}
                onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }} />
            </div>

            <button onClick={handleSubmitTicket} style={{ width:"100%", padding:"15px", borderRadius:30, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:15, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 16px 48px rgba(99,102,241,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              Submit Ticket
              <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* PENDING TICKETS */}
        {activeTab === "pending" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:600, color:"#111827" }}>Pending Complaints</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Track your open service requests</div>
              </div>
              <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, color:"#d97706", background:"rgba(254,243,199,0.85)", border:"1px solid rgba(245,158,11,0.25)" }}>{tickets.length} Active</span>
            </div>

            {loading && <div style={{ textAlign:"center", padding:40, color:"#6b7280" }}>Loading tickets...</div>}

            {!loading && tickets.length === 0 && (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Pending Tickets</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>You have no pending service requests.</div>
              </div>
            )}

            {!loading && tickets.map((ticket) => (
              <div key={ticket.id} style={{ ...glassCard, marginBottom:14 }}>
                <div style={{ padding:"22px 26px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:8 }}>{ticket.subject}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:16, fontSize:13, color:"#6b7280" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          {ticket.type}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          {ticket.subtype}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block" }} />
                      <span style={{ fontSize:12, fontWeight:600, color:"#d97706" }}>Pending</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(ticket)} style={{ width:"100%", padding:"11px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)", marginTop:4 }}>
                    View Details
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESOLVED TICKETS */}
        {activeTab === "resolved" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:600, color:"#111827" }}>Resolved Complaints</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Review completed service requests</div>
              </div>
              <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, color:"#16a34a", background:"rgba(220,252,231,0.85)", border:"1px solid rgba(34,197,94,0.25)" }}>{tickets.length} Completed</span>
            </div>

            {loading && <div style={{ textAlign:"center", padding:40, color:"#6b7280" }}>Loading tickets...</div>}

            {!loading && tickets.length === 0 && (
              <div style={{ ...glassCard, padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:600, color:"#374151", marginBottom:6 }}>No Resolved Tickets</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>You have no resolved service requests yet.</div>
              </div>
            )}

            {!loading && tickets.map((ticket) => (
              <div key={ticket.id} style={{ ...glassCard, marginBottom:14 }}>
                <div style={{ padding:"22px 26px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:17, fontWeight:600, color:"#111827", marginBottom:8 }}>{ticket.subject}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:16, fontSize:13, color:"#6b7280" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          {ticket.type}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:"#16a34a" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          <span style={{ fontWeight:500 }}>{ticket.subtype}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <svg width="16" height="16" fill="#22c55e" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span style={{ fontSize:12, fontWeight:600, color:"#16a34a" }}>Resolved</span>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:4 }}>
                    <button onClick={() => setSelectedTicket(ticket)} style={{ flex:1, minWidth:130, padding:"11px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 8px 24px rgba(99,102,241,0.3)" }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Details
                    </button>
                    <button style={{ flex:1, minWidth:130, padding:"11px", borderRadius:18, border:"1px solid rgba(34,197,94,0.2)", background:"rgba(34,197,94,0.12)", color:"#16a34a", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Satisfied
                    </button>
                    <button onClick={() => { setFollowupTicket(ticket); setFollowupForm({ title:"", description:"" }); }} style={{ flex:1, minWidth:130, padding:"11px", borderRadius:18, border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.08)", color:"#dc2626", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Follow-up
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:660, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Ticket Details</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Complete information about your request</div>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding:"24px 28px", maxHeight:"68vh", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderRadius:18, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.12)", marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em" }}>TICKET STATUS</div>
                <span style={{ padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, color: selectedTicket.status === "PENDING" ? "#d97706" : "#16a34a", background: selectedTicket.status === "PENDING" ? "rgba(254,243,199,0.85)" : "rgba(220,252,231,0.85)", border: `1px solid ${selectedTicket.status === "PENDING" ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.25)"}` }}>
                  {selectedTicket.status}
                </span>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"ISSUE TITLE",  val: selectedTicket.subject, span: true },
                  { label:"DEPARTMENT",   val: selectedTicket.type },
                  { label:"ISSUE TYPE",   val: selectedTicket.subtype },
                  { label:"CREATED DATE", val: new Date(selectedTicket.createdAt).toLocaleDateString() },
                  { label:"TICKET ID",    val: selectedTicket.id },
                ].map((f, i) => (
                  <div key={i} style={{ padding:"13px 15px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)", marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:6 }}>DETAILED DESCRIPTION</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{selectedTicket.body}</div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setSelectedTicket(null)} style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>
                  Close
                </button>
                {selectedTicket.status === "PENDING" && (
                  <button style={{ flex:1, padding:"12px", borderRadius:18, border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.1)", color:"#dc2626", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOLLOW-UP MODAL */}
      {followupTicket && (
        <div onClick={() => setFollowupTicket(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:580, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>

            {/* Header */}
            <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#dc2626,#f97316)", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:600, color:"white" }}>Raise Follow-up Ticket</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Issue not resolved? Let us know.</div>
                </div>
              </div>
              <button onClick={() => setFollowupTicket(null)} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding:"24px 28px" }}>

              {/* Pre-filled info */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>DEPARTMENT</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{followupTicket.type}</div>
                </div>
                <div style={{ padding:"12px 14px", borderRadius:16, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#6366f1", letterSpacing:"0.05em", marginBottom:4 }}>ISSUE TYPE</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{followupTicket.subtype}</div>
                </div>
              </div>

              {/* New title */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Follow-up Title</label>
                <input
                  value={followupForm.title}
                  onChange={e => setFollowupForm({ ...followupForm, title: e.target.value })}
                  placeholder="e.g., Issue still not fixed after repair"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.15)"; }}
                  onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }}
                />
              </div>

              {/* New description */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Description</label>
                <textarea
                  value={followupForm.description}
                  onChange={e => setFollowupForm({ ...followupForm, description: e.target.value })}
                  placeholder="Describe what is still wrong or not fixed properly..."
                  rows={4}
                  style={{ ...inputStyle, resize:"none", height:"auto" }}
                  onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 5px rgba(99,102,241,0.15)"; }}
                  onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.09)"; e.target.style.boxShadow="none"; }}
                />
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setFollowupTicket(null)} style={{ flex:1, padding:"13px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)", background:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500, fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSubmitFollowup} style={{ flex:2, padding:"13px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#dc2626,#f97316)", color:"white", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 8px 24px rgba(220,38,38,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  Submit Follow-up Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;