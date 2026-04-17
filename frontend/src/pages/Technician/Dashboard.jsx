import React, { useState, useEffect } from "react";
import {
  Eye, CheckCircle, X, MapPin, Calendar, Wrench,
  AlertTriangle, KeyRound, EyeOff, Eye as EyeIcon,
  Send, Pencil, Trash2, Clock, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';
import CustomToast from "../../components/CustomToast";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL RESPONSIVE CSS  (mobile-first, namespaced td-)
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes td-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .td-page {
    min-height: 100vh;
    background: #eef2ff;
    font-family: 'Inter','Segoe UI',sans-serif;
    color: #111827;
    position: relative;
    overflow-x: hidden;
  }

  /* ── HEADER ── */
  .td-header {
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
    background: rgba(255,255,255,0.55);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.6);
  }
  .td-header-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 14px; height: 58px;
    display: flex; align-items: center;
    justify-content: space-between; gap: 8px;
  }
  .td-header-left {
    display: flex; align-items: center; gap: 9px;
    min-width: 0; flex: 1; overflow: hidden;
  }
  .td-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    box-shadow: 0 5px 15px rgba(99,102,241,0.32);
    flex-shrink: 0; cursor: pointer;
    overflow: hidden; position: relative;
  }
  .td-avatar-body {
    position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
    width: 26px; height: 16px; border-radius: 50% 50% 0 0;
    background: rgba(255,255,255,0.88);
  }
  .td-avatar-head {
    position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
    width: 13px; height: 13px; border-radius: 50%;
    background: rgba(255,255,255,0.88);
  }
  .td-header-text { min-width: 0; overflow: hidden; }
  .td-header-name {
    font-size: 14px; font-weight: 600; color: #111827;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .td-header-meta {
    font-size: 11px; color: #6b7280; margin-top: 1px;
    display: flex; align-items: center; gap: 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .td-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }

  .td-header-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }

  .td-bell {
    position: relative; width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid rgba(99,102,241,0.2); background: rgba(255,255,255,0.85);
    cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6366f1;
  }
  .td-badge {
    position: absolute; top: 2px; right: 2px;
    width: 15px; height: 15px; border-radius: 50%;
    background: #ef4444; color: white; font-size: 8px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .td-logout {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 14px;
    border: 1.5px solid rgba(239,68,68,0.22); background: rgba(254,242,242,0.85);
    font-size: 12px; font-weight: 500; color: #dc2626; cursor: pointer; white-space: nowrap;
  }
  .td-logout-lbl { display: none; }

  /* ── CONTENT ── */
  .td-content {
    max-width: 1280px; margin: 0 auto;
    padding: 16px 12px 48px; position: relative; z-index: 1;
  }

  /* ── STATS ── */
  .td-stats {
    display: grid; grid-template-columns: repeat(2,1fr);
    gap: 10px; margin-bottom: 16px;
  }
  .td-stat {
    border-radius: 18px;
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.62);
    box-shadow: 0 8px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8);
    padding: 16px 14px;
  }
  .td-stat-lbl { font-size: 11px; font-weight: 500; color: #6b7280; margin-bottom: 4px; }
  .td-stat-val {
    font-size: 30px; font-weight: 700; line-height: 1.1;
    background: linear-gradient(135deg,#6366f1,#0ea5e9);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .td-stat-val.warn {
    background: linear-gradient(135deg,#ef4444,#f97316);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ── TABS (horizontal scroll on mobile) ── */
  .td-tabs {
    display: flex; gap: 4px; padding: 5px;
    border-radius: 16px;
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.55);
    box-shadow: 0 6px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    margin-bottom: 16px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .td-tabs::-webkit-scrollbar { display: none; }
  .td-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 11px; border-radius: 11px; border: none;
    font-size: 12px; font-weight: 500; font-family: inherit;
    cursor: pointer; background: transparent; color: #6b7280;
    white-space: nowrap; flex-shrink: 0; transition: all 0.14s;
  }
  .td-tab.active { background: linear-gradient(135deg,#6366f1,#0ea5e9); color: white; box-shadow: 0 5px 15px rgba(99,102,241,0.28); }
  .td-tab.active.ov { background: linear-gradient(135deg,#b91c1c,#ef4444); box-shadow: 0 5px 15px rgba(185,28,28,0.26); }
  .td-tab-ct {
    min-width: 16px; height: 16px; border-radius: 8px; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 3px;
    background: rgba(99,102,241,0.1); color: #6366f1;
  }
  .td-tab.active .td-tab-ct { background: rgba(255,255,255,0.25); color: white; }
  .td-tab-ct.ov-pill { background: rgba(185,28,28,0.1); color: #b91c1c; }

  /* ── SECTION HEADER ── */
  .td-sec-hd {
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; margin-bottom: 12px; flex-wrap: wrap;
  }
  .td-sec-title { font-size: 15px; font-weight: 600; color: #111827; }
  .td-sec-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .td-ct-pill {
    padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
    color: #6366f1; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
    flex-shrink: 0; white-space: nowrap;
  }

  /* ── COMPACT TICKET CARD ── */
  .atk-card {
    border-radius: 16px; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.65); box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    overflow: hidden; margin-bottom: 12px;
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
  .td-fu-tag { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; color: #7c3aed; background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.18); margin-left: 6px; }


  /* ── TICKET ACTION BUTTONS ── */
  .td-acts {
    display: flex; gap: 6px; padding: 10px 14px;
    border-top: 1px solid rgba(0,0,0,0.05);
  }
  .td-act {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    padding: 9px 6px; border-radius: 12px;
    font-size: 11px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap;
  }
  .td-act-view { border: none; background: linear-gradient(135deg,#6366f1,#0ea5e9); color: white; box-shadow: 0 5px 14px rgba(99,102,241,0.26); }
  .td-act-res  { border: 1px solid rgba(16,185,129,0.22); background: rgba(16,185,129,0.08); color: #059669; }
  .td-act-res:disabled  { background: rgba(0,0,0,0.04); color: #9ca3af; border-color: rgba(0,0,0,0.06); cursor: not-allowed; }
  .td-act-cls  { border: 1px solid rgba(239,68,68,0.22); background: rgba(254,242,242,0.85); color: #dc2626; }
  .td-act-cls:disabled  { background: rgba(0,0,0,0.04); color: #9ca3af; border-color: rgba(0,0,0,0.06); cursor: not-allowed; }

  /* ── EMPTY ── */
  .td-empty {
    border-radius: 20px;
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.62);
    box-shadow: 0 8px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8);
    padding: 52px 20px; text-align: center;
  }

  /* ── BACKDROP / SHEET ── */
  .td-bk {
    position: fixed; inset: 0; background: rgba(0,0,0,0.32);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .td-sheet {
    width: 100%; max-width: 92vw; max-height: 72vh;
    border-radius: 20px; overflow: hidden;
    display: flex; flex-direction: column;
    background: rgba(255,255,255,0.97);
    box-shadow: 0 40px 120px rgba(0,0,0,0.18);
  }
  .td-handle { display: none; }
  .td-sh-hd { padding: 13px 16px 15px; position: relative; flex-shrink: 0; }
  .td-sh-hd-title { font-size: 17px; font-weight: 600; color: white; }
  .td-sh-hd-sub { font-size: 12px; color: rgba(255,255,255,0.72); margin-top: 2px; }
  .td-sh-close {
    position: absolute; top: 11px; right: 13px;
    width: 30px; height: 30px; border-radius: 50%; border: none;
    background: rgba(255,255,255,0.22); cursor: pointer;
    display: flex; align-items: center; justify-content: center; color: white;
  }
  .td-sh-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 14px 14px 28px; }

  /* detail grid inside modal */
  .td-dg { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 10px; }
  .td-dc { padding: 9px 11px; border-radius: 11px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.1); }
  .td-dc.s2 { grid-column: 1 / -1; }
  .td-dc-l { font-size: 10px; font-weight: 600; color: #6366f1; letter-spacing: 0.05em; margin-bottom: 3px; }
  .td-dc-v { font-size: 13px; font-weight: 600; color: #111827; word-break: break-word; }

  /* comment compose */
  .td-cc { display: flex; flex-direction: column; gap: 7px; }
  .td-cc textarea { width: 100%; padding: 10px 12px; border-radius: 13px; border: 1.5px solid rgba(13,148,136,0.22); background: rgba(255,255,255,0.9); font-size: 13px; font-family: inherit; color: #111827; outline: none; resize: none; }
  .td-cc-send { padding: 10px 16px; border-radius: 13px; border: none; background: linear-gradient(135deg,#0d9488,#0ea5e9); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(13,148,136,0.26); }
  .td-cc-send:disabled { opacity: 0.6; cursor: not-allowed; }

  /* follow-up banner */
  .td-fu-ban { margin-bottom: 12px; padding: 11px 13px; border-radius: 13px; background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.15); display: flex; flex-direction: column; gap: 8px; }
  .td-fu-ban-btn { align-self: flex-start; padding: 6px 13px; border-radius: 20px; border: none; background: linear-gradient(135deg,#7c3aed,#6366f1); color: white; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 5px; }

  /* confirm sheet */
  .td-conf { width: 100%; border-radius: 22px 22px 0 0; background: rgba(255,255,255,0.98); box-shadow: 0 -18px 55px rgba(0,0,0,0.18); padding: 26px 18px 36px; text-align: center; }
  .td-conf-btns { display: flex; gap: 10px; margin-top: 18px; }
  .td-conf-btns button { flex: 1; padding: 12px; border-radius: 15px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; }

  /* pw form */
  .td-pw-row { display: flex; gap: 8px; margin-top: 8px; }
  .td-pw-row button { flex: 1; padding: 10px; border-radius: 11px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; }
  .td-pw-wrap { position: relative; }
  .td-pw-ico { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #6366f1; display: flex; pointer-events: none; }
  .td-pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6366f1; display: flex; padding: 4px; }

  /* ─── TABLET 640px+ ─── */
  @media (min-width: 640px) {
    .td-header-inner { padding: 0 24px; height: 64px; }
    .td-header-name { font-size: 15px; }
    .td-header-meta { font-size: 12px; }
    .td-avatar { width: 42px; height: 42px; }
    .td-avatar-body { width: 30px; height: 18px; }
    .td-avatar-head { width: 14px; height: 14px; top: 8px; }
    .td-bell { width: 40px; height: 40px; }
    .td-logout { padding: 9px 16px; font-size: 13px; border-radius: 16px; }
    .td-logout-lbl { display: inline; }

    .td-content { padding: 24px 24px 48px; }
    .td-stats { grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px; }
    .td-stat { padding: 20px 18px; border-radius: 22px; }
    .td-stat-val { font-size: 36px; }

    .td-tab { padding: 8px 13px; font-size: 13px; border-radius: 12px; }

    .atk-card { border-radius: 18px; }
    .atk-body { padding: 14px 18px; gap: 12px; }
    .atk-icon { width: 38px; height: 38px; border-radius: 11px; }
    .atk-subject { font-size: 14px; }
    .atk-meta-item { font-size: 12px; }
    .td-acts { padding: 12px 20px; gap: 8px; }
    .td-act { font-size: 12px; padding: 9px 14px; flex: 0 1 auto; }

    .td-bk { align-items: center; padding: 20px; }
    .td-sheet { max-width: 600px; max-height: 88vh; border-radius: 26px; }
    .td-handle { display: none; }
    .td-sh-hd { padding: 18px 22px 20px; }
    .td-sh-hd-title { font-size: 19px; }
    .td-sh-body { padding: 18px 22px 26px; }

    .td-conf { border-radius: 22px; padding: 32px 28px; max-width: 420px; }
    .td-dg { gap: 10px; }
    .td-dc { padding: 11px 13px; border-radius: 13px; }
    .td-dc-v { font-size: 14px; }

    .td-fu-ban { flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; }
    .td-fu-ban-btn { align-self: auto; }

    .td-cc { flex-direction: row; align-items: flex-end; }
    .td-cc textarea { flex: 1; }
    .td-cc-send { flex-shrink: 0; }
  }

  /* ─── DESKTOP 1024px+ ─── */
  @media (min-width: 1024px) {
    .td-header-inner { padding: 0 32px; height: 68px; }
    .td-header-name { font-size: 17px; }
    .td-avatar { width: 46px; height: 46px; }
    .td-avatar-body { width: 34px; height: 22px; bottom: -6px; }
    .td-avatar-head { width: 16px; height: 16px; top: 9px; }
    .td-bell { width: 42px; height: 42px; }

    .td-content { padding: 30px 32px 56px; }
    .td-stats { gap: 18px; margin-bottom: 28px; }
    .td-stat { padding: 24px 22px; }
    .td-stat-val { font-size: 40px; }

    .atk-body { padding: 16px 22px; }
    .atk-subject { font-size: 15px; }
    .td-acts { padding: 14px 24px; gap: 10px; }
    .td-act { font-size: 13px; padding: 10px 18px; }
    .td-meta { gap: 12px; }
    .td-mv { font-size: 13px; }

    .td-sheet { max-width: 640px; }
    .td-sh-body { padding: 22px 26px 28px; }
    .td-sh-hd { padding: 22px 26px; }

    .td-sec-title { font-size: 18px; }
    .td-sec-sub { font-size: 13px; }
    .td-tabs { margin-bottom: 20px; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const statusStyle = (s) => {
  const m = {
    pending:  { color: "#d97706", bg: "rgba(254,243,199,0.85)", border: "rgba(245,158,11,0.25)" },
    resolved: { color: "#059669", bg: "rgba(236,253,245,0.88)", border: "rgba(16,185,129,0.22)" },
    closed:   { color: "#6b7280", bg: "rgba(243,244,246,0.85)", border: "rgba(156,163,175,0.25)" },
    overdue:  { color: "#b91c1c", bg: "rgba(254,242,242,0.88)", border: "rgba(185,28,28,0.25)" },
  };
  return m[(s || "").toLowerCase().replace("_", "-")] || m.closed;
};

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

const ROLE_STYLE = {
  admin:      { label: "ADMIN",      color: "#6366f1", bg: "rgba(99,102,241,0.07)",  border: "rgba(99,102,241,0.15)",  tagBg: "rgba(99,102,241,0.12)"  },
  technician: { label: "TECHNICIAN", color: "#0d9488", bg: "rgba(13,148,136,0.07)",  border: "rgba(13,148,136,0.18)",  tagBg: "rgba(13,148,136,0.12)"  },
  engineer:   { label: "ENGINEER",   color: "#0ea5e9", bg: "rgba(14,165,233,0.06)",  border: "rgba(14,165,233,0.15)",  tagBg: "rgba(14,165,233,0.1)"   },
};

const fmtDt = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const TAB_MAP = { pending: ["PENDING"], overdue: ["OVERDUE"], resolved: ["RESOLVED"], closed: ["CLOSED"] };

/* ─────────────────────────────────────────────────────────────────────────────
   DESCRIPTION RENDERER
───────────────────────────────────────────────────────────────────────────── */
const Desc = ({ body = "" }) => {
  const sep = /\n\n--- Original complaint \(raised on (.+?)\) ---\n([\s\S]*)/;
  const m = body.match(sep);
  if (m) {
    const fu = body.replace(sep, "").replace(/^\[Follow-up\]\s*/, "").trim();
    return (
      <div>
        <div style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: "0.06em", textTransform: "uppercase" }}>Follow-up complaint</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.6, padding: "10px 12px", borderRadius: 11, background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.22)" }}>{fu}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", fontStyle: "italic" }}>Original · {m[1]}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, padding: "9px 12px", borderRadius: 11, background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", fontStyle: "italic" }}>{m[2].trim()}</div>
      </div>
    );
  }
  return <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{body}</div>;
};

/* ─────────────────────────────────────────────────────────────────────────────
   COMMENT SECTION
───────────────────────────────────────────────────────────────────────────── */
const Comments = ({ ticketId, role, uid }) => {
  const [list, setList]   = useState([]);
  const [load, setLoad]   = useState(true);
  const [body, setBody]   = useState("");
  const [sub, setSub]     = useState(false);
  const [eid, setEid]     = useState(null);
  const [eb,  setEb]      = useState("");
  const [esub, setEsub]   = useState(false);
  const BASE = `http://localhost:3000/api/${role}`;

  const reload = async () => {
    setLoad(true);
    try { const r = await fetch(`${BASE}/tickets/${ticketId}`, { credentials: "include" }); const d = await r.json(); if (r.ok) setList(d.ticket?.comments || []); }
    catch (e) { console.error(e); } finally { setLoad(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [ticketId]);
  useEffect(() => {
  subscribeToPush();
}, []);

  const post = async () => {
    if (!body.trim()) return; setSub(true);
    try { const r = await fetch(`${BASE}/tickets/${ticketId}/comments`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) }); const d = await r.json(); if (r.ok) { setList(p => [...p, d.comment]); setBody(""); } }
    catch (e) { console.error(e); } finally { setSub(false); }
  };
  const patch = async (id) => {
    if (!eb.trim()) return; setEsub(true);
    try { const r = await fetch(`${BASE}/tickets/${ticketId}/comments/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: eb }) }); const d = await r.json(); if (r.ok) { setList(p => p.map(c => c.id === id ? d.comment : c)); setEid(null); setEb(""); } }
    catch (e) { console.error(e); } finally { setEsub(false); }
  };
  const del = async (id) => {
    try { const r = await fetch(`${BASE}/tickets/${ticketId}/comments/${id}`, { method: "DELETE", credentials: "include" }); if (r.ok) setList(p => p.filter(c => c.id !== id)); }
    catch (e) { console.error(e); }
  };

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Comments</span>
        <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
      </div>
      {load ? <div style={{ textAlign: "center", padding: "14px 0", color: "#9ca3af", fontSize: 12 }}>Loading…</div>
        : list.length === 0 ? <div style={{ textAlign: "center", padding: "12px 0", color: "#9ca3af", fontSize: 12 }}>No comments yet.</div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
            {list.map(c => {
              const rs = ROLE_STYLE[c.authorRole] ?? ROLE_STYLE.engineer;
              const own = c.authorRole === role && c.authorId === uid;
              return (
                <div key={c.id} style={{ padding: "10px 12px", borderRadius: 14, background: rs.bg, border: `1px solid ${rs.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: rs.color, background: rs.tagBg, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em" }}>{rs.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{c.authorName}</span>
                      {c.authorDepartment && <span style={{ fontSize: 10, color: "#9ca3af" }}>· {c.authorDepartment}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDt(c.createdAt)}</span>
                      {own && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { setEid(c.id); setEb(c.body); }} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "rgba(13,148,136,0.1)", color: "#0d9488", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={10} /></button>
                          <button onClick={() => del(c.id)} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={10} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  {eid === c.id ? (
                    <div>
                      <textarea value={eb} onChange={e => setEb(e.target.value)} rows={1} style={{ width: "100%", padding: "8px 10px", borderRadius: 9, border: "1.5px solid rgba(13,148,136,0.3)", background: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "inherit", color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                      <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                        <button onClick={() => { setEid(null); setEb(""); }} style={{ padding: "5px 11px", borderRadius: 9, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
                        <button onClick={() => patch(c.id)} disabled={esub || !eb.trim()} style={{ padding: "5px 13px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#0d9488,#0ea5e9)", color: "white", fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", opacity: esub || !eb.trim() ? 0.6 : 1 }}>{esub ? "Saving…" : "Save"}</button>
                      </div>
                    </div>
                  ) : <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{c.body}</div>}
                  {c.updatedAt !== c.createdAt && eid !== c.id && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>edited {fmtDt(c.updatedAt)}</div>}
                </div>
              );
            })}
          </div>
        )}
      <div className="td-cc">
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment…" rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }} />
        <button className="td-cc-send" onClick={post} disabled={sub || !body.trim()}>
          <Send size={13} />{sub ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
const TechnicianDashboard = () => {
  const navigate = useNavigate();

  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setTab]       = useState("pending");
  const [sel, setSel]             = useState(null);
  const [prev, setPrev]           = useState(null);
  const [prevLoad, setPrevLoad]   = useState(false);
  const [info, setInfo]           = useState({ username: "", department: "", area: "" });
  const [uid, setUid]             = useState(null);
  const [profile, setProfile]     = useState(null);
  const [showProf, setShowProf]   = useState(false);

  const [showPw, setShowPw]       = useState(false);
  const [pwF, setPwF]             = useState({ current: "", newPw: "", confirm: "" });
  const [pwS, setPwS]             = useState({ current: false, newPw: false, confirm: false });
  const [pwLoad, setPwLoad]       = useState(false);
  const [pwErr, setPwErr]         = useState("");
  const [pwOk, setPwOk]           = useState(false);

  const [cConf, setCConf]         = useState(null);
  const [cRem, setCRem]           = useState("");
  const [closing, setClosing]     = useState(false);
  const [rConf, setRConf]         = useState(null);
  const [rRem, setRRem]           = useState("");
  const [resolving, setResolving] = useState(false);

  const [notifs, setNotifs]       = useState([]);
  const [showN, setShowN]         = useState(false);
  const [unread, setUnread]       = useState(0);

  const loadTickets = async () => {
    setLoading(true);
    try { const r = await fetch("http://localhost:3000/api/technician/tickets", { credentials: "include" }); const d = await r.json(); if (!r.ok) { CustomToast(d.message); return; } setTickets(d.tickets); console.log(d.tickets);}
    catch { CustomToast("Server error"); } finally { setLoading(false); }
  };
  const loadPrev = async (id) => {
    setPrevLoad(true);
    try { const r = await fetch(`http://localhost:3000/api/technician/tickets/${id}`, { credentials: "include" }); const d = await r.json(); if (!r.ok) { CustomToast(d.message); return; } setPrev(d.ticket); }
    catch { CustomToast("Server error"); } finally { setPrevLoad(false); }
  };

  useEffect(() => {
    (async () => { try { const r = await fetch("http://localhost:3000/api/technician/dashboard", { credentials: "include" }); const d = await r.json(); if (r.ok) { setInfo({ username: d.user?.username || "Technician", department: d.user?.department || "", area: d.user?.area || "" }); setUid(d.user?.id ?? null); } } catch (e) { console.error(e); } })();
    (async () => { try { const r = await fetch("http://localhost:3000/api/technician/profile", { credentials: "include" }); const d = await r.json(); if (r.ok) setProfile(d.technician); } catch (e) { console.error(e); } })();
    (async () => { try { const r = await fetch("http://localhost:3000/api/technician/notifications", { credentials: "include" }); const d = await r.json(); if (r.ok) { setNotifs(d.notifications); setUnread(d.notifications.filter(n => !n.isRead).length); } } catch (e) { console.error(e); } })();
    loadTickets();
    subscribeToPush();
  }, []);

  const openN = async () => {
    setShowN(true);
    try { await fetch("http://localhost:3000/api/technician/notifications/read", { method: "PATCH", credentials: "include" }); setUnread(0); setNotifs(p => p.map(n => ({ ...n, isRead: true }))); }
    catch (e) { console.error(e); }
  };

  const doResolve = async (id) => {
    if (resolving) return; setResolving(true);
    try { const r = await fetch(`http://localhost:3000/api/technician/tickets/${id}/resolve`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ remark: rRem }) }); const d = await r.json(); if (!r.ok) { CustomToast(d.message); return; } setTickets(p => p.map(t => t.id === id ? { ...t, status: "RESOLVED" } : t)); setRConf(null); setRRem(""); }
    catch { CustomToast("Server error"); } finally { setResolving(false); }
  };

  const doClose = async (id) => {
    if (closing) return; setClosing(true);
    try { const r = await fetch(`http://localhost:3000/api/technician/tickets/${id}/close`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ remark: cRem }) }); const d = await r.json(); if (!r.ok) { CustomToast(d.message); return; } setTickets(p => p.map(t => t.id === id ? { ...t, status: "CLOSED" } : t)); setCConf(null); setCRem(""); }
    catch { CustomToast("Server error"); } finally { setClosing(false); }
  };

  const logout = async () => {
    await unsubscribeFromPush();
    await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("token"); localStorage.removeItem("role");
    navigate("/LoginRoleSelect");
  };

  const resetPw = () => { setPwF({ current: "", newPw: "", confirm: "" }); setPwS({ current: false, newPw: false, confirm: false }); setPwErr(""); setPwOk(false); setShowPw(false); };

  const changePw = async () => {
    setPwErr("");
    if (!pwF.current || !pwF.newPw || !pwF.confirm) { setPwErr("All fields are required."); return; }
    if (pwF.newPw.length < 6) { setPwErr("New password must be at least 6 characters."); return; }
    if (pwF.newPw !== pwF.confirm) { setPwErr("New passwords do not match."); return; }
    if (pwF.current === pwF.newPw) { setPwErr("New password must differ from current password."); return; }
    setPwLoad(true);
    try { const r = await fetch("http://localhost:3000/api/technician/change-password", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pwF.current, newPassword: pwF.newPw }) }); const d = await r.json(); if (!r.ok) { setPwErr(d.message || "Failed to change password."); return; } setPwOk(true); setTimeout(() => resetPw(), 2200); }
    catch { setPwErr("Server error. Please try again."); } finally { setPwLoad(false); }
  };

  const closed   = tickets.filter(t => t.status === "CLOSED").length;
  const resolved = tickets.filter(t => t.status === "RESOLVED").length;
  const overdue  = tickets.filter(t => t.status === "OVERDUE").length;
  const pending  = tickets.filter(t => t.status === "PENDING").length;


  const TABS = [
    { id: "pending",  label: "Pending",  ct: pending  },
    { id: "overdue",  label: "Overdue",  ct: overdue  },
    { id: "resolved", label: "Resolved", ct: resolved },
    { id: "closed",   label: "Closed",   ct: closed   },
  ];  const filtered = tickets.filter(t => (TAB_MAP[activeTab] || []).includes(t.status))
  .slice()
  .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  const disp = prev ?? sel;

  const pwScore = [pwF.newPw.length >= 6, pwF.newPw.length >= 10, /[A-Z]/.test(pwF.newPw) || /[0-9]/.test(pwF.newPw), /[^a-zA-Z0-9]/.test(pwF.newPw)].filter(Boolean).length;
  const pwColors = ["#334155", "#475569", "#eab308", "#10b981"];
  const pwLbls   = ["", "Weak", "Fair", "Good", "Strong"];
  const pwInp    = { width: "100%", padding: "10px 10px 10px 36px", paddingRight: 36, borderRadius: 11, border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box" };

  return (
    <div className="td-page">
      <style>{CSS}</style>

      {/* bg blobs */}
      <div style={{ position: "fixed", width: 480, height: 480, borderRadius: "50%", background: "#6366f1", filter: "blur(120px)", opacity: 0.38, top: -110, left: -110, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "#0ea5e9", filter: "blur(120px)", opacity: 0.38, bottom: -100, right: -90, pointerEvents: "none", zIndex: 0 }} />

      {/* ══ HEADER ══ */}
      <header className="td-header">
        <div className="td-header-inner">
          <div className="td-header-left">
            <div className="td-avatar" onClick={() => { setShowProf(true); resetPw(); }}>
              <div className="td-avatar-body" />
              <div className="td-avatar-head" />
            </div>
            <div className="td-header-text">
              <div className="td-header-name">{info.username}</div>
              <div className="td-header-meta">
                <span className="td-dot" />
                <span>{info.department}{info.area ? ` · ${info.area}` : ""}</span>
              </div>
            </div>
          </div>

          <div className="td-header-right">
            <button className="td-bell" onClick={openN}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && <span className="td-badge">{unread > 9 ? "9+" : unread}</span>}
            </button>
            <button className="td-logout" onClick={logout}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="td-logout-lbl">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══ NOTIFICATIONS ══ */}
      {showN && (
        <div className="td-bk" onClick={() => setShowN(false)}>
          <div className="td-sheet" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="td-handle" />
            <div className="td-sh-hd" style={{ background: "linear-gradient(135deg,#4f69e7,#5a71e4)" }}>
              <div className="td-sh-hd-title">Notifications</div>
              <button className="td-sh-close" onClick={() => setShowN(false)}><X size={13} /></button>
            </div>
            <div className="td-sh-body">
              {notifs.length === 0
                ? <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af", fontSize: 13 }}>No notifications yet</div>
                : notifs.map(n => (
                  <div key={n.id} style={{ padding: "11px 13px", borderRadius: 13, background: n.isRead ? "rgba(0,0,0,0.02)" : "rgba(239,68,68,0.06)", border: n.isRead ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(239,68,68,0.18)", marginBottom: 7, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: n.isRead ? "rgba(0,0,0,0.05)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: n.isRead ? "#9ca3af" : "#dc2626" }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: "#111827", lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{new Date(n.createdAt).toLocaleString("en-IN")}</div>
                    </div>
                    {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f2261b", flexShrink: 0, marginTop: 3 }} />}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="td-content"> 

        {/* TABS */}
        <div className="td-tabs">
          {TABS.map(tab => {
            const act = activeTab === tab.id;
            const ov  = tab.id === "overdue";
            return (
              <button key={tab.id} className={`td-tab${act ? ` active${ov ? " ov" : ""}` : ""}`} onClick={() => setTab(tab.id)}>
                {tab.label}
                <span className={`td-tab-ct${!act && ov && tab.ct > 0 ? " ov-pill" : ""}`}>{tab.ct}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION HEADER */}
        <div className="td-sec-hd">
          <div>
            <div className="td-sec-title">{TABS.find(t => t.id === activeTab)?.label} Tickets</div>
            <div className="td-sec-sub">Showing {activeTab} tickets</div>
          </div>
          <span className="td-ct-pill">{filtered.length} {filtered.length === 1 ? "Ticket" : "Tickets"}</span>
        </div>

        {/* LOADING */}
        {loading && <div className="td-empty"><div style={{ fontSize: 14, color: "#6b7280" }}>Loading tickets…</div></div>}

        {/* EMPTY */}
     {!loading && filtered.map(t => {
  const ss = statusStyle(t.status);
  const isDone = t.status === "RESOLVED" || t.status === "CLOSED";
  const isRes  = t.status === "RESOLVED";
  const isCls  = t.status === "CLOSED";
  const statusKey = (t.status || "").toLowerCase().replace(/_/g, "-");
  return (
    <div key={t.id} className="atk-card" style={{ outline: t.isPriority ? "2px solid rgba(239,68,68,0.4)" : "none" }}>
      {t.isPriority && (
        <div className="atk-priority-banner">
          <svg width="11" height="11" fill="#dc2626" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", letterSpacing: "0.04em" }}>PRIORITY TICKET</span>
        </div>
      )}
      <div className="atk-body">
        <div className={`atk-icon ${statusKey}`}>
          {getStatusIcon(statusKey)}
        </div>
        <div className="atk-content">
          <div className="atk-top">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="atk-subject">{t.subject || "No Subject"}</div>
              <div className="atk-meta" style={{ marginTop: 3 }}>
                <span className="atk-meta-item">
                  <span>#{t.id}</span>
                  {t.prevId && <span className="td-fu-tag">Follow-up</span>}
                </span>
                {t.area && (
                  <span className="atk-meta-item">
                    <MapPin size={10} color="#9ca3af" />
                    {t.area}
                  </span>
                )}
                <span className="atk-meta-item">
                  <Calendar size={10} color="#9ca3af" />
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="atk-status-pill" style={{ color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>
              {t.status}
            </div>
          </div>
        </div>
      </div>
      <div className="td-acts">
        <button className="td-act td-act-view" onClick={() => { setPrev(null); setSel(t); }}><Eye size={13} /> View</button>
        <button className="td-act td-act-res" onClick={() => !isDone && setRConf(t)} disabled={isDone}><CheckCircle size={13} />{isRes ? "Resolved ✓" : "Resolve"}</button>
        <button className="td-act td-act-cls" onClick={() => !isDone && setCConf(t)} disabled={isDone}><X size={13} />{isCls ? "Closed ✓" : "Close"}</button>
      </div>
    </div>
  );
})}
      </div>

      {/* ══ VIEW DETAILS MODAL ══ */}
      {sel && (
        <div className="td-bk" onClick={() => { setSel(null); setPrev(null); }}>
          <div className="td-sheet" onClick={e => e.stopPropagation()}>
            <div className="td-handle" />
            <div className="td-sh-hd" style={{ background: prev ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "linear-gradient(135deg,#6366f1,#0ea5e9)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Wrench size={17} color="white" /></div>
                <div>
                  <div className="td-sh-hd-title">{prev ? "Previous Ticket" : "Ticket Details"}</div>
                  <div className="td-sh-hd-sub">{prev ? `Referenced by #${sel.id}` : "Full ticket information"}</div>
                </div>
              </div>
              <button className="td-sh-close" onClick={() => { setSel(null); setPrev(null); }}><X size={13} /></button>
            </div>
            <div className="td-sh-body">
              {prev && (
                <button onClick={() => setPrev(null)} style={{ marginBottom: 12, background: "none", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back to Ticket #{sel.id}
                </button>
              )}
              {!prev && sel.prevId && (
                <div className="td-fu-ban">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span style={{ fontSize: 13, color: "#374151" }}>Follow-up to <span style={{ fontWeight: 600, color: "#7c3aed" }}>Ticket #{sel.prevId}</span></span>
                  </div>
                  <button className="td-fu-ban-btn" onClick={() => loadPrev(sel.prevId)} disabled={prevLoad} style={{ opacity: prevLoad ? 0.7 : 1, cursor: prevLoad ? "wait" : "pointer" }}>
                    {prevLoad ? "Loading…" : <><Eye size={12} /> View Previous</>}
                  </button>
                </div>
              )}

              <div className="td-dg">
                {[
                  { l: "TICKET ID",      v: disp?.id,                                   s: false },
                  { l: "STATUS",         v: disp?.status,                               s: false },
                  { l: "SUBJECT",        v: disp?.subject,                              s: true  },
                  { l: "DEPARTMENT",     v: disp?.type,                                 s: false },
                  { l: "AREA",           v: disp?.area,                                 s: false },
                  { l: "LOCATION",       v: disp?.location || "—",                      s: false },
                  { l: "RAISED BY",      v: disp?.user?.username || "—",                s: false },
                  { l: "CONTACT",        v: disp?.phone || "—",                         s: false },
                  { l: "DATE",           v: disp ? new Date(disp.createdAt).toLocaleDateString() : "—", s: false },
                ].map((f, i) => (
                  <div key={i} className={`td-dc${f.s ? " s2" : ""}`}>
                    <div className="td-dc-l">{f.l}</div>
                    <div className="td-dc-v">{f.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "11px 13px", borderRadius: 13, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 7 }}>DETAILED DESCRIPTION</div>
                {disp && <Desc body={disp.body} />}
              </div>

              {disp?.imageUrl ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 6 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${disp.imageUrl}`} alt="ticket" style={{ width: "100%", borderRadius: 13, maxHeight: 220, objectFit: "cover" }} />
                </div>
              ) : null}

              {!prev && <Comments ticketId={sel.id} role="technician" uid={uid} />}

              <button onClick={() => { setSel(null); setPrev(null); }} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 15, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PROFILE MODAL ══ */}
      {showProf && profile && (
        <div className="td-bk" onClick={() => { setShowProf(false); resetPw(); }}>
          <div className="td-sheet" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="td-handle" />
            <div className="td-sh-hd" style={{ background: "linear-gradient(135deg,#6366f1,#0ea5e9)" }}>
              <div className="td-sh-hd-title">My Profile</div>
              <div className="td-sh-hd-sub">Your account details</div>
              <button className="td-sh-close" onClick={() => { setShowProf(false); resetPw(); }}><X size={13} /></button>
            </div>
            <div className="td-sh-body">
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 700, margin: "0 auto 10px", boxShadow: "0 5px 18px rgba(99,102,241,0.35)" }}>
                  {(profile.username || "T").charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{profile.username}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{profile.department} · {profile.area}</div>
              </div>
              {[{ l: "EMAIL", v: profile.email }, { l: "DEPARTMENT", v: profile.department }, { l: "AREA", v: profile.area }].map((f, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 13, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 7 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 3 }}>{f.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.v}</div>
                </div>
              ))}

              {/* Change PW */}
              <div style={{ marginTop: 12, borderRadius: 14, border: "1.5px solid rgba(99,102,241,0.18)", overflow: "hidden" }}>
                <button onClick={() => { setShowPw(v => !v); setPwErr(""); setPwOk(false); }} style={{ width: "100%", padding: "12px 13px", background: showPw ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.04)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={12} color="white" /></div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Change Password</span>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ transform: showPw ? "rotate(180deg)" : "none", transition: "transform 0.25s", flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPw && (
                  <div style={{ padding: "14px 13px", borderTop: "1px solid rgba(99,102,241,0.12)", background: "rgba(255,255,255,0.55)" }}>
                    {pwOk ? (
                      <div style={{ textAlign: "center", padding: "12px 0" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px" }}><CheckCircle size={22} color="#059669" /></div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#059669", marginBottom: 3 }}>Password Updated!</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Changed successfully.</div>
                      </div>
                    ) : (
                      <>
                        {pwErr && (
                          <div style={{ marginBottom: 10, padding: "8px 11px", borderRadius: 10, background: "rgba(100,116,139,0.07)", border: "1px solid rgba(100,116,139,0.18)", display: "flex", alignItems: "center", gap: 7 }}>
                            <AlertTriangle size={12} color="#334155" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#334155" }}>{pwErr}</span>
                          </div>
                        )}
                        {[
                          { k: "current", lbl: "Current Password",     ph: "Enter current password" },
                          { k: "newPw",   lbl: "New Password",         ph: "At least 6 characters"  },
                          { k: "confirm", lbl: "Confirm New Password", ph: "Re-enter new password"  },
                        ].map(({ k, lbl, ph }) => (
                          <div key={k} style={{ marginBottom: 10 }}>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#374151", marginBottom: 4 }}>{lbl}</label>
                            <div className="td-pw-wrap">
                              <span className="td-pw-ico"><KeyRound size={12} /></span>
                              <input type={pwS[k] ? "text" : "password"} value={pwF[k]} onChange={e => setPwF(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={pwInp} disabled={pwLoad} onKeyDown={e => e.key === "Enter" && changePw()} />
                              <button type="button" className="td-pw-eye" onClick={() => setPwS(p => ({ ...p, [k]: !p[k] }))}>{pwS[k] ? <EyeOff size={12} /> : <EyeIcon size={12} />}</button>
                            </div>
                            {k === "newPw" && pwF.newPw && (
                              <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                                {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= pwScore ? pwColors[pwScore - 1] : "rgba(0,0,0,0.08)", transition: "background 0.3s" }} />)}
                                <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 3, minWidth: 26 }}>{pwLbls[pwScore]}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="td-pw-row">
                          <button onClick={resetPw} disabled={pwLoad} style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", color: "#374151" }}>Cancel</button>
                          <button onClick={changePw} disabled={pwLoad} style={{ border: "none", background: pwLoad ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: pwLoad ? "none" : "0 4px 12px rgba(99,102,241,0.28)" }}>
                            {pwLoad
                              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "td-spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Updating…</>
                              : <><KeyRound size={11} />Update</>}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => { setShowProf(false); resetPw(); }} style={{ width: "100%", marginTop: 12, padding: "11px", borderRadius: 15, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CONFIRM RESOLVE ══ */}
      {rConf && (
        <div className="td-bk" onClick={() => { setRConf(null); setRRem(""); }}>
          <div className="td-conf" onClick={e => e.stopPropagation()}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#059669" }}><CheckCircle size={24} /></div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 5 }}>Mark as Resolved?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 3 }}>Resolving ticket</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#059669", marginBottom: 14 }}>#{rConf.id} — {rConf.subject}</div>
            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, letterSpacing: "0.03em" }}>REMARK <span style={{ fontWeight: 400, color: "#9ca3af" }}>(sent to user)</span></label>
              <textarea value={rRem} onChange={e => setRRem(e.target.value)} placeholder="e.g. The issue has been fixed." rows={3} style={{ width: "100%", padding: "9px 11px", borderRadius: 12, resize: "vertical", border: "1.5px solid rgba(16,185,129,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = "rgba(16,185,129,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(16,185,129,0.2)"} />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>User will be notified via email.</div>
            <div className="td-conf-btns">
              <button onClick={() => { setRConf(null); setRRem(""); }} style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", color: "#374151" }}>Cancel</button>
              <button onClick={() => doResolve(rConf.id)} disabled={resolving} style={{ border: "none", background: resolving ? "#94a3b8" : "linear-gradient(135deg,#10b981,#059669)", color: "white", cursor: resolving ? "not-allowed" : "pointer", opacity: resolving ? 0.75 : 1, boxShadow: resolving ? "none" : "0 5px 15px rgba(16,185,129,0.28)" }}>
                {resolving ? "Resolving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CONFIRM CLOSE ══ */}
      {cConf && (
        <div className="td-bk" onClick={() => { setCConf(null); setCRem(""); }}>
          <div className="td-conf" onClick={e => e.stopPropagation()}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#dc2626" }}><AlertTriangle size={24} /></div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 5 }}>Close Ticket?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 3 }}>Closing ticket</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 14 }}>#{cConf.id} — {cConf.subject}</div>
            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, letterSpacing: "0.03em" }}>REMARK <span style={{ fontWeight: 400, color: "#9ca3af" }}>(sent to user)</span></label>
              <textarea value={cRem} onChange={e => setCRem(e.target.value)} placeholder="e.g. Issue does not fall under our department." rows={3} style={{ width: "100%", padding: "9px 11px", borderRadius: 12, resize: "vertical", border: "1.5px solid rgba(99,102,241,0.2)", background: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.2)"} />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>This action cannot be undone.</div>
            <div className="td-conf-btns">
              <button onClick={() => { setCConf(null); setCRem(""); }} style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", color: "#374151" }}>Cancel</button>
              <button onClick={() => doClose(cConf.id)} disabled={closing} style={{ border: "none", background: closing ? "#94a3b8" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", cursor: closing ? "not-allowed" : "pointer", opacity: closing ? 0.75 : 1, boxShadow: closing ? "none" : "0 5px 15px rgba(239,68,68,0.28)" }}>
                {closing ? "Closing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;