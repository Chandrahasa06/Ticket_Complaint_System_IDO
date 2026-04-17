import React, { useState, useEffect } from "react";
import { X, Activity, Clock, AlertTriangle, CheckCircle, KeyRound, EyeOff, Eye, Mail, Send, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';
import CustomToast from "../../components/CustomToast";

/* ─── Responsive style injection ─────────────────────────────────────────── */
const RESPONSIVE_CSS = `
  /* ── Header ── */
  .eng-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    height: 68px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  @media (max-width: 768px) {
    .eng-header-inner { padding: 0 16px; height: 58px; }
  }
  @media (max-width: 400px) {
    .eng-header-inner { padding: 0 10px; }
  }

  /* ── Header username/dept text ── */
  .eng-header-name { font-size: 17px; font-weight: 600; color: #111827; }
  .eng-header-dept { font-size: 12px; color: #6b7280; margin-top: 1px; display: flex; align-items: center; gap: 6px; }
  @media (max-width: 400px) {
    .eng-header-name { font-size: 14px; }
    .eng-header-dept { font-size: 11px; }
  }

  /* ── Logout button ── */
  .eng-logout-btn {
    padding: 10px 20px;
    border-radius: 18px;
    border: 1.5px solid rgba(239,68,68,0.2);
    background: rgba(254,242,242,0.8);
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    color: #dc2626;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  @media (max-width: 480px) {
    .eng-logout-btn { padding: 8px 12px; font-size: 12px; border-radius: 14px; }
    .eng-logout-btn span { display: none; }
  }

  /* ── Tab bar — horizontal scroll ── */
  .eng-tab-bar {
    display: flex; gap: 4px; padding: 5px; border-radius: 16px;
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.55);
    box-shadow: 0 6px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    margin-bottom: 20px; overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; width: 100%;
  }
  .eng-tab-bar::-webkit-scrollbar { display: none; }
  .eng-tab-btn {
    display: flex; align-items: center; gap: 5px; padding: 7px 11px;
    border-radius: 11px; border: none; font-size: 12px; font-weight: 500;
    font-family: inherit; cursor: pointer; background: transparent;
    color: #6b7280; white-space: nowrap; flex-shrink: 0; transition: all 0.14s;
  }
  .eng-tab-btn.active {
    background: linear-gradient(135deg,#6366f1,#0ea5e9); color: white;
    box-shadow: 0 5px 15px rgba(99,102,241,0.28);
  }
  .eng-tab-btn.active.ov {
    background: linear-gradient(135deg,#b91c1c,#ef4444);
    box-shadow: 0 5px 15px rgba(185,28,28,0.26);
  }
  .eng-tab-ct {
    min-width: 16px; height: 16px; border-radius: 8px; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 3px;
    background: rgba(99,102,241,0.1); color: #6366f1;
  }
  .eng-tab-btn.active .eng-tab-ct { background: rgba(255,255,255,0.25); color: white; }
  .eng-tab-ct.ov-pill { background: rgba(185,28,28,0.1); color: #b91c1c; }
  @media (min-width: 640px) {
    .eng-tab-btn { padding: 8px 13px; font-size: 13px; border-radius: 12px; }
  }

  /* ── Main content area ── */
  .eng-main { max-width: 1280px; margin: 0 auto; padding: 28px 32px; position: relative; z-index: 1; }
  @media (max-width: 768px) { .eng-main { padding: 18px 16px; } }
  @media (max-width: 480px) { .eng-main { padding: 12px 10px; } }

  /* ── Section Header ── */
  .eng-sec-hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .eng-sec-title { font-size: 15px; font-weight: 600; color: #111827; }
  .eng-sec-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }

  /* ── COMPACT TICKET CARD ── */
  .atk-card {
    border-radius: 16px; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.65); box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    overflow: hidden; margin-bottom: 8px;
  }
  .atk-priority-banner {
    padding: 4px 14px; border-bottom: 1px solid rgba(239,68,68,0.1);
    background: rgba(254,242,242,0.8); display: flex; align-items: center; gap: 6px;
  }
  .atk-body { padding: 12px 14px; display: flex; align-items: flex-start; gap: 10px; }
  .atk-icon {
    width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#0ea5e9);
    display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; margin-top: 1px;
  }
  .atk-icon.overdue { background: linear-gradient(135deg,#b91c1c,#ef4444); }
  .atk-icon.pending  { background: linear-gradient(135deg,#d97706,#f59e0b); }
  .atk-icon.resolved { background: linear-gradient(135deg,#059669,#10b981); }
  .atk-icon.closed   { background: linear-gradient(135deg,#6b7280,#9ca3af); }
  .atk-content { flex: 1; min-width: 0; }
  .atk-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
  .atk-subject { font-size: 13px; font-weight: 600; color: #111827; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
  .atk-status-pill { padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
  .atk-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .atk-meta-item { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #9ca3af; }
  .atk-view-btn {
    padding: 6px 13px; border-radius: 10px; border: none; background: linear-gradient(135deg,#6366f1,#0ea5e9);
    color: white; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 4px;
    box-shadow: 0 3px 10px rgba(99,102,241,0.28); white-space: nowrap; flex-shrink: 0; margin-top: 2px;
  }
  @media (min-width: 640px) {
    .atk-card { border-radius: 18px; margin-bottom: 10px; }
    .atk-body { padding: 14px 18px; gap: 12px; }
    .atk-icon { width: 38px; height: 38px; border-radius: 11px; }
    .atk-subject { font-size: 14px; }
    .atk-meta-item { font-size: 12px; }
    .atk-view-btn { font-size: 12px; padding: 7px 15px; }
  }
  @media (min-width: 1024px) { .atk-body { padding: 16px 22px; } }

  /* ── Ticket card ── */
  .eng-ticket-body { padding: 24px 26px; }
  .eng-ticket-footer {
    display: flex;
    gap: 10px;
    padding: 14px 26px;
    border-top: 1px solid rgba(0,0,0,0.05);
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .eng-ticket-body { padding: 14px 14px; }
    .eng-ticket-footer { padding: 10px 14px; gap: 8px; }
    .eng-ticket-footer button { flex: 1; justify-content: center; }
  }

  /* ── Ticket header row ── */
  .eng-ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* ── Ticket meta row (dept + date) ── */
  .eng-ticket-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }
  @media (max-width: 400px) {
    .eng-ticket-meta { gap: 14px; }
  }

  /* ── Technicians grid ── */
  .eng-tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  @media (max-width: 640px) {
    .eng-tech-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
  }
  @media (max-width: 420px) {
    .eng-tech-grid { grid-template-columns: 1fr; gap: 12px; }
  }

  /* ── Profile / ticket modal box ── */
  .eng-modal-sm {
    width: 100%;
    max-width: 460px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }
  .eng-modal-md {
    width: 100%;
    max-width: 620px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }
  .eng-modal-lg {
    width: 100%;
    max-width: 560px;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }
  @media (max-width: 680px) {
    .eng-modal-sm, .eng-modal-md, .eng-modal-lg {
      border-radius: 20px;
      max-width: 92vw;
      max-height: 72vh;
    }
  }

  /* ── Modal scroll bodies ── */
  .eng-modal-body-sm {
    padding: 24px 28px;
    flex: 1;
    overflow-y: auto;
  }
  .eng-modal-body-md {
    padding: 24px 28px;
    flex: 1;
    overflow-y: auto;
  }
  .eng-modal-body-lg {
    padding: 24px 28px;
    flex: 1;
    overflow-y: auto;
  }
  @media (max-width: 680px) {
    .eng-modal-body-sm,
    .eng-modal-body-md,
    .eng-modal-body-lg { padding: 12px 12px 16px; }
  }

  /* ── Ticket detail grid (8 fields) ── */
  .eng-ticket-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 0;
  }
  @media (max-width: 520px) {
    .eng-ticket-detail-grid { grid-template-columns: 1fr; gap: 8px; }
  }

  /* ── Comment input row ── */
  .eng-comment-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  @media (max-width: 420px) {
    .eng-comment-row { flex-direction: column; }
    .eng-comment-row textarea { width: 100%; box-sizing: border-box; }
    .eng-comment-row button { width: 100%; justify-content: center; }
  }

  /* ── Password change form buttons ── */
  .eng-pw-btn-row {
    display: flex;
    gap: 10px;
    margin-top: 6px;
  }
  @media (max-width: 380px) {
    .eng-pw-btn-row { flex-direction: column; }
    .eng-pw-btn-row button { width: 100%; }
  }

  /* ── "My Team" section header ── */
  .eng-team-header { margin-bottom: 22px; }
  .eng-team-title { font-size: 20px; font-weight: 600; color: #111827; }
  .eng-team-sub { font-size: 13px; color: #6b7280; margin-top: 3px; }
  @media (max-width: 480px) {
    .eng-team-title { font-size: 17px; }
    .eng-team-sub { font-size: 12px; }
  }

  /* ── View button compact ── */
  .eng-view-btn {
    padding: 8px 16px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    color: white;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .eng-view-btn:hover { opacity: 0.92; }

  /* ── Priority compact button ── */
  .eng-priority-btn {
    padding: 7px 10px;
    border-radius: 12px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Ticket list wrapper ── */
  .eng-ticket-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};



const COMMENT_ROLE_STYLE = {
  admin: {
    label: "ADMIN",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.07)",
    border: "rgba(99,102,241,0.15)",
    tagBg: "rgba(99,102,241,0.12)",
  },
  engineer: {
    label: "ENGINEER",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.06)",
    border: "rgba(14,165,233,0.15)",
    tagBg: "rgba(14,165,233,0.1)",
  },
  technician: {
    label: "TECHNICIAN",
    color: "#0d9488",
    bg: "rgba(13,148,136,0.07)",
    border: "rgba(13,148,136,0.18)",
    tagBg: "rgba(13,148,136,0.12)",
  },
};

const renderDescription = (body = "") => {
  const separatorRegex = /\n\n--- Original complaint \(raised on (.+?)\) ---\n([\s\S]*)/;
  const match = body.match(separatorRegex);

  if (match) {
    const followupText = body.replace(separatorRegex, "").replace(/^\[Follow-up\]\s*/, "").trim();
    const originalDate = match[1];
    const originalText = match[2].trim();

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.06em", textTransform: "uppercase" }}>Follow-up complaint</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.65, padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.22)" }}>
            {followupText}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", fontStyle: "italic" }}>Original complaint · {originalDate}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, padding: "10px 14px", borderRadius: 12, background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", fontStyle: "italic" }}>
          {originalText}
        </div>
      </div>
    );
  }

  return <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{body}</div>;
};

/* ─── Status icon ──────────────────────────────────────────────────────────── */
const getStatusIcon = (status) => {
  const s = (status || "").toLowerCase().replace("_", "-");
  switch (s) {
    case "pending": return <Clock size={13} />;
    case "in-progress": return <Activity size={13} />;
    case "overdue": return <AlertTriangle size={13} />;
    case "resolved": return <CheckCircle size={13} />;
    case "closed": return <X size={13} />;
    default: return null;
  }
};

/* ─── Comment Section ──────────────────────────────────────────────────────── */
const CommentSection = ({ ticketId, role, loggedInUserId }) => {
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
  useEffect(() => { subscribeToPush(); }, []);

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
      const res = await fetch(`${BASE}/tickets/${ticketId}/comments/${commentId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) { console.error(e); }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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
            const rs = COMMENT_ROLE_STYLE[c.authorRole] ?? COMMENT_ROLE_STYLE.engineer;
            const isOwn = c.authorRole === role && c.authorId === loggedInUserId;

            return (
              <div key={c.id} style={{ padding: "13px 15px", borderRadius: 18, background: rs.bg, border: `1px solid ${rs.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: rs.color, background: rs.tagBg, padding: "2px 9px", borderRadius: 20, letterSpacing: "0.04em" }}>
                      {rs.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.authorName}</span>
                    {c.authorDepartment && <span style={{ fontSize: 11, color: "#9ca3af" }}>· {c.authorDepartment}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(c.createdAt)}</span>
                    {isOwn && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditingId(c.id); setEditBody(c.body); }} style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(99,102,241,0.1)", color: "#6366f1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(c.id)} style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === c.id ? (
                  <div>
                    <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={1} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.3)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                      <button onClick={() => { setEditingId(null); setEditBody(""); }} style={{ padding: "7px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => handleEdit(c.id)} disabled={editSubmitting || !editBody.trim()} style={{ padding: "7px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", opacity: editSubmitting || !editBody.trim() ? 0.6 : 1 }}>{editSubmitting ? "Saving..." : "Save"}</button>
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

      <div className="eng-comment-row">
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment..." rows={1} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} style={{ flex: 1, padding: "11px 14px", borderRadius: 16, border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", resize: "none", boxSizing: "border-box" }} />
        <button onClick={handleSubmit} disabled={submitting || !body.trim()} style={{ padding: "11px 18px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 6px 18px rgba(99,102,241,0.3)", opacity: submitting || !body.trim() ? 0.6 : 1, flexShrink: 0 }}>
          <Send size={14} />{submitting ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

/* ─── Compact Ticket Card ─────────────────────────────────────────────────── */
const TicketCard = ({ ticket, onView, onTogglePriority, priorityLoading }) => {
  const statusKey = (ticket.status || "").toLowerCase().replace(/_/g, "-");
  const isPriority = ticket.isPriority;
  const canPriority = ticket.status === "PENDING" || ticket.status === "OVERDUE";
  const formattedDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="atk-card" style={{ outline: isPriority ? "2px solid rgba(239,68,68,0.35)" : "none" }}>
      {isPriority && (
        <div className="atk-priority-banner">
          <svg width="11" height="11" fill="#dc2626" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", letterSpacing: "0.04em" }}>PRIORITY</span>
        </div>
      )}
      <div className="atk-body">
        <div className={`atk-icon ${statusKey}`}>
          {getStatusIcon(statusKey)}
        </div>
        <div className="atk-content">
          <div className="atk-top">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="atk-subject">{ticket.subject || "No Subject"}</div>
              <div className="atk-meta" style={{ marginTop: 3 }}>
                <span className="atk-meta-item"><span>#{ticket.id}</span></span>
                {ticket.type && (
                  <span className="atk-meta-item">
                    <svg width="10" height="10" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {ticket.type}
                  </span>
                )}
                <span className="atk-meta-item">
                  <svg width="10" height="10" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formattedDate}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              {canPriority && (
                <button
                  className="eng-priority-btn"
                  onClick={() => onTogglePriority(ticket)}
                  disabled={priorityLoading === ticket.id}
                  style={{
                    border: isPriority ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(239,68,68,0.2)",
                    background: isPriority ? "rgba(239,68,68,0.1)" : "rgba(254,242,242,0.85)",
                    color: "#dc2626",
                    opacity: priorityLoading === ticket.id ? 0.6 : 1,
                    cursor: priorityLoading === ticket.id ? "not-allowed" : "pointer",
                    padding: "4px 8px", fontSize: 10, borderRadius: 8,
                  }}
                >
                  <svg width="10" height="10" fill={isPriority ? "#dc2626" : "none"} stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginRight: 2 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {priorityLoading === ticket.id ? "..." : isPriority ? "Unmark" : "Priority"}
                </button>
              )}
              <button className="atk-view-btn" onClick={() => onView(ticket)}>
                <Eye size={11} /> View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ─── Main Dashboard ───────────────────────────────────────────────────────── */
const EngineerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [engineerInfo, setEngineerInfo] = useState({ username: "", department: "" });
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewTechnician, setViewTechnician] = useState(null);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [tabCounts, setTabCounts] = useState({ pending: 0, overdue: 0, resolved: 0, closed: 0 });
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);
  const [priorityLoading, setPriorityLoading] = useState(null);



  useEffect(() => {
    const fetchEngineerInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/engineer/dashboard", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setEngineerInfo({ username: data.user?.username || "Engineer", department: data.user?.department || "" });
          setLoggedInUserId(data.user?.id ?? null);
        }
      } catch (e) { console.error(e); }
    };
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/engineer/profile", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setProfile(data.engineer);
      } catch (e) { console.error(e); }
    };
    const fetchAllCounts = async () => {
      try {
        const statuses = ["pending", "overdue", "resolved", "closed"];
        const results = await Promise.all(statuses.map(s =>
          fetch(`http://localhost:3000/api/engineer/tickets?pg=1&status=${s.toUpperCase()}`, { credentials: "include" }).then(r => r.json())
        ));
        setTabCounts({ pending: results[0].tickets?.length || 0, overdue: results[1].tickets?.length || 0, resolved: results[2].tickets?.length || 0, closed: results[3].tickets?.length || 0 });
      } catch (e) { console.error(e); }
    };
    const fetchNotifs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/engineer/notifications", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setNotifs(data.notifications);
          setUnread(data.notifications.filter(n => !n.isRead).length);
        }
      } catch (e) { console.error(e); }
    };
    fetchEngineerInfo();
    fetchProfile();
    fetchAllCounts();
    fetchNotifs();
    subscribeToPush();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/engineer/technicians", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTechnicians(data.technicians);
    } catch (e) { console.error(e); }
  };

  const fetchTickets = async (status) => {
    setLoading(true);
    try {
      let url = "http://localhost:3000/api/engineer/tickets?pg=1";
      if (status && status !== "technicians") url += `&status=${status.toUpperCase().replace("-", "_")}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) { CustomToast(data.message); return; }
      setTickets(data.tickets);
    } catch (e) { console.error(e); CustomToast("Server error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "technicians") fetchTechnicians();
    else fetchTickets(activeTab);
  }, [activeTab]);



  const handleTogglePriority = async (ticket) => {
    setPriorityLoading(ticket.id);
    try {
      const res = await fetch(`http://localhost:3000/api/engineer/tickets/${ticket.id}/priority`, {
        method: "PATCH", credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) { CustomToast(data.message); return; }
      setTickets(prev => prev.map(t =>
        t.id === ticket.id ? { ...t, isPriority: data.isPriority } : t
      ));
    } catch (e) { console.error(e); CustomToast("Server error"); }
    finally { setPriorityLoading(null); }
  };

  const handleLogout = async () => {
    await unsubscribeFromPush();
    try {
      await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch (error) { console.error("Logout error:", error); }
  };

  const resetPwForm = () => {
    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwShow({ current: false, newPw: false, confirm: false });
    setPwError(""); setPwSuccess(false); setShowChangePw(false);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwError("All fields are required."); return; }
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.current === pwForm.newPw) { setPwError("New password must differ from current password."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/engineer/change-password", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }) });
      const data = await res.json();
      if (!res.ok) { setPwError(data.message || "Failed to change password."); return; }
      setPwSuccess(true);
      setTimeout(() => resetPwForm(), 2200);
    } catch (e) { console.error(e); setPwError("Server error. Please try again."); }
    finally { setPwLoading(false); }
  };

  const pwInputStyle = { width: "100%", padding: "11px 11px 11px 40px", borderRadius: 13, border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box", paddingRight: 40 };

  const pwScore = (() => { const v = pwForm.newPw; return [v.length >= 6, v.length >= 10, /[A-Z]/.test(v) || /[0-9]/.test(v), /[^a-zA-Z0-9]/.test(v)].filter(Boolean).length; })();
  const pwStrengthColors = ["#334155", "#475569", "#eab308", "#10b981"];
  const pwStrengthLabels = ["", "Weak", "Fair", "Good", "Strong"];



  const tabs = [
    { key: "pending", label: "Pending", count: tabCounts.pending },
    { key: "overdue", label: "Overdue", count: tabCounts.overdue },
    { key: "resolved", label: "Resolved", count: tabCounts.resolved },
    { key: "closed", label: "Closed", count: tabCounts.closed },
    { key: "technicians", label: "My Team", count: technicians.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#111827", position: "relative", overflowX: "hidden" }}>
      <style>{RESPONSIVE_CSS}</style>

      <div style={{ position: "fixed", width: 560, height: 560, borderRadius: "50%", background: "#6366f1", filter: "blur(130px)", opacity: 0.45, top: -130, left: -130, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 460, height: 460, borderRadius: "50%", background: "#0ea5e9", filter: "blur(130px)", opacity: 0.45, bottom: -140, right: -110, pointerEvents: "none", zIndex: 0 }} />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)", background: "rgba(255,255,255,0.55)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
        <div className="eng-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div onClick={() => { setShowProfile(true); resetPwForm(); }} style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.35)", flexShrink: 0, cursor: "pointer", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 34, height: 22, borderRadius: "50% 50% 0 0", background: "rgba(255,255,255,0.9)" }} />
              <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
            </div>
            <div>
              <div className="eng-header-name">{engineerInfo.username}</div>
              <div className="eng-header-dept">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                {engineerInfo.department} Department
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={async () => {
                setShowNotifs(true);
                if (unread > 0) {
                  await fetch("http://localhost:3000/api/engineer/notifications/read", { method: "PATCH", credentials: "include" });
                  setUnread(0);
                  setNotifs(p => p.map(n => ({ ...n, isRead: true })));
                }
              }}
              style={{ position: "relative", width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button className="eng-logout-btn" onClick={handleLogout}>
              <span>Logout</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* TAB STRIP */}
      <div style={{ position: "sticky", top: 68, zIndex: 90, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(255,255,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "0 16px", maxWidth: 1280, margin: "0 auto", marginTop: 16 }}>
          <div className="eng-tab-bar">
            {tabs.map(tab => {
              const act = activeTab === tab.key;
              const ov = tab.key === "overdue";
              return (
                <button
                  key={tab.key}
                  className={`eng-tab-btn${act ? ` active${ov ? " ov" : ""}` : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`eng-tab-ct${!act && ov && tab.count > 0 ? " ov-pill" : ""}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="eng-main">
        {activeTab !== "technicians" && (
          <div>
            {loading ? (
              <div style={{ ...glassCard, padding: "60px 32px", textAlign: "center" }}><div style={{ fontSize: 16, color: "#6b7280" }}>Loading tickets...</div></div>
            ) : tickets.length === 0 ? (
              <div style={{ ...glassCard, padding: "60px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No Tickets Found</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>There are no {activeTab.replace("-", " ")} tickets at the moment.</div>
              </div>
            ) : (
              <div>
                <div className="eng-sec-hd">
                  <div>
                    <div className="eng-sec-title">{tabs.find(t=>t.key===activeTab)?.label} Tickets</div>
                    <div className="eng-sec-sub">Showing {tabs.find(t=>t.key===activeTab)?.label?.toLowerCase()} tickets · {tickets.length} Total</div>
                  </div>
                </div>
                <div className="eng-ticket-list">
                  {(tickets ?? [])
                    .slice()
                    .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0))
                    .map(ticket => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onView={setSelectedTicket}
                        onTogglePriority={handleTogglePriority}
                        priorityLoading={priorityLoading}
                      />
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "technicians" && (
          <div>
            <div className="eng-team-header">
              <div className="eng-team-title">My Team</div>
              <div className="eng-team-sub">Technicians in {engineerInfo.department} department</div>
            </div>
            {technicians.length === 0 ? (
              <div style={{ ...glassCard, padding: "60px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No Technicians Found</div>
              </div>
            ) : (
              <div className="eng-tech-grid">
                {technicians.map(tech => (
                  <div key={tech.id} style={{ ...glassCard, overflow: "hidden" }}>
                    <div style={{ height: 60, background: "linear-gradient(135deg,#6366f1,#0ea5e9)" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px 24px" }}>
                      <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>{(tech.username || "T").charAt(0).toUpperCase()}</div>
                      <div style={{ textAlign: "center", marginTop: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{tech.username || "—"}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>{tech.department}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{tech.area}</div>
                      </div>
                      <button onClick={() => setViewTechnician(tech)} style={{ width: "100%", padding: "11px", borderRadius: 18, border: "none", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
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
      {showProfile && profile && (
        <div onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="eng-modal-sm">
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "white" }}>My Profile</div>
              <button onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><X size={15} /></button>
            </div>
            <div className="eng-modal-body-sm">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, fontWeight: 700, margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>{(profile.username || "E").charAt(0).toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{profile.username}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{profile.department} Department</div>
              </div>
              {[{ label: "EMAIL", val: profile.email }, { label: "DEPARTMENT", val: profile.department }].map((f, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.val}</div>
                </div>
              ))}
              <div style={{ marginTop: 16, borderRadius: 18, border: "1.5px solid rgba(99,102,241,0.18)", overflow: "hidden" }}>
                <button onClick={() => { setShowChangePw(v => !v); setPwError(""); setPwSuccess(false); }} style={{ width: "100%", padding: "14px 16px", background: showChangePw ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.04)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={14} color="white" /></div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Change Password</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ transition: "transform 0.25s", transform: showChangePw ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showChangePw && (
                  <div style={{ padding: "18px 16px", borderTop: "1px solid rgba(99,102,241,0.12)", background: "rgba(255,255,255,0.55)" }}>
                    {pwSuccess ? (
                      <div style={{ textAlign: "center", padding: "14px 0" }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><CheckCircle size={26} color="#059669" /></div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Password Updated!</div>
                      </div>
                    ) : (
                      <>
                        {pwError && <div style={{ marginBottom: 14, padding: "10px 13px", borderRadius: 12, background: "rgba(100,116,139,0.07)", border: "1px solid rgba(100,116,139,0.18)", display: "flex", alignItems: "center", gap: 9 }}><AlertTriangle size={14} color="#334155" style={{ flexShrink: 0 }} /><span style={{ fontSize: 12, color: "#334155" }}>{pwError}</span></div>}
                        {[{ key: "current", label: "Current Password", placeholder: "Enter current password" }, { key: "newPw", label: "New Password", placeholder: "At least 6 characters" }, { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" }].map(({ key, label, placeholder }) => (
                          <div key={key} style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1", display: "flex", pointerEvents: "none" }}><KeyRound size={13} /></span>
                              <input type={pwShow[key] ? "text" : "password"} value={pwForm[key]} onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} style={pwInputStyle} disabled={pwLoading} onKeyDown={e => e.key === "Enter" && handleChangePassword()} />
                              <button type="button" onClick={() => setPwShow(prev => ({ ...prev, [key]: !prev[key] }))} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6366f1", display: "flex", padding: 4 }}>{pwShow[key] ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                            </div>
                            {key === "newPw" && pwForm.newPw && (
                              <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 5 }}>
                                {[1, 2, 3, 4].map(i => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= pwScore ? pwStrengthColors[pwScore - 1] : "rgba(0,0,0,0.08)", transition: "background 0.3s" }} />))}
                                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4, minWidth: 30 }}>{pwStrengthLabels[pwScore]}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="eng-pw-btn-row">
                          <button onClick={resetPwForm} disabled={pwLoading} style={{ flex: 1, padding: "10px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: pwLoading ? "not-allowed" : "pointer" }}>Cancel</button>
                          <button onClick={handleChangePassword} disabled={pwLoading} style={{ flex: 1, padding: "10px", borderRadius: 14, border: "none", background: pwLoading ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: pwLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                            {pwLoading ? (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Updating...</>) : (<><KeyRound size={13} /> Update Password</>)}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => { setShowProfile(false); resetPwForm(); }} style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET DETAIL MODAL */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="eng-modal-md">
            <div style={{ padding: "22px 28px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>Ticket Details</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>#{selectedTicket.id} · {selectedTicket.subject}</div>
              <button onClick={() => setSelectedTicket(null)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><X size={15} /></button>
            </div>
            <div className="eng-modal-body-md">
              <div className="eng-ticket-detail-grid">
                {[
                  { label: "TICKET ID", val: selectedTicket.id },
                  { label: "SUBJECT", val: selectedTicket.subject },
                  { label: "DEPARTMENT", val: selectedTicket.type },
                  { label: "LOCATION", val: selectedTicket.location || "—" },
                  { label: "STATUS", val: selectedTicket.status },
                  { label: "RAISED BY", val: selectedTicket.user?.username || "—" },
                  { label: "CONTACT NUMBER", val: selectedTicket.phone || "—" },
                  { label: "DATE", val: new Date(selectedTicket.createdAt).toLocaleDateString() },
                ].map((f, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{f.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 10 }}>DESCRIPTION</div>
                {renderDescription(selectedTicket.body)}
              </div>

              {selectedTicket.imageUrl ? (
                <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 10 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${selectedTicket.imageUrl}`} alt="ticket" style={{ width:"100%", borderRadius:12, maxHeight:250, objectFit:"cover" }} />
                </div>
              ) : null}

              <CommentSection
                ticketId={selectedTicket.id}
                role="engineer"
                loggedInUserId={loggedInUserId}
              />

              <button onClick={() => setSelectedTicket(null)} style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TECHNICIAN DETAIL MODAL */}
      {viewTechnician && (
        <GlassModal onClose={() => setViewTechnician(null)} title="Technician Profile">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, fontWeight: 700, margin: "0 auto 12px", boxShadow: "0 12px 32px rgba(99,102,241,0.35)" }}>{(viewTechnician.username || "T").charAt(0).toUpperCase()}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{viewTechnician.username || "—"}</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>{viewTechnician.department}</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>{viewTechnician.area}</div>
          </div>
          {[{ icon: <Mail size={16} color="#6366f1" />, label: "EMAIL", val: viewTechnician.email }, { icon: <Activity size={16} color="#6366f1" />, label: "DEPARTMENT", val: viewTechnician.department }, { icon: <Activity size={16} color="#6366f1" />, label: "AREA", val: viewTechnician.area }].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 10 }}>
              {f.icon}
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", marginBottom: 2 }}>{f.label}</div><div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.val}</div></div>
            </div>
          ))}
        </GlassModal>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotifs && (
        <div onClick={() => setShowNotifs(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "22px 28px", background: "linear-gradient(135deg,#4f69e7,#5a71e4)", position: "relative", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>Notifications</div>
              <button onClick={() => setShowNotifs(false)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><X size={14} /></button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {notifs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>No notifications yet</div>
              ) : notifs.map(n => (
                <div key={n.id} style={{ padding: "12px 14px", borderRadius: 14, background: n.isRead ? "rgba(0,0,0,0.02)" : "rgba(239,68,68,0.06)", border: n.isRead ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(239,68,68,0.18)", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: n.isRead ? "rgba(0,0,0,0.05)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: n.isRead ? "#9ca3af" : "#dc2626" }}>
                    <AlertTriangle size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: "#111827", lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const GlassModal = ({ children, onClose, title }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
    <div onClick={e => e.stopPropagation()} className="eng-modal-lg">
      <div style={{ padding: "22px 28px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div><div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>{title}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>View and manage information</div></div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><X size={15} /></button>
      </div>
      <div className="eng-modal-body-lg">
        {children}
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer", marginTop: 8 }}>Close</button>
      </div>
    </div>
  </div>
);

export default EngineerDashboard;