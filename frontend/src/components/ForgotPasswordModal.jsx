import React, { useState, useRef } from "react";

const STEP = { EMAIL: 1, OTP: 2, PASSWORD: 3, SUCCESS: 4 };

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep]         = useState(STEP.EMAIL);
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState({});
  const inputsRef = useRef([]);

  if (!isOpen) return null;

  const reset = () => {
    setStep(STEP.EMAIL);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
    setFocused({});
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Step 1: send OTP ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (loading) return;
    if (!email) { alert("Please enter your email"); return; }
    if (!email.endsWith("@iiti.ac.in")) {
      alert("Only @iiti.ac.in email addresses are allowed!");
      return;
    }
    try {
      setLoading(true);
      const res  = await fetch("http://localhost:3000/api/user/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setStep(STEP.OTP);
    } catch (e) {
      console.error(e); alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    if (loading) return;
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) { alert("Enter complete OTP"); return; }
    try {
      setLoading(true);
      const res  = await fetch("http://localhost:3000/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Invalid OTP"); return; }
      setStep(STEP.PASSWORD);
    } catch (e) {
      console.error(e); alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: reset password ────────────────────────────────────
  const handleResetPassword = async () => {
  if (loading) return;
  if (!newPassword || !confirmPassword) { alert("All fields are required"); return; }
  if (newPassword.length < 6) { alert("Password must be at least 6 characters"); return; }
  if (newPassword !== confirmPassword) { alert("Passwords do not match"); return; }
  try {
    setLoading(true);
    const res = await fetch("http://localhost:3000/api/user/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),  // ← removed otp
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    setStep(STEP.SUCCESS);
  } catch (e) {
    console.error(e); alert("Server error");
  } finally {
    setLoading(false);
  }
};

  // ── shared styles ─────────────────────────────────────────────
  const inputStyle = (key) => ({
    width: "100%", padding: "13px 14px 13px 44px",
    borderRadius: 18,
    border: `1.5px solid ${focused[key] ? "#6366f1" : "rgba(0,0,0,0.09)"}`,
    background: "rgba(255,255,255,0.9)", fontSize: 14,
    fontFamily: "inherit", color: "#111827", outline: "none",
    boxShadow: focused[key] ? "0 0 0 5px rgba(99,102,241,0.15)" : "none",
    boxSizing: "border-box", transition: "all 0.2s",
  });

  const iconEmail = (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  );

  const EyeIcon = ({ show }) => (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d={show
          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
      />
    </svg>
  );

  const LockIcon = () => (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  // ── step meta ─────────────────────────────────────────────────
  const stepMeta = {
    [STEP.EMAIL]:    { title: "Forgot Password",    subtitle: "Enter your registered institute email" },
    [STEP.OTP]:      { title: "Verify OTP",         subtitle: `OTP sent to ${email}` },
    [STEP.PASSWORD]: { title: "Set New Password",   subtitle: "Choose a strong new password" },
    [STEP.SUCCESS]:  { title: "Password Reset!",    subtitle: "You can now sign in with your new password" },
  };

  return (
    <div
      onClick={handleClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center",
        justifyContent:"center", zIndex:300, padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:440, borderRadius:32, overflow:"hidden",
          boxShadow:"0 40px 120px rgba(0,0,0,0.18)", background:"rgba(255,255,255,0.97)",
          backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}
      >
        {/* ── Header ── */}
        <div style={{ padding:"24px 28px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {step === STEP.SUCCESS ? (
                <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize:19, fontWeight:600, color:"white" }}>{stepMeta[step].title}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:2 }}>{stepMeta[step].subtitle}</div>
            </div>
          </div>

          {/* Step indicator dots */}
          {step !== STEP.SUCCESS && (
            <div style={{ display:"flex", gap:6, marginTop:16 }}>
              {[STEP.EMAIL, STEP.OTP, STEP.PASSWORD].map(s => (
                <div key={s} style={{ height:4, flex:1, borderRadius:4,
                  background: step >= s ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                  transition:"background 0.3s" }} />
              ))}
            </div>
          )}

          <button onClick={handleClose}
            style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%",
              border:"none", background:"rgba(255,255,255,0.2)", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"28px 28px 24px" }}>

          {/* STEP 1 — Email */}
          {step === STEP.EMAIL && (
            <>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>
                  Institute Email
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                    color:"#6366f1", display:"flex", pointerEvents:"none" }}>{iconEmail}</span>
                  <input
                    type="text" value={email} placeholder="yourname@iiti.ac.in"
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(p => ({ ...p, email: true }))}
                    onBlur={() => setFocused(p => ({ ...p, email: false }))}
                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                    style={inputStyle("email")}
                  />
                </div>
              </div>
              <button onClick={handleSendOtp} disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:30, border:"none",
                  background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white",
                  fontSize:14, fontWeight:500, fontFamily:"inherit", cursor: loading ? "wait" : "pointer",
                  boxShadow:"0 12px 36px rgba(99,102,241,0.35)", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:8, opacity: loading ? 0.8 : 1 }}>
                {loading ? "Sending OTP..." : (
                  <>Send OTP
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 2 — OTP */}
          {step === STEP.OTP && (
            <>
              <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:24 }}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => (inputsRef.current[i] = el)}
                    type="text" value={digit} maxLength={1}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    style={{ width:46, height:52, textAlign:"center", fontSize:22, fontWeight:600,
                      borderRadius:14, border:`1.5px solid ${digit ? "#6366f1" : "rgba(0,0,0,0.12)"}`,
                      background: digit ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.9)",
                      color:"#111827", outline:"none", fontFamily:"inherit",
                      boxShadow: digit ? "0 0 0 4px rgba(99,102,241,0.12)" : "none",
                      transition:"all 0.15s" }}
                  />
                ))}
              </div>
              <button onClick={handleVerifyOtp} disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:30, border:"none",
                  background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white",
                  fontSize:14, fontWeight:500, fontFamily:"inherit", cursor: loading ? "wait" : "pointer",
                  boxShadow:"0 12px 36px rgba(99,102,241,0.35)", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:8, opacity: loading ? 0.8 : 1,
                  marginBottom:12 }}>
                {loading ? "Verifying..." : (
                  <>Verify OTP
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              <button onClick={() => setStep(STEP.EMAIL)}
                style={{ width:"100%", padding:"11px", borderRadius:18, border:"1px solid rgba(0,0,0,0.08)",
                  background:"transparent", fontSize:13, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
                ← Back
              </button>
            </>
          )}

          {/* STEP 3 — New Password */}
          {step === STEP.PASSWORD && (
            <>
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>
                  New Password
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                    color:"#6366f1", display:"flex", pointerEvents:"none" }}><LockIcon /></span>
                  <input
                    type={showPassword ? "text" : "password"} value={newPassword}
                    placeholder="Enter new password"
                    onChange={e => setNewPassword(e.target.value)}
                    onFocus={() => setFocused(p => ({ ...p, np: true }))}
                    onBlur={() => setFocused(p => ({ ...p, np: false }))}
                    style={{ ...inputStyle("np"), paddingRight:44 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:8, color:"#374151" }}>
                  Confirm Password
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                    color:"#6366f1", display:"flex", pointerEvents:"none" }}><LockIcon /></span>
                  <input
                    type={showConfirm ? "text" : "password"} value={confirmPassword}
                    placeholder="Re-enter new password"
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused(p => ({ ...p, cp: true }))}
                    onBlur={() => setFocused(p => ({ ...p, cp: false }))}
                    onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                    style={{ ...inputStyle("cp"), paddingRight:44 }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer", color:"#6366f1", display:"flex", padding:4 }}>
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {/* live match hint */}
                {confirmPassword && (
                  <div style={{ marginTop:7, fontSize:12, display:"flex", alignItems:"center", gap:5,
                    color: newPassword === confirmPassword ? "#16a34a" : "#dc2626" }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={newPassword === confirmPassword ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </div>
                )}
              </div>
              <button onClick={handleResetPassword} disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:30, border:"none",
                  background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white",
                  fontSize:14, fontWeight:500, fontFamily:"inherit", cursor: loading ? "wait" : "pointer",
                  boxShadow:"0 12px 36px rgba(99,102,241,0.35)", display:"flex",
                  alignItems:"center", justifyContent:"center", gap:8, opacity: loading ? 0.8 : 1 }}>
                {loading ? "Resetting..." : (
                  <>Reset Password
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 4 — Success */}
          {step === STEP.SUCCESS && (
            <div style={{ textAlign:"center", padding:"8px 0 4px" }}>
              <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(34,197,94,0.12)",
                border:"2px solid rgba(34,197,94,0.3)", display:"flex", alignItems:"center",
                justifyContent:"center", margin:"0 auto 18px" }}>
                <svg width="32" height="32" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div style={{ fontSize:16, fontWeight:600, color:"#111827", marginBottom:8 }}>
                Password updated successfully!
              </div>
              <div style={{ fontSize:13, color:"#6b7280", marginBottom:24 }}>
                You can now sign in with your new password.
              </div>
              <button onClick={handleClose}
                style={{ width:"100%", padding:"14px", borderRadius:30, border:"none",
                  background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white",
                  fontSize:14, fontWeight:500, fontFamily:"inherit", cursor:"pointer",
                  boxShadow:"0 12px 36px rgba(99,102,241,0.35)" }}>
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;