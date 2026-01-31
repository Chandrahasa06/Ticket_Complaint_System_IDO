import React from "react";

const TechnicianDashboard = () => {
  const tickets = [
    {
      id: "TKT101",
      title: "AC not working",
      description: "Air conditioner in room 301 is not cooling properly",
      location: "Room 301, Hostel Block A",
      dateAssigned: "2026-01-24",
      priority: "High",
      status: "assigned" // assigned | in-progress | resolved
    },
    {
      id: "TKT102",
      title: "Projector issue",
      description: "Projector display is flickering frequently",
      location: "Lab 5, Academic Block",
      dateAssigned: "2026-01-22",
      priority: "Medium",
      status: "in-progress"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-2xl font-bold">Technician Dashboard</h1>
          <p className="text-sm opacity-90">Electrical Department</p>
        </div>
        <button className="bg-purple-700 px-4 py-2 rounded-lg hover:bg-purple-800">
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Assigned</p>
          <p className="text-3xl font-bold text-purple-600">
            {tickets.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">
            {tickets.filter(t => t.status === "in-progress").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Completed Today</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>

      {/* TICKETS */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>

        <div className="space-y-6">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row justify-between gap-6"
            >
              {/* LEFT SIDE */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      ticket.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {ticket.description}
                </p>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>📍 <span className="font-medium">Location:</span> {ticket.location}</p>
                  <p>📅 <span className="font-medium">Assigned:</span> {ticket.dateAssigned}</p>
                </div>
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="flex items-center gap-3 self-start md:self-center">
                {/* View Details */}
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  View Details
                </button>

                {/* Start Work */}
                {ticket.status === "assigned" && (
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    Start Work
                  </button>
                )}

                {/* Mark as Resolved */}
                {ticket.status === "in-progress" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
