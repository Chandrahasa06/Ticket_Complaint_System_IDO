import React, { useState } from 'react';


function EngineerDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [tickets, setTickets] = useState([
    { id: 1, title: 'AC not working', user: 'John Doe', priority: 'High', status: 'Pending', date: '2026-01-20', days: 2 },
    { id: 2, title: 'Projector issue', user: 'Jane Smith', priority: 'Medium', status: 'In Progress', date: '2026-01-22', days: 0, technician: 'Mike Wilson' },
    { id: 3, title: 'Fan not working', user: 'Bob Johnson', priority: 'Critical', status: 'Overdue', date: '2026-01-15', days: 11 },
    { id: 4, title: 'Light bulb replacement', user: 'Alice Brown', priority: 'Low', status: 'Resolved', date: '2026-01-18', days: 0 },
  ]);

  const [technicians] = useState([
    { id: 1, name: 'Mike Wilson', activeTickets: 3, department: 'Electrical' },
    { id: 2, name: 'Sarah Davis', activeTickets: 2, department: 'Electrical' },
    { id: 3, name: 'Tom Anderson', activeTickets: 1, department: 'Electrical' },
  ]);

  const filterTickets = (status) => {
    return tickets.filter(t => t.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Engineer Dashboard</h1>
            <p className="text-sm text-green-100">Electrical Department</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, Engineer Smith</span>
            <button className="bg-green-700 px-4 py-2 rounded hover:bg-green-800">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto mt-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Tickets ({filterTickets('Pending').length})
          </button>
          <button
            onClick={() => setActiveTab('inprogress')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'inprogress'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress ({filterTickets('In Progress').length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'overdue'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overdue ({filterTickets('Overdue').length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved ({filterTickets('Resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'closed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Closed
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'technicians'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Technicians
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'pending' && <TicketList tickets={filterTickets('Pending')} showActions type="pending" />}
          {activeTab === 'inprogress' && <TicketList tickets={filterTickets('In Progress')} type="inprogress" />}
          {activeTab === 'overdue' && <TicketList tickets={filterTickets('Overdue')} showActions type="overdue" />}
          {activeTab === 'resolved' && <TicketList tickets={filterTickets('Resolved')} type="resolved" />}
          {activeTab === 'closed' && <TicketList tickets={[]} type="closed" />}
          {activeTab === 'technicians' && <TechnicianList technicians={technicians} />}
        </div>
      </div>
    </div>
  );
}

// Ticket List Component
function TicketList({ tickets, showActions, type }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{type.replace('inprogress', 'In Progress')} Tickets</h2>
      
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tickets found</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                  <p className="text-sm text-gray-600">Raised by: {ticket.user}</p>
                  <p className="text-sm text-gray-600">Date: {ticket.date} {ticket.days > 0 && `(${ticket.days} days ago)`}</p>
                  {ticket.technician && (
                    <p className="text-sm text-blue-600 font-semibold">Assigned to: {ticket.technician}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2 flex-wrap">
                <button 
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Details
                </button>
                {showActions && type === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                      Assign Technician
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                      Close Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Details Modal (simplified) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-4">{selectedTicket.title}</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>User:</strong> {selectedTicket.user}</p>
              <p><strong>Priority:</strong> {selectedTicket.priority}</p>
              <p><strong>Date:</strong> {selectedTicket.date}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>
              <p className="pt-2"><strong>Description:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. The equipment needs immediate attention.</p>
            </div>
            <button 
              onClick={() => setSelectedTicket(null)}
              className="mt-6 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Technician List Component
function TechnicianList({ technicians }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Technicians</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div key={tech.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {tech.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.department}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Active Tickets:</span>
              <span className="font-bold text-green-600">{tech.activeTickets}</span>
            </div>
            <button className="mt-3 w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EngineerDashboard;