import React, { useState } from "react";
import { Eye, Bell, X, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const tickets = [
    {
      id: "TKT001",
      title: "Plumbing issue",
      department: "Plumbing",
      user: "Jane Smith",
      engineer: "Engineer Jones",
      status: "overdue",
      priority: "Critical",
      date: "2026-01-10 (16 days ago)",
      description: "Water leakage in washroom",
    },
    {
      id: "TKT002",
      title: "Projector repair",
      department: "IT",
      user: "Bob Johnson",
      engineer: "Engineer Davis",
      status: "in-progress",
      priority: "Medium",
      date: "2026-01-22 (4 days ago)",
      description: "Projector flickering issue",
    },
    {
      id: "TKT003",
      title: "Door lock broken",
      department: "Carpentry",
      user: "Alice Brown",
      engineer: "Engineer Wilson",
      status: "resolved",
      priority: "Low",
      date: "2026-01-18 (8 days ago)",
      description: "Door lock jammed",
    },
    {
      id: "TKT004",
      title: "AC not working",
      department: "Electrical",
      user: "John Doe",
      engineer: "Engineer Smith",
      status: "pending",
      priority: "High",
      date: "2026-01-25 (1 day ago)",
      description: "AC not cooling properly",
    },
    {
      id: "TKT005",
      title: "Network cable issue",
      department: "IT",
      user: "Robert King",
      engineer: "Engineer Clark",
      status: "closed",
      priority: "Low",
      date: "2026-01-05 (21 days ago)",
      description: "Loose network cable fixed",
    },
  ];

  const filteredTickets =
    activeTab === "overview"
      ? []
      : tickets.filter((t) => t.status === activeTab);

  const getStatusColor = (status) => {
    const colors = {
      overdue: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-500 text-white",
      High: "bg-orange-500 text-white",
      Medium: "bg-yellow-500 text-white",
      Low: "bg-blue-500 text-white",
    };
    return colors[priority] || "bg-gray-500 text-white";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "in-progress":
        return <TrendingUp className="w-5 h-5" />;
      case "resolved":
        return <CheckCircle className="w-5 h-5" />;
      case "closed":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* MODERN HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-purple-200 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                System Administrator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white border-opacity-20">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center font-bold text-white">
                A
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-purple-200">admin@system.com</p>
              </div>
            </div>
            <button className="group bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white border-opacity-30">
              <span className="flex items-center gap-2">
                Logout
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* MODERN SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { label: "Total Tickets", value: tickets.length, icon: "📊", gradient: "from-blue-500 to-cyan-500", iconBg: "bg-blue-100" },
            { label: "Pending", value: tickets.filter(t => t.status === "pending").length, icon: "⏳", gradient: "from-yellow-500 to-orange-500", iconBg: "bg-yellow-100" },
            { label: "In Progress", value: tickets.filter(t => t.status === "in-progress").length, icon: "🔄", gradient: "from-indigo-500 to-purple-500", iconBg: "bg-indigo-100" },
            { label: "Overdue", value: tickets.filter(t => t.status === "overdue").length, icon: "⚠️", gradient: "from-red-500 to-pink-500", iconBg: "bg-red-100" },
            { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, icon: "✅", gradient: "from-green-500 to-emerald-500", iconBg: "bg-green-100" },
          ].map((card, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${card.iconBg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {card.icon}
                  </div>
                  <div className={`px-3 py-1 bg-gradient-to-r ${card.gradient} text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    Active
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1 font-medium">{card.label}</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {card.value}
                </p>
              </div>

              {/* Bottom Accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
            </div>
          ))}
        </div>

        {/* MODERN TABS */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2 flex-wrap">
          {[
            { id: "overview", label: "Overview", icon: "📈" },
            { id: "pending", label: "Pending", icon: "⏳" },
            { id: "overdue", label: "Overdue", icon: "⚠️" },
            { id: "in-progress", label: "In Progress", icon: "🔄" },
            { id: "resolved", label: "Resolved", icon: "✅" },
            { id: "closed", label: "Closed", icon: "🔒" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:scale-102"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-0 rounded-xl bg-white opacity-20 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div>
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Critical Alerts */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg animate-pulse-slow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-2 text-lg flex items-center gap-2">
                      ⚠️ Critical Alerts
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-red-700">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="font-medium">{tickets.filter(t => t.status === "overdue").length} ticket(s) overdue - Immediate action required</span>
                      </li>
                      <li className="flex items-center gap-2 text-red-700">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="font-medium">{tickets.filter(t => t.priority === "Critical").length} critical priority ticket(s) need attention</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tickets by Department */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Tickets by Department</h3>
                  </div>
                  <div className="space-y-3">
                    {["Electrical", "Plumbing", "IT", "Carpentry"].map((d, i) => {
                      const count = tickets.filter(t => t.department === d).length;
                      return (
                        <div key={i} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform duration-300">
                              {d[0]}
                            </div>
                            <span className="font-medium text-gray-700">{d}</span>
                          </div>
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full text-sm group-hover:scale-110 transition-transform duration-300">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors duration-300">
                      <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">!</span>
                      <div>
                        <p className="text-red-700 font-medium">Ticket #TKT001 is overdue</p>
                        <p className="text-xs text-red-600">16 days past deadline</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors duration-300">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">⏳</span>
                      <div>
                        <p className="text-yellow-700 font-medium">Ticket #TKT004 pending</p>
                        <p className="text-xs text-yellow-600">Waiting for 1 day</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">🔄</span>
                      <div>
                        <p className="text-blue-700 font-medium">Ticket #TKT002 in progress</p>
                        <p className="text-xs text-blue-600">Active for 4 days</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-300">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</span>
                      <div>
                        <p className="text-green-700 font-medium">Ticket #TKT003 resolved</p>
                        <p className="text-xs text-green-600">Completed successfully</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TICKET LIST */}
          {activeTab !== "overview" && (
            <div className="space-y-5 animate-fadeIn">
              {filteredTickets.length === 0 ? (
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
                filteredTickets.map((t, index) => (
                  <div
                    key={t.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(t.status)} border-2`}>
                              {getStatusIcon(t.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-gray-400 tracking-wider">{t.id}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(t.priority)} shadow-sm`}>
                                  {t.priority}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                                {t.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">{t.description}</p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">Department</p>
                                <p className="font-medium text-gray-700">{t.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">User</p>
                                <p className="font-medium text-gray-700">{t.user}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">Engineer</p>
                                <p className="font-medium text-gray-700">{t.engineer}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-gray-400 text-xs">Created</p>
                                <p className="font-medium text-gray-700 text-xs">{t.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-xl border-2 ${getStatusColor(t.status)} font-semibold text-sm flex items-center gap-2 w-fit`}>
                          {getStatusIcon(t.status)}
                          {t.status.toUpperCase().replace("-", " ")}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                        >
                          <Eye size={18} />
                          View Details
                        </button>

                        {activeTab === "overdue" && (
                          <button className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95">
                            <Bell size={18} />
                            Notify Engineer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODERN MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative animate-scaleIn overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-2">Ticket Details</h2>
              <p className="text-purple-100 text-sm">Complete information about this ticket</p>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold mb-1">TICKET ID</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.id}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-xs text-purple-600 font-semibold mb-1">TITLE</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.title}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-semibold mb-1">DEPARTMENT</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.department}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-semibold mb-1">PRIORITY</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600 font-semibold mb-1">USER</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.user}</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
                    <p className="text-xs text-cyan-600 font-semibold mb-1">ENGINEER</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.engineer}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
                    <p className="text-xs text-yellow-600 font-semibold mb-1">STATUS</p>
                    <span className={`inline-block px-3 py-1 rounded-xl border-2 text-sm font-bold ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.toUpperCase().replace("-", " ")}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-semibold mb-1">DATE</p>
                    <p className="text-sm font-bold text-gray-800">{selectedTicket.date}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">DESCRIPTION</p>
                <p className="text-gray-800 leading-relaxed">{selectedTicket.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;