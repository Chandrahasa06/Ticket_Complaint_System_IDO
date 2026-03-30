import React, { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
 
const EngineerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email:false, password:false });
   const googleWrapperRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:3000/api/engineer/google-login", {
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

      navigate("/engineer/dashboard");
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
      const res = await fetch("http://localhost:3000/api/engineer/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {         if (data.useGoogle) {
          triggerGoogleLogin();
          return;
        }alert(data.message || "Invalid credentials"); return; }
         localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      navigate("/engineer/dashboard");
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
 
  const iconUser = <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const iconLock = <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
  const eyePath = showPassword
    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z";
 
  return (
    <div style={{ minHeight:"100vh", background:"#eef2ff", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", width:560, height:560, borderRadius:"50%", background:"#6366f1", filter:"blur(130px)", opacity:0.45, top:-130, left:-130, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:460, height:460, borderRadius:"50%", background:"#0ea5e9", filter:"blur(130px)", opacity:0.45, bottom:-140, right:-110, pointerEvents:"none", zIndex:0 }} />
 
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#6366f1,#0ea5e9)", boxShadow:"0 16px 40px rgba(99,102,241,0.4)", marginBottom:18 }}>
            <svg width="34" height="34" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:"#111827", marginBottom:6 }}>Engineer Portal</div>
          <div style={{ fontSize:14, color:"#6b7280" }}>Access your engineering dashboard</div>
        </div>
 
        <div style={{ borderRadius:32, backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", background:"rgba(255,255,255,0.65)", boxShadow:"0 24px 64px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", padding:"36px 36px 32px" }}>
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
        </div>
        
      </div>
    </div>
  );
};
 
export default EngineerLogin;