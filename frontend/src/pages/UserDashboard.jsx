import React, { useState } from "react";



const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("raise");

  const [tickets, setTickets] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    priority: "Low",
    description: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: `TKT${tickets.length + 1}`,
      title: formData.title,
      department: formData.department,
      priority: formData.priority,
      description: formData.description,
      photo: formData.photo,
      status: "pending",
      date: new Date().toLocaleDateString(),
    };

    setTickets([...tickets, newTicket]);

    // Reset form
    setFormData({
      title: "",
      department: "",
      priority: "Low",
      description: "",
      photo: null,
    });

    setActiveTab("pending");
  };

  const filteredTickets = tickets.filter(
    (t) => t.status === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-600 text-white px-8 py-4 flex justify-between">
        <h1 className="text-xl font-bold">User Dashboard</h1>
        <button className="bg-blue-800 px-4 py-2 rounded">Logout</button>
      </header>

      <div className="p-8">
        {/* TABS */}
        <div className="flex gap-3 mb-6">
          {["raise", "pending", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {tab === "raise"
                ? "Raise Ticket"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* RAISE TICKET */}
        {activeTab === "raise" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow max-w-xl"
          >
            <h2 className="text-lg font-semibold mb-4">Raise New Ticket</h2>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Complaint Title"
              className="w-full mb-3 p-2 border rounded"
              required
            />

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
              required
            >
              <option value="">Select Department</option>
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>IT</option>
            </select>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue"
              className="w-full mb-3 p-2 border rounded"
              rows="4"
            />

            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="mb-4"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Submit Ticket
            </button>
          </form>
        )}

        {/* PENDING / RESOLVED */}
        {activeTab !== "raise" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tickets
            </h2>

            {filteredTickets.length === 0 ? (
              <p className="text-gray-500">No tickets found.</p>
            ) : (
              <ul className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="border p-4 rounded flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-gray-500">
                        {ticket.department} • {ticket.priority}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {ticket.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
