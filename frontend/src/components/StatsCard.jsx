import React from "react";

function StatsCard({ title, value, icon, color = "green", onClick }) {
  const colorClasses = {
    green: "border-l-4 border-green-500 bg-green-50",
    blue: "border-l-4 border-blue-500 bg-blue-50",
    red: "border-l-4 border-red-500 bg-red-50",
    yellow: "border-l-4 border-yellow-500 bg-yellow-50",
    purple: "border-l-4 border-purple-500 bg-purple-50"
  };

  const iconColorClasses = {
    green: "text-green-500",
    blue: "text-blue-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500"
  };

  return (
    <div 
      className={`rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md cursor-pointer ${colorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconColorClasses[color]} bg-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;