import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { unsubscribeFromPush } from '../../utils/pushNotifications';
import CustomToast from "../../components/CustomToast";
import { Clock, Activity, CheckCircle, Calendar, Eye } from "lucide-react";

/* ─── inject responsive CSS once ─── */
const RESPONSIVE_CSS = `
  *,*::before,*::after{box-sizing:border-box;}

  .ud-header-inner{
    max-width:1280px;margin:0 auto;padding:0 20px;
    height:64px;display:flex;justify-content:space-between;align-items:center;gap:10px;
  }
  .ud-profile-btn{
    display:flex;align-items:center;gap:10px;
    background:none;border:none;cursor:pointer;
    padding:6px 8px 6px 6px;border-radius:40px;
    transition:background 0.18s;flex-shrink:0;max-width:calc(100vw - 120px);
  }
  .ud-profile-btn:hover{background:rgba(99,102,241,0.07);}
  .ud-profile-name{font-size:14px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;}
  .ud-profile-sub{font-size:11px;font-weight:400;color:#6B7280;display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;}
  .ud-logout-btn{
    padding:9px 16px;border-radius:16px;border:1.5px solid rgba(0,0,0,0.08);
    background:rgba(255,255,255,0.7);font-size:13px;font-weight:500;
    font-family:inherit;color:#374151;cursor:pointer;
    display:flex;align-items:center;gap:5px;flex-shrink:0;white-space:nowrap;
  }

  .ud-main{max-width:1280px;margin:0 auto;padding:24px 16px;position:relative;z-index:1;}
  @media(min-width:640px){.ud-main{padding:28px 24px;}}
  @media(min-width:1024px){.ud-main{padding:32px 32px;}}

  /* TABS */
  .ud-tabs{
    display:flex;gap:6px;margin-bottom:24px;padding:6px;border-radius:22px;
    backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);
    background:rgba(255,255,255,0.55);
    box-shadow:0 8px 32px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.8);
    width:100%;overflow-x:auto;
  }
  .ud-tab-btn{
    padding:9px 14px;border-radius:14px;border:none;
    font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;
    display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;
    transition:background 0.18s,color 0.18s,box-shadow 0.18s;
  }
  @media(min-width:400px){.ud-tab-btn{padding:10px 18px;font-size:13px;}}
  @media(min-width:640px){.ud-tab-btn{padding:10px 22px;font-size:13px;}}

  /* RAISE TICKET CARD */
  .ud-raise-card{border-radius:28px;backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);background:rgba(255,255,255,0.6);box-shadow:0 16px 48px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.8);padding:22px 16px;width:100%;}
  @media(min-width:480px){.ud-raise-card{padding:28px 24px;}}
  @media(min-width:768px){.ud-raise-card{padding:36px 40px;max-width:780px;}}

  /* ── COMPACT TICKET CARD ── */
  .atk-card {
    border-radius: 16px; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.65); box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    overflow: hidden; margin-bottom: 12px; border: 1.5px solid transparent;
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
  .ud-fu-tag { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; color: #7c3aed; background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.18); margin-left: 6px; }
  .atk-view-btn {
    padding: 6px 13px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#6366f1,#0ea5e9); color: white;
    font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer;
    display: flex; align-items: center; gap: 4px;
    box-shadow: 0 3px 10px rgba(99,102,241,0.28); white-space: nowrap;
    flex-shrink: 0; margin-top: 2px;
  }
  @media(min-width:640px){ .atk-view-btn { font-size: 12px; padding: 7px 15px; } }

  @media(min-width:640px){
    .atk-card { border-radius: 18px; margin-bottom: 14px; }
    .atk-body { padding: 14px 18px; gap: 12px; }
    .atk-icon { width: 38px; height: 38px; border-radius: 11px; }
    .atk-subject { font-size: 14px; }
    .atk-meta-item { font-size: 12px; }
  }
  @media(min-width:1024px){
    .atk-body { padding: 16px 22px; }
    .atk-subject { font-size: 15px; }
  }

  /* NAME + PHONE GRID */
  .ud-name-phone-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:18px;}
  @media(min-width:540px){.ud-name-phone-grid{grid-template-columns:1fr 1fr;}}

  /* TICKET DETAIL GRID */
  .ud-detail-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px;}
  @media(min-width:480px){.ud-detail-grid{grid-template-columns:1fr 1fr;}}

  /* RESOLVED BUTTONS */
  .ud-resolved-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;}
  .ud-resolved-btns button{flex:1 1 calc(33% - 8px);min-width:100px;display:flex;align-items:center;justify-content:center;gap:6px;}
  @media(max-width:400px){.ud-resolved-btns button{flex:1 1 100%;}}

  /* MODAL */
  .ud-modal-wrap{position:fixed;inset:0;background:rgba(0,0,0,0.25);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
  .ud-modal-box{
    width:100%;max-width:92vw;border-radius:20px;
    overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.18);
    background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
    max-height:72vh;display:flex;flex-direction:column;
  }
  @media(min-width:600px){
    .ud-modal-box{border-radius:32px;max-width:660px;max-height:88vh;}
  }
  .ud-modal-body{overflow-y:auto;padding:20px 18px 24px;flex:1;}
  @media(min-width:480px){.ud-modal-body{padding:24px 28px 28px;}}

  /* Profile modal slightly smaller */
  .ud-profile-modal-box{
    width:100%;max-width:92vw;border-radius:20px;
    overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.18);
    background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
    max-height:72vh;display:flex;flex-direction:column;
  }
  @media(min-width:600px){
    .ud-profile-modal-box{border-radius:32px;max-width:480px;max-height:88vh;}
  }
  .ud-profile-modal-body{overflow-y:auto;padding:20px 18px 24px;flex:1;}
  @media(min-width:480px){.ud-profile-modal-body{padding:24px 28px 28px;}}

  /* Followup modal */
  .ud-followup-modal-box{
    width:100%;max-width:92vw;border-radius:20px;
    overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.18);
    background:rgba(255,255,255,0.97);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
    max-height:72vh;display:flex;flex-direction:column;
  }
  @media(min-width:600px){
    .ud-followup-modal-box{border-radius:32px;max-width:580px;max-height:88vh;}
  }
  .ud-followup-modal-body{overflow-y:auto;padding:20px 18px 24px;flex:1;}
  @media(min-width:480px){.ud-followup-modal-body{padding:24px 28px 28px;}}

  /* Followup info grid */
  .ud-followup-info-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:18px;}
  @media(min-width:400px){.ud-followup-info-grid{grid-template-columns:1fr 1fr;}}

  /* Pending/Resolved header row */
  .ud-list-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:20px;}

  /* Ticket card header row */
  .ud-ticket-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;}
  .ud-ticket-subject{font-size:16px;font-weight:600;color:#111827;margin-bottom:6px;word-break:break-word;}
  @media(min-width:480px){.ud-ticket-subject{font-size:17px;}}

  /* Modal bottom action buttons */
  .ud-modal-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .ud-modal-actions button{flex:1 1 120px;}

  /* Pagination */
  .ud-pagination {
    display: flex; align-items: center; justify-content: space-between; margin-top: 12px;
    padding: 14px 18px; border-radius: 18px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.55); box-shadow: 0 8px 24px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.7);
    flex-wrap: wrap; gap: 10px;
  }
  @media (max-width: 520px) {
    .ud-pagination { justify-content: center; padding: 12px 14px; }
    .ud-pagination-label { display: none; }
  }

  /* Scrollbar slim */
  .ud-modal-body::-webkit-scrollbar,.ud-profile-modal-body::-webkit-scrollbar,.ud-followup-modal-body::-webkit-scrollbar{width:4px;}
  .ud-modal-body::-webkit-scrollbar-thumb,.ud-profile-modal-body::-webkit-scrollbar-thumb,.ud-followup-modal-body::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.25);border-radius:4px;}
`;

function injectStyle(id, css) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

const glassCard = {
  borderRadius: 28,
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  background: "rgba(255,255,255,0.6)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const UserDashboard = () => {
  injectStyle("ud-responsive", RESPONSIVE_CSS);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("raise");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [prevTicket, setPrevTicket] = useState(null);
  const [prevTicketLoading, setPrevTicketLoading] = useState(false);

  const [followupTicket, setFollowupTicket] = useState(null);
  const [followupForm, setFollowupForm] = useState({ title: "", description: "" });

  const [formData, setFormData] = useState({ title: "", department: "", description: "", area: "", location: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const TICKETS_PER_PAGE = 10;

  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [phoneUpdateMsg, setPhoneUpdateMsg] = useState(null);

  const [ticketPhone, setTicketPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setTicketPhone(phone); }, [phone]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/user/profile", { credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { console.error("Profile parse error:", text); return; }
      if (!res.ok) { console.error(data.message); return; }
      setUsername(data.user.username);
      setEmail(data.user.email);
      setPhone(data.user.phone || "");
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);
    } catch (err) {
      console.error(err);
      setUsername(localStorage.getItem("username"));
      setEmail(localStorage.getItem("email"));
    } finally { setProfileLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone.length < 10) { setPhoneUpdateMsg({ type: "error", text: "Please enter a valid 10-digit mobile number." }); return; }
    setPhoneUpdateLoading(true); setPhoneUpdateMsg(null);
    try {
      const res = await fetch("http://localhost:3000/api/user/profile/phone", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { setPhoneUpdateMsg({ type: "error", text: "Invalid server response." }); return; }
      if (!res.ok) { setPhoneUpdateMsg({ type: "error", text: data.message }); return; }
      setPhone(newPhone); setTicketPhone(newPhone); setEditingPhone(false); setNewPhone("");
      setPhoneUpdateMsg({ type: "success", text: "Mobile number updated successfully!" });
    } catch (err) { console.error(err); setPhoneUpdateMsg({ type: "error", text: "Server error. Please try again." }); }
    finally { setPhoneUpdateLoading(false); }
  };

  const fetchTickets = async (status, page = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/api/user/tickets?page=${page}`;
      if (status) url += "&status=" + status;
      const res = await fetch(url, { credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Invalid server response while fetching tickets."); return; }
      if (!res.ok) { CustomToast(data.message); return; }
      setTickets(data.tickets);
      setTotalTickets(data.pagination?.totalTickets || 0);
    } catch (err) { console.error(err); CustomToast("Server error"); }
    finally { setLoading(false); }
  };

  const totalPages = Math.ceil(totalTickets / TICKETS_PER_PAGE) || 1;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchTickets(activeTab.toUpperCase(), page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const fetchTicketById = async (id) => {
    setPrevTicketLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/user/tickets/${id}`, { credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Invalid server response."); return; }
      if (!res.ok) { CustomToast(data.message); return; }
      setPrevTicket(data.ticket);
    } catch (err) { console.error(err); CustomToast("Server error"); }
    finally { setPrevTicketLoading(false); }
  };

  const closeModal = () => { setSelectedTicket(null); setPrevTicket(null); };
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitTicket = async () => {
    if (submitting) return;
    if (!formData.title || !formData.department || !formData.description || !formData.area || !formData.location) { CustomToast("All fields are required!"); return; }
    if (!ticketPhone || ticketPhone.length < 10) { CustomToast("Please enter a valid 10-digit mobile number!"); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("type", formData.department); fd.append("subject", formData.title);
      fd.append("body", formData.description); fd.append("area", formData.area);
      fd.append("location", formData.location); fd.append("phone", ticketPhone);
      if (selectedImage) fd.append("image", selectedImage);
      const res = await fetch("http://localhost:3000/api/user/raise", { method: "POST", credentials: "include", body: fd });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Invalid server response."); return; }
      if (!res.ok) { CustomToast(data.message); return; }
      CustomToast("Ticket raised successfully!", "green");
      setFormData({ title: "", department: "", description: "", area: "", location: "" });
      setSelectedImage(null); setImagePreview(null);
    } catch (err) { console.error(err); CustomToast("Server error"); }
    finally { setSubmitting(false); }
  };

  const handleCancelTicket = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/user/tickets/${id}/cancel`, { method: "DELETE", credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Invalid server response."); return; }
      if (!res.ok) { CustomToast(data.message); return; }
      CustomToast("Ticket cancelled successfully!", "green");
      closeModal(); fetchTickets("PENDING", currentPage);
    } catch (err) { console.error(err); CustomToast("Server error"); }
  };

  const handleSatisfied = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/user/tickets/${ticketId}/satisfied`, { method: "PUT", credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Server error: unexpected response."); return; }
      if (!res.ok) { CustomToast(data.message); return; }
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, satisfied: true } : t));
    } catch (err) { console.error(err); CustomToast("Server error"); }
  };

  const handleSubmitFollowup = async () => {
    if (!followupForm.title || !followupForm.description) { CustomToast("All fields are required!"); return; }
    try {
      const response = await fetch(`http://localhost:3000/api/user/followup/${followupTicket.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: followupForm.title, body: followupForm.description }),
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { CustomToast("Invalid server response."); return; }
      if (!response.ok) { CustomToast(data.message); return; }
      CustomToast("Follow-up submitted! Ticket has been reopened.", "green");
      setFollowupTicket(null); setFollowupForm({ title: "", description: "" });
      fetchTickets("RESOLVED", currentPage);
    } catch (err) { console.error(err); CustomToast("Server error"); }
  };

  const handleLogout = async () => {
    await unsubscribeFromPush();
    try {
      await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("token"); localStorage.removeItem("role");
      navigate("/LoginRoleSelect");
    } catch (err) { console.error("Logout error:", err); }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.09)",
    background: "rgba(255,255,255,0.9)", fontSize: 14,
    fontFamily: "inherit", color: "#111827", outline: "none",
    boxSizing: "border-box", display: "block",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const focusStyle = (e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 5px rgba(99,102,241,0.15)"; };
  const blurStyle = (e) => { e.target.style.borderColor = "rgba(0,0,0,0.09)"; e.target.style.boxShadow = "none"; };

  const tabs = [
    { id: "raise", label: "Raise Ticket", iconPath: "M12 4v16m8-8H4" },
    { id: "pending", label: "Pending", iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "resolved", label: "Resolved", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const AREAS = [
    "Hostels", "KV School", "Abhinandhan Bhavan", "Academic Block",
    "Library", "Sports Complex", "Guest House", "Faculty Quarters",
    "Admin Block", "Cafeteria"
  ];

  const complaintOptions = {
    Civil: [
      "Carpentry",
      "Plumbing",
      "Mason Work"
    ],
    Electrical: [
      "Switch & Socket",
      "Tubelight",
      "Power Board",
      "Hot Water",
      "Fan",
      "Street Light",
      "Lift"
    ],
    HVAC: [
      "Split AC",
      "Central AC"
    ]
  };

  const displayedTicket = prevTicket ?? selectedTicket;
  const initials = username ? username.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.65, padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.22)" }}>{followupText}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", fontStyle: "italic" }}>Original complaint · {originalDate}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, padding: "10px 14px", borderRadius: 12, background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", fontStyle: "italic" }}>{originalText}</div>
        </div>
      );
    }
    return <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{body}</div>;
  };

  /* ── Modal backdrop shared style ── */
  const modalBackdrop = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 200,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#111827", position: "relative", overflowX: "hidden" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "#6366f1", filter: "blur(110px)", opacity: 0.4, top: -100, left: -100, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 360, height: 360, borderRadius: "50%", background: "#0ea5e9", filter: "blur(110px)", opacity: 0.4, bottom: -120, right: -80, pointerEvents: "none", zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)", background: "rgba(255,255,255,0.55)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
        <div className="ud-header-inner">

          {/* Profile button */}
          <button
            className="ud-profile-btn"
            onClick={() => { setShowProfileModal(true); setEditingPhone(false); setPhoneUpdateMsg(null); setNewPhone(""); }}
            title="View Profile"
          >
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.35)", flexShrink: 0, position: "relative" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{initials}</span>
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#10b981", border: "2px solid white" }} />
            </div>
            <div style={{ textAlign: "left", overflow: "hidden" }}>
              <div className="ud-profile-name">{username || "—"}</div>
              <div className="ud-profile-sub">
                {phone
                  ? <><svg width="11" height="11" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{phone}</>
                  : <><span style={{ color: "#f59e0b" }}>⚠</span> Add phone</>
                }
              </div>
            </div>
            <svg width="13" height="13" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ marginLeft: 2, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Logout */}
          <button onClick={handleLogout} className="ud-logout-btn">
            <span style={{ display: "none" }} className="ud-logout-label">Logout</span>
            <span style={{ display: "block" }}>
              {/* Show text on wider screens via CSS trick — we'll always show the icon, label shown via span */}
              Logout
            </span>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="ud-main">

        {/* ── TABS ── */}
        <div className="ud-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="ud-tab-btn"
              onClick={() => {
                if (tab.id === "pending") fetchTickets("PENDING");
                if (tab.id === "resolved") fetchTickets("RESOLVED");
                setActiveTab(tab.id);
              }}
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "transparent",
                color: activeTab === tab.id ? "white" : "#6b7280",
                boxShadow: activeTab === tab.id ? "0 8px 24px rgba(99,102,241,0.3)" : "none",
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.iconPath} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── RAISE TICKET ── */}
        {activeTab === "raise" && (
          <div className="ud-raise-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.35)", flexShrink: 0 }}>
                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Raise a New Ticket</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Fill in the details below to submit your request</div>
              </div>
            </div>

            {/* Name + Phone */}
            <div className="ud-name-phone-grid">
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>
                  Your Name
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: "#9ca3af", background: "rgba(99,102,241,0.08)", borderRadius: 20, padding: "2px 8px" }}>auto-filled</span>
                </label>
                <div style={{ ...inputStyle, background: "rgba(243,244,246,0.9)", color: "#6b7280", cursor: "not-allowed", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {username || "—"}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>
                  Mobile Number
                  {phone && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: "#9ca3af", background: "rgba(99,102,241,0.08)", borderRadius: 20, padding: "2px 8px" }}>auto-filled</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel" value={ticketPhone}
                    onChange={e => setTicketPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number" maxLength={10}
                    style={{ ...inputStyle, paddingRight: phone ? 44 : 16 }}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  {phone && ticketPhone === phone && (
                    <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                      <svg width="16" height="16" fill="#10b981" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>
                {!phone && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" fill="none" stroke="#f59e0b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                    Save in <button onClick={() => { setShowProfileModal(true); setEditingPhone(true); setPhoneUpdateMsg(null); setNewPhone(""); }} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>profile</button> for auto-fill
                  </div>
                )}
              </div>
            </div>

            {/* Department */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>Department</label>
              <select name="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value, title: "" })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select Department</option>
                <option>Civil</option><option>Electrical</option><option>HVAC</option>
              </select>
            </div>

            {/* Complaint Title */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: "#374151"
                }}
              >
                Subject
              </label>

              <select
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value
                  })
                }
                disabled={!formData.department}
                style={{
                  ...inputStyle,
                  cursor: formData.department ? "pointer" : "not-allowed",
                  background: formData.department ? "#fff" : "#f3f4f6",
                  color: formData.department ? "#111827" : "#9ca3af"
                }}
              >
                {!formData.department ? (
                  <option value="">Select a department first</option>
                ) : (
                  <>
                    <option value="">Select Subject</option>
                    {complaintOptions[formData.department].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide detailed information about the issue..." rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 100, height: "auto" }} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Area */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>Area</label>
              <select name="area" value={formData.area} onChange={handleInputChange} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select Area</option>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>Location</label>
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Block B, Room 204" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>
                Attach Image <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <div
                style={{ border: "1.5px dashed rgba(99,102,241,0.3)", borderRadius: 18, padding: "18px 14px", textAlign: "center", background: "rgba(99,102,241,0.04)", cursor: "pointer", position: "relative" }}
                onClick={() => document.getElementById("ticketImageInput").click()}
              >
                <input id="ticketImageInput" type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setSelectedImage(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                />
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="preview" style={{ maxHeight: 140, borderRadius: 12, marginBottom: 8, maxWidth: "100%", objectFit: "cover" }} />
                    <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 500, wordBreak: "break-all" }}>{selectedImage?.name}</div>
                    <button type="button" onClick={e => { e.stopPropagation(); setSelectedImage(null); setImagePreview(null); }} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(30,41,59,0.2)", background: "rgba(100,116,139,0.08)", color: "#1e293b", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <svg width="28" height="28" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ margin: "0 auto 8px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Tap to upload an image</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>JPG, PNG, GIF up to 5MB</div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitTicket} disabled={submitting}
              style={{ width: "100%", padding: "15px", borderRadius: 30, border: "none", background: submitting ? "linear-gradient(135deg,#94a3b8,#cbd5e1)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 15, fontWeight: 500, fontFamily: "inherit", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "0 10px 30px rgba(148,163,184,0.25)" : "0 16px 48px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.85 : 1, transition: "all 0.2s ease" }}
            >
              {submitting ? "Submitting..." : <>Submit Ticket<svg width="17" height="17" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
            </button>
          </div>
        )}

        {/* ── PENDING TICKETS ── */}
        {activeTab === "pending" && (
          <div>
            <div className="ud-list-header">
              <div>
                <div style={{ fontSize: 19, fontWeight: 600, color: "#111827" }}>Pending Complaints</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Track your open service requests</div>
              </div>
              <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#d97706", background: "rgba(254,243,199,0.85)", border: "1px solid rgba(245,158,11,0.25)", flexShrink: 0 }}>{tickets.length} Active</span>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Loading tickets...</div>}
            {!loading && tickets.length === 0 && (
              <div style={{ ...glassCard, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No Pending Tickets</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>You have no pending service requests.</div>
              </div>
            )}
            {!loading && tickets.map((ticket) => (
              <div key={ticket.id} className="atk-card">
                <div className="atk-body">
                  <div className="atk-icon pending">
                    <Clock size={16} />
                  </div>
                  <div className="atk-content">
                    <div className="atk-top">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="atk-subject">
                          {ticket.subject}
                          {ticket.prevId && <span className="ud-fu-tag">Follow-up</span>}
                        </div>
                        <div className="atk-meta" style={{ marginTop: 4 }}>
                          <span className="atk-meta-item">
                            <Activity size={12} color="#9ca3af" />
                            {ticket.type}
                          </span>
                          <span className="atk-meta-item">
                            <Calendar size={12} color="#9ca3af" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <div className="atk-status-pill" style={{ color: "#d97706", background: "rgba(254,243,199,0.85)", border: "1px solid rgba(245,158,11,0.25)" }}>
                          Pending
                        </div>
                        <button className="atk-view-btn" onClick={() => { setPrevTicket(null); setSelectedTicket(ticket); }}>
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination for Pending */}
            {totalPages > 1 && tickets.length > 0 && (
              <div className="ud-pagination">
                <div className="ud-pagination-label" style={{ fontSize: 12, color: "#6b7280" }}>
                  Page <span style={{ fontWeight: 600, color: "#111827" }}>{currentPage}</span> of{" "}
                  <span style={{ fontWeight: 600, color: "#111827" }}>{totalPages}</span>
                  {" "}— <span style={{ fontWeight: 600, color: "#111827" }}>{totalTickets}</span> tickets
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(0,0,0,0.08)", background: currentPage === 1 ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af" }}>…</span>
                    ) : (
                      <button key={page} onClick={() => handlePageChange(page)} style={{ width: 34, height: 34, borderRadius: 11, border: currentPage === page ? "none" : "1px solid rgba(0,0,0,0.08)", background: currentPage === page ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(255,255,255,0.8)", color: currentPage === page ? "white" : "#374151", fontSize: 12, fontWeight: currentPage === page ? 700 : 500, cursor: "pointer", fontFamily: "inherit", boxShadow: currentPage === page ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                        {page}
                      </button>
                    )
                  )}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(0,0,0,0.08)", background: currentPage === totalPages ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESOLVED TICKETS ── */}
        {activeTab === "resolved" && (
          <div>
            <div className="ud-list-header">
              <div>
                <div style={{ fontSize: 19, fontWeight: 600, color: "#111827" }}>Resolved Complaints</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Review completed service requests</div>
              </div>
              <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#059669", background: "rgba(236,253,245,0.88)", border: "1px solid rgba(16,185,129,0.22)", flexShrink: 0 }}>{tickets.length} Completed</span>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Loading tickets...</div>}
            {!loading && tickets.length === 0 && (
              <div style={{ ...glassCard, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No Resolved Tickets</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>You have no resolved service requests yet.</div>
              </div>
            )}
            {!loading && tickets.map((ticket) => {
              const bg = ticket.satisfied ? "rgba(236,253,245,0.75)" : "rgba(255,255,255,0.65)";
              const bcolor = ticket.satisfied ? "rgba(16,185,129,0.4)" : "transparent";
              return (
                <div key={ticket.id} className="atk-card" style={{ background: bg, borderColor: bcolor }}>
                  <div className="atk-body">
                    <div className="atk-icon resolved" style={{ background: ticket.satisfied ? "linear-gradient(135deg,#10b981,#34d399)" : "" }}>
                      <CheckCircle size={16} />
                    </div>
                    <div className="atk-content">
                      <div className="atk-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="atk-subject">
                            {ticket.subject}
                            {ticket.prevId && <span className="ud-fu-tag">Follow-up</span>}
                          </div>
                          <div className="atk-meta" style={{ marginTop: 4 }}>
                            <span className="atk-meta-item">
                              <Activity size={12} color="#9ca3af" />
                              {ticket.type}
                            </span>
                            <span className="atk-meta-item">
                              <Calendar size={12} color="#9ca3af" />
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                          <div className="atk-status-pill" style={{ color: "#059669", background: "rgba(236,253,245,0.88)", border: "1px solid rgba(16,185,129,0.22)" }}>
                            {ticket.satisfied ? "Satisfied ✓" : "Resolved"}
                          </div>
                          <button
                            className="atk-view-btn"
                            style={ticket.satisfied ? { background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 3px 10px rgba(16,185,129,0.28)" } : {}}
                            onClick={() => { setPrevTicket(null); setSelectedTicket(ticket); }}
                          >
                            <Eye size={11} /> View
                          </button>
                        </div>
                      </div>
                      {/* Extra action buttons for unresolved tickets */}
                      {!ticket.satisfied && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <button onClick={() => handleSatisfied(ticket.id)} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.18)", background: "rgba(16,185,129,0.10)", color: "#059669", fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                            <CheckCircle size={12} /> Satisfied
                          </button>
                          <button onClick={() => { setFollowupTicket(ticket); setFollowupForm({ title: "", description: "" }); }} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid rgba(100,116,139,0.2)", background: "rgba(100,116,139,0.08)", color: "#1e293b", fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                            <Activity size={12} /> Follow-up
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination for Resolved */}
            {totalPages > 1 && tickets.length > 0 && (
              <div className="ud-pagination">
                <div className="ud-pagination-label" style={{ fontSize: 12, color: "#6b7280" }}>
                  Page <span style={{ fontWeight: 600, color: "#111827" }}>{currentPage}</span> of{" "}
                  <span style={{ fontWeight: 600, color: "#111827" }}>{totalPages}</span>
                  {" "}— <span style={{ fontWeight: 600, color: "#111827" }}>{totalTickets}</span> tickets
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(0,0,0,0.08)", background: currentPage === 1 ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af" }}>…</span>
                    ) : (
                      <button key={page} onClick={() => handlePageChange(page)} style={{ width: 34, height: 34, borderRadius: 11, border: currentPage === page ? "none" : "1px solid rgba(0,0,0,0.08)", background: currentPage === page ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(255,255,255,0.8)", color: currentPage === page ? "white" : "#374151", fontSize: 12, fontWeight: currentPage === page ? 700 : 500, cursor: "pointer", fontFamily: "inherit", boxShadow: currentPage === page ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                        {page}
                      </button>
                    )
                  )}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(0,0,0,0.08)", background: currentPage === totalPages ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══ PROFILE MODAL ══ */}
      {showProfileModal && (
        <div
          onClick={() => { setShowProfileModal(false); setEditingPhone(false); setPhoneUpdateMsg(null); }}
          className="ud-modal-wrap"
          style={modalBackdrop}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="ud-profile-modal-box"
          >
            {/* Header */}
            <div style={{ padding: "22px 20px 18px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid rgba(255,255,255,0.5)", flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>{initials}</span>
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: "white" }}>{username || "—"}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>My Profile</div>
                </div>
              </div>
              <button onClick={() => { setShowProfileModal(false); setEditingPhone(false); setPhoneUpdateMsg(null); }}
                style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="ud-profile-modal-body">
              {profileLoading ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#6b7280" }}>Loading profile...</div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    {/* Name */}
                    <div style={{ padding: "13px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 2 }}>FULL NAME</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{username || "—"}</div>
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ padding: "13px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 2 }}>EMAIL ADDRESS</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email || "—"}</div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div style={{ padding: "13px 16px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
                      {!editingPhone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: phone ? "linear-gradient(135deg,#10b981,#34d399)" : "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 2 }}>MOBILE NUMBER</div>
                            {phone
                              ? <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{phone}</div>
                              : <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 500 }}>Not added yet</div>
                            }
                          </div>
                          <button onClick={() => { setEditingPhone(true); setNewPhone(phone); setPhoneUpdateMsg(null); }}
                            style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.08)", color: "#6366f1", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, whiteSpace: "nowrap" }}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            {phone ? "Change" : "Add"}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 8 }}>{phone ? "CHANGE MOBILE NUMBER" : "ADD MOBILE NUMBER"}</div>
                          <input type="tel" value={newPhone} onChange={e => { setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneUpdateMsg(null); }}
                            placeholder="Enter 10-digit mobile number" maxLength={10} autoFocus
                            style={{ ...inputStyle, fontSize: 15, fontWeight: 500 }} onFocus={focusStyle} onBlur={blurStyle} />
                          <div style={{ marginTop: 4, fontSize: 11, color: newPhone.length === 10 ? "#10b981" : "#9ca3af" }}>{newPhone.length}/10 digits {newPhone.length === 10 && "✓"}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button onClick={() => { setEditingPhone(false); setNewPhone(""); setPhoneUpdateMsg(null); }}
                              style={{ flex: 1, padding: "10px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
                            <button onClick={handleUpdatePhone} disabled={phoneUpdateLoading || newPhone.length < 10}
                              style={{ flex: 2, padding: "10px", borderRadius: 14, border: "none", background: newPhone.length === 10 ? "linear-gradient(135deg,#6366f1,#0ea5e9)" : "rgba(99,102,241,0.3)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: newPhone.length === 10 && !phoneUpdateLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              {phoneUpdateLoading ? "Saving..." : <><svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save Number</>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {phoneUpdateMsg && (
                    <div style={{ padding: "11px 14px", borderRadius: 12, background: phoneUpdateMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${phoneUpdateMsg.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`, color: phoneUpdateMsg.type === "success" ? "#059669" : "#dc2626", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      {phoneUpdateMsg.type === "success"
                        ? <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                      }
                      {phoneUpdateMsg.text}
                    </div>
                  )}

                  {!editingPhone && (
                    <div style={{ padding: "10px 13px", borderRadius: 12, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 16 }}>
                      <svg width="13" height="13" fill="none" stroke="#6366f1" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                      Your mobile number will be auto-filled when raising tickets.
                    </div>
                  )}

                  <button onClick={() => { setShowProfileModal(false); setEditingPhone(false); setPhoneUpdateMsg(null); }}
                    style={{ width: "100%", padding: "13px", borderRadius: 18, border: "none", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ TICKET DETAILS MODAL ══ */}
      {selectedTicket && (
        <div onClick={closeModal} className="ud-modal-wrap" style={modalBackdrop}>
          <div onClick={e => e.stopPropagation()} className="ud-modal-box">
            {/* Header */}
            <div style={{ padding: "20px 20px 16px", background: prevTicket ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "linear-gradient(135deg,#6366f1,#0ea5e9)", position: "relative", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>{prevTicket ? "Previous Ticket" : "Ticket Details"}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{prevTicket ? `Referenced by #${selectedTicket.id}` : "Complete information about your request"}</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="ud-modal-body">
              {prevTicket && (
                <button onClick={() => setPrevTicket(null)} style={{ marginBottom: 16, background: "none", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back to Follow-up #{selectedTicket.id}
                </button>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 16, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em" }}>TICKET STATUS</div>
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: displayedTicket.status === "PENDING" ? "#d97706" : "#059669", background: displayedTicket.status === "PENDING" ? "rgba(254,243,199,0.85)" : "rgba(236,253,245,0.88)", border: `1px solid ${displayedTicket.status === "PENDING" ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.22)"}` }}>
                  {displayedTicket.status}
                </span>
              </div>

              {!prevTicket && selectedTicket.prevId && (
                <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: 14, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="14" height="14" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span style={{ fontSize: 13, color: "#374151" }}>Follow-up to <span style={{ fontWeight: 600, color: "#7c3aed" }}>#{selectedTicket.prevId}</span></span>
                  </div>
                  <button onClick={() => fetchTicketById(selectedTicket.prevId)} disabled={prevTicketLoading} style={{ padding: "6px 12px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", fontSize: 12, fontWeight: 600, cursor: prevTicketLoading ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, opacity: prevTicketLoading ? 0.7 : 1 }}>
                    {prevTicketLoading ? "Loading..." : <><svg width="11" height="11" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>View Previous</>}
                  </button>
                </div>
              )}

              <div className="ud-detail-grid">
                {[
                  { label: "ISSUE TITLE", val: displayedTicket.subject, span: true },
                  { label: "RAISED BY", val: username || "—" },
                  { label: "CONTACT", val: displayedTicket.phone || phone || "—" },
                  { label: "DEPARTMENT", val: displayedTicket.type },
                  { label: "AREA", val: displayedTicket.area || "—" },
                  { label: "LOCATION", val: displayedTicket.location || "—" },
                  { label: "DATE", val: new Date(displayedTicket.createdAt).toLocaleDateString("en-GB") },
                  { label: "TICKET ID", val: `#${displayedTicket.id}` },
                ].map((f, i) => (
                  <div key={i} style={{ padding: "11px 13px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", gridColumn: f.span ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", wordBreak: "break-word" }}>{f.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "13px 14px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 8 }}>DETAILED DESCRIPTION</div>
                {renderDescription(displayedTicket.body)}
              </div>

              {displayedTicket.imageUrl ? (
                <div style={{ padding: "13px 14px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)", marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 8 }}>ATTACHED IMAGE</div>
                  <img src={`http://localhost:3000${displayedTicket.imageUrl}`} alt="ticket" style={{ width: "100%", borderRadius: 12, maxHeight: 250, objectFit: "cover" }} />
                </div>
              ) : null}

              <div className="ud-modal-actions">
                <button onClick={closeModal} style={{ padding: "12px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Close</button>
                {!prevTicket && displayedTicket.status === "PENDING" && (
                  <button onClick={() => handleCancelTicket(displayedTicket.id)} style={{ padding: "12px", borderRadius: 18, border: "1px solid rgba(100,116,139,0.2)", background: "rgba(100,116,139,0.1)", color: "#1e293b", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ FOLLOW-UP MODAL ══ */}
      {followupTicket && (
        <div onClick={() => setFollowupTicket(null)} className="ud-modal-wrap" style={modalBackdrop}>
          <div onClick={e => e.stopPropagation()} className="ud-followup-modal-box">
            <div style={{ padding: "20px 20px 16px", background: "linear-gradient(135deg,#1e293b,#475569)", position: "relative", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>Raise Follow-up</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>Issue not resolved? Let us know.</div>
                </div>
              </div>
              <button onClick={() => setFollowupTicket(null)} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="ud-followup-modal-body">
              <div style={{ marginBottom: 16, padding: "11px 13px", borderRadius: 14, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <svg width="15" height="15" fill="none" stroke="#b45309" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                  This will <strong>reopen ticket #{followupTicket.id}</strong> and update the complaint description.
                </div>
              </div>

              <div className="ud-followup-info-grid">
                <div style={{ padding: "11px 13px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 3 }}>DEPARTMENT</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{followupTicket.type}</div>
                </div>
                <div style={{ padding: "11px 13px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em", marginBottom: 3 }}>LOCATION</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{followupTicket.location || "—"}</div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7, color: "#374151" }}>Follow-up Title</label>
                <input value={followupForm.title} onChange={e => setFollowupForm({ ...followupForm, title: e.target.value })} placeholder="e.g., Issue still not fixed after repair" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 7, color: "#374151" }}>Description</label>
                <textarea value={followupForm.description} onChange={e => setFollowupForm({ ...followupForm, description: e.target.value })} placeholder="Describe what is still wrong or not fixed properly..." rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 90, height: "auto" }} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div className="ud-modal-actions">
                <button onClick={() => setFollowupTicket(null)} style={{ padding: "13px", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSubmitFollowup} style={{ flex: 2, padding: "13px", borderRadius: 18, border: "none", background: "linear-gradient(135deg,#1e293b,#475569)", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 8px 24px rgba(30,41,59,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  Reopen & Submit
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