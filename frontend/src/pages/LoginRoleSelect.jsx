import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginRoleSelect = ({ setPage }) => {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://localhost:3000/health", { method: "GET" });
        if (res.ok) setServerStatus("online");
        else setServerStatus("offline");
      } catch {
        setServerStatus("offline");
      }
    };
    checkServer();
  }, []);

  const statusConfig = {
    checking: { color:"#fbbf24", text:"Checking...",    dot:"#fbbf24" },
    online:   { color:"#16a34a", text:"System Online",  dot:"#22c55e" },
    offline:  { color:"#dc2626", text:"Server Offline", dot:"#ef4444" },
  };
  const status = statusConfig[serverStatus];

  const roles = [
    {
      id: "user-login",
      title: "Student",
      description: "Submit and track tickets",
      icon: (
        <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: "/login/user",
    },
    {
      id: "admin-login",
      title: "Admin",
      description: "Manage system & users",
      icon: (
        <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      path: "/login/admin",
    },
    {
      id: "engineer-login",
      title: "Engineer",
      description: "Review & assign tasks",
      icon: (
        <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: "/login/engineer",
    },
    {
      id: "technician-login",
      title: "Technician",
      description: "Execute & resolve tickets",
      icon: (
        <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: "/login/technician",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#eef2ff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      color: "#111827",
    }}>

      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.5, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.5, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:860 }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", marginBottom:52 }}>

          {/* Logo */}
          <div style={{
            marginBottom:20,
            padding:6,
            borderRadius:24,
            background:"rgba(255,255,255,0.7)",
            backdropFilter:"blur(20px)",
            WebkitBackdropFilter:"blur(20px)",
            boxShadow:"0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
            border:"1px solid rgba(255,255,255,0.8)",
          }}>
            <img
              src={logo}
              alt="IIT Indore Logo"
              style={{
                width: 96,
                height: 96,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Institute name */}
          <div style={{ fontSize:13, fontWeight:600, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:16 }}>
            Indian Institute of Technology Indore
          </div>

          {/* Title */}
          <div style={{ fontSize:42, fontWeight:700, lineHeight:1.15, marginBottom:12, textAlign:"center" }}>
            <span style={{ background:"linear-gradient(90deg,#111827,#4f46e5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Ticket Management
            </span>
            <br />
            <span style={{ background:"linear-gradient(90deg,#6366f1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              System
            </span>
          </div>

          <div style={{ fontSize:16, color:"#6b7280" }}>Select your role to continue</div>
        </div>

        {/* ── Role Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              style={{
                padding: "32px 28px",
                borderRadius: 28,
                border: `1.5px solid ${hoveredRole === role.id ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.7)"}`,
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                background: hoveredRole === role.id ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)",
                boxShadow: hoveredRole === role.id
                  ? "0 32px 80px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.9)"
                  : "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
                transform: hoveredRole === role.id ? "translateY(-4px)" : "translateY(0)",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
            >
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:58, height:58, borderRadius:18,
                background:"linear-gradient(135deg,#6366f1,#0ea5e9)",
                boxShadow:"0 10px 28px rgba(99,102,241,0.35)",
                marginBottom:20,
                transform: hoveredRole === role.id ? "scale(1.08) rotate(4deg)" : "scale(1)",
                transition:"transform 0.25s ease",
              }}>
                {role.icon}
              </div>
              <div style={{ fontSize:20, fontWeight:600, color:"#111827", marginBottom:6 }}>{role.title}</div>
              <div style={{ fontSize:14, color:"#6b7280", marginBottom:20 }}>{role.description}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:500, color: hoveredRole === role.id ? "#6366f1" : "#9ca3af", transition:"color 0.2s" }}>
                Continue
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ transform: hoveredRole === role.id ? "translateX(4px)" : "translateX(0)", transition:"transform 0.2s ease" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign:"center", marginTop:40 }}>
          <div style={{ fontSize:13, color:"#9ca3af", marginBottom:10 }}>
            Secure access to your ticketing portal
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <span style={{
              width:8, height:8, borderRadius:"50%",
              background: status.dot,
              display:"inline-block",
              boxShadow: serverStatus === "online" ? "0 0 6px #22c55e" : serverStatus === "offline" ? "0 0 6px #ef4444" : "none",
            }} />
            <span style={{ fontSize:12, fontWeight:500, color: status.color }}>{status.text}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginRoleSelect;