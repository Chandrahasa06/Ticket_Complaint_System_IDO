import React, { useState } from "react";
import { X, Star, Phone, Mail, Activity, Clock, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EngineerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();
  const [ticketsData, setTicketsData] = useState([
    {
      id: "TKT001",
      title: "AC not working",
      user: "John Doe",
      date: "2026-01-20",
      priority: "High",
      status: "pending",
      technician: null,
      description: "AC not cooling properly"
    },
    {
      id: "TKT002",
      title: "Fan issue",
      user: "Jane Smith",
      date: "2026-01-19",
      priority: "Medium",
      status: "in-progress",
      technician: "Ravi Kumar",
      description: "Fan making noise"
    },
    {
      id: "TKT003",
      title: "Light problem",
      user: "Bob Wilson",
      date: "2026-01-18",
      priority: "Low",
      status: "overdue",
      technician: null,
      description: "Tube light flickering"
    }
  ]);

  const technicians = [
    {
      id: "TECH01",
      name: "Ravi Kumar",
      skill: "Electrical",
      rating: 4.6,
      email: "ravi@iiti.ac.in",
      phone: "9876543210",
      activeTickets: 2,
      status: "active"
    },
    {
      id: "TECH02",
      name: "Amit Sharma",
      skill: "Maintenance",
      rating: 4.2,
      email: "amit@iiti.ac.in",
      phone: "9123456789",
      activeTickets: 1,
      status: "inactive"
    }
  ];

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignTicket, setAssignTicket] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [viewTechnician, setViewTechnician] = useState(null);

  const count = (status) =>
    ticketsData.filter(t => t.status === status).length;

  const assignTechnician = () => {
    setTicketsData(prev =>
      prev.map(t =>
        t.id === assignTicket.id
          ? {
              ...t,
              status: "in-progress",
              technician: selectedTechnician.name
            }
          : t
      )
    );
    setAssignTicket(null);
    setSelectedTechnician(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5" />;
      case "in-progress": return <Activity className="w-5 h-5" />;
      case "overdue": return <AlertTriangle className="w-5 h-5" />;
      case "resolved": return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };
  const handleLogout = async () => {
  try {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include"
    });

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/LoginRoleSelect"); // change route if needed
  } catch (error) {
    console.error("Logout error:", error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* MODERN HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Engineer Dashboard</h1>
              <p className="text-sm text-emerald-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                Electrical Department
              </p>
            </div>
          </div>
          <button
          onClick={handleLogout} className="group bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white border-opacity-30">
            <span className="flex items-center gap-2">
              Logout
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
          </button>
        </div>
      </header>

      {/* MODERN TABS */}
      <div className="bg-white shadow-md sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 flex-wrap">
          {[
            { key: "pending", label: `Pending`, count: count("pending"), icon: "⏳", gradient: "from-yellow-500 to-orange-500" },
            { key: "in-progress", label: `In Progress`, count: count("in-progress"), icon: "🔄", gradient: "from-blue-500 to-indigo-500" },
            { key: "overdue", label: `Overdue`, count: count("overdue"), icon: "⚠️", gradient: "from-red-500 to-pink-500" },
            { key: "resolved", label: "Resolved", count: 0, icon: "✅", gradient: "from-green-500 to-emerald-500" },
            { key: "closed", label: "Closed", count: 0, icon: "🔒", gradient: "from-gray-500 to-slate-500" },
            { key: "technicians", label: "My Team", count: technicians.length, icon: "👥", gradient: "from-purple-500 to-pink-500" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key ? "bg-white bg-opacity-30" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute inset-0 rounded-xl bg-white opacity-20 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TICKETS */}
        {activeTab !== "technicians" && (
          <div className="space-y-5 animate-fadeIn">
            {ticketsData.filter(t => t.status === activeTab).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Tickets Found</h3>
                <p className="text-gray-500">There are no {activeTab.replace("-", " ")} tickets at the moment.</p>
              </div>
            ) : (
              ticketsData
                .filter(t => t.status === activeTab)
                .map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-green-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                              {getStatusIcon(ticket.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-gray-400 tracking-wider">{ticket.id}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)} shadow-sm`}>
                                  {ticket.priority}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                                {ticket.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">Raised by</p>
                                <p className="font-medium text-gray-700">{ticket.user}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">Date</p>
                                <p className="font-medium text-gray-700">{ticket.date}</p>
                              </div>
                            </div>
                            {ticket.technician && (
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <div>
                                  <p className="text-gray-400 text-xs">Assigned to</p>
                                  <p className="font-medium text-green-600">{ticket.technician}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>

                          {(ticket.status === "pending" || ticket.status === "overdue") && (
                            <>
                              <button
                                onClick={() => setAssignTicket(ticket)}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                              >
                                <UserCheck className="w-4 h-4" />
                                Assign
                              </button>
                              <button className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95">
                                <X className="w-4 h-4" />
                                Close
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* MY TECHNICIANS */}
        {activeTab === "technicians" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {technicians.map((tech, index) => (
              <div
                key={tech.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${tech.status === "active" ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
                    <span className="text-xs text-white font-medium">{tech.status === "active" ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                <div className="p-6 -mt-12 relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4 mx-auto border-4 border-white group-hover:scale-110 transition-transform duration-300">
                    {tech.name.charAt(0)}
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{tech.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{tech.skill}</p>
                    <p className="text-xs text-gray-400">ID: {tech.id}</p>
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(tech.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">{tech.rating}</span>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 mb-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Tickets</span>
                      <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
                        {tech.activeTickets}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewTechnician(tech)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW TICKET MODAL */}
      {selectedTicket && (
        <Modal onClose={() => setSelectedTicket(null)} title="Ticket Details" gradient="from-blue-600 to-indigo-600">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">TICKET ID</p>
              <p className="text-lg font-bold text-gray-800">{selectedTicket.id}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-600 font-semibold mb-1">TITLE</p>
              <p className="text-lg font-bold text-gray-800">{selectedTicket.title}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">DESCRIPTION</p>
              <p className="text-gray-700">{selectedTicket.description}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-600 font-semibold mb-1">STATUS</p>
              <p className="text-lg font-bold text-gray-800 capitalize">{selectedTicket.status.replace("-", " ")}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {assignTicket && (
        <Modal onClose={() => setAssignTicket(null)} title="Assign Technician" gradient="from-green-600 to-emerald-600">
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <p className="text-sm text-green-700">
              <span className="font-semibold">Ticket:</span> {assignTicket.title}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {technicians
              .filter(t => t.status === "active")
              .map(t => (
                <label
                  key={t.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    selectedTechnician?.id === t.id
                      ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tech"
                    checked={selectedTechnician?.id === t.id}
                    onChange={() => setSelectedTechnician(t)}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.skill}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">{t.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.activeTickets} tickets</p>
                  </div>
                </label>
              ))}
          </div>

          <button
            onClick={assignTechnician}
            disabled={!selectedTechnician}
            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedTechnician
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Assign Technician
          </button>
        </Modal>
      )}

      {/* TECHNICIAN DETAILS MODAL */}
      {viewTechnician && (
        <Modal onClose={() => setViewTechnician(null)} title="Technician Profile" gradient="from-purple-600 to-pink-600">
          <div className="text-center">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-xl text-white text-4xl font-bold">
              {viewTechnician.name.charAt(0)}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">{viewTechnician.name}</h2>
            <p className="text-gray-500 mb-4">{viewTechnician.skill}</p>

            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(viewTechnician.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">{viewTechnician.rating}</span>
            </div>

            <div className="space-y-3 text-left">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-semibold">EMAIL</p>
                  <p className="text-gray-800 font-medium">{viewTechnician.email}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-semibold">PHONE</p>
                  <p className="text-gray-800 font-medium">{viewTechnician.phone}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-semibold">ACTIVE TICKETS</p>
                  <p className="text-gray-800 font-medium">{viewTechnician.activeTickets} tickets</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CUSTOM ANIMATIONS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

/* MODERN MODAL */
const Modal = ({ children, onClose, title, gradient }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
      <div className={`relative bg-gradient-to-r ${gradient} p-6 text-white overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        
        <div className="relative z-10">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm opacity-90 mt-1">View and manage information</p>
        </div>
      </div>

      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {children}
      </div>
    </div>

    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }

      .animate-slideUp {
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `}</style>
  </div>
);

export default EngineerDashboard;