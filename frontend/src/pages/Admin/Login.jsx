import React, { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { subscribeToPush } from '../../utils/pushNotifications';
 
const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [regUsernameFocused, setRegUsernameFocused] = useState(false);
  const [regEmailFocused, setRegEmailFocused] = useState(false);
  const [regPassFocused, setRegPassFocused] = useState(false);
   const googleWrapperRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/google-login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      subscribeToPush();
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  const triggerGoogleLogin = () => {
    const btn = googleWrapperRef.current?.querySelector("div[role='button']");
    if (btn) btn.click();
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) { alert("All fields are required!"); return; }
      const res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {        if (data.useGoogle) {
          triggerGoogleLogin();
          return;
        } alert(data.message || "Invalid credentials"); return; }
         localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      subscribeToPush();
      navigate("/admin/dashboard");
    } catch (err) { console.error(err); alert("Server error"); }
  };
 
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!regUsername || !regEmail || !regPassword) { alert("All fields are required!"); return; }
      const res = await fetch("http://localhost:3000/api/admin/register", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Registration failed"); return; }
      alert("Admin registered successfully! Please login.");
      setMode("login");
      setRegUsername(""); setRegEmail(""); setRegPassword("");
    } catch (err) { console.error(err); alert("Server error"); }
  };
 
  const inputStyle = (focused) => ({
    width: "100%", padding: "14px 14px 14px 44px", borderRadius: 18,
    border: `1.5px solid ${focused ? "#6366f1" : "rgba(0,0,0,0.09)"}`,
    background: "rgba(255,255,255,0.9)", fontSize: 14, fontFamily: "inherit",
    color: "#111827", outline: "none",
    boxShadow: focused ? "0 0 0 5px rgba(99,102,241,0.15)" : "none",
    boxSizing: "border-box", display: "block", transition: "all 0.2s",
  });
 
  const iconUser = <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const iconEmail = <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
  const iconLock = <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
 
  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827" }}>
      <div style={{ position:"fixed", width:520, height:520, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.5, top:-120, left:-120, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:420, height:420, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.5, bottom:-130, right:-100, pointerEvents:"none", zIndex:0 }} />
 
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:460, padding:"48px 48px", borderRadius:35, backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", background:"rgba(255,255,255,0.6)", boxShadow:"0 40px 120px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:62, height:62, borderRadius:20, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", boxShadow:"0 16px 40px rgba(99,102,241,0.4)", marginBottom:16 }}>
            <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div style={{ fontSize:24, fontWeight:600, background:"linear-gradient(90deg,#111827,#4f46e5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Admin Portal</div>
          <div style={{ fontSize:14, color:"#6b7280", marginTop:6 }}>{mode === "login" ? "Secure administrative access" : "Create a new admin account"}</div>
        </div>
 
        <div style={{ display:"flex", gap:6, padding:6, borderRadius:22, background:"rgba(99,102,241,0.08)", marginBottom:28 }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"10px", borderRadius:16, border:"none", background: mode === m ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent", color: mode === m ? "white" : "#6b7280", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer", boxShadow: mode === m ? "0 4px 14px rgba(99,102,241,0.3)" : "none", transition:"all 0.2s" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
 
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Admin Email</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconUser}</span>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} placeholder="Enter admin email" style={inputStyle(emailFocused)} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Password</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconLock}</span>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} placeholder="Enter your password" style={{ ...inputStyle(passFocused), paddingRight:44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                </button>
              </div>
            </div>
            <div style={{ textAlign:"right", marginBottom:22 }}>
              <button type="button" style={{ background:"none", border:"none", fontSize:13, color:"#6366f1", cursor:"pointer", fontFamily:"inherit" }}>Forgot password?</button>
            </div>
            <button type="submit" style={{ width:"100%", padding:"15px", borderRadius:30, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:15, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 16px 48px rgba(99,102,241,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Admin Sign In
              <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "18px 0",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
                <span style={{ fontSize: 12, color: "#6b7280" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
              </div>

              <div ref={googleWrapperRef}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    alert("Google Sign In Failed");
                  }}
                  hosted_domain="iiti.ac.in"
                  width="100%"
                  text="signin_with"
                  shape="pill"
                />
              </div>
            </div>
          </form>
        )}
 
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Username</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconUser}</span>
                <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} onFocus={() => setRegUsernameFocused(true)} onBlur={() => setRegUsernameFocused(false)} placeholder="Enter username" style={inputStyle(regUsernameFocused)} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Email</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconEmail}</span>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} onFocus={() => setRegEmailFocused(true)} onBlur={() => setRegEmailFocused(false)} placeholder="Enter email address" style={inputStyle(regEmailFocused)} />
              </div>
            </div>
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>Password</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconLock}</span>
                <input type={showPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} onFocus={() => setRegPassFocused(true)} onBlur={() => setRegPassFocused(false)} placeholder="Create a password" style={{ ...inputStyle(regPassFocused), paddingRight:44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                </button>
              </div>
            </div>
            <button type="submit" style={{ width:"100%", padding:"15px", borderRadius:30, border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:15, fontWeight:500, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 16px 48px rgba(99,102,241,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Create Admin Account
              <svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </form>
        )}
      </div>
 
     
    </div>
  );
};
 
export default AdminLogin;