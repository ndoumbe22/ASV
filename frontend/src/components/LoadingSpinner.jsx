import React from "react";

function LoadingSpinner({ 
  size = "md", // sm, md, lg
  color = "green", // green, blue, red, gray
  fullScreen = false,
  overlay = false
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const colorClasses = {
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600",
    gray: "text-gray-600"
  };

  const spinner = (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full border-4 border-solid border-current border-r-transparent animate-spin`}
        role="status"
      >
        <span className="sr-only">Chargement...</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;