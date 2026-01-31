import React, { useState } from 'react';


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [tickets, setTickets] = useState([
    { id: 1, title: 'AC not working', department: 'Electrical', user: 'John Doe', priority: 'High', status: 'Pending', engineer: 'Engineer Smith', date: '2026-01-20', days: 6 },
    { id: 2, title: 'Plumbing issue', department: 'Plumbing', user: 'Jane Smith', priority: 'Critical', status: 'Overdue', engineer: 'Engineer Jones', date: '2026-01-10', days: 16 },
    { id: 3, title: 'Projector repair', department: 'IT', user: 'Bob Johnson', priority: 'Medium', status: 'In Progress', engineer: 'Engineer Davis', date: '2026-01-22', days: 4 },
    { id: 4, title: 'Door lock broken', department: 'Carpentry', user: 'Alice Brown', priority: 'Low', status: 'Resolved', engineer: 'Engineer Wilson', date: '2026-01-18', days: 8 },
  ]);

  const stats = {
    totalTickets: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    overdue: tickets.filter(t => t.status === 'Overdue').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  const handleNotifyEngineer = (ticketId, engineerName) => {
    alert(`Notification sent to ${engineerName} regarding ticket #${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-red-100">System Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, Admin</span>
            <button className="bg-red-700 px-4 py-2 rounded hover:bg-red-800">Logout</button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Total Tickets</h3>
            <p className="text-3xl font-bold text-gray-800">{stats.totalTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Overdue</h3>
            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Tickets
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overdue Tickets
          </button>
          <button
            onClick={() => setActiveTab('inprogress')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'inprogress'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'resolved'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'closed'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Closed
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'overview' && <OverviewSection tickets={tickets} />}
          {activeTab === 'pending' && <TicketList tickets={tickets.filter(t => t.status === 'Pending')} onNotify={handleNotifyEngineer} />}
          {activeTab === 'overdue' && <TicketList tickets={tickets.filter(t => t.status === 'Overdue')} onNotify={handleNotifyEngineer} showNotify />}
          {activeTab === 'inprogress' && <TicketList tickets={tickets.filter(t => t.status === 'In Progress')} onNotify={handleNotifyEngineer} />}
          {activeTab === 'resolved' && <TicketList tickets={tickets.filter(t => t.status === 'Resolved')} onNotify={handleNotifyEngineer} />}
          {activeTab === 'closed' && <TicketList tickets={[]} onNotify={handleNotifyEngineer} />}
        </div>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ tickets }) {
  const departmentStats = tickets.reduce((acc, ticket) => {
    acc[ticket.department] = (acc[ticket.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department-wise Tickets */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets by Department</h3>
          <div className="space-y-3">
            {Object.entries(departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex justify-between items-center">
                <span className="text-gray-700">{dept}</span>
                <span className="font-bold text-red-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>🔴 Ticket #2 is overdue (16 days)</p>
            <p>🟡 Ticket #1 pending for 6 days</p>
            <p>🔵 Ticket #3 in progress (4 days)</p>
            <p>🟢 Ticket #4 resolved successfully</p>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Critical Alerts</h3>
        <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
          <li>{tickets.filter(t => t.status === 'Overdue').length} tickets are overdue</li>
          <li>{tickets.filter(t => t.priority === 'Critical').length} critical priority tickets need attention</li>
        </ul>
      </div>
    </div>
  );
}

// Ticket List Component
function TicketList({ tickets, onNotify, showNotify }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tickets found</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                  <p className="text-sm text-gray-600">Department: {ticket.department}</p>
                  <p className="text-sm text-gray-600">User: {ticket.user}</p>
                  <p className="text-sm text-gray-600">Engineer: {ticket.engineer}</p>
                  <p className="text-sm text-gray-600">Date: {ticket.date} ({ticket.days} days ago)</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  View Details
                </button>
                {showNotify && (
                  <button 
                    onClick={() => onNotify(ticket.id, ticket.engineer)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Notify Engineer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;