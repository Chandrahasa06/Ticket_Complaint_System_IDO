import React, { useState } from 'react';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('raise');
  const [tickets, setTickets] = useState([
    { id: 1, title: 'AC not working', department: 'Electrical', status: 'Pending', date: '2026-01-20' },
    { id: 2, title: 'Broken desk', department: 'Carpentry', status: 'Resolved', date: '2026-01-18' },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
       <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, John Doe</span>
            <button onClick={handleLogout} className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto mt-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('raise')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'raise'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Raise a Ticket
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Complaints
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved Complaints
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'raise' && <RaiseTicketForm />}
          {activeTab === 'pending' && <TicketList tickets={tickets.filter(t => t.status === 'Pending')} />}
          {activeTab === 'resolved' && <TicketList tickets={tickets.filter(t => t.status === 'Resolved')} showFeedback />}
        </div>
      </div>
    </div>
  );
}

// Raise Ticket Form Component
function RaiseTicketForm() {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    priority: 'Medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Ticket submitted:', formData);
    alert('Ticket raised successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Raise a New Ticket</h2>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Complaint Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Department</label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Department</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Carpentry">Carpentry</option>
          <option value="IT">IT Support</option>
          <option value="Civil">Civil</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="5"
          placeholder="Detailed description of the problem"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        Submit Ticket
      </button>
    </form>
  );
}

// Ticket List Component
function TicketList({ tickets, showFeedback }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {showFeedback ? 'Resolved Complaints' : 'Pending Complaints'}
      </h2>
      
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tickets found</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                  <p className="text-sm text-gray-600">Department: {ticket.department}</p>
                  <p className="text-sm text-gray-600">Date: {ticket.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ticket.status === 'Resolved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
              
              {showFeedback && (
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Satisfied ✓
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Create Follow-up
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;