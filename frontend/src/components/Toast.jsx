import React, { useState, useEffect } from "react";
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

function Toast({ 
  message, 
  type = "info", // success, error, warning, info
  duration = 5000,
  onClose,
  show = true
}) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Allow animation to complete
    }
  };

  if (!isVisible) return null;

  const typeClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700"
  };

  const iconClasses = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500"
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className={iconClasses.success} />;
      case "error":
        return <FaExclamationTriangle className={iconClasses.error} />;
      case "warning":
        return <FaExclamationTriangle className={iconClasses.warning} />;
      case "info":
        return <FaInfoCircle className={iconClasses.info} />;
      default:
        return <FaInfoCircle className={iconClasses.info} />;
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-start p-4 rounded-lg border-l-4 shadow-lg transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="mr-3">
          {getIcon()}
        </div>
        <div className="text-sm font-medium">
          {message}
        </div>
      </div>
      <button 
        onClick={handleClose}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaTimes />
      </button>
    </div>
  );
}

export default Toast;