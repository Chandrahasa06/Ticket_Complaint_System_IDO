import React from "react";
import { X } from "lucide-react";

const TicketDetailsModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">Ticket Details</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><b>Title:</b> {ticket.title}</p>
          <p><b>Department:</b> {ticket.department}</p>
          <p><b>User:</b> {ticket.user}</p>
          <p><b>Engineer:</b> {ticket.engineer || "Not Assigned"}</p>
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Priority:</b> {ticket.priority}</p>
          <p><b>Date:</b> {ticket.date}</p>

          {ticket.description && (
            <p><b>Description:</b> {ticket.description}</p>
          )}

          {ticket.technician && (
            <p><b>Technician:</b> {ticket.technician}</p>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
