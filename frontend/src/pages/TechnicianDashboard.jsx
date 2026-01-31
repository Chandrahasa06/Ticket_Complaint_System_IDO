import React, { useState } from 'react';


function TechnicianDashboard() {
  const [tickets, setTickets] = useState([
    { id: 1, title: 'AC not working', location: 'Room 301', priority: 'High', status: 'Assigned', assignedDate: '2026-01-24', description: 'Air conditioner in room 301 is not cooling properly' },
    { id: 2, title: 'Projector issue', location: 'Lab 5', priority: 'Medium', status: 'In Progress', assignedDate: '2026-01-22', description: 'Projector display is flickering' },
    { id: 3, title: 'Ceiling fan repair', location: 'Room 105', priority: 'Low', status: 'Assigned', assignedDate: '2026-01-25', description: 'Fan making unusual noise' },
  ]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkResolved = (ticketId) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: 'Completed' } : t
    ));
    setSelectedTicket(null);
    alert('Ticket marked as resolved!');
  };

  const handleStartWork = (ticketId) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: 'In Progress' } : t
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Technician Dashboard</h1>
            <p className="text-sm text-purple-100">Electrical Department</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, Mike Wilson</span>
            <button className="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800">Logout</button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Total Assigned</h3>
            <p className="text-3xl font-bold text-purple-600">{tickets.filter(t => t.status !== 'Completed').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">{tickets.filter(t => t.status === 'In Progress').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Completed Today</h3>
            <p className="text-3xl font-bold text-green-600">{tickets.filter(t => t.status === 'Completed').length}</p>
          </div>
        </div>

        {/* My Tickets Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h2>
          
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tickets assigned</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                      <p className="text-sm text-gray-600">📍 Location: {ticket.location}</p>
                      <p className="text-sm text-gray-600">📅 Assigned: {ticket.assignedDate}</p>
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

                  <p className="text-gray-700 text-sm mb-4">{ticket.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      View Full Details
                    </button>
                    
                    {ticket.status === 'Assigned' && (
                      <button 
                        onClick={() => handleStartWork(ticket.id)}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        Start Work
                      </button>
                    )}
                    
                    {ticket.status === 'In Progress' && (
                      <button 
                        onClick={() => handleMarkResolved(ticket.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    
                    {ticket.status === 'Completed' && (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">
                        ✓ Work Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">{selectedTicket.title}</h3>
            
            <div className="space-y-3 text-gray-700">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <p><strong>Location:</strong> {selectedTicket.location}</p>
                <p><strong>Assigned Date:</strong> {selectedTicket.assignedDate}</p>
              </div>
              
              <div className="border-t pt-3">
                <p><strong>Description:</strong></p>
                <p className="text-gray-600 mt-1">{selectedTicket.description}</p>
              </div>

              <div className="border-t pt-3">
                <p><strong>Additional Notes:</strong></p>
                <p className="text-gray-600 mt-1">Equipment inspection required. Bring necessary tools and replacement parts if needed.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {selectedTicket.status === 'In Progress' && (
                <button 
                  onClick={() => handleMarkResolved(selectedTicket.id)}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Mark as Resolved
                </button>
              )}
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicianDashboard;