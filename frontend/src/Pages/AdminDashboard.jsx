import React, { useState } from "react";
import { Eye } from "lucide-react";
import TicketDetailsModal from "../components/TicketDetailsModal";


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
      date: "2026-01-10",
    },
    {
      id: "TKT002",
      title: "Projector repair",
      department: "IT",
      user: "Bob Johnson",
      engineer: "Engineer Davis",
      status: "in-progress",
      priority: "Medium",
      date: "2026-01-22",
    },
    {
      id: "TKT003",
      title: "Door lock broken",
      department: "Carpentry",
      user: "Alice Brown",
      engineer: "Engineer Wilson",
      status: "resolved",
      priority: "Low",
      date: "2026-01-18",
    },
    {
      id: "TKT004",
      title: "Network issue",
      department: "IT",
      user: "Tom Lee",
      engineer: "Engineer Kumar",
      status: "pending",
      priority: "High",
      date: "2026-01-25",
    },
  ];

  const statusCounts = {
    pending: tickets.filter(t => t.status === "pending").length,
    "in-progress": tickets.filter(t => t.status === "in-progress").length,
    overdue: tickets.filter(t => t.status === "overdue").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  const filteredTickets =
    activeTab === "overview"
      ? tickets
      : tickets.filter(t => t.status === activeTab);

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-5 py-2 rounded-lg font-medium transition
        ${activeTab === id
          ? "bg-black text-white"
          : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-black text-white px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-300">System Administrator</p>
        </div>
        <button className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">
          Logout
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-8 py-6">
        <StatCard title="Total Tickets" value={tickets.length} />
        <StatCard title="Pending" value={statusCounts.pending} />
        <StatCard title="In Progress" value={statusCounts["in-progress"]} />
        <StatCard title="Overdue" value={statusCounts.overdue} />
        <StatCard title="Resolved" value={statusCounts.resolved} />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-3 px-8">
        <TabButton id="overview" label="Overview" />
        <TabButton id="pending" label="Pending Tickets" />
        <TabButton id="overdue" label="Overdue Tickets" />
        <TabButton id="in-progress" label="In Progress" />
        <TabButton id="resolved" label="Resolved" />
        <TabButton id="closed" label="Closed" />
      </div>

      {/* CONTENT */}
      <div className="px-8 py-6 space-y-4">
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className="bg-white rounded-xl shadow p-6 flex justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{ticket.title}</h2>
              <p className="text-sm text-gray-600">
                Department: {ticket.department}
              </p>
              <p className="text-sm text-gray-600">User: {ticket.user}</p>
              <p className="text-sm text-gray-600">
                Engineer: {ticket.engineer}
              </p>
              <p className="text-sm text-gray-500">
                Date: {ticket.date}
              </p>

              <button
                onClick={() => setSelectedTicket(ticket)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>

            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
                ${ticket.priority === "Critical"
                    ? "bg-red-100 text-red-700"
                    : ticket.priority === "High"
                      ? "bg-orange-100 text-orange-700"
                      : ticket.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
              >
                {ticket.priority}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
                ${ticket.status === "overdue"
                    ? "bg-red-100 text-red-700"
                    : ticket.status === "in-progress"
                      ? "bg-blue-100 text-blue-700"
                      : ticket.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <TicketDetailsModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
