import React from "react";
import { FaCalendarAlt, FaClock, FaUserMd, FaUser, FaCheck, FaTimes, FaEdit } from "react-icons/fa";

function AppointmentCard({ 
  appointment, 
  onConfirm, 
  onCancel, 
  onReschedule,
  onJoinSession,
  showActions = true 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "RESCHEDULED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "PENDING":
        return "En attente";
      case "CANCELLED":
        return "Annulé";
      case "RESCHEDULED":
        return "Reprogrammé";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <FaCalendarAlt className="text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {formatDate(appointment.date)}
              </h3>
            </div>
            
            <div className="flex items-center text-gray-600 mb-1">
              <FaClock className="mr-2" />
              <span>{formatTime(appointment.heure)}</span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-1">
              <FaUserMd className="mr-2" />
              <span>Dr. {appointment.medecin_nom || appointment.medecin?.user?.first_name} {appointment.medecin?.user?.last_name}</span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-3">
              <FaUser className="mr-2" />
              <span>{appointment.patient_nom || appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}</span>
            </div>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.statut)}`}>
                {getStatusText(appointment.statut)}
              </span>
            </div>
          </div>
          
          {appointment.description && (
            <div className="max-w-xs">
              <p className="text-gray-600 text-sm italic">"{appointment.description}"</p>
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
            {appointment.statut === "CONFIRMED" && onJoinSession && (
              <button
                onClick={() => onJoinSession(appointment)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Rejoindre la session
              </button>
            )}
            
            {appointment.statut !== "CANCELLED" && onConfirm && (
              <button
                onClick={() => onConfirm(appointment)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaCheck className="mr-2" />
                Confirmer
              </button>
            )}
            
            {appointment.statut !== "CANCELLED" && onCancel && (
              <button
                onClick={() => onCancel(appointment)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaTimes className="mr-2" />
                Annuler
              </button>
            )}
            
            {onReschedule && (
              <button
                onClick={() => onReschedule(appointment)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaEdit className="mr-2" />
                Reprogrammer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;