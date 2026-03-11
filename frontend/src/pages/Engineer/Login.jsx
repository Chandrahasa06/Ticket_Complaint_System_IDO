import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EngineerLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email:false, password:false, regUsername:false, regEmail:false, regPassword:false });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) { alert("All fields are required!"); return; }
      const res = await fetch("http://localhost:3000/api/engineer/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Invalid credentials"); return; }
      navigate("/engineer/dashboard");
    } catch (err) { console.error(err); alert("Server error"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!regUsername || !regEmail || !regPassword) { alert("All fields are required!"); return; }
      const res = await fetch("http://localhost:3000/api/engineer/register", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Registration failed"); return; }
      alert("Engineer account created! Please login.");
      setMode("login");
      setRegUsername(""); setRegEmail(""); setRegPassword("");
    } catch (err) { console.error(err); alert("Server error"); }
  };

  const focus = (key) => setIsFocused(prev => ({ ...prev, [key]: true }));
  const blur  = (key) => setIsFocused(prev => ({ ...prev, [key]: false }));

  const inputStyle = (focused) => ({
    width:"100%", padding:"13px 14px 13px 46px", borderRadius:18,
    border:`1.5px solid ${focused ? "#6366f1" : "rgba(0,0,0,0.08)"}`,
    background:"rgba(255,255,255,0.85)", fontSize:14,
    fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", outline:"none",
    boxShadow: focused ? "0 0 0 5px rgba(99,102,241,0.12)" : "none",
    transition:"all 0.2s", boxSizing:"border-box", display:"block",
  });

  const iconUser  = <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const iconEmail = <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
  const iconLock  = <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
  const eyePath = showPassword
    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>

      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:440 }}>

        {/* Icon + Title */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", boxShadow:"0 16px 40px rgba(99,102,241,0.4)", marginBottom:18 }}>
            <svg width="34" height="34" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:"#111827", marginBottom:6 }}>Engineer Portal</div>
          <div style={{ fontSize:14, color:"#6b7280" }}>
            {mode === "login" ? "Access your engineering dashboard" : "Register as an engineer"}
          </div>
        </div>

        {/* Card */}
        <div style={{ borderRadius:32, backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", background:"rgba(255,255,255,0.65)", boxShadow:"0 24px 64px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", padding:"36px 36px 32px" }}>

          {/* Toggle */}
          <div style={{ display:"flex", gap:6, padding:6, borderRadius:22, background:"rgba(99,102,241,0.08)", marginBottom:28 }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"10px", borderRadius:16, border:"none", background: mode === m ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent", color: mode === m ? "white" : "#6b7280", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow: mode === m ? "0 4px 14px rgba(99,102,241,0.3)" : "none", transition:"all 0.2s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Engineer ID / Email</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: isFocused.email ? "#6366f1" : "#9ca3af", pointerEvents:"none" }}>{iconUser}</div>
                  <input type="text" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => focus("email")} onBlur={() => blur("email")} placeholder="Enter your engineer ID or email" style={inputStyle(isFocused.email)} />
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: isFocused.password ? "#6366f1" : "#9ca3af", pointerEvents:"none" }}>{iconLock}</div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => focus("password")} onBlur={() => blur("password")} placeholder="Enter your password" style={{ ...inputStyle(isFocused.password), paddingRight:46 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:0, display:"flex" }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                  </button>
                </div>
              </div>
              <div style={{ textAlign:"right", marginBottom:24 }}>
                <button type="button" style={{ background:"none", border:"none", fontSize:13, color:"#6366f1", fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Forgot password?</button>
              </div>
              <button type="submit" style={{ width:"100%", padding:"14px", borderRadius:30, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 10px 32px rgba(99,102,241,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                Engineer Sign In
              </button>
            </form>
          )}

          {/* REGISTER */}
          {mode === "register" && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Username</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: isFocused.regUsername ? "#6366f1" : "#9ca3af", pointerEvents:"none" }}>{iconUser}</div>
                  <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} onFocus={() => focus("regUsername")} onBlur={() => blur("regUsername")} placeholder="Enter your username" style={inputStyle(isFocused.regUsername)} />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Email</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: isFocused.regEmail ? "#6366f1" : "#9ca3af", pointerEvents:"none" }}>{iconEmail}</div>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} onFocus={() => focus("regEmail")} onBlur={() => blur("regEmail")} placeholder="Enter your email address" style={inputStyle(isFocused.regEmail)} />
                </div>
              </div>
              <div style={{ marginBottom:28 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: isFocused.regPassword ? "#6366f1" : "#9ca3af", pointerEvents:"none" }}>{iconLock}</div>
                  <input type={showPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} onFocus={() => focus("regPassword")} onBlur={() => blur("regPassword")} placeholder="Create a password" style={{ ...inputStyle(isFocused.regPassword), paddingRight:46 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:0, display:"flex" }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={eyePath} /></svg>
                  </button>
                </div>
              </div>
              <button type="submit" style={{ width:"100%", padding:"14px", borderRadius:30, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 10px 32px rgba(99,102,241,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Create Engineer Account
              </button>
            </form>
          )}

          {/* Info badge */}
          <div style={{ marginTop:20, padding:"14px 16px", borderRadius:18, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", display:"flex", alignItems:"flex-start", gap:10 }}>
            <svg width="18" height="18" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#4f46e5" }}>Engineering Access</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>Manage tickets and assign technicians</div>
            </div>
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:20 }}>Need help? Contact your system administrator</p>
      </div>
    </div>
  );
};

export default EngineerLogin;