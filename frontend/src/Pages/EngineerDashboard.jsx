import React, { useState } from "react";

const EngineerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const tickets = [
    {
      id: "TKT001",
      title: "AC not working",
      user: "John Doe",
      date: "2026-01-20",
      priority: "High",
      status: "pending"
    },
    {
      id: "TKT002",
      title: "Fan issue",
      user: "Jane Smith",
      date: "2026-01-19",
      priority: "Medium",
      status: "in-progress"
    },
    {
      id: "TKT003",
      title: "Light problem",
      user: "Bob Wilson",
      date: "2026-01-18",
      priority: "Low",
      status: "overdue"
    }
  ];

  const technicians = [
    { id: "TECH01", name: "Ravi Kumar", skill: "Electrical" },
    { id: "TECH02", name: "Amit Sharma", skill: "Maintenance" }
  ];

  const count = (status) =>
    tickets.filter(t => t.status === status).length;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-green-600 text-white px-6 py-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Engineer Dashboard</h1>
          <p className="text-sm opacity-90">Electrical Department</p>
        </div>
        <button className="bg-green-700 px-4 py-2 rounded">Logout</button>
      </div>

      {/* TABS */}
      <div className="bg-white shadow px-6 py-3 flex gap-3 flex-wrap">
        {[
          { key: "pending", label: `Pending (${count("pending")})` },
          { key: "in-progress", label: `In Progress (${count("in-progress")})` },
          { key: "overdue", label: `Overdue (${count("overdue")})` },
          { key: "resolved", label: "Resolved" },
          { key: "closed", label: "Closed" },
          { key: "technicians", label: "My Technicians" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* TICKETS VIEW */}
        {activeTab !== "technicians" && (
          <div className="space-y-4">
            {tickets
              .filter(t => t.status === activeTab)
              .map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <p className="text-sm text-gray-500">
                      Raised by: {ticket.user}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {ticket.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700">
                      {ticket.priority}
                    </span>

                    <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded">
                      View Details
                    </button>

                    {(ticket.status === "pending" ||
                      ticket.status === "overdue") && (
                      <>
                        <button className="px-3 py-1 bg-green-600 text-white rounded">
                          Assign Technician
                        </button>
                        <button className="px-3 py-1 border border-red-600 text-red-600 rounded">
                          Close Ticket
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* MY TECHNICIANS TAB */}
        {activeTab === "technicians" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicians.map(tech => (
              <div
                key={tech.id}
                className="bg-white p-5 rounded-lg shadow"
              >
                <h3 className="font-semibold text-lg">{tech.name}</h3>
                <p className="text-sm text-gray-500">{tech.skill}</p>
                <p className="text-xs text-gray-400 mt-1">ID: {tech.id}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default EngineerDashboard;
