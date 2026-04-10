import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, X, MapPin, Calendar, Wrench, AlertTriangle, KeyRound, EyeOff, Eye as EyeIcon, Send, Pencil, Trash2 } from "lucide-react";
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
  const s = (status || "").toLowerCase().replace("_", "-");
  const map = {
    pending: { color: "#d97706", bg: "rgba(254,243,199,0.85)", border: "rgba(245,158,11,0.25)" },
    resolved: { color: "#059669", bg: "rgba(236,253,245,0.88)", border: "rgba(16,185,129,0.22)" },
    closed: { color: "#6b7280", bg: "rgba(243,244,246,0.85)", border: "rgba(156,163,175,0.25)" },
    overdue: { color: "#b91c1c", bg: "rgba(254,242,242,0.88)", border: "rgba(185,28,28,0.25)" },
  };
  return map[s] || { color: "#6b7280", bg: "rgba(243,244,246,0.85)", border: "rgba(156,163,175,0.25)" };
};

const TAB_STATUSES = {
  all: null,
  pending: ["PENDING"],
  overdue: ["OVERDUE"],
  resolved: ["RESOLVED"],
  closed: ["CLOSED"],
};

const ROLE_STYLE = {
  admin: {
    label: "ADMIN",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.07)",
    border: "rgba(99,102,241,0.15)",
    tagBg: "rgba(99,102,241,0.12)",
  },
  technician: {
    label: "TECHNICIAN",
    color: "#0d9488",
    bg: "rgba(13,148,136,0.07)",
    border: "rgba(13,148,136,0.18)",
    tagBg: "rgba(13,148,136,0.12)",
  },
  engineer: {
    label: "ENGINEER",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.06)",
    border: "rgba(14,165,233,0.15)",
    tagBg: "rgba(14,165,233,0.1)",
  },
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
      const res = await fetch(`${BASE}/tickets/${ticketId}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setComments(data.ticket?.comments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchComments(); }, [ticketId]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok) { setComments(prev => [...prev, data.comment]); setBody(""); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (commentId) => {
    if (!editBody.trim()) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === commentId ? data.comment : c));
        setEditingId(null); setEditBody("");
      }
    } catch (e) { console.error(e); }
    finally { setEditSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) { console.error(e); }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
      + " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Comments</span>
        <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 13 }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "18px 0", color: "#9ca3af", fontSize: 13 }}>No comments yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {comments.map(c => {
            const rs = ROLE_STYLE[c.authorRole] ?? ROLE_STYLE.engineer;
            const isOwn =
              c.authorRole === role ||
              (role === "technician" && c.authorRole === "engineer");

            return (
              <div
                key={c.id}
                style={{
                  padding: "13px 15px",
                  borderRadius: 18,
                  background: rs.bg,
                  border: `1px solid ${rs.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: rs.color,
                      background: rs.tagBg,
                      padding: "2px 9px",
                      borderRadius: 20,
                      letterSpacing: "0.04em",
                    }}>
                      {rs.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.authorName}</span>
                    {c.authorDepartment && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>· {c.authorDepartment}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(c.createdAt)}</span>
                    {isOwn && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => { setEditingId(c.id); setEditBody(c.body); }}
                          style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: `rgba(13,148,136,0.1)`, color: "#0d9488", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === c.id ? (
                  <div>
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      rows={2}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid rgba(13,148,136,0.3)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                      <button
                        onClick={() => { setEditingId(null); setEditBody(""); }}
                        style={{ padding: "7px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEdit(c.id)}
                        disabled={editSubmitting || !editBody.trim()}
                        style={{ padding: "7px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9488,#0ea5e9)", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", opacity: editSubmitting || !editBody.trim() ? 0.6 : 1 }}
                      >
                        {editSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{c.body}</div>
                )}

                {c.updatedAt !== c.createdAt && editingId !== c.id && (
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>edited {formatDate(c.updatedAt)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write a comment..."
          rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          style={{ flex: 1, padding: "11px 14px", borderRadius: 16, border: "1.5px solid rgba(13,148,136,0.22)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", resize: "none", boxSizing: "border-box" }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          style={{ padding: "11px 18px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#0d9488,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 6px 18px rgba(13,148,136,0.3)", opacity: submitting || !body.trim() ? 0.6 : 1, flexShrink: 0 }}
        >
          <Send size={14} />{submitting ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [prevTicket, setPrevTicket] = useState(null);
  const [prevTicketLoading, setPrevTicketLoading] = useState(false);
  const [confirmCloseTicket, setConfirmCloseTicket] = useState(null);
  const [techInfo, setTechInfo] = useState({ username: "", department: "", area: "" });
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [closing, setClosing] = useState(false);

  const [closeRemark, setCloseRemark] = useState("");
  const [confirmResolveTicket, setConfirmResolveTicket] = useState(null);
  const [resolveRemark, setResolveRemark] = useState("");
  const [resolving, setResolving] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/technician/tickets", { credentials: "include" });
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

  const fetchTicketById = async (id) => {
    setPrevTicketLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setPrevTicket(data.ticket);
    } catch (e) {
      console.error(e);
      alert("Server error");
    } finally {
      setPrevTicketLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setPrevTicket(null);
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/technician/dashboard", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setTechInfo({
          username: data.user?.username || "Technician",
          department: data.user?.department || "",
          area: data.user?.area || "",
        });
      } catch (e) { console.error(e); }
    };
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/technician/profile", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setProfile(data.technician);
      } catch (e) { console.error(e); }
    };
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/technician/notifications", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter(n => !n.isRead).length);
        }
      } catch (e) { console.error(e); }
    };

    fetchInfo();
    fetchProfile();
    fetchNotifications();
    fetchTickets();
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    try {
      await fetch("http://localhost:3000/api/technician/notifications/read", {
        method: "PATCH", credentials: "include",
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (id) => {
    if (resolving) return;
    try {
      setResolving(true);
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}/resolve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: resolveRemark }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "RESOLVED" } : t));
      setConfirmResolveTicket(null);
      setResolveRemark("");
    } catch (e) {
      console.error(e); alert("Server error");
    } finally {
      setResolving(false);
    }
  };

  const handleClose = async (id) => {
    if (closing) return;
    try {
      setClosing(true);
      const res = await fetch(`http://localhost:3000/api/technician/tickets/${id}/close`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: closeRemark }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "CLOSED" } : t));
      setConfirmCloseTicket(null);
      setCloseRemark("");
    } catch (e) {
      console.error(e); alert("Server error");
    } finally {
      setClosing(false);
    }
  };

  const handleLogout = async () => {
    await unsubscribeFromPush();
    await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/LoginRoleSelect");
  };

  const resetPwForm = () => {
    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwShow({ current: false, newPw: false, confirm: false });
    setPwError("");
    setPwSuccess(false);
    setShowChangePw(false);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwError("All fields are required."); return; }
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.current === pwForm.newPw) { setPwError("New password must differ from current password."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/technician/change-password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.message || "Failed to change password."); return; }
      setPwSuccess(true);
      setTimeout(() => resetPwForm(), 2200);
    } catch (e) {
      console.error(e);
      setPwError("Server error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const closedCount = tickets.filter(t => t.status === "CLOSED").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;
  const overdueCount = tickets.filter(t => t.status === "OVERDUE").length;
  const pendingCount = tickets.filter(t => t.status === "PENDING").length;

  const stats = [
    { label: "Total Assigned", value: tickets.length },
    { label: "Pending", value: pendingCount },
    { label: "Resolved", value: resolvedCount },
    { label: "Closed", value: closedCount },
  ];

  const tabs = [
    { id: "all", label: "All", count: tickets.length },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "overdue", label: "Overdue", count: overdueCount },
    { id: "resolved", label: "Resolved", count: resolvedCount },
    { id: "closed", label: "Closed", count: closedCount },
  ];

  const filteredTickets = activeTab === "all"
    ? tickets
    : tickets.filter(t => {
      const allowed = TAB_STATUSES[activeTab];
      return allowed && allowed.includes(t.status);
    });

  const pwInputStyle = {
    width: "100%", padding: "11px 11px 11px 40px", borderRadius: 13,
    border: "1.5px solid rgba(99,102,241,0.2)",
    background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit",
    color: "#111827", outline: "none", boxSizing: "border-box", paddingRight: 40,
  };

  const pwScore = (() => {
    const v = pwForm.newPw;
    return [v.length >= 6, v.length >= 10, /[A-Z]/.test(v) || /[0-9]/.test(v), /[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
  })();
  const pwStrengthColors = ["#334155", "#475569", "#eab308", "#10b981"];
  const pwStrengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const displayedTicket = prevTicket ?? selectedTicket;

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#111827", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", width: 560, height: 560, borderRadius: "50%", background: "#6366f1", filter: "blur(130px)", opacity: 0.45, top: -130, left: -130, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 460, height: 460, borderRadius: "50%", background: "#0ea5e9", filter: "blur(130px)", opacity: 0.45, bottom: -140, right: -110, pointerEvents: "none", zIndex: 0 }} />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)", background: "rgba(255,255,255,0.55)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              onClick={() => { setShowProfile(true); resetPwForm(); }}
              style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.35)", flexShrink: 0, cursor: "pointer", overflow: "hidden", position: "relative" }}
            >
              <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 34, height: 22, borderRadius: "50% 50% 0 0", background: "rgba(255,255,255,0.9)" }} />
              <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>{techInfo.username}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                {techInfo.department} · {techInfo.area}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notification Bell */}
            <button
              onClick={handleOpenNotifications}
              style={{
                position: "relative", width: 42, height: 42, borderRadius: "50%",
                border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.8)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1"
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%",
                  background: "#ef4444", color: "white", fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px", borderRadius: 18, border: "1.5px solid rgba(239,68,68,0.2)",
                background: "rgba(254,242,242,0.8)", fontSize: 13, fontWeight: 500,
                color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATIONS MODAL */}
      {showNotifications && (
        <div onClick={() => setShowNotifications(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
            <div style={{ padding: "22px 28px", background: "linear-gradient(135deg,#ef4444,#dc2626)", position: "relative" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "white" }}>Notifications</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>Overdue ticket alerts from your engineer</div>
              <button onClick={() => setShowNotifications(false)} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: "20px 24px", maxHeight: "60vh", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 14 }}>No notifications yet</div>
              ) : notifications.map((n) => (
                <div key={n.id} style={{ padding: "14px 16px", borderRadius: 16, background: n.isRead ? "rgba(0,0,0,0.02)" : "rgba(239,68,68,0.06)", border: n.isRead ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(239,68,68,0.18)", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: n.isRead ? "rgba(0,0,0,0.05)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: n.isRead ? "#9ca3af" : "#dc2626" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: "#111827", lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                  {!n.isRead && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 32px", position: "relative", zIndex: 1 }}>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 30 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ ...glassCard, padding: "24px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 6 }}>{s.label}</div>
              <div style={{
                fontSize: 36, fontWeight: 700,
                background: s.label === "Pending"
                  ? "linear-gradient(135deg,#ef4444,#f97316)"
                  : "linear-gradient(135deg,#6366f1,#0ea5e9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TAB NAV */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24, padding: 6, borderRadius: 22, backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", background: "rgba(255,255,255,0.55)", boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)", width: "fit-content" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const isOverdueTab = tab.id === "overdue";
            const activeBg = isOverdueTab ? "linear-gradient(135deg,#b91c1c,#ef4444)" : "linear-gradient(135deg,#6366f1,#0ea5e9)";
            const activeShadow = isOverdueTab ? "0 8px 24px rgba(185,28,28,0.28)" : "0 8px 24px rgba(99,102,241,0.3)";
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "9px 16px", borderRadius: 15, border: "none", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, background: isActive ? activeBg : "transparent", color: isActive ? "white" : "#6b7280", boxShadow: isActive ? activeShadow : "none", transition: "all 0.15s" }}>
                {tab.label}
                <span style={{ minWidth: 18, height: 18, borderRadius: 9, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", background: isActive ? "rgba(255,255,255,0.25)" : (isOverdueTab && tab.count > 0 ? "rgba(185,28,28,0.1)" : "rgba(99,102,241,0.1)"), color: isActive ? "white" : (isOverdueTab && tab.count > 0 ? "#b91c1c" : "#6366f1") }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SECTION HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{tabs.find(t => t.id === activeTab)?.label} Tickets</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {activeTab === "all" ? "All tickets assigned to your area and department" : `Showing ${activeTab} tickets`}
            </div>
          </div>
          <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            {filteredTickets.length} {filteredTickets.length === 1 ? "Ticket" : "Tickets"}
          </span>
        </div>

        {/* TICKET LIST */}
        {loading && (
          <div style={{ ...glassCard, padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 16, color: "#6b7280" }}>Loading tickets...</div>
          </div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div style={{ ...glassCard, padding: "72px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Wrench size={28} color="#9ca3af" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              No {activeTab === "all" ? "" : tabs.find(t => t.id === activeTab)?.label + " "}Tickets
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>
              {activeTab === "all" ? "No tickets match your area and department yet." : `You have no ${activeTab} tickets at the moment.`}
            </div>
          </div>
        )}

        {!loading && filteredTickets.map((t) => {
          const statusKey = (t.status || "").toLowerCase().replace("_", "-");
          const ss = getStatusStyle(statusKey);
          const isResolved = t.status === "RESOLVED";
          const isClosed = t.status === "CLOSED";
          const isDone = isResolved || isClosed;

          return (
            <div key={t.id} style={{ ...glassCard, marginBottom: 16 }}>
              <div style={{ padding: "24px 26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em" }}>#{t.id}</span>
                      {t.prevId && (
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.18)" }}>
                          Follow-up
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{t.subject}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>{t.body}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 1 }}>Area</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{t.area}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 1 }}>Location</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{t.location || "—"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Calendar size={14} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 1 }}>Raised On</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 14, fontSize: 12, fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, whiteSpace: "nowrap" }}>
                    {t.status}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, padding: "14px 26px", borderTop: "1px solid rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
                <button
                  onClick={() => { setPrevTicket(null); setSelectedTicket(t); }}
                  style={{ padding: "10px 18px", borderRadius: 18, border: "none", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
                >
                  <Eye size={15} /> View Details
                </button>

                <button
                  onClick={() => !isDone && setConfirmResolveTicket(t)}
                  disabled={isDone}
                  style={{ padding: "10px 18px", borderRadius: 18, border: "1px solid rgba(16,185,129,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(16,185,129,0.08)", color: isDone ? "#9ca3af" : "#059669", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: isDone ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
                >
                  <CheckCircle size={15} />
                  {isResolved ? "Resolved ✓" : "Mark as Resolved"}
                </button>

                <button
                  onClick={() => !isDone && setConfirmCloseTicket(t)}
                  disabled={isDone}
                  style={{ padding: "10px 18px", borderRadius: 18, border: isDone ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(239,68,68,0.2)", background: isDone ? "rgba(0,0,0,0.04)" : "rgba(254,242,242,0.8)", color: isDone ? "#9ca3af" : "#dc2626", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: isDone ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
                >
                  <X size={15} />
                  {isClosed ? "Closed ✓" : "Close Ticket"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── VIEW DETAILS MODAL with Comments ── */}
      {selectedTicket && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 620, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
            <div style={{ padding: "24px 28px", background: prevTicket ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wrench size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "white" }}>{prevTicket ? "Previous Ticket Details" : "Ticket Details"}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                    {prevTicket ? `Referenced by Ticket #${selectedTicket.id}` : "Complete ticket information"}
                  </div>
                </div>
              </div>
              <button onClick={closeModal} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "24px 28px", maxHeight: "76vh", overflowY: "auto" }}>
              {prevTicket && (
                <button onClick={() => setPrevTicket(null)} style={{ marginBottom: 18, background: "none", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back to Ticket #{selectedTicket.id}
                </button>
              )}

              {!prevTicket && selectedTicket.prevId && (
                <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 16, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="15" height="15" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span style={{ fontSize: 13, color: "#374151" }}>
                      This is a follow-up to <span style={{ fontWeight: 600, color: "#7c3aed" }}>Ticket #{selectedTicket.prevId}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => fetchTicketById(selectedTicket.prevId)}
                    disabled={prevTicketLoading}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", fontSize: 12, fontWeight: 600, cursor: prevTicketLoading ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, opacity: prevTicketLoading ? 0.7 : 1 }}
                  >
                    {prevTicketLoading ? "Loading..." : (<><Eye size={12} /> View Previous Ticket</>)}
                  </button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {[
                  { label: "TICKET ID", val: displayedTicket.id, span: false },
                  { label: "STATUS", val: displayedTicket.status, span: false },
                  { label: "SUBJECT", val: displayedTicket.subject, span: true },
                  { label: "DEPARTMENT", val: displayedTicket.type, span: false },
                  { label: "AREA", val: displayedTicket.area, span: false },
                  { label: "LOCATION", val: displayedTicket.location || "—", span: false },
                  { label: "RAISED BY", val: displayedTicket.user?.username || "—", span: false },
                  { label: "DATE", val: new Date(displayedTicket.createdAt).toLocaleDateString(), span: false },
                ].map((f, i) => (
                  <div key={i} style={{ padding: "13px 15px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 5 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>

              {/* ── DESCRIPTION: split view for follow-up tickets ── */}
              {!prevTicket && selectedTicket.prevId && selectedTicket.prev?.body ? (
                <div style={{ marginBottom: 16 }}>
                  {/* Previous ticket description — greyed out */}
                  <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(0,0,0,0.025)", border: "1px dashed rgba(156,163,175,0.55)", marginBottom: 8, opacity: 0.75 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", flexShrink: 0 }} />
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}>
                        PREVIOUS TICKET #{selectedTicket.prevId} — DESCRIPTION
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, fontStyle: "italic" }}>
                      {selectedTicket.prev.body}
                    </div>
                  </div>

                  {/* Current ticket description — bold and prominent */}
                  <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(99,102,241,0.08)", border: "2px solid rgba(99,102,241,0.28)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em" }}>
                        CURRENT TICKET — DESCRIPTION
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.65 }}>
                      {selectedTicket.body}
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal single description (non-follow-up or prevTicket view) */
                <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 6 }}>DESCRIPTION</div>
                  <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{displayedTicket.body}</div>
                </div>
              )}

              {displayedTicket.imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 8 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${displayedTicket.imageUrl}`} alt="ticket" style={{ width: "100%", borderRadius: 16, maxHeight: 240, objectFit: "cover" }} />
                </div>
              )}

              {/* Comments — only shown for the current ticket, not the previous one */}
              {!prevTicket && (
                <CommentSection ticketId={selectedTicket.id} role="technician" />
              )}

              <button onClick={closeModal} style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && profile && (
        <div onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "white" }}>My Profile</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>Your account details</div>
              <button onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "24px 28px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, fontWeight: 700, margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>
                  {(profile.username || "T").charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{profile.username}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{profile.department} · {profile.area}</div>
              </div>

              {[
                { label: "EMAIL", val: profile.email },
                { label: "DEPARTMENT", val: profile.department },
                { label: "AREA", val: profile.area },
              ].map((f, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.val}</div>
                </div>
              ))}

              <div style={{ marginTop: 16, borderRadius: 18, border: "1.5px solid rgba(99,102,241,0.18)", overflow: "hidden" }}>
                <button onClick={() => { setShowChangePw(v => !v); setPwError(""); setPwSuccess(false); }} style={{ width: "100%", padding: "14px 16px", background: showChangePw ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.04)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <KeyRound size={14} color="white" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Change Password</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ transition: "transform 0.25s", transform: showChangePw ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showChangePw && (
                  <div style={{ padding: "18px 16px", borderTop: "1px solid rgba(99,102,241,0.12)", background: "rgba(255,255,255,0.55)" }}>
                    {pwSuccess ? (
                      <div style={{ textAlign: "center", padding: "14px 0" }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                          <CheckCircle size={26} color="#059669" />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Password Updated!</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Your password has been changed successfully.</div>
                      </div>
                    ) : (
                      <>
                        {pwError && (
                          <div style={{ marginBottom: 14, padding: "10px 13px", borderRadius: 12, background: "rgba(100,116,139,0.07)", border: "1px solid rgba(100,116,139,0.18)", display: "flex", alignItems: "center", gap: 9 }}>
                            <AlertTriangle size={14} color="#334155" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#334155" }}>{pwError}</span>
                          </div>
                        )}
                        {[
                          { key: "current", label: "Current Password", placeholder: "Enter current password" },
                          { key: "newPw", label: "New Password", placeholder: "At least 6 characters" },
                          { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key} style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1", display: "flex", pointerEvents: "none" }}>
                                <KeyRound size={13} />
                              </span>
                              <input
                                type={pwShow[key] ? "text" : "password"}
                                value={pwForm[key]}
                                onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={placeholder}
                                style={pwInputStyle}
                                disabled={pwLoading}
                                onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                              />
                              <button type="button" onClick={() => setPwShow(prev => ({ ...prev, [key]: !prev[key] }))} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6366f1", display: "flex", padding: 4 }}>
                                {pwShow[key] ? <EyeOff size={13} /> : <EyeIcon size={13} />}
                              </button>
                            </div>
                            {key === "newPw" && pwForm.newPw && (
                              <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 5 }}>
                                {[1, 2, 3, 4].map(i => (
                                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= pwScore ? pwStrengthColors[pwScore - 1] : "rgba(0,0,0,0.08)", transition: "background 0.3s" }} />
                                ))}
                                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4, minWidth: 30 }}>{pwStrengthLabels[pwScore]}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                          <button onClick={resetPwForm} disabled={pwLoading} style={{ flex: 1, padding: "10px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: pwLoading ? "not-allowed" : "pointer" }}>Cancel</button>
                          <button onClick={handleChangePassword} disabled={pwLoading} style={{ flex: 1, padding: "10px", borderRadius: 14, border: "none", background: pwLoading ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: pwLoading ? "not-allowed" : "pointer", boxShadow: pwLoading ? "none" : "0 6px 18px rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                            {pwLoading ? (
                              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Updating...</>
                            ) : (
                              <><KeyRound size={13} /> Update Password</>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM RESOLVE MODAL ── */}
      {confirmResolveTicket && (
        <div onClick={() => { setConfirmResolveTicket(null); setResolveRemark(""); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, borderRadius: 28, boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#059669" }}>
              <CheckCircle size={28} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Mark as Resolved?</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>Are you sure you want to resolve</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#059669", marginBottom: 20 }}>#{confirmResolveTicket.id} — {confirmResolveTicket.subject}</div>
            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 7, letterSpacing: "0.03em" }}>
                REMARK <span style={{ fontWeight: 400, color: "#9ca3af" }}>(sent to user via email)</span>
              </label>
              <textarea
                value={resolveRemark}
                onChange={e => setResolveRemark(e.target.value)}
                placeholder="e.g. The issue has been fixed. Please check and confirm."
                rows={3}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 14, resize: "vertical", border: "1.5px solid rgba(16,185,129,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(16,185,129,0.2)"}
              />
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>The user will be notified via email.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setConfirmResolveTicket(null); setResolveRemark(""); }} style={{ flex: 1, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleResolve(confirmResolveTicket.id)} disabled={resolving} style={{ flex: 1, padding: "12px", borderRadius: 18, border: "none", background: resolving ? "#94a3b8" : "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: resolving ? "not-allowed" : "pointer", opacity: resolving ? 0.75 : 1, boxShadow: resolving ? "none" : "0 8px 24px rgba(16,185,129,0.3)", pointerEvents: resolving ? "none" : "auto" }}>
                {resolving ? "Resolving..." : "Yes, Mark Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM CLOSE MODAL ── */}
      {confirmCloseTicket && (
        <div onClick={() => { setConfirmCloseTicket(null); setCloseRemark(""); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, borderRadius: 28, boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#dc2626" }}>
              <AlertTriangle size={28} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Close Ticket?</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>Are you sure you want to close</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6366f1", marginBottom: 20 }}>#{confirmCloseTicket.id} — {confirmCloseTicket.subject}</div>
            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 7, letterSpacing: "0.03em" }}>
                REMARK <span style={{ fontWeight: 400, color: "#9ca3af" }}>(sent to user via email)</span>
              </label>
              <textarea
                value={closeRemark}
                onChange={e => setCloseRemark(e.target.value)}
                placeholder="e.g. Issue does not fall under our department. Please contact the electrical team."
                rows={3}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 14, resize: "vertical", border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.2)"}
              />
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setConfirmCloseTicket(null); setCloseRemark(""); }} style={{ flex: 1, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleClose(confirmCloseTicket.id)} disabled={closing} style={{ flex: 1, padding: "12px", borderRadius: 18, border: "none", background: closing ? "#94a3b8" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: closing ? "not-allowed" : "pointer", opacity: closing ? 0.75 : 1, boxShadow: closing ? "none" : "0 8px 24px rgba(239,68,68,0.3)", pointerEvents: closing ? "none" : "auto" }}>
                {closing ? "Closing..." : "Yes, Close Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TechnicianDashboard;