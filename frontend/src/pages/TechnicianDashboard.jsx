import React, { useState } from "react";
import { Eye, CheckCircle, Play, X, MapPin, Calendar, Wrench, AlertTriangle } from "lucide-react";

const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState([
    {
      id: "TKT001",
      title: "AC not working",
      description: "Air conditioner not cooling properly",
      location: "Room 301",
      assignedDate: "2026-01-24",
      priority: "High",
      status: "assigned",
    },
    {
      id: "TKT002",
      title: "Projector issue",
      description: "Projector display flickering",
      location: "Lab 5",
      assignedDate: "2026-01-22",
      priority: "Medium",
      status: "in-progress",
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const startWork = (id) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "in-progress" } : t
      )
    );
  };

  const resolveWork = (id) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "resolved" } : t
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned": return "bg-blue-100 text-blue-700 border-blue-200";
      case "in-progress": return "bg-purple-100 text-purple-700 border-purple-200";
      case "resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "assigned": return <AlertTriangle className="w-5 h-5" />;
      case "in-progress": return <Wrench className="w-5 h-5" />;
      case "resolved": return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* MODERN HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Technician Dashboard</h1>
              <p className="text-sm text-purple-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Maintenance Technician
              </p>
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
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* MODERN STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Total Assigned", 
              value: tickets.length, 
              icon: "📋", 
              gradient: "from-blue-500 to-cyan-500",
              iconBg: "bg-blue-100",
              textColor: "text-blue-600"
            },
            { 
              label: "Pending to Work On", 
              value: tickets.filter((t) => t.status === "assigned").length, 
              icon: "⏳", 
              gradient: "from-yellow-500 to-orange-500",
              iconBg: "bg-yellow-100",
              textColor: "text-yellow-600"
            },
            { 
              label: "In Progress", 
              value: tickets.filter((t) => t.status === "in-progress").length, 
              icon: "🔧", 
              gradient: "from-purple-500 to-pink-500",
              iconBg: "bg-purple-100",
              textColor: "text-purple-600"
            },
            { 
              label: "Completed", 
              value: tickets.filter((t) => t.status === "resolved").length, 
              icon: "✅", 
              gradient: "from-green-500 to-emerald-500",
              iconBg: "bg-green-100",
              textColor: "text-green-600"
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.iconBg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {stat.icon}
                  </div>
                  <div className={`px-3 py-1 bg-gradient-to-r ${stat.gradient} text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    Active
                  </div>
                </div>
                <p className={`text-sm ${stat.textColor} mb-1 font-medium`}>{stat.label}</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>

              {/* Bottom Accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
            </div>
          ))}
        </div>

        {/* TICKETS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Tickets</h2>
              <p className="text-gray-500 text-sm">Manage your assigned work orders</p>
            </div>
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm">
              {tickets.length} Total
            </div>
          </div>

          <div className="space-y-5 animate-fadeIn">
            {tickets.map((t, index) => (
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${getStatusColor(t.status)}`}>
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

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Location</p>
                            <p className="font-medium text-gray-700">{t.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Assigned Date</p>
                            <p className="font-medium text-gray-700">{t.assignedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-xl border-2 ${getStatusColor(t.status)} font-semibold text-sm flex items-center gap-2 w-fit capitalize`}>
                      {getStatusIcon(t.status)}
                      {t.status.replace("-", " ")}
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

                    {t.status === "assigned" && (
                      <button
                        onClick={() => startWork(t.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
                      >
                        <Play size={18} />
                        Start Work
                      </button>
                    )}

                    {t.status === "in-progress" && (
                      <button
                        onClick={() => resolveWork(t.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                      >
                        <CheckCircle size={18} />
                        Mark as Resolved
                      </button>
                    )}

                    {t.status === "resolved" && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-5 py-2.5 rounded-xl font-medium border-2 border-green-200">
                        <CheckCircle size={18} />
                        Resolved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODERN MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 animate-pulse animation-delay-1000"></div>
              
              <div className="relative z-10">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="absolute top-0 right-0 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
                >
                  <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wrench className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Work Order Details</h2>
                    <p className="text-purple-100 text-sm">Complete ticket information</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Ticket ID and Status Banner */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-semibold">WORK ORDER ID</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTicket.id}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold text-sm capitalize ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace("-", " ")}
                </span>
              </div>

              {/* Main Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Title */}
                <div className="md:col-span-2 group bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-indigo-600 font-semibold mb-1">ISSUE TITLE</p>
                      <p className="text-lg font-bold text-gray-800">{selectedTicket.title}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">LOCATION</p>
                      <p className="text-base font-bold text-gray-800">{selectedTicket.location}</p>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="group bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600 font-semibold mb-1">PRIORITY</p>
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Date */}
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-semibold mb-1">ASSIGNED DATE</p>
                      <p className="text-base font-bold text-gray-800">{selectedTicket.assignedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="group bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 font-semibold mb-2">DETAILED DESCRIPTION</p>
                    <p className="text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ANIMATIONS */}
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
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default TechnicianDashboard;